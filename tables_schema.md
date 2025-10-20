# Supabase Database Schema - Angelina AI Project

## Table: products
- **Schema**: public
- **RLS Enabled**: false
- **Rows**: 0
- **Primary Keys**: id
- **Columns**:
  - `id` (uuid) - Default: gen_random_uuid()
  - `name` (varchar) - Required
  - `description` (text) - Nullable
  - `is_price_fixed` (boolean) - Default: true
  - `price` (numeric) - Nullable
  - `min_price` (numeric) - Nullable
  - `max_price` (numeric) - Nullable
  - `stock_quantity` (integer) - Default: 0
  - `image_url` (text) - Nullable
  - `created_at` (timestamp) - Default: CURRENT_TIMESTAMP
  - `company_id` (uuid) - Nullable

## Table: users
- **Schema**: public
- **RLS Enabled**: false
- **Rows**: 1
- **Primary Keys**: id
- **Columns**:
  - `id` (uuid) - Default: gen_random_uuid()
  - `full_name` (varchar) - Nullable
  - `email` (varchar) - Nullable
  - `phone` (varchar) - Nullable
  - `role` (user_role enum) - Default: 'customer', Options: [customer, manager, staff, admin]
  - `created_at` (timestamp) - Default: CURRENT_TIMESTAMP
  - `company_id` (uuid) - Nullable

## Table: orders
- **Schema**: public
- **RLS Enabled**: false
- **Rows**: 0
- **Primary Keys**: id
- **Columns**:
  - `id` (uuid) - Default: gen_random_uuid()
  - `user_id` (uuid) - Required
  - `status` (order_status enum) - Default: 'pending', Options: [pending, confirmed, preparing, completed, cancelled]
  - `total_amount` (numeric) - Default: 0
  - `special_instructions` (text) - Nullable
  - `created_at` (timestamp) - Default: CURRENT_TIMESTAMP
  - `company_id` (uuid) - Nullable

## Table: order_items
- **Schema**: public
- **RLS Enabled**: false
- **Rows**: 0
- **Primary Keys**: id
- **Columns**:
  - `id` (uuid) - Default: gen_random_uuid()
  - `order_id` (uuid) - Nullable
  - `product_id` (uuid) - Nullable
  - `quantity` (integer) - Required
  - `price_each` (numeric) - Required
  - `total_price` (numeric) - Required

## Table: complaints
- **Schema**: public
- **RLS Enabled**: false
- **Rows**: 0
- **Primary Keys**: id
- **Columns**:
  - `id` (uuid) - Default: gen_random_uuid()
  - `user_id` (uuid) - Nullable
  - `order_id` (uuid) - Nullable
  - `company_id` (uuid) - Nullable
  - `complaint_text` (text) - Required
  - `status` (complaint_status enum) - Default: 'open', Options: [open, in_progress, resolved, closed]
  - `created_at` (timestamp) - Default: CURRENT_TIMESTAMP
  - `resolved_at` (timestamp) - Nullable

## Table: companies
- **Schema**: public
- **RLS Enabled**: false
- **Rows**: 1
- **Primary Keys**: id
- **Columns**:
  - `id` (uuid) - Default: gen_random_uuid(), Unique
  - `user_id` (uuid) - Required
  - `subscription_id` (uuid) - Nullable
  - `name` (varchar) - Required
  - `type` (company_type enum) - Default: 'restaurant', Options: [restaurant, retail, service, other]
  - `address` (text) - Nullable
  - `phone` (varchar) - Nullable
  - `email` (varchar) - Nullable
  - `description` (text) - Nullable
  - `avatar_url` (text) - Nullable
  - `subscription_status` (subscription_status enum) - Default: 'inactive', Options: [active, inactive, cancelled, trial]
  - `created_at` (timestamp) - Default: CURRENT_TIMESTAMP

## Table: subscription_plans
- **Schema**: public
- **RLS Enabled**: false
- **Rows**: 3
- **Primary Keys**: id
- **Columns**:
  - `id` (uuid) - Default: gen_random_uuid()
  - `title` (varchar) - Required
  - `description` (text) - Required
  - `price_monthly` (numeric) - Required
  - `yearly_discount_percent` (integer) - Default: 0
  - `created_at` (timestamp) - Default: CURRENT_TIMESTAMP

