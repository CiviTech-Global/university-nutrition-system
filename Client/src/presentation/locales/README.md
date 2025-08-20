# Locales Directory

This directory contains all translation files for the University Nutrition System.

## Structure

```
locales/
├── index.ts      # Main export file with types and translations object
├── en.ts         # English translations
├── fa.ts         # Persian translations
└── README.md     # This file
```

## Usage

### Importing translations

```typescript
import { translations } from "../../locales";
import type { Language } from "../../locales";

// Use in component
const [language, setLanguage] = useState<Language>("en");
const t = translations[language];
```

### Adding new languages

1. Create a new file `[language-code].ts` (e.g., `ar.ts` for Arabic)
2. Export an object with the same structure as `en.ts`
3. Add the new language to the `translations` object in `index.ts`
4. Update the `Language` type in `index.ts`

### Adding new translation keys

1. Add the key to all language files (`en.ts`, `fa.ts`, etc.)
2. The key will automatically be available in the `TranslationKeys` type

## Available Languages

- **en**: English
- **fa**: Persian (فارسی)

## Translation Keys

All translation keys are defined in the English file (`en.ts`) and should be replicated in all other language files.
