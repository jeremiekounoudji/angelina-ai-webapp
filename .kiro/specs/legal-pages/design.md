# Design Document

## Overview

This feature adds Privacy Policy and Terms & Conditions pages to the marketing site with full i18n support. The pages will follow the existing marketing site design patterns and integrate seamlessly with the current translation infrastructure.

## Architecture

### Page Structure

- Two new Next.js pages: `/privacy` and `/terms`
- Both pages use the existing marketing layout with Header component
- Pages are client-side rendered to support language switching
- Reuse existing translation context and language switcher

### Translation Integration

- Add new translation keys to existing `marketing.json` files (en/fr)
- Translation keys structure:
  - `marketing.legal.privacy.*` - Privacy Policy content
  - `marketing.legal.terms.*` - Terms & Conditions content
  - `marketing.footer.links.privacy` - Footer link label
  - `marketing.footer.links.terms` - Footer link label

## Components and Interfaces

### New Pages

**1. Privacy Policy Page (`src/app/privacy/page.tsx`)**

- Client component using `'use client'`
- Imports: Header, useTranslationNamespace
- Uses `marketing.legal.privacy` namespace
- Renders structured content with sections

**2. Terms & Conditions Page (`src/app/terms/page.tsx`)**

- Client component using `'use client'`
- Imports: Header, useTranslationNamespace
- Uses `marketing.legal.terms` namespace
- Renders structured content with sections

### Modified Components

**Footer Component (`src/app/marketing/components/Footer.tsx`)**

- Add new "Legal" section in footer grid
- Include links to `/privacy` and `/terms`
- Use translation keys for link labels
- Maintain existing footer structure and styling

## Data Models

### Translation Structure

```typescript
// marketing.json additions
{
  "legal": {
    "privacy": {
      "title": "Privacy Policy",
      "lastUpdated": "Last updated: ...",
      "sections": {
        "intro": { "title": "...", "content": "..." },
        "dataCollection": { "title": "...", "content": "..." },
        "dataUsage": { "title": "...", "content": "..." },
        "dataSecurity": { "title": "...", "content": "..." },
        "userRights": { "title": "...", "content": "..." },
        "contact": { "title": "...", "content": "..." }
      }
    },
    "terms": {
      "title": "Terms & Conditions",
      "lastUpdated": "Last updated: ...",
      "sections": {
        "intro": { "title": "...", "content": "..." },
        "serviceDescription": { "title": "...", "content": "..." },
        "userObligations": { "title": "...", "content": "..." },
        "payment": { "title": "...", "content": "..." },
        "liability": { "title": "...", "content": "..." },
        "termination": { "title": "...", "content": "..." },
        "contact": { "title": "...", "content": "..." }
      }
    }
  },
  "footer": {
    // existing keys...
    "links": {
      "privacy": "Privacy Policy",
      "terms": "Terms & Conditions"
    }
  }
}
```

## Styling

### Design Patterns

- Reuse marketing site color scheme (black background, green accents)
- Typography: Same font hierarchy as marketing pages
- Spacing: Consistent padding and margins
- Responsive: Mobile-first approach

### Page Layout

- Full-width container with max-width constraint
- Header at top (existing component)
- Content area with proper spacing
- Sections with clear visual hierarchy
- Footer at bottom (existing component)

### Content Styling

- Title: Large, bold, white text
- Section headings: Medium, semibold, white text
- Body text: Gray-400 for readability
- Links: Green-500 with hover effects
- Last updated date: Small, gray-500 text

## Error Handling

- No special error handling required (static content)
- 404 handling by Next.js default behavior
- Translation fallback handled by existing i18n system

## Testing Strategy

- Manual testing: Navigate to `/privacy` and `/terms`
- Verify language switching works correctly
- Test footer links navigation
- Verify responsive design on mobile/tablet/desktop
- Check translation completeness in both languages
