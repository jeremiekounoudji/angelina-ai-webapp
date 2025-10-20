# Translation Implementation Guide

## Overview

This guide provides step-by-step instructions for implementing the new i18n system across the entire application.

## 1. Setup Complete ✅

### Files Created:

- `src/locales/en/` and `src/locales/fr/` folders with JSON translation files
- `src/locales/index.ts` - Translation utilities and functions
- `src/contexts/TranslationContext.tsx` - React context for translations
- `src/components/LanguageSwitcher.tsx` - Language switching components
- `translation-audit.md` - Complete audit of all text content
- `translation-implementation-guide.md` - This implementation guide

## 2. Next Steps - Integration

### Step 1: Update Root Layout

Add the TranslationProvider to your root layout:

```tsx
// src/app/layout.tsx
import { TranslationProvider } from "@/contexts/TranslationContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <TranslationProvider>{children}</TranslationProvider>
      </body>
    </html>
  );
}
```

### Step 2: Update Marketing Pages

Replace hardcoded text with translation keys:

```tsx
// Before
<h1>Angelina AI: The WhatsApp AI agent</h1>;

// After
import { useTranslationNamespace } from "@/contexts/TranslationContext";

function HeroSection() {
  const { t } = useTranslationNamespace("marketing.hero");

  return <h1>{t("title")}</h1>;
}
```

### Step 3: Update Authentication Pages

Replace form labels and messages:

```tsx
// src/app/login/page.tsx
import { useTranslationNamespace } from "@/contexts/TranslationContext";

function LoginPage() {
  const { t } = useTranslationNamespace("auth.login");

  return (
    <form>
      <label>{t("form.email")}</label>
      <input placeholder={t("form.emailPlaceholder")} />
      <button>{t("form.submit")}</button>
    </form>
  );
}
```

### Step 4: Update Dashboard Pages

Replace all dashboard text:

```tsx
// src/app/dashboard/products/page.tsx
import { useTranslationNamespace } from "@/contexts/TranslationContext";

function ProductsPage() {
  const { t } = useTranslationNamespace("dashboard.products");

  return (
    <div>
      <h1>{t("title")}</h1>
      <p>{t("subtitle")}</p>
      <button>{t("actions.addProduct")}</button>
    </div>
  );
}
```

### Step 5: Update Hooks for Error/Success Messages

Replace hardcoded messages in hooks:

```tsx
// src/hooks/useProducts.ts
import { useTranslationNamespace } from "@/contexts/TranslationContext";

export function useProducts() {
  const { t } = useTranslationNamespace("hooks.products");

  const createProduct = async (data: ProductData) => {
    try {
      // ... API call
      toast.success(t("success.created"));
    } catch (error) {
      toast.error(t("errors.createFailed"));
    }
  };

  return { createProduct };
}
```

### Step 6: Update API Routes

Replace API response messages:

```tsx
// src/app/api/auth/signup/route.ts
import { createTranslationFunction } from "@/locales";

export async function POST(request: Request) {
  const locale =
    (request.headers.get("Accept-Language")?.split("-")[0] as "en" | "fr") ||
    "en";
  const t = createTranslationFunction(locale);

  try {
    // ... signup logic
    return Response.json({
      success: true,
      message: t("api.auth.signup.success.accountCreated"),
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: t("api.auth.signup.errors.registrationFailed"),
      },
      { status: 400 }
    );
  }
}
```

### Step 7: Add Language Switcher to Navigation

Add language switching to your navbar:

```tsx
// src/app/marketing/components/Navbar.tsx
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

function Navbar() {
  return (
    <nav>
      {/* Other nav items */}
      <LanguageSwitcher showLabels />
    </nav>
  );
}
```

## 3. Implementation Priority Order

### Phase 1: Core Pages (High Priority)

1. Marketing landing page (`src/app/marketing/`)
2. Authentication pages (`src/app/login/`, `src/app/register/`)
3. Main dashboard (`src/app/dashboard/page.tsx`)

### Phase 2: Dashboard Features (Medium Priority)

1. Company management (`src/app/dashboard/company/`)
2. Products management (`src/app/dashboard/products/`)
3. Subscription management (`src/app/dashboard/subscription/`)

### Phase 3: Advanced Features (Lower Priority)

1. User management (`src/app/dashboard/users/`)
2. Settings (`src/app/dashboard/settings/`)
3. Support and help sections

### Phase 4: Backend Integration (Final)

1. API route messages (`src/app/api/`)
2. Hook error/success messages (`src/hooks/`)
3. Email templates and notifications

## 4. Testing Checklist

### Functional Testing

- [ ] Language switcher works correctly
- [ ] All text displays in selected language
- [ ] Fallback to English works for missing translations
- [ ] Currency formatting works (€ for French, $ for English)
- [ ] Date formatting works (DD/MM/YYYY for French, MM/DD/YYYY for English)
- [ ] Form validation messages are translated
- [ ] API error messages are translated
- [ ] Success notifications are translated

### Browser Testing

- [ ] Language preference persists across sessions
- [ ] Browser language detection works
- [ ] No console warnings for missing translations
- [ ] Performance is not impacted

## 5. Common Patterns

### Using Translations in Components

```tsx
import { useTranslationNamespace } from "@/contexts/TranslationContext";

function MyComponent() {
  const { t, formatCurrency, formatDate } =
    useTranslationNamespace("dashboard.products");

  return (
    <div>
      <h1>{t("title")}</h1>
      <p>{formatCurrency(99.99)}</p>
      <span>{formatDate(new Date())}</span>
    </div>
  );
}
```

### Using Translations with Parameters

```tsx
const { t } = useTranslationNamespace("hooks.planLimits");

// Translation: "You have used {percentage}% of your plan limit"
const message = t("warnings.limitWarning", { percentage: 85 });
```

### Using Translations in API Routes

```tsx
import { createTranslationFunction } from "@/locales";

const locale = getLocaleFromRequest(request);
const t = createTranslationFunction(locale);

return Response.json({
  message: t("api.products.success.productCreated"),
});
```

## 6. Maintenance

### Adding New Translations

1. Add the key to both `en/` and `fr/` JSON files
2. Use descriptive, nested keys (e.g., `dashboard.products.form.name`)
3. Test both languages
4. Update this guide if needed

### Updating Existing Translations

1. Update both language files simultaneously
2. Check for parameter usage (`{paramName}`)
3. Verify context and meaning
4. Test in the UI

## 7. Performance Considerations

- Translation files are imported statically (tree-shakeable)
- Context uses React's built-in optimization
- Locale changes trigger minimal re-renders
- Browser language detection happens only once
- localStorage caching prevents repeated detection

## 8. Accessibility

- Language switcher has proper ARIA labels
- Document language attribute updates automatically
- Screen readers will announce content in correct language
- Form labels maintain semantic meaning across languages

This implementation provides a robust, scalable i18n solution that covers all aspects of the application from UI text to API responses and error messages.
