# Missing Translations Audit

## Overview
This file catalogs all hardcoded text found in components and pages that need to be added to translation files.

## Methodology
1. Read full content of all pages and components
2. Identify hardcoded strings that should be translated
3. Note current translation key usage
4. List missing translations by file and category

---
## Dashboard Pages Analysis

### Settings Page (`src/app/dashboard/settings/page.tsx`)
✅ **Status: FULLY TRANSLATED** - All text uses translation keys

### Subscription Page (`src/app/dashboard/subscription/page.tsx`)
❌ **Missing Translations:**
- "Monthly Cost" (line 95)
- "Status" (line 105)
- "Your trial period is active. Upgrade to a paid plan to continue using all features." (line 118-120)
- "Token Usage" (line 125)
- "Loading usage data..." (line 130)
- "Tokens Used" (line 137)
- "Tokens Remaining" (line 147)
- "Monthly Allowance" (line 157)
- "Purchased" (line 167)
- "Usage Progress" (line 177)
- "Buy More Tokens" (line 194)
- "Choose Your Plan" (line 205)
- "Select the plan that best fits your business needs" (line 208)
- "Monthly" (line 212)
- "Annual" (line 225)
- "Save up to 20%" (line 228)
- "Most Popular" (line 240)
- "/month" (line 250)
- "annually" (line 254)
- "Current Plan" (line 270)
- "Select Plan" (line 271)

### Users Page (`src/app/dashboard/users/page.tsx`)
❌ **Missing Translations:**
- "users" (line 58) - in the limit display
- "No name" (line 108)
- "Phone" (line 125)
- "Joined" (line 131)

### Company Page (`src/app/dashboard/company/page.tsx`)
❌ **Missing Translations:**
- "Created" (line 108)
- "Company ID" (line 114)
- "Subscription" (line 119)

### Products Page (`src/app/dashboard/products/page.tsx`)
❌ **Missing Translations:**
- "products" (line 58) - in the limit display
- "Price" (line 139)
- "Stock" (line 145)
- "units" (line 147)
- "Added" (line 151)
- "Product Limit Reached" (line 163)
- Upgrade prompt description (line 164)

---## Dash
board Components Analysis

### PaymentHistory (`src/app/dashboard/components/PaymentHistory.tsx`)
❌ **Missing Translations:**
- "Payment History" (line 60)
- "payment" / "payments" (line 62)
- "total" (line 62)
- "No payments found" (line 73)
- "Your payment history will appear here once you make a payment" (line 75)
- "Unknown Plan" (line 85)
- "Completed", "Pending", "Failed" (lines 22-30)
- "/month" (line 115)

### DashboardHeader (`src/app/dashboard/components/DashboardHeader.tsx`)
❌ **Missing Translations:**
- "Company Profile" (line 6)
- "Team Management" (line 7)
- "Subscription & Billing" (line 8)
- "Product Management" (line 9)
- "Dashboard" (line 13)

### PaymentModal (`src/app/dashboard/subscription/components/PaymentModal.tsx`)
❌ **Missing Translations:**
- "Complete Payment" (line 179)
- "Yearly" / "Monthly" (line 183)
- "Plan" (line 183)
- "Total Amount:" (line 189)
- "Save X% with yearly billing" (line 195)
- "Mobile Money Provider" (line 199)
- "Select your mobile money provider" (line 200)
- "Phone Number" (line 210)
- "Enter your mobile money number" (line 211)
- "Enter the phone number linked to your mobile money account" (line 216)
- "Note:" (line 224)
- "You will receive a payment prompt on your phone. Please approve the transaction to complete your subscription." (line 224-227)
- "Initializing Payment..." (line 234)
- "Setting up your payment request..." (line 237)
- "Payment Initialized!" (line 250)
- "Please check your phone and confirm the payment request" (line 253)
- "You should receive a payment prompt on your mobile device. Please approve it to complete your subscription." (line 256-258)
- "Waiting for Confirmation..." (line 266)
- "We're waiting for you to confirm the payment on your phone" (line 269)
- "Please check your phone" (line 272)
- "and approve the payment request from your mobile money provider." (line 273-274)
- "Payment Confirmed!" (line 290)
- "Your subscription has been activated successfully. Refreshing page..." (line 293-294)
- "Payment Failed" (line 308)
- "Cancel" (line 315)
- "Initialize Payment" (line 322)
- "Close" (line 329)
- "Try Again" (line 340)

---