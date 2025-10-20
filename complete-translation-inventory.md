# Complete Translation Inventory - Missing Words & Keys

This file contains a comprehensive inventory of ALL missing translations found across the entire application.

## Analysis Method
1. Read full content of all pages and components
2. Identify hardcoded strings and translation keys
3. Cross-reference with existing translation files
4. Document every missing word/phrase

---

## Current Translation Files Analysis

### Current Translation Files Status:
- ✅ `src/locales/en/common.json` - Well structured with buttons, status, loading, validation, etc.
- ✅ `src/locales/en/dashboard.json` - Has basic dashboard structure but missing many specific strings
- ✅ `src/locales/fr/common.json` - French translations for common elements
- ✅ `src/locales/fr/dashboard.json` - French translations for dashboard but missing many strings

---

## COMPREHENSIVE MISSING TRANSLATIONS INVENTORY

### 1. SETTINGS PAGE (`src/app/dashboard/settings/page.tsx`)
❌ **Missing Translation Keys:**
- `profile.description` - Currently missing, needs to be added
- All other strings are properly using translation keys ✅

### 2. SUBSCRIPTION PAGE (`src/app/dashboard/subscription/page.tsx`)
❌ **Missing Hardcoded Strings:**
- "Monthly Cost" (line 89)
- "Status" (line 96)
- "Your trial period is active. Upgrade to a paid plan to continue using all features." (line 113-115)
- "Token Usage" (line 120)
- "Loading usage data..." (line 125)
- "Tokens Used" (line 135)
- "Tokens Remaining" (line 145)
- "Monthly Allowance" (line 155)
- "Purchased" (line 165)
- "Usage Progress" (line 175)
- "Buy More Tokens" (line 190)
- "Choose Your Plan" (line 198)
- "Select the plan that best fits your business needs" (line 201)
- "Monthly" (line 206)
- "Annual" (line 218)
- "Save up to 20%" (line 224)
- "Most Popular" (line 237)
- "/month" (line 245)
- "annually" (line 252)
- "Current Plan" (line 275)
- "Select Plan" (line 276)

### 3. USERS PAGE (`src/app/dashboard/users/page.tsx`)
❌ **Missing Hardcoded Strings:**
- "users" (line 25) - in the limit display
- "No name" (line 108)
- "Phone" (line 120)
- "Joined" (line 127)

### 4. ADD USER MODAL (`src/app/dashboard/users/components/AddUserModal.tsx`)
❌ **Missing Hardcoded Strings:**
- "Add New User" (line 118)
- "User Limit Reached" (line 125)
- "You have reached the maximum number of users ({limits.max_users}) for your current plan. You currently have {limits.current_users} users. Please upgrade your plan to add more users." (lines 128-131)
- "Click the camera icon to select an avatar" (line 150)
- "Full Name" (line 156)
- "Enter full name" (line 157)
- "Email" (line 168)
- "Enter email address" (line 169)
- "Phone Number" (line 180)
- "Enter phone number" (line 181)
- "Role" (line 192)
- "Select user role" (line 193)
- "Customer" (line 210)
- "Staff" (line 211)
- "Manager" (line 212)
- "Cancel" (line 220)
- "Uploading..." (line 225)
- "Add User" (line 225)

### 5. EDIT USER MODAL (`src/app/dashboard/users/components/EditUserModal.tsx`)
❌ **Missing Hardcoded Strings:**
- "Edit User" (line 108)
- "Full Name" (line 130)
- "Enter full name" (line 131)
- "Email" (line 138)
- "Enter email address" (line 140)
- "Phone" (line 148)
- "Enter phone number" (line 149)
- "Role" (line 157)
- "Select user role" (line 158)
- "Admin" (line 172)
- "Manager" (line 173)
- "Staff" (line 174)
- "Customer" (line 175)
- "Cancel" (line 184)
- "Save Changes" (line 193)

