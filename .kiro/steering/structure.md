# Project Structure

## Root Directory

```
├── .env.local              # Environment variables (not committed)
├── .env.example            # Environment template
├── database-setup.sql      # Supabase database schema
├── next.config.ts          # Next.js configuration
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.js      # Tailwind + HeroUI config
├── eslint.config.mjs       # ESLint configuration
└── package.json            # Dependencies and scripts
```

## Source Structure (`src/`)

### `src/app/` - Next.js App Router
- **Route-based organization** following Next.js 15 conventions
- Each route folder contains `page.tsx` and optional `layout.tsx`
- Colocated components in `components/` subfolders

```
app/
├── layout.tsx              # Root layout with providers
├── page.tsx                # Home (redirects to /marketing)
├── providers.tsx           # Client-side providers wrapper
├── globals.css             # Global styles and Tailwind imports
├── marketing/              # Public landing page
│   ├── page.tsx
│   └── components/         # Marketing-specific components
├── login/                  # Authentication pages
├── register/
├── dashboard/              # Protected dashboard area
│   ├── layout.tsx          # Dashboard layout with sidebar
│   ├── page.tsx            # Dashboard home
│   ├── company/            # Company management
│   ├── users/              # Team member management
│   ├── products/           # Product/menu management
│   ├── subscription/       # Billing and plans
│   ├── settings/           # User settings
│   └── components/         # Shared dashboard components
└── api/                    # API routes
    ├── auth/               # Authentication endpoints
    └── fedapay-payment/    # Payment processing
```

### `src/components/` - Shared Components
- **Reusable UI components** used across multiple routes
- `ui/` - Base UI components (buttons, inputs, etc.)
- `icons/` - Custom SVG icon components
- Top-level: Feature components (LanguageSwitcher, LoadingScreen, etc.)

### `src/contexts/` - React Context Providers
- `AuthContext.tsx` - User authentication state
- `SubscriptionContext.tsx` - Subscription and plan data
- `TranslationContext.tsx` - i18n state management

### `src/hooks/` - Custom React Hooks
- **Business logic hooks**: `useAuth`, `useCompany`, `useProducts`, `useUsers`
- **Feature hooks**: `useSubscriptions`, `usePlanLimits`, `useMetrics`, `usePayments`
- **UI hooks**: `useTranslation`, `useTypingAnimation`, `useInView`, `useUpload`
- **Utility hooks**: `useCounter`, `useReducedMotion`, `useTokenUsage`

### `src/lib/` - External Service Integrations
```
lib/
├── supabase/
│   ├── client.ts           # Client-side Supabase instance
│   └── server.ts           # Server-side Supabase instance
├── tokenService.ts         # Token management
└── utils.ts                # Utility functions (cn, etc.)
```

### `src/locales/` - Internationalization
```
locales/
├── en/                     # English translations
│   ├── common.json
│   ├── dashboard.json
│   ├── marketing.json
│   └── api.json
├── fr/                     # French translations (same structure)
├── index.ts                # Locale exports
└── translations.ts         # Translation utilities
```

### `src/types/` - TypeScript Definitions
- `database.ts` - Supabase database types (auto-generated or manual)

### `src/interfaces/` - TypeScript Interfaces
- `components.ts` - Component prop interfaces
- `content.ts` - Content structure interfaces
- `marketing.ts` - Marketing page interfaces

### `src/data/` - Static Data
- `content.ts` - Static content data
- `features.tsx` - Feature definitions
- `marketing.ts` - Marketing page content

### `src/store/` - Zustand State Management
- `index.ts` - Global store configuration

### `src/utils/` - Utility Functions
- `animations.ts` - Framer Motion animation variants
- `constants.ts` - App-wide constants
- `pricing.ts` - Pricing calculations

### `src/middleware.ts` - Next.js Middleware
- Route protection and authentication checks

## Key Conventions

### File Naming
- **Components**: PascalCase (e.g., `DashboardHeader.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`)
- **Utilities**: camelCase (e.g., `animations.ts`)
- **Types/Interfaces**: PascalCase files (e.g., `database.ts`)

### Component Organization
- **Colocate** route-specific components in route folders
- **Share** common components in `src/components/`
- **Group** related components in subfolders (e.g., `components/ui/`)

### Import Aliases
- Use `@/*` for all imports from `src/`
- Example: `import { useAuth } from '@/hooks/useAuth'`

### Database Schema
- **Tables**: `companies`, `users`, `products`, `subscription_plans`, `subscription_features`, `payments`, `metrics`
- **Custom Types**: `company_type`, `user_role`, `subscription_status`
- **RLS Policies**: All tables have Row Level Security enabled
- **Storage**: Public buckets for `avatars` and `products`

### Authentication Flow
1. User signs up/logs in via `/register` or `/login`
2. `AuthContext` manages auth state globally
3. `middleware.ts` protects `/dashboard/*` routes
4. Supabase handles session management

### Styling Approach
- **Tailwind-first**: Use Tailwind utility classes
- **Custom colors**: Brand color system in `tailwind.config.js`
- **Component library**: HeroUI for complex components
- **Animations**: Framer Motion for transitions and effects
