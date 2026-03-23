# RLS Setup Checklist

## ✅ Completed

1. ✅ Created RLS policies for payments table:
   - Edge Functions can create payments (service_role)
   - Edge Functions can update payments (service_role)
   - Users can create payments for their company (authenticated)
   - Users can update their company payments (authenticated)
   - Users can view their company payments (public)

2. ✅ Created admin Supabase client (`src/lib/supabase/admin.ts`)
   - Uses service role key for elevated permissions
   - Bypasses RLS for webhook operations

3. ✅ Updated webhook handler (`/api/fedapay-payment/status`)
   - Now uses admin client for payment updates
   - Properly bypasses RLS for external webhooks

4. ✅ Updated `.env.example` with service role key documentation

5. ✅ Created documentation:
   - `docs/RLS_PAYMENTS_SETUP.md` - Detailed RLS setup guide
   - `docs/RLS_SETUP_CHECKLIST.md` - This checklist

## 🔧 Action Required

### 1. Add Service Role Key to Environment

You need to add the service role key to your environment files:

**Local Development** (`.env.local`):
```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Production** (Deployment platform):
Add the same environment variable to your production deployment (Vercel, Railway, etc.)

**Where to find it**:
1. Go to your Supabase project dashboard
2. Navigate to: **Settings → API**
3. Under "Project API keys", copy the **service_role** key (marked as secret)

### 2. Test the Setup

**Test webhook functionality**:
```bash
# Send a test webhook to verify payment updates work
curl -X POST https://your-app.com/api/fedapay-payment/status \
  -H "Content-Type: application/json" \
  -H "x-fedapay-signature: your_test_signature" \
  -d '{"transaction_id": "test_123", "status": "approved"}'
```

**Test authenticated user access**:
1. Log in to the dashboard
2. Navigate to subscription/payment history
3. Verify you can see your company's payments
4. Try to create a test payment

### 3. Verify RLS Policies

Run this query in Supabase SQL Editor to verify all policies are active:

```sql
SELECT 
  policyname,
  cmd as operation,
  roles
FROM pg_policies 
WHERE tablename = 'payments'
ORDER BY policyname;
```

Expected output: 5 policies (2 for service_role, 2 for authenticated, 1 for public)

## 🔒 Security Reminders

- ✅ Never commit `.env.local` or `.env` files to git
- ✅ Keep service role key secret (it bypasses all RLS)
- ✅ Only use admin client in server-side code (never in browser)
- ✅ Always verify webhook signatures before processing
- ✅ Rotate service role key if it's ever exposed

## 📝 Notes

- The admin client is only used in webhook handlers
- Regular API routes continue using the standard server client
- User operations respect RLS and only access their company's data
- Edge Functions automatically use service role when deployed to Supabase