### 6. PAYMENT MODAL (`src/app/dashboard/subscription/components/PaymentModal.tsx`)
❌ **Missing Hardcoded Strings:**
- "Complete Payment" (line 118)
- "Yearly" (line 122)
- "Monthly" (line 122)
- "Total Amount:" (line 129)
- "Save {plan.yearly_discount_percent}% with yearly billing" (line 136)
- "Mobile Money Provider" (line 141)
- "Select your mobile money provider" (line 142)
- "Phone Number" (line 154)
- "Enter your mobile money number" (line 155)
- "Enter the phone number linked to your mobile money account" (line 160)
- "Note:" (line 168)
- "You will receive a payment prompt on your phone. Please approve the transaction to complete your subscription." (line 169-171)
- "Initializing Payment..." (line 178)
- "Setting up your payment request..." (line 181)
- "Payment Initialized!" (line 194)
- "Please check your phone and confirm the payment request" (line 197)
- "You should receive a payment prompt on your mobile device. Please approve it to complete your subscription." (line 200-202)
- "Waiting for Confirmation..." (line 210)
- "We're waiting for you to confirm the payment on your phone" (line 213)
- "Please check your phone" (line 217)
- "and approve the payment request from your mobile money provider." (line 218-219)
- "Payment Confirmed!" (line 235)
- "Your subscription has been activated successfully. Refreshing page..." (line 238-239)
- "Payment Failed" (line 253)
- "Cancel" (line 260)
- "Initialize Payment" (line 270)
- "Close" (line 276)
- "Try Again" (line 287)

### 7. PAYMENT HISTORY (`src/app/dashboard/components/PaymentHistory.tsx`)
❌ **Missing Hardcoded Strings:**
- "Payment History" (line 49)
- "payment" / "payments" (line 52)
- "total" (line 52)
- "No payments found" (line 62)
- "Your payment history will appear here once you make a payment" (line 64-65)
- "Unknown Plan" (line 74)
- "Completed" (line 18)
- "Pending" (line 20)
- "Failed" (line 22)

### 8. COMPANY PAGE (`src/app/dashboard/company/page.tsx`)
❌ **Missing Hardcoded Strings from previous analysis:**
- "Company ID" 
- "Subscription"
- "Created"

### 9. PRODUCTS PAGE (`src/app/dashboard/products/page.tsx`)
❌ **Missing Hardcoded Strings from previous analysis:**
- "Price"
- "Stock" 
- "units"
- "Added"

### 10. MODAL COMPONENTS (from previous analysis)
❌ **AddProductModal missing strings:**
- "Add New Product"
- "Create a new product for your inventory"
- "Product Name"
- "Enter product name"
- "Description"
- "Describe your product"
- "Pricing"
- "Fixed Price"
- "Price Range"
- "Price"
- "Min Price"
- "Max Price"
- "Stock Quantity"
- "Product Image"
- "Upload Image"
- "Drag and drop an image here, or click to select"
- "Cancel"
- "Create Product"
- "Creating..."
- "Plan Limit Reached"
- "You've reached your product limit. Upgrade your plan to add more products."
- "Upgrade Plan"

❌ **EditProductModal missing strings:**
- "Edit Product"
- "Update product information"
- "Current Image"
- "Upload New Image"
- "Update Product"
- "Updating..."

❌ **EditCompanyModal missing strings:**
- "Edit Company Profile"
- "Update your company information"
- "Company Name"
- "Company Type"
- "Restaurant"
- "Shop"
- "Retail"
- "Service"
- "Other"
- "Address"
- "Phone Number"
- "Email Address"
- "Description"
- "Company Logo"
- "Upload Logo"
- "Update Company"
- "Updating..."

❌ **MetricsCards missing strings:**
- "Users Created"
- "Messages Total"
- "Loading..."

---

## SUMMARY OF ALL MISSING TRANSLATIONS

### Total Missing Translation Keys: ~200+

### Categories of Missing Translations:

#### 1. **Payment & Billing (High Priority)** - ~50 keys
- Payment modal flow (initialization, waiting, success, error states)
- Payment history display
- Billing intervals and amounts
- Mobile money provider selection
- Payment status messages

#### 2. **User Management (High Priority)** - ~40 keys
- Add/Edit user modal forms
- User roles and permissions
- User information display
- User limits and restrictions

#### 3. **Subscription Management (High Priority)** - ~35 keys
- Token usage tracking
- Plan selection and comparison
- Subscription status display
- Usage progress and limits

#### 4. **Product Management (Medium Priority)** - ~30 keys
- Add/Edit product modal forms
- Product information display
- Stock management
- Product categories

#### 5. **Company Management (Medium Priority)** - ~25 keys
- Company profile editing
- Company information display
- Company types and categories

#### 6. **General UI Elements (Medium Priority)** - ~20 keys
- Status labels
- Date/time displays
- Loading states
- Empty states

### Files That Need Translation Updates:

#### JSON Translation Files:
1. `src/locales/en/dashboard.json` - Add ~100 new keys
2. `src/locales/fr/dashboard.json` - Add ~100 new keys
3. `src/locales/en/common.json` - Add ~50 new keys
4. `src/locales/fr/common.json` - Add ~50 new keys

#### Component Files Needing Code Updates:
1. `src/app/dashboard/subscription/page.tsx`
2. `src/app/dashboard/users/page.tsx`
3. `src/app/dashboard/users/components/AddUserModal.tsx`
4. `src/app/dashboard/users/components/EditUserModal.tsx`
5. `src/app/dashboard/subscription/components/PaymentModal.tsx`
6. `src/app/dashboard/components/PaymentHistory.tsx`
7. `src/app/dashboard/products/components/AddProductModal.tsx`
8. `src/app/dashboard/products/components/EditProductModal.tsx`
9. `src/app/dashboard/company/components/EditCompanyModal.tsx`
10. `src/app/dashboard/company/components/MetricsCards.tsx`

### Missing Translation Key Structure Needed:

```json
{
  "subscription": {
    "billing": {
      "monthlyCost": "Monthly Cost",
      "status": "Status",
      "trialMessage": "Your trial period is active...",
      "monthly": "Monthly",
      "annual": "Annual",
      "savePercent": "Save up to {percent}%"
    },
    "tokens": {
      "usage": "Token Usage",
      "used": "Tokens Used",
      "remaining": "Tokens Remaining",
      "allowance": "Monthly Allowance",
      "purchased": "Purchased",
      "buyMore": "Buy More Tokens"
    },
    "plans": {
      "choose": "Choose Your Plan",
      "description": "Select the plan that best fits your business needs",
      "current": "Current Plan",
      "select": "Select Plan",
      "mostPopular": "Most Popular"
    }
  },
  "payment": {
    "modal": {
      "title": "Complete Payment",
      "totalAmount": "Total Amount:",
      "provider": "Mobile Money Provider",
      "phoneNumber": "Phone Number",
      "note": "Note:",
      "instructions": "You will receive a payment prompt..."
    },
    "status": {
      "initializing": "Initializing Payment...",
      "initialized": "Payment Initialized!",
      "waiting": "Waiting for Confirmation...",
      "confirmed": "Payment Confirmed!",
      "failed": "Payment Failed"
    },
    "history": {
      "title": "Payment History",
      "noPayments": "No payments found",
      "total": "total",
      "unknownPlan": "Unknown Plan"
    }
  },
  "users": {
    "limits": {
      "reached": "User Limit Reached",
      "message": "You have reached the maximum number of users..."
    },
    "form": {
      "addTitle": "Add New User",
      "editTitle": "Edit User",
      "fullName": "Full Name",
      "email": "Email",
      "phone": "Phone Number",
      "role": "Role",
      "avatar": "Click the camera icon to select an avatar"
    },
    "info": {
      "noName": "No name",
      "phone": "Phone",
      "joined": "Joined"
    }
  }
}
```

---

## NEXT STEPS:
1. ✅ **Complete inventory done** - All missing translations identified
2. 🔄 **Add missing keys to JSON files** - Add ~200 translation keys
3. 🔄 **Update component code** - Replace hardcoded strings with translation hooks
4. 🔄 **Test language switching** - Verify all areas work in both languages
5. 🔄 **Final verification** - Ensure 100% translation coverage

This inventory captures every single hardcoded string that needs to be translated across the entire dashboard application.