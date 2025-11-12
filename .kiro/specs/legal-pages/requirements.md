# Requirements Document

## Introduction

This feature adds Privacy Policy and Terms & Conditions pages to the marketing site with full translation support and footer navigation links.

## Glossary

- **Legal Pages System**: The collection of static legal content pages including Privacy Policy and Terms & Conditions
- **Marketing Footer**: The footer component displayed on marketing pages that contains navigation links
- **Translation System**: The existing i18n infrastructure using locale JSON files

## Requirements

### Requirement 1

**User Story:** As a visitor, I want to access the Privacy Policy page, so that I can understand how my data is handled

#### Acceptance Criteria

1. WHEN a visitor navigates to /privacy, THE Legal Pages System SHALL display the Privacy Policy page
2. THE Legal Pages System SHALL render the Privacy Policy content in the visitor's selected language
3. THE Legal Pages System SHALL display the Privacy Policy with consistent marketing site styling
4. THE Legal Pages System SHALL include a language switcher on the Privacy Policy page

### Requirement 2

**User Story:** As a visitor, I want to access the Terms & Conditions page, so that I can understand the service agreement

#### Acceptance Criteria

1. WHEN a visitor navigates to /terms, THE Legal Pages System SHALL display the Terms & Conditions page
2. THE Legal Pages System SHALL render the Terms & Conditions content in the visitor's selected language
3. THE Legal Pages System SHALL display the Terms & Conditions with consistent marketing site styling
4. THE Legal Pages System SHALL include a language switcher on the Terms & Conditions page

### Requirement 3

**User Story:** As a visitor, I want to find legal page links in the footer, so that I can easily access Privacy Policy and Terms & Conditions

#### Acceptance Criteria

1. THE Marketing Footer SHALL display a "Privacy Policy" link that navigates to /privacy
2. THE Marketing Footer SHALL display a "Terms & Conditions" link that navigates to /terms
3. THE Marketing Footer SHALL render link labels in the visitor's selected language
4. THE Marketing Footer SHALL be visible on all marketing pages
