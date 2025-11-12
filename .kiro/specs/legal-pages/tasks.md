# Implementation Plan

- [x] 1. Add translation keys for legal pages





  - Add privacy policy and terms & conditions content to `src/locales/en/marketing.json`
  - Add privacy policy and terms & conditions content to `src/locales/fr/marketing.json`
  - Add footer link labels for both languages
  - _Requirements: 1.2, 2.2, 3.3_




- [ ] 2. Create Privacy Policy page
  - Create `src/app/privacy/page.tsx` with client component
  - Import Header component and translation hook



  - Render privacy policy content with proper styling
  - Ensure responsive design matches marketing site
  - _Requirements: 1.1, 1.2, 1.3, 1.4_




- [ ] 3. Create Terms & Conditions page
  - Create `src/app/terms/page.tsx` with client component
  - Import Header component and translation hook
  - Render terms & conditions content with proper styling
  - Ensure responsive design matches marketing site
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 4. Update Footer component with legal links
  - Modify `src/app/marketing/components/Footer.tsx`
  - Add "Legal" section with Privacy Policy and Terms & Conditions links
  - Use translation keys for link labels
  - Ensure links navigate to `/privacy` and `/terms`
  - _Requirements: 3.1, 3.2, 3.3, 3.4_
