import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Look up company directly by owner — avoids cross-table join and is RLS-safe
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!company?.id) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    const { data: payments, error } = await supabase
      .from('payments')
      .select(`*, subscription_plans(id, title, description)`)
      .eq('company_id', company.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching payments:', error.message)
      return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
    }

    const transformedPayments = payments?.map(p => ({ ...p, plan: p.subscription_plans })) ?? []
    return NextResponse.json({ payments: transformedPayments })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
