# Translation Audit - All Text Content by Location

## Pages

### Marketing Landing Page (`src/app/marketing/page.tsx`)
- Hero section: title, subtitle, CTA buttons
- Features section: titles, descriptions
- Pricing section: plan names, features, prices
- FAQ section: questions and answers
- Testimonials: names, roles, content
- How it works: step titles and descriptions
- Enterprise section: titles, descriptions
- Footer: links, copyright

### Authentication Pages
#### Login (`src/app/login/page.tsx`)
- Page title, form labels, buttons, error messages, links

#### Register (`src/app/register/page.tsx`)
- Page title, form labels, buttons, error messages, links

### Dashboard Pages
#### Main Dashboard (`src/app/dashboard/page.tsx`)
- Welcome messages, metrics labels, chart titles

#### Company Management (`src/app/dashboard/company/page.tsx`)
- Page title, form labels, buttons, table headers
- MetricsCards component: metric names, values

#### Products Management (`src/app/dashboard/products/page.tsx`)
- Page title, table headers, buttons, status labels
- AddProductModal: form labels, validation messages
- EditProductModal: form labels, validation messages

#### Users Management (`src/app/dashboard/users/page.tsx`)
- Page title, table headers, buttons, status labels

#### Subscription (`src/app/dashboard/subscription/page.tsx`)
- Plan details, payment history, upgrade buttons
- PaymentModal: form labels, payment messages

#### Settings (`src/app/dashboard/settings/page.tsx`)
- Settings categories, form labels, descriptions

## Components

### Navigation
#### Navbar (`src/app/marketing/components/Navbar.tsx`)
- Menu items, language selector, CTA buttons

#### DashboardSidebar (`src/app/dashboard/components/DashboardSidebar.tsx`)
- Menu items, section titles

#### DashboardHeader (`src/app/dashboard/components/DashboardHeader.tsx`)
- User menu, notifications, breadcrumbs

### Shared Components
#### PaymentHistory (`src/app/dashboard/components/PaymentHistory.tsx`)
- Table headers, status labels, date formats

#### PricingSection (`src/app/marketing/components/PricingSection.tsx`)
- Plan names, features, pricing labels

## Hooks (Error/Success Messages)

### useProducts (`src/hooks/useProducts.ts`)
- Success: "Product created successfully", "Product updated successfully", "Product deleted successfully"
- Errors: "Failed to create product", "Failed to update product", "Failed to delete product"

### useSubscriptions (`src/hooks/useSubscriptions.ts`)
- Success: "Subscription updated successfully", "Payment processed successfully"
- Errors: "Failed to update subscription", "Payment failed", "Invalid payment method"

### usePlanLimits (`src/hooks/usePlanLimits.ts`)
- Errors: "Plan limit exceeded", "Upgrade required", "Feature not available"

### useMetrics (`src/hooks/useMetrics.ts`)
- Errors: "Failed to load metrics", "Data unavailable"

## API Routes (Error/Success Messages)

### Auth API (`src/app/api/auth/signup/route.ts`)
- Success: "Account created successfully", "Welcome email sent"
- Errors: "Email already exists", "Invalid email format", "Password too weak", "Registration failed"

### Payment API (`src/app/api/fedapay-payment/route.ts`)
- Success: "Payment initiated successfully", "Payment completed"
- Errors: "Payment failed", "Invalid payment data", "Payment provider error"

### Payment Status API (`src/app/api/fedapay-payment/status/route.ts`)
- Success: "Payment status updated"
- Errors: "Payment not found", "Status update failed"

## Form Validation Messages
- Required field errors
- Email format errors
- Password strength errors
- File upload errors
- Network connection errors

## Date/Time Formats
- Relative dates (e.g., "2 days ago")
- Absolute dates (e.g., "January 15, 2024")
- Time formats (e.g., "2:30 PM")

## Status Labels
- Active/Inactive
- Pending/Completed/Failed
- Online/Offline
- Enabled/Disabled

## Button Labels
- Save/Cancel
- Submit/Reset
- Edit/Delete
- Add/Remove
- Upload/Download
- Next/Previous

## Loading States
- "Loading...", "Please wait...", "Processing..."
- "Saving...", "Updating...", "Deleting..."

## Empty States
- "No data available"
- "No products found"
- "No users found"
- "No payment history"