# Translation Fixes Needed

## CRITICAL ISSUE IDENTIFIED:
The translation JSON files have **malformed JSON structure** causing translation keys to display instead of translated text.

## Problems Found:

### 1. **Malformed JSON Structure**
- Extra closing braces `}` in dashboard.json files
- Incorrect nesting causing JSON parsing errors
- Missing keys that are referenced in components

### 2. **Missing Translation Keys Showing as Raw Keys:**
- `dashboard.settings.profile.description`
- `dashboard.settings.sections.support` 
- `dashboard.settings.sections.danger`
- `dashboard.company.form.status`
- `dashboard.company.metrics.title`
- `dashboard.company.metrics.productsCreated` (typo: should be `productsCreated`)
- `dashboard.company.metrics.tokensUsed`

### 3. **JSON Structure Issues in `src/locales/en/dashboard.json`:**
```json
// CURRENT BROKEN STRUCTURE (lines 280+):
}  
  },
    "metrics": {
      "tokensUsed": "Tokens Used",
      "productsCreated": "Products Created",
      "usersCreated": "Users Created",
      "messagesTotal": "Messages Total"
    }
  }
}
```

## IMMEDIATE FIXES NEEDED:

### 1. Fix JSON Structure
- Remove extra closing braces
- Fix nesting issues
- Ensure valid JSON format

### 2. Add Missing Keys
- Add `profile.description` to settings section
- Add missing company form and metrics keys
- Ensure all referenced keys exist

### 3. Fix Component References
- Some components reference keys that don't exist in JSON
- Some components use hardcoded strings instead of translation keys

## NEXT STEPS:
1. ✅ Fix JSON structure in all translation files
2. ✅ Add all missing translation keys
3. ✅ Update components to use correct translation keys
4. ✅ Test language switching functionality