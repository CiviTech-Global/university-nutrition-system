# Fonts Directory

This directory contains the Persian font files for the University Nutrition System.

## Font Files

- **Vazir.ttf** - Regular weight (400)
- **Vazir-Thin.ttf** - Thin weight (100)
- **Vazir-Light.ttf** - Light weight (300)
- **Vazir-Medium.ttf** - Medium weight (500)
- **Vazir-Bold.ttf** - Bold weight (700)

## Setup

The fonts are automatically loaded through `fonts.css` which is imported in the main `index.css` file.

## Usage

### CSS Variables

The fonts are available through CSS variables:

```css
/* Persian font */
var(--font-persian)

/* English font */
var(--font-english)
```

### Utility Classes

You can also use the utility classes:

```css
.text-persian {
  font-family: var(--font-persian);
  direction: rtl;
}

.text-english {
  font-family: var(--font-english);
  direction: ltr;
}
```

### In React Components

```tsx
sx={{
  fontFamily: language === "fa" ? "var(--font-persian)" : "var(--font-english)",
  direction: language === "fa" ? "rtl" : "ltr",
}}
```

## Font Information

- **Name**: Vazir
- **Type**: Persian/Arabic font
- **Weights**: 100, 300, 400, 500, 700
- **License**: MIT License
- **Source**: [Vazir Font](https://github.com/rastikerdar/vazir-font)

## Browser Support

The fonts use `font-display: swap` for better loading performance and fallback handling.
