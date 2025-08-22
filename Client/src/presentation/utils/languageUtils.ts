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

// Persian month names
const persianMonths = {
  long: [
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
  ],
  short: [
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
  ],
};

// Persian weekday names
const persianWeekdays = {
  long: ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه", "شنبه"],
  short: ["یک", "دو", "سه", "چهار", "پنج", "جمعه", "شنبه"],
};

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
  const formatted = amount.toLocaleString(
    language === "fa" ? "fa-IR" : "en-US",
    {
      style: "currency",
      currency: "USD",
    }
  );

  if (language === "fa") {
    return toPersianNumber(formatted);
  }

  return formatted;
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
