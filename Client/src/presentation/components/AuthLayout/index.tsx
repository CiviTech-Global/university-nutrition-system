import { useState, useEffect } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { LanguageContext } from "../../contexts/LanguageContext";
import { translations } from "../../locales";
import type { Language } from "../../locales";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  const [language, setLanguage] = useState<Language>("en");

  // Load language preference from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language;
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "fa")) {
      setLanguage(savedLanguage);
    } else {
      // Set default language if none is saved
      setLanguage("en");
      localStorage.setItem("language", "en");
    }
  }, []);

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  // Apply direction to document
  useEffect(() => {
    document.documentElement.setAttribute(
      "dir",
      language === "fa" ? "rtl" : "ltr"
    );
    document.documentElement.setAttribute("lang", language);
  }, [language]);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  // Create theme based on language
  const customTheme = createTheme({
    direction: language === "fa" ? "rtl" : "ltr",
    palette: {
      primary: {
        main: "#667eea",
      },
      secondary: {
        main: "#764ba2",
      },
    },
    typography: {
      fontFamily:
        language === "fa" ? "var(--font-persian)" : "var(--font-english)",
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            direction: language === "fa" ? "rtl" : "ltr",
            fontFamily:
              language === "fa" ? "var(--font-persian)" : "var(--font-english)",
          },
        },
      },
    },
  });

  const isRTL = language === "fa";
  const t = translations[language];

  const contextValue = {
    language,
    setLanguage: handleLanguageChange,
    t,
    isRTL,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      <ThemeProvider theme={customTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </LanguageContext.Provider>
  );
};

export default AuthLayout;
