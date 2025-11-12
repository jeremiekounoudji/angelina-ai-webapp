import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createTranslationFunction } from '@/locales';

export async function POST(request: NextRequest) {
    let isSent=false;

  try {
    const supabase = await createClient();
    
    // Get locale from request headers
    const locale = (request.headers.get('Accept-Language')?.split('-')[0] as 'en' | 'fr') || 'en';
    const t = createTranslationFunction(locale);
    
    // Get the current user and session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return NextResponse.json({ error: t('api.general.errors.unauthorized') }, { status: 401 });
    }

    // Get the session to extract the JWT token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.access_token) {
      console.error('Session error:', sessionError);
      return NextResponse.json({ error: t('api.general.errors.unauthorized') }, { status: 401 });
    }

    const body = await request.json();
     
    if (!isSent) {
      isSent=true
      const { planId, companyId, billingInterval, phoneNumber, provider, customerEmail } = body;

    console.log('User authenticated:', user.id);
    console.log('Request body:', { planId, companyId, billingInterval, phoneNumber, provider });

    // Verify the company belongs to the user
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .eq('user_id', user.id)
      .single();
    
    if (companyError || !company) {
      console.error('Company error:', companyError);
      return NextResponse.json({ error: t('api.general.errors.notFound') }, { status: 404 });
    }

    console.log('Company verified:', company.id);

    // Call the edge function with user's JWT token
    const edgeFunctionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/fedapay-payment`;
    
    console.log('Calling edge function:', edgeFunctionUrl);
    
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
        customerEmail
      }),
    });

    console.log('Edge function response status:', response.status);
    
    const data = await response.json();
    console.log('Edge function response data:', data);

    if (!response.ok) {
     isSent=false;

      console.error('Edge function error:', data.error || 'Unknown error');
      console.error('Response status:', response.status);
      return NextResponse.json({ 
        error: data.error || t('api.payment.fedapay.errors.paymentFailed'),
        details: data 
      }, { status: response.status });
    }
     isSent=false;

    return NextResponse.json(data);
  } 
      
    }catch (error) {
    console.error('Payment API error:', error);
    isSent=false
    return NextResponse.json({ 
      error: 'Server error occurred',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}