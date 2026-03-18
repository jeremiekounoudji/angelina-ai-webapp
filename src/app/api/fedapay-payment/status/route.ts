import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createTranslationFunction } from '@/locales';

export async function GET(request: NextRequest) {
  try {
    const locale = (request.headers.get('Accept-Language')?.split('-')[0] as 'en' | 'fr') || 'en';
    const t = createTranslationFunction(locale);

    const { searchParams } = new URL(request.url);
    const merchantReference = searchParams.get('merchantReference');

    if (!merchantReference) {
      return NextResponse.json({ error: t('api.general.errors.missingParameters') }, { status: 400 });
    }

    const supabase = await createClient();

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: t('api.general.errors.unauthorized') }, { status: 401 });
    }

    // Look up payment
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select(`*, subscription_plans(id, title, price_monthly)`)
      .eq('transaction_id', merchantReference)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json({ error: t('api.payment.status.errors.paymentNotFound') }, { status: 404 });
    }

    // Verify the payment belongs to a company owned by the authenticated user
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('id', payment.company_id)
      .eq('user_id', user.id)
      .single();

    if (companyError || !company) {
      return NextResponse.json({ error: t('api.general.errors.unauthorized') }, { status: 403 });
    }

    return NextResponse.json({
      status: payment.payment_status,
      amount: payment.amount,
      currency: payment.currency,
      created_at: payment.created_at,
      plan: payment.subscription_plans,
    });

  } catch (error) {
    console.error('Payment status error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Webhook from FedaPay — verify HMAC signature before processing
    const signature = request.headers.get('x-fedapay-signature') ?? '';
    const rawBody = await request.text();

    const webhookSecret = process.env.FEDAPAY_WEBHOOK_SECRET;
    if (webhookSecret) {
      const { createHmac, timingSafeEqual } = await import('crypto');
      const expected = createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
      const sigBuffer = Buffer.from(signature);
      const expBuffer = Buffer.from(expected);
      const signaturesMatch =
        sigBuffer.length === expBuffer.length &&
        timingSafeEqual(sigBuffer, expBuffer);

      if (!signaturesMatch) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const body = JSON.parse(rawBody);
    const { transaction_id, status } = body;

    if (!transaction_id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();

    // Idempotency check — skip if already completed
    const { data: existing } = await supabase
      .from('payments')
      .select('payment_status')
      .eq('transaction_id', transaction_id)
      .single();

    if (existing?.payment_status === 'completed') {
      return NextResponse.json({ status: 'already_processed' });
    }

    // Update payment status
    const { error: updateError } = await supabase
      .from('payments')
      .update({ payment_status: status === 'approved' ? 'completed' : 'failed' })
      .eq('transaction_id', transaction_id);

    if (updateError) {
      console.error('Webhook update error:', updateError.message);
      return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
