// Font utilities for managing Persian and English fonts
export const FONT_FAMILIES = {
  persian: "var(--font-persian)",
  english: "var(--font-english)",
} as const;

export const getFontFamily = (language: "en" | "fa"): string => {
  return language === "fa" ? FONT_FAMILIES.persian : FONT_FAMILIES.english;
};

export const getFontWeight = (
  weight: "light" | "normal" | "medium" | "bold"
): number => {
  const weights = {
    light: 300,
    normal: 400,
    medium: 500,
    bold: 700,
  };
  return weights[weight];
};

export const getFontSize = (size: "small" | "medium" | "large"): string => {
  const sizes = {
    small: "0.875rem",
    medium: "1rem",
    large: "1.125rem",
  };
  return sizes[size];
};

export const createFontStyles = (language: "en" | "fa") => ({
  fontFamily: getFontFamily(language),
  direction: language === "fa" ? "rtl" : "ltr",
});

export const applyFontToElement = (
  element: HTMLElement,
  language: "en" | "fa"
) => {
  element.style.fontFamily = getFontFamily(language);
  element.style.direction = language === "fa" ? "rtl" : "ltr";
};