## Table: subscription_features
- **Schema**: public
- **RLS Enabled**: false
- **Rows**: 11
- **Primary Keys**: id
- **Columns**:
  - `id` (uuid) - Default: gen_random_uuid()
  - `plan_id` (uuid) - Nullable
  - `feature` (text) - Required

## Table: payments
- **Schema**: public
- **RLS Enabled**: false
- **Rows**: 0
- **Primary Keys**: id
- **Columns**:
  - `id` (uuid) - Default: gen_random_uuid()
  - `company_id` (uuid) - Nullable
  - `plan_id` (uuid) - Nullable
  - `amount` (numeric) - Required
  - `currency` (varchar) - Default: 'USD'
  - `payment_status` (varchar) - Default: 'pending'
  - `provider` (varchar) - Nullable
  - `transaction_id` (varchar) - Nullable
  - `created_at` (timestamp) - Default: CURRENT_TIMESTAMP

## Table: data_schema
- **Schema**: public
- **RLS Enabled**: true
- **Rows**: 6
- **Primary Keys**: id
- **Columns**:
  - `id` (uuid) - Default: gen_random_uuid()
  - `created_at` (timestamptz) - Default: now()
  - `table_name` (varchar) - Default: ''
  - `schema` (text) - Default: ''

## Enums Defined:
- **user_role**: customer, manager, staff, admin
- **order_status**: pending, confirmed, preparing, completed, cancelled
- **complaint_status**: open, in_progress, resolved, closed
- **company_type**: restaurant, retail, service, other
- **subscription_status**: active, inactive, cancelled, trial
---


# INTERFACE MISMATCHES ANALYSIS

## Critical Mismatches Found:

### 1. **Company Interface Issues**
**Database Schema vs Interface:**
- ❌ **ID Field**: DB uses `id` (uuid), Interface uses `company_id` (number)
- ❌ **ID Type**: DB uses UUID, Interface uses number
- ❌ **CompanyType Enum**: 
  - DB: [restaurant, retail, service, other]
  - Interface: ['restaurant', 'shop', 'retail', 'service'] (missing 'other', has extra 'shop')
- ❌ **Missing Fields in Interface**: `user_id` (required in DB)

### 2. **User Interface Issues**
**Database Schema vs Interface:**
- ❌ **ID Field**: DB uses `id` (uuid), Interface uses `user_id` (string)
- ❌ **UserRole Enum**:
  - DB: [customer, manager, staff, admin]
  - Interface: ['admin', 'manager', 'employee', 'customer'] (missing 'staff', has extra 'employee')
- ❌ **Missing Fields in Interface**: `avatar_url` field exists in interface but not in DB schema

### 3. **Product Interface Issues**
**Database Schema vs Interface:**
- ❌ **ID Field**: DB uses `id` (uuid), Interface uses `product_id` (number)
- ❌ **ID Type**: DB uses UUID, Interface uses number
- ❌ **Image Field**: DB has `image_url` (text), Interface has `image_urls` (string[])

### 4. **SubscriptionPlan Interface Issues**
**Database Schema vs Interface:**
- ❌ **ID Field**: DB uses `id` (uuid), Interface uses `plan_id` (number)
- ❌ **ID Type**: DB uses UUID, Interface uses number

### 5. **SubscriptionFeature Interface Issues**
**Database Schema vs Interface:**
- ❌ **ID Field**: DB uses `id` (uuid), Interface uses `feature_id` (number)
- ❌ **ID Type**: DB uses UUID, Interface uses number

### 6. **Payment Interface Issues**
**Database Schema vs Interface:**
- ❌ **ID Field**: DB uses `id` (uuid), Interface uses `payment_id` (number)
- ❌ **ID Type**: DB uses UUID, Interface uses number
- ❌ **PaymentStatus Enum**:
  - DB: Uses varchar with default 'pending' (no enum defined)
  - Interface: ['pending', 'completed', 'failed', 'cancelled', 'refunded']

### 7. **Missing Tables in Interfaces**
The following tables exist in DB but have no corresponding interfaces:
- ❌ **orders** table (with order_status enum)
- ❌ **order_items** table
- ❌ **complaints** table (with complaint_status enum)
- ❌ **data_schema** table

## Summary of Required Fixes:

