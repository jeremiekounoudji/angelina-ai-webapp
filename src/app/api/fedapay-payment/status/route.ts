import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createTranslationFunction } from '@/locales';

export async function GET(request: NextRequest) {
  try {
    // Get locale from request headers
    const locale = (request.headers.get('Accept-Language')?.split('-')[0] as 'en' | 'fr') || 'en';
    const t = createTranslationFunction(locale);

    const { searchParams } = new URL(request.url);
    const merchantReference = searchParams.get('merchantReference');

    if (!merchantReference) {
      return NextResponse.json({ error: t('api.general.errors.missingParameters') }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Get the current user and session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return NextResponse.json({ error: t('api.general.errors.unauthorized') }, { status: 401 });
    }

    // Check payment status from database
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select(`
        *,
        subscription_plans (
          id,
          title,
          price_monthly
        )
      `)
      .eq('transaction_id', merchantReference)
      .single();

    if (paymentError) {
      console.error('Payment lookup error:', paymentError);
      return NextResponse.json({ error: t('api.payment.status.errors.paymentNotFound') }, { status: 404 });
    }

    // Verify the payment belongs to a company owned by the user
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('id', payment.company_id)
      .eq('user_id', user.id)
      .single();

    if (companyError || !company) {
      console.error('Company verification error:', companyError);
      return NextResponse.json({ error: 'Unauthorized access to payment' }, { status: 403 });
    }
    
    return NextResponse.json({
      status: payment.payment_status,
      amount: payment.amount,
      currency: payment.currency,
      created_at: payment.created_at,
      plan: payment.subscription_plans,
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}