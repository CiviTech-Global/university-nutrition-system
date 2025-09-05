import type { Language as LanguageType } from "../locales";

// Persian number mapping
const persianNumbers = {
  "0": "۰",
  "1": "۱",
  "2": "۲",
  "3": "۳",
  "4": "۴",
  "5": "۵",
  "6": "۶",
  "7": "۷",
  "8": "۸",
  "9": "۹",
};

// These could be used for more sophisticated Persian date formatting if needed
// const persianMonths = { ... };
// const persianWeekdays = { ... };

// Convert English numbers to Persian
export const toPersianNumber = (num: number | string): string => {
  const str = num.toString();
  return str.replace(
    /[0-9]/g,
    (match) => persianNumbers[match as keyof typeof persianNumbers] || match
  );
};

// Convert Persian numbers to English
export const toEnglishNumber = (str: string): string => {
  const englishNumbers = Object.fromEntries(
    Object.entries(persianNumbers).map(([eng, per]) => [per, eng])
  );
  return str.replace(/[۰-۹]/g, (match) => englishNumbers[match] || match);
};

// Format currency based on language
export const formatCurrency = (
  amount: number,
  language: LanguageType
): string => {
  if (language === "fa") {
    // For Persian, use Iranian Toman (IRT) with تومان symbol
    const tomanAmount = amount; // Assuming amount is already in Toman
    const formatted = tomanAmount.toLocaleString("fa-IR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return `${toPersianNumber(formatted)} تومان`;
  } else {
    // For English, use Toman without currency symbol
    const formatted = amount.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return `${formatted} Toman`;
  }
};

// Format date based on language
export const formatDate = (
  date: Date,
  language: LanguageType,
  options?: Intl.DateTimeFormatOptions
): string => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  };

  const formatOptions = { ...defaultOptions, ...options };

  if (language === "fa") {
    // For Persian, we'll use the native Persian calendar
    const persianDate = new Intl.DateTimeFormat("fa-IR", formatOptions).format(
      date
    );
    return toPersianNumber(persianDate);
  }

  return date.toLocaleDateString("en-US", formatOptions);
};

// Format time based on language
export const formatTime = (date: Date, language: LanguageType): string => {
  const timeString = date.toLocaleTimeString(
    language === "fa" ? "fa-IR" : "en-US",
    {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }
  );

  if (language === "fa") {
    return toPersianNumber(timeString);
  }

  return timeString;
};

// Get relative time (e.g., "2 hours ago", "3 days ago")
export const getRelativeTime = (date: Date, language: LanguageType): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds);
    if (interval >= 1) {
      if (language === "fa") {
        const persianUnits = {
          year: "سال",
          month: "ماه",
          week: "هفته",
          day: "روز",
          hour: "ساعت",
          minute: "دقیقه",
        };
        return `${toPersianNumber(interval)} ${
          persianUnits[unit as keyof typeof persianUnits]
        } پیش`;
      } else {
        const englishUnits = {
          year: "year",
          month: "month",
          week: "week",
          day: "day",
          hour: "hour",
          minute: "minute",
        };
        const unitName =
          interval === 1
            ? englishUnits[unit as keyof typeof englishUnits]
            : `${englishUnits[unit as keyof typeof englishUnits]}s`;
        return `${interval} ${unitName} ago`;
      }
    }
  }

  return language === "fa" ? "همین الان" : "just now";
};

// Format file size
export const formatFileSize = (
  bytes: number,
  language: LanguageType
): string => {
  const sizes =
    language === "fa"
      ? ["بایت", "کیلوبایت", "مگابایت", "گیگابایت"]
      : ["B", "KB", "MB", "GB"];

  if (bytes === 0) return `0 ${sizes[0]}`;

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = Math.round((bytes / Math.pow(1024, i)) * 100) / 100;

  const formattedSize =
    language === "fa" ? toPersianNumber(size) : size.toString();
  return `${formattedSize} ${sizes[i]}`;
};

// Format percentage
export const formatPercentage = (
  value: number,
  language: LanguageType
): string => {
  const percentage = value.toFixed(1);
  if (language === "fa") {
    return `${toPersianNumber(percentage)}٪`;
  }
  return `${percentage}%`;
};

// Get direction based on language
export const getDirection = (language: LanguageType): "rtl" | "ltr" => {
  return language === "fa" ? "rtl" : "ltr";
};

// Get text alignment based on language
export const getTextAlign = (language: LanguageType): "right" | "left" => {
  return language === "fa" ? "right" : "left";
};

// Get font family based on language
export const getFontFamily = (language: LanguageType): string => {
  return language === "fa" ? "var(--font-persian)" : "var(--font-english)";
};

// Create language-specific styles
export const createLanguageStyles = (language: LanguageType) => ({
  direction: getDirection(language),
  fontFamily: getFontFamily(language),
  textAlign: getTextAlign(language),
});

// Validate Persian text input
export const validatePersianText = (text: string): boolean => {
  // Persian Unicode range: \u0600-\u06FF
  const persianRegex =
    /^[\u0600-\u06FF\s\u200C\u200D\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]+$/;
  return persianRegex.test(text);
};

// Convert text to proper Persian form
export const toProperPersian = (text: string): string => {
  // Replace common English characters with Persian equivalents
  const replacements: Record<string, string> = {
    ك: "ک",
    ي: "ی",
    ة: "ه",
    أ: "ا",
    إ: "ا",
    آ: "آ",
    ؤ: "و",
    ئ: "ی",
    ء: "ء",
  };

  let result = text;
  Object.entries(replacements).forEach(([from, to]) => {
    result = result.replace(new RegExp(from, "g"), to);
  });

  return result;
};

// Get Persian calendar date
export const getPersianDate = (date: Date) => {
  // This is a simplified implementation
  // For production, you might want to use a proper Persian calendar library
  const gregorianDate = new Date(date);
  const persianDate = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(gregorianDate);

  return toPersianNumber(persianDate);
};

// Format phone number based on language
export const formatPhoneNumber = (
  phone: string,
  language: LanguageType
): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");

  if (language === "fa") {
    // Format for Iranian phone numbers
    if (cleaned.length === 11 && cleaned.startsWith("09")) {
      return toPersianNumber(
        `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(
          7,
          9
        )} ${cleaned.slice(9)}`
      );
    }
    if (cleaned.length === 10 && cleaned.startsWith("9")) {
      return toPersianNumber(
        `0${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(
          6,
          8
        )} ${cleaned.slice(8)}`
      );
    }
  } else {
    // Format for US phone numbers
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
        6
      )}`;
    }
  }

  return phone;
};

// Enhanced styling utilities for better RTL/LTR support
export const createEnhancedLanguageStyles = (language: LanguageType) => {
  const isRTL = language === "fa";

  return {
    // Typography styles
    typography: {
      direction: isRTL ? "rtl" : "ltr",
      fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
      textAlign: isRTL ? "right" : "left",
      lineHeight: isRTL ? 1.8 : 1.5,
      letterSpacing: isRTL ? "0.5px" : "0.2px",
    },

    // Container styles
    container: {
      direction: isRTL ? "rtl" : "ltr",
      width: "100%",
      maxWidth: "100%",
    },

    // Flexbox styles
    flex: {
      direction: isRTL ? "rtl" : "ltr",
      display: "flex",
    },

    // Stack styles
    stack: {
      direction: isRTL ? "rtl" : "ltr",
      width: "100%",
    },

    // Grid styles
    grid: {
      direction: isRTL ? "rtl" : "ltr",
      width: "100%",
    },

    // Card styles
    card: {
      direction: isRTL ? "rtl" : "ltr",
      width: "100%",
      borderRadius: 0,
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    },

    // Paper styles
    paper: {
      direction: isRTL ? "rtl" : "ltr",
      width: "100%",
      borderRadius: 0,
      padding: 3,
    },

    // Button styles
    button: {
      direction: isRTL ? "rtl" : "ltr",
      fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
      borderRadius: 0,
      padding: "8px 16px",
      textTransform: "none",
      fontWeight: 600,
    },

    // Input styles
    input: {
      direction: isRTL ? "rtl" : "ltr",
      fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
      textAlign: isRTL ? "right" : "left",
      borderRadius: 0,
    },

    // Table styles
    table: {
      direction: isRTL ? "rtl" : "ltr",
      width: "100%",
    },

    // Table cell styles
    tableCell: {
      direction: isRTL ? "rtl" : "ltr",
      fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
      textAlign: isRTL ? "right" : "left",
      padding: "12px 16px",
    },

    // List styles
    list: {
      direction: isRTL ? "rtl" : "ltr",
      width: "100%",
    },

    // List item styles
    listItem: {
      direction: isRTL ? "rtl" : "ltr",
      borderRadius: 2,
      marginBottom: 0.5,
    },

    // Dialog styles
    dialog: {
      direction: isRTL ? "rtl" : "ltr",
      "& .MuiDialogTitle-root": {
        direction: isRTL ? "rtl" : "ltr",
        fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
        textAlign: isRTL ? "right" : "left",
      },
      "& .MuiDialogContent-root": {
        direction: isRTL ? "rtl" : "ltr",
      },
      "& .MuiDialogActions-root": {
        direction: isRTL ? "rtl" : "ltr",
        justifyContent: isRTL ? "flex-start" : "flex-end",
      },
    },

    // Spacing utilities
    spacing: {
      xs: isRTL ? { pr: 1 } : { pl: 1 },
      sm: isRTL ? { pr: 2 } : { pl: 2 },
      md: isRTL ? { pr: 3 } : { pl: 3 },
      lg: isRTL ? { pr: 4 } : { pl: 4 },
      xl: isRTL ? { pr: 5 } : { pl: 5 },
    },

    // Margin utilities
    margin: {
      xs: isRTL ? { mr: 1 } : { ml: 1 },
      sm: isRTL ? { mr: 2 } : { ml: 2 },
      md: isRTL ? { mr: 3 } : { ml: 3 },
      lg: isRTL ? { mr: 4 } : { ml: 4 },
      xl: isRTL ? { mr: 5 } : { ml: 5 },
    },

    // Responsive styles
    responsive: {
      mobile: {
        direction: isRTL ? "rtl" : "ltr",
        width: "100%",
        padding: 2,
      },
      tablet: {
        direction: isRTL ? "rtl" : "ltr",
        width: "100%",
        padding: 3,
      },
      desktop: {
        direction: isRTL ? "rtl" : "ltr",
        width: "100%",
        padding: 4,
      },
    },
  };
};

// Enhanced component-specific styles
export const createComponentStyles = (language: LanguageType) => {
  const baseStyles = createEnhancedLanguageStyles(language);

  return {
    // Dashboard specific styles
    dashboard: {
      container: {
        ...baseStyles.container,
        padding: { xs: 2, sm: 3, md: 4 },
        height: "100%",
      },
      header: {
        ...baseStyles.typography,
        marginBottom: 3,
        paddingBottom: 2,
        borderBottom: "1px solid",
        borderColor: "divider",
      },
      statsGrid: {
        ...baseStyles.grid,
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "1fr 1fr",
          md: "1fr 1fr 1fr 1fr",
        },
        gap: 3,
        marginBottom: 4,
      },
      statCard: {
        ...baseStyles.card,
        padding: 3,
        textAlign: "center",
        transition: "transform 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-2px)",
        },
      },
      table: {
        ...baseStyles.table,
        marginTop: 3,
      },
    },

    // Sidebar specific styles
    sidebar: {
      container: {
        ...baseStyles.container,
        height: "100vh",
        position: "sticky",
        top: 0,
        background: "linear-gradient(180deg, #1e293b 0%, #334155 100%)",
        color: "white",
        boxShadow: "4px 0 20px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
      },
      header: {
        ...baseStyles.typography,
        padding: 2,
        background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
        borderRadius: "0 0 16px 16px",
        marginBottom: 2,
      },
      menuItem: {
        ...baseStyles.listItem,
        margin: "4px 8px",
        borderRadius: 0,
        minHeight: 48,
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          transform: "translateX(4px)",
        },
        "&.Mui-selected": {
          backgroundColor: "rgba(59, 130, 246, 0.2)",
          border: "1px solid rgba(59, 130, 246, 0.3)",
        },
      },
      footer: {
        ...baseStyles.container,
        padding: 2,
        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        marginTop: "auto",
      },
    },

    // Form specific styles
    form: {
      container: {
        ...baseStyles.container,
        padding: 3,
      },
      field: {
        ...baseStyles.input,
        marginBottom: 2,
        "& .MuiInputLabel-root": {
          ...baseStyles.typography,
        },
        "& .MuiInputBase-input": {
          ...baseStyles.typography,
        },
        "& .MuiFormHelperText-root": {
          ...baseStyles.typography,
          fontSize: "0.75rem",
        },
        "& .MuiInputAdornment-root": {
          color: "action.active",
        },
        "& .MuiOutlinedInput-root": {
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "primary.main",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "primary.main",
            borderWidth: 2,
          },
        },
      },
      button: {
        ...baseStyles.button,
        marginTop: 2,
      },
    },

    // Table specific styles
    table: {
      container: {
        ...baseStyles.container,
        overflow: "auto",
      },
      table: {
        ...baseStyles.table,
        minWidth: 650,
      },
      head: {
        ...baseStyles.tableCell,
        fontWeight: 700,
        backgroundColor: "background.paper",
      },
      cell: {
        ...baseStyles.tableCell,
      },
      row: {
        "&:nth-of-type(odd)": {
          backgroundColor: "action.hover",
        },
        "&:hover": {
          backgroundColor: "action.selected",
        },
      },
    },

    // Dialog specific styles
    dialog: {
      ...baseStyles.dialog,
      "& .MuiDialog-paper": {
        borderRadius: 0,
        padding: 2,
      },
    },

    // Card specific styles
    card: {
      ...baseStyles.card,
      padding: 3,
      transition: "all 0.2s ease-in-out",
      "&:hover": {
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
        transform: "translateY(-2px)",
      },
    },
  };
};

// Utility function to merge styles
export const mergeStyles = (...styleObjects: any[]) => {
  return styleObjects.reduce((merged, current) => {
    return { ...merged, ...current };
  }, {});
};

// Responsive spacing utility
export const getResponsiveSpacing = (
  language: LanguageType,
  size: "xs" | "sm" | "md" | "lg" | "xl"
) => {
  const isRTL = language === "fa";
  const spacingMap = {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5,
  };

  return {
    padding: spacingMap[size],
    margin: spacingMap[size],
    [isRTL ? "paddingRight" : "paddingLeft"]: spacingMap[size],
    [isRTL ? "marginRight" : "marginLeft"]: spacingMap[size],
  };
};

// Enhanced typography utility
export const getTypographyStyles = (
  language: LanguageType,
  variant:
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "body1"
    | "body2"
    | "subtitle1"
    | "caption"
) => {
  const isRTL = language === "fa";

  const baseStyles = {
    direction: isRTL ? "rtl" : "ltr",
    fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
    textAlign: isRTL ? "right" : "left",
  };

  const variantStyles = {
    h1: { fontSize: "2.5rem", fontWeight: 700, lineHeight: 1.2 },
    h2: { fontSize: "2rem", fontWeight: 600, lineHeight: 1.3 },
    h3: { fontSize: "1.75rem", fontWeight: 600, lineHeight: 1.4 },
    h4: { fontSize: "1.5rem", fontWeight: 600, lineHeight: 1.4 },
    h5: { fontSize: "1.25rem", fontWeight: 600, lineHeight: 1.5 },
    h6: { fontSize: "1.125rem", fontWeight: 600, lineHeight: 1.5 },
    body1: { fontSize: "1rem", fontWeight: 400, lineHeight: isRTL ? 1.8 : 1.5 },
    body2: {
      fontSize: "0.875rem",
      fontWeight: 400,
      lineHeight: isRTL ? 1.8 : 1.5,
    },
    subtitle1: {
      fontSize: "1rem",
      fontWeight: 500,
      lineHeight: isRTL ? 1.8 : 1.6,
    },
    caption: {
      fontSize: "0.75rem",
      fontWeight: 400,
      lineHeight: isRTL ? 1.8 : 1.5,
    },
  };

  return { ...baseStyles, ...variantStyles[variant] };
};