1. **Change all ID fields from number to string (UUID)**
2. **Update enum values to match database exactly**
3. **Add missing interfaces for orders, order_items, complaints, data_schema**
4. **Fix field name mismatches (id vs *_id)**
5. **Update image handling (image_url vs image_urls)**
6. **Add missing required fields like user_id in companies**
7. **Remove fields that don't exist in DB (like avatar_url in users)**
--
-

# FIXES APPLIED ✅

## Database Interface Updates:
1. ✅ **Updated all ID fields from `*_id` to `id`** (company_id → id, user_id → id, etc.)
2. ✅ **Changed all ID types from `number` to `string`** (UUID support)
3. ✅ **Fixed enum mismatches**:
   - CompanyType: Added 'other', removed 'shop'
   - UserRole: Changed 'employee' to 'staff'
   - Added missing enums: OrderStatus, ComplaintStatus
4. ✅ **Added missing interfaces**: Order, OrderItem, Complaint, DataSchema
5. ✅ **Fixed image handling**: Changed `image_urls` (array) to `image_url` (single string)
6. ✅ **Removed non-existent fields**: avatar_url from User interface

## Code Updates Applied:
1. ✅ **AuthContext.tsx**: Fixed user/company lookup queries
2. ✅ **useSubscriptions.ts**: Updated feature_id → id
3. ✅ **usePayments.ts**: Updated company field references and plan_id → id
4. ✅ **Dashboard Users**: Fixed all user CRUD operations
5. ✅ **Dashboard Products**: Fixed all product CRUD operations and image handling
6. ✅ **Dashboard Company**: Fixed company update operations
7. ✅ **Dashboard Subscription**: Fixed plan ID references
8. ✅ **API Routes**: Updated field references in payments and subscriptions
9. ✅ **UI Components**: Updated all modals and forms to use correct field names
10. ✅ **Image Handling**: Converted from multiple images to single image throughout

## Database Schema Alignment:
- ✅ All TypeScript interfaces now match the actual Supabase database schema
- ✅ All field names are consistent (using `id` instead of `*_id`)
- ✅ All data types are correct (UUID strings instead of numbers)
- ✅ All enums match the database exactly
- ✅ All missing tables now have corresponding interfaces

Your project is now fully aligned with your Supabase database schema! 🎉---

# 
AUTHENTICATION & SUBSCRIPTION FIXES ✅

## Issues Fixed:

### 1. ✅ **Subscription Plans Relationship Error**
- **Problem**: Foreign key relationship missing between subscription_plans and subscription_features
- **Solution**: 
  - Cleaned up orphaned subscription_features records
  - Recreated features with correct plan_id references
  - Added proper foreign key constraint

### 2. ✅ **User Lookup 406 Error**
- **Problem**: AuthContext was failing to fetch user data properly
- **Solution**: 
  - Added proper error handling in fetchUserCompany function
  - Improved auth state change handling
  - Added loading states for better UX

### 3. ✅ **Authentication-Aware Navigation**
- **Updated Components**:
  - **Navbar**: Shows login/logout buttons or user avatar with dropdown
  - **Header**: Dynamic authentication buttons based on user state
  - **HeroSection**: CTA button redirects to dashboard if logged in, register if not
  - **PricingSection**: CTA buttons redirect to subscription management if logged in

### 4. ✅ **Consistent App Startup Flow**
- **Main Page (/)**: 
  - Shows loading screen while checking auth
  - Redirects authenticated users to dashboard
  - Redirects unauthenticated users to marketing page
- **LoadingScreen Component**: Created for better loading UX

### 5. ✅ **Smart CTA Button Routing**
- All "Get Started", "Commencez maintenant", and similar buttons now:
  - Redirect to `/dashboard` if user is authenticated
  - Redirect to `/register` if user is not authenticated
  - Show appropriate loading states

## Components Updated:
1. ✅ `AuthContext.tsx` - Better error handling and loading states
2. ✅ `Navbar.tsx` - Authentication-aware navigation
3. ✅ `Header.tsx` - Dynamic auth buttons and user menu
4. ✅ `HeroSection.tsx` - Smart CTA routing
5. ✅ `PricingSection.tsx` - Authentication-aware plan selection
6. ✅ `page.tsx` - Smart startup routing
7. ✅ `LoadingScreen.tsx` - New loading component

## Database Fixes:
1. ✅ Fixed subscription_features foreign key relationship
2. ✅ Cleaned up orphaned data
3. ✅ Verified subscription plans query works correctly

Your app now provides a seamless authentication experience! 🎉