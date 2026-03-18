import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createTranslationFunction } from '@/locales';
import { z } from 'zod';

const PaymentBodySchema = z.object({
  planId: z.string().uuid(),
  companyId: z.string().uuid(),
  billingInterval: z.enum(['monthly', 'annual']),
  phoneNumber: z.string().min(8).max(20),
  provider: z.string().min(1).max(50),
  customerEmail: z.string().email().optional(),
  customerName: z.string().min(1).max(100).optional(),
  customerPhone: z.string().min(8).max(20).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get locale from request headers
    const locale = (request.headers.get('Accept-Language')?.split('-')[0] as 'en' | 'fr') || 'en';
    const t = createTranslationFunction(locale);

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: t('api.general.errors.unauthorized') }, { status: 401 });
    }

    // Get session for JWT forwarding to edge function
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.access_token) {
      return NextResponse.json({ error: t('api.general.errors.unauthorized') }, { status: 401 });
    }

    // Validate request body
    const rawBody = await request.json();
    const parsed = PaymentBodySchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: t('api.general.errors.missingParameters') },
        { status: 400 }
      );
    }

    const { planId, companyId, billingInterval, phoneNumber, provider, customerEmail, customerName, customerPhone } = parsed.data;

    // Verify the company belongs to the authenticated user
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('id', companyId)
      .eq('user_id', user.id)
      .single();

    if (companyError || !company) {
      return NextResponse.json({ error: t('api.general.errors.notFound') }, { status: 404 });
    }

    // Forward to edge function with user's JWT
    const edgeFunctionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/fedapay-payment`;

    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        planId,
        companyId,
        billingInterval,
        phoneNumber,
        provider,
        customerEmail,
        customerName,
        customerPhone,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || t('api.payment.fedapay.errors.paymentFailed') },
        { status: response.status }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    // Log full error server-side only — never expose to client
    console.error('Payment API error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
