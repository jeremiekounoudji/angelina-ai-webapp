# Backend Integration Setup Guide

This guide will help you set up the complete backend integration with Supabase for your application.

## Prerequisites

1. A Supabase account and project
2. Node.js and npm installed
3. Basic understanding of React and Next.js

## Setup Steps

### 1. Supabase Project Setup

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for the project to be fully initialized
3. Go to Settings > API to get your project URL and anon key

### 2. Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Supabase credentials in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 3. Database Setup

1. In your Supabase dashboard, go to the SQL Editor
2. Copy and paste the contents of `database-setup.sql`
3. Run the SQL script to create all tables, types, and policies

### 4. Storage Setup

The SQL script automatically creates the storage buckets, but you can verify:

1. Go to Storage in your Supabase dashboard
2. You should see two buckets:
   - `avatars` - for user and company profile pictures
   - `products` - for product images

### 5. Authentication Setup

1. In Supabase dashboard, go to Authentication > Settings
2. Configure your site URL (e.g., `http://localhost:3000` for development)
3. Add any additional redirect URLs if needed

### 6. Install Dependencies

Make sure all dependencies are installed:
```bash
npm install
```

### 7. Run the Application

Start the development server:
```bash
npm run dev
```

## Features Implemented

### Authentication System
- **Login Page** (`/login`) - Email/password authentication
- **Registration Page** (`/register`) - Two-step registration process:
  1. User account creation (email/password)
  2. Company profile setup
- **Protected Routes** - Automatic redirect to login for unauthenticated users

### Dashboard System
- **Responsive Layout** - Sidebar navigation with company card
- **Company Management** - View and edit company profile with avatar upload
- **User Management** - Add, edit, delete team members with role-based access
- **Subscription Management** - View current plan and upgrade options
- **Product Management** - Full CRUD operations for products with image uploads

### Database Schema

#### Companies Table
- `company_id` (Primary Key)
- `name` (Company name)
- `type` (restaurant, shop, retail, service)
- `address`, `phone`, `email` (Contact information)
- `description` (Company description)
- `avatar_url` (Profile picture)
- `subscription_id`, `subscription_status` (Billing information)

#### Users Table
- `user_id` (UUID, linked to Supabase Auth)
- `company_id` (Foreign key to companies)
- `full_name`, `email`, `phone` (User information)
- `role` (admin, manager, employee, customer)
- `avatar_url` (Profile picture)

#### Products Table
- `product_id` (Primary Key)
- `company_id` (Foreign key to companies)
- `name`, `description` (Product information)
- `is_price_fixed` (Boolean for pricing type)
- `price` (Fixed price) OR `min_price`/`max_price` (Price range)
- `stock_quantity` (Inventory count)
- `image_urls` (Array of product images)

### Security Features
- **Row Level Security (RLS)** - Users can only access their company's data
- **Role-based Access Control** - Different permissions for admin/manager/employee roles
- **Secure File Upload** - Images stored in Supabase Storage with proper policies

### UI Components
- **Hero UI Integration** - Modern, accessible components throughout
- **Upload Progress Tracking** - Real-time progress for file uploads
- **Form Validation** - Comprehensive validation with Zod schemas
- **Responsive Design** - Works on desktop and mobile devices
- **Toast Notifications** - User feedback for actions (ready for implementation)

## Next Steps

### Payment Integration
The subscription system is ready for payment processor integration:
- Stripe integration for subscription billing
- PayPal or other payment methods
- Webhook handling for subscription updates

### Additional Features
- Email notifications
- Advanced analytics dashboard
- API endpoints for mobile apps
- Multi-language support
- Advanced reporting

## Troubleshooting

### Common Issues

1. **Authentication not working**
   - Check environment variables are set correctly
   - Verify Supabase project URL and keys
   - Ensure site URL is configured in Supabase Auth settings

2. **Database errors**
   - Verify the SQL script ran successfully
   - Check RLS policies are enabled
   - Ensure user has proper permissions

3. **File upload issues**
   - Check storage buckets exist and are public
   - Verify storage policies are set correctly
   - Ensure file size limits are appropriate

4. **Build errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check for TypeScript errors
   - Verify all imports are correct

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Review Supabase logs in the dashboard
3. Verify all environment variables are set
4. Ensure the database schema matches the application code

The application is now ready for production deployment with a complete backend system!