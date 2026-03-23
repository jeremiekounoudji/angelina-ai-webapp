# RLS Setup for Payments Table

## Overview

Row Level Security (RLS) policies have been configured on the `payments` table to control access based on user roles and authentication context.

## Policies Created

### 1. Edge Functions can create payments
- **Operation**: INSERT
- **Role**: `service_role`
- **Purpose**: Allows Edge Functions and webhooks to create payment records
- **Use Case**: Payment processing from external providers (FedaPay)

### 2. Edge Functions can update payments
- **Operation**: UPDATE
- **Role**: `service_role`
- **Purpose**: Allows Edge Functions and webhooks to update payment status
- **Use Case**: Payment status updates from webhooks (approved, failed, etc.)

### 3. Users can create payments for their company
- **Operation**: INSERT
- **Role**: `authenticated`
- **Purpose**: Allows authenticated users to create payments for their own company
- **Use Case**: Direct payment initiation from the dashboard

### 4. Users can update their company payments
- **Operation**: UPDATE
- **Role**: `authenticated`
- **Purpose**: Allows authenticated users to update their company's payment records
- **Use Case**: Payment status updates from the dashboard

### 5. Users can view their company payments
- **Operation**: SELECT
- **Role**: `public`
- **Purpose**: Allows users to view payments for companies they own
- **Use Case**: Payment history display in the dashboard

## Implementation Details

### Admin Client for Webhooks

A new admin client has been created at `src/lib/supabase/admin.ts` that uses the service role key to bypass RLS. This client should ONLY be used in:

- Webhook handlers (e.g., `/api/fedapay-payment/status`)
- Server-side operations requiring elevated permissions
- Edge Functions

**Important**: Never expose the admin client to the browser!

### Environment Variables

The following environment variable is required:

```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

You can find this key in your Supabase project settings under:
**Settings → API → Project API keys → service_role (secret)**

### Usage Example

```typescript
// Webhook handler using admin client
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  // Verify webhook signature first...
  
  const supabase = createAdminClient();
  
  // This bypasses RLS and can update any payment
  await supabase
    .from('payments')
    .update({ payment_status: 'completed' })
    .eq('transaction_id', transactionId);
}
```

### Regular Client for User Operations

For authenticated user operations, continue using the regular server client:

```typescript
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  
  // This respects RLS and only returns payments for the user's company
  const { data } = await supabase
    .from('payments')
    .select('*');
}
```

## Security Considerations

1. **Service Role Key**: Keep this key secret and never commit it to version control
2. **Webhook Verification**: Always verify webhook signatures before processing
3. **User Validation**: The authenticated user policies verify company ownership
4. **Idempotency**: Webhook handlers check for duplicate processing

## Testing

To test the RLS policies:

1. **As authenticated user**: Try to view/create/update payments for your company
2. **As webhook**: Send a test webhook to verify payment updates work
3. **Cross-company**: Verify users cannot access other companies' payments

## Migration Applied

Migration name: `add_edge_function_payments_policies`

This migration added all the policies listed above to the `payments` table.
