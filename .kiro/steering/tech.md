# Technology Stack

## Frontend Framework
- **Next.js 16.1.6** with App Router
- **React 19.2.4** with React DOM
- **TypeScript 5** (strict mode enabled)

## Styling & UI
- **Tailwind CSS v4** with custom brand color system
- **HeroUI (@heroui/react)** - Primary component library
- **Framer Motion** - Animations and transitions
- **Lucide React** & **Heroicons** - Icon libraries
- **class-variance-authority** & **clsx** - Conditional styling utilities

## Backend & Database
- **Supabase** - PostgreSQL database, authentication, and storage
  - `@supabase/supabase-js` - Client library
  - `@supabase/ssr` - Server-side rendering support
  - `@supabase/auth-helpers-nextjs` - Auth integration
- **Row Level Security (RLS)** enabled on all tables
- **Storage buckets**: `avatars`, `products`

## State Management
- **Zustand** - Global state management
- **React Context** - Auth, Subscription, Translation contexts
- **React Hook Form** with **Zod** validation

## Key Libraries
- **react-hot-toast** - Toast notifications
- **country-flag-icons** - Country flag components
- **tailwind-merge** - Merge Tailwind classes

## Development Tools
- **ESLint 9** with Next.js config
- **Husky** - Git hooks
- **lint-staged** - Pre-commit linting
- **Turbopack** - Fast bundler (dev & build)

## Common Commands

```bash
# Development
npm run dev              # Start dev server with Turbopack

# Building
npm run build            # Production build with Turbopack
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix ESLint issues

# Git Hooks (automatic)
# Pre-commit: ESLint auto-fix on staged files
# Pre-push: Additional checks
```

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Build Configuration

- **TypeScript**: Strict mode, no build errors allowed
- **ESLint**: Warnings treated as errors during build
- **Path aliases**: `@/*` maps to `./src/*`
- **Target**: ES2017
