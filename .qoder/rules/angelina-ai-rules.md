---
trigger: manual
alwaysApply: false
---
# AngelinaAI Frontend Development Guide

## Role & Objective
You are a **Next.js 15 developer** with expertise in **TypeScript**, **Tailwind CSS**, **Hero UI**, and **Framer Motion**.  
Your mission is to build a **scalable, mobile-first web application** that showcases **AngelinaAI** — a WhatsApp-based restaurant management agent (orders, stock, delivery, complaints).

---

## Core Development Rules
- **ALWAYS** use clean, modular, and reusable code.  
- **ALWAYS** split UI into components to keep files under ~200 lines.  
- **ALWAYS** use TypeScript interfaces for props and API responses.  
- **NEVER** leave unused imports, variables, or code.  
- **PREFER** functional components with clear single responsibilities.  
- **PREFER** composition over inheritance.  
- **ALWAYS** separate UI (components) from business logic (hooks/services).

### Component-Based Code Structure
- **ALWAYS** break down pages into smaller, focused components (max 200-300 lines each).
- **NEVER** let any single file exceed 500 lines.
- **ALWAYS** create separate files for sections like:
  
  - `/app/page-one/components/component-one.tsx`
  **ALWAYS** create components based on the design file of the page
- **ALWAYS** extract animations into Framer Motion variants when reused.
- **ALWAYS** use `motion` components from **Framer Motion** for reveal animations.

---

## Next.js 15 Routing & Page Rules
- **ALWAYS** follow the **App Router** structure.  
- **Pages live in `/app`** — each folder inside `/app` is a route segment.  
 
- **ALWAYS** use `page.tsx` as the entry point for each route.  
- **ALWAYS** colocate smaller UI components inside `components/` folder at the route level.  
- **PREFER** using server components for data fetching and client components for interactive UI.  
- **ALWAYS** mark interactive components with `"use client"` at the top.

### Page Structure Example
```tsx
// /app/(marketing)/page.tsx
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import FeaturesSection from "./components/FeaturesSection";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
    </main>
  );
}
```

---

## UI/UX Guidelines
- **ALWAYS** use Tailwind CSS for responsive, mobile-first styling.  
- **PREFER** Hero UI primitives (`Dialog`, `Tabs`, `Popover`, `Card`).  
- **ALWAYS** animate major sections with **Framer Motion** (fade, slide, zoom).  
- **PREFER** clean dark mode aesthetic (inspired by Wazzap.ai).  
- **ALWAYS** round video/image previews (`rounded-3xl`) and apply shadow.

---

## State & API Rules
- **ALWAYS** use Zustand or Context API for global state (auth, settings).  
- **PREFER** React Query or SWR for data fetching and caching.  
- **NEVER** call WhatsApp Business API directly in components — abstract into `/services/`.  
- **ALWAYS** show toast notifications on success/error.  
- **PREFER** optimistic UI updates for better UX.

---

## Code Quality & Debugging Rules
- **ALWAYS** use ESLint + Prettier for formatting.  
- **ALWAYS** log lifecycle events and API calls with a logger utility.  
- **ALWAYS** remove unused imports/variables before commits.  
- **NEVER** use `any` type.  
- **PREFER** explicit typing with `interface` or `type`.

### Debugging Guidelines
- Add logs at critical points:  
  - Component mount/unmount (`useEffect`)  
  - API calls (start/success/error)  
  - User actions (clicks, form submissions)
- Use a centralized logger (`utils/logger.ts`) with `logInfo`, `logError`.

---

## Project Structure
```bash
/src
  /app              # Next.js 15 app router pages
    /marketing    # Public pages (landing, about, pricing)
      components   # Components only used in marketing pages
      page.tsx      # Marketing homepage
    /dashboard    # Authenticated dashboard pages
      components   # Components only used in dashboard
      page.tsx
  /assets           # Static assets (images, icons, videos)
  /context          # Zustand or Context providers
  /hooks            # Custom hooks (e.g., useOrders, useComplaints)
  /interfaces       # TypeScript interfaces
  /services         # WhatsApp & backend integrations
  /utils            # Helpers (logger, formatters)
  /locales          # Translations (fr, en)
  /summaries        # Functionality summaries for context
```

---

## Summaries & Maintenance
- **ALWAYS** update a summary file in `/summaries/` for every new feature.  
- **PREFER** plain English + short technical notes.  
- **EXAMPLES:**
  - `summaries/orders/ordering-flow.md`  
  - `summaries/complaints/complaints-resolution.md`

---

## Example Task
> **Build a `HeroSection`** inside `/app/marketing/components/` using:  
> - `motion.div` from Framer Motion for entrance animations.  
> - Tailwind for layout and typography.  
> - Hero UI `Button` for CTA.  
> - Props-driven `VideoPreview` component (`demo.mp4`).  
> - All text wrapped in translation hook `t('hero.title')`, with keys in `fr` & `en`.

---