import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Avatar,
  Drawer,
  AppBar,
  Toolbar,
  useMediaQuery,
  useTheme,
  Fab,
  Zoom,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Language as LanguageIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from "@mui/icons-material";
import { translations } from "../../locales";
import type { Language as LanguageType } from "../../locales";
import { getCurrentUser } from "../../utils/userUtils";
import { LanguageContext } from "../../contexts/LanguageContext";
import Sidebar from "../Sidebar";
import "./index.css";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [desktopDrawerCollapsed, setDesktopDrawerCollapsed] = useState(false);
  const [language, setLanguageState] = useState<LanguageType>("en");
  const [user, setUser] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.between("md", "lg"));

  const isRTL = language === "fa";
  const t = translations[language];

  // Create dynamic theme based on language and dark mode
  const customTheme = createTheme({
    direction: isRTL ? "rtl" : "ltr",
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: "#2563eb",
        light: "#3b82f6",
        dark: "#1d4ed8",
      },
      secondary: {
        main: "#f59e0b",
        light: "#fbbf24",
        dark: "#d97706",
      },
      background: {
        default: darkMode ? "#0f172a" : "#FCFCFD",
        paper: darkMode ? "#1e293b" : "#ffffff",
      },
      text: {
        primary: darkMode ? "#f1f5f9" : "#0f172a",
        secondary: darkMode ? "#94a3b8" : "#64748b",
      },
    },
    typography: {
      fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            direction: isRTL ? "rtl" : "ltr",
            fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
            backgroundColor: darkMode ? "#0f172a" : "#FCFCFD",
            overflowX: "hidden", // Prevent horizontal scroll
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: "none",
            direction: isRTL ? "rtl" : "ltr",
          },
        },
      },
    },
  });

  // Initialize user and preferences
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setLanguageState(currentUser.language || "en");

      // Load saved preferences
      const savedDarkMode = localStorage.getItem("darkMode");
      const savedCollapsed = localStorage.getItem("sidebarCollapsed");

      if (savedDarkMode) {
        setDarkMode(JSON.parse(savedDarkMode));
      }
      if (savedCollapsed && !isMobile) {
        setDesktopDrawerCollapsed(JSON.parse(savedCollapsed));
      }
    } else {
      window.location.href = "/login";
    }
  }, [isMobile]);

  // Handle scroll to top visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-collapse sidebar on tablet
  useEffect(() => {
    if (isTablet && !desktopDrawerCollapsed) {
      setDesktopDrawerCollapsed(true);
    }
  }, [isTablet]);

  const setLanguage = (newLanguage: LanguageType) => {
    setLanguageState(newLanguage);
    if (user) {
      const updatedUser = { ...user, language: newLanguage };
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  const handleMobileDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleDesktopDrawerToggle = () => {
    const newCollapsed = !desktopDrawerCollapsed;
    setDesktopDrawerCollapsed(newCollapsed);
    localStorage.setItem("sidebarCollapsed", JSON.stringify(newCollapsed));
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage as LanguageType);
  };

  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", JSON.stringify(newDarkMode));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!user) {
    return null;
  }

  const contextValue = {
    language,
    setLanguage,
    t,
    isRTL,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      <ThemeProvider theme={customTheme}>
        <CssBaseline />

        {/* Mobile App Bar */}
        {isMobile && (
          <AppBar
            position="fixed"
            sx={{
              backgroundColor: customTheme.palette.background.paper,
              color: customTheme.palette.text.primary,
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
              zIndex: customTheme.zIndex.drawer + 1,
            }}
          >
            <Toolbar>
              <IconButton
                edge="start"
                onClick={handleMobileDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography
                variant="h6"
                sx={{
                  flexGrow: 1,
                  fontWeight: 600,
                  direction: isRTL ? "rtl" : "ltr",
                  fontFamily: isRTL
                    ? "var(--font-persian)"
                    : "var(--font-english)",
                }}
              >
                {t.title}
              </Typography>

              {/* Mobile Language Toggle */}
              <IconButton
                onClick={() =>
                  handleLanguageChange(language === "en" ? "fa" : "en")
                }
                sx={{ mr: 1, color: "inherit" }}
              >
                <LanguageIcon />
              </IconButton>

              {/* Mobile Dark Mode Toggle */}
              <IconButton
                onClick={handleDarkModeToggle}
                sx={{ mr: 1, color: "inherit" }}
              >
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>

              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: customTheme.palette.primary.main,
                }}
              >
                {user?.firstName?.charAt(0) || "U"}
              </Avatar>
            </Toolbar>
          </AppBar>
        )}

        {/* Main Layout Container */}
        <Box
          sx={{
            display: "flex",
            minHeight: "100vh",
            bgcolor: "#FCFCFD",
            direction: isRTL ? "rtl" : "ltr",
            overflow: "hidden", // Prevent body overflow
          }}
        >
          {/* Desktop Sidebar - Fixed Position */}
          {!isMobile && (
            <Box
              sx={{
                position: "fixed",
                top: 0,
                left: isRTL ? "auto" : 0,
                right: isRTL ? 0 : "auto",
                height: "100vh",
                zIndex: 1200,
                overflow: "hidden", // Prevent sidebar overflow
              }}
            >
              <Sidebar
                collapsed={desktopDrawerCollapsed}
                onToggleCollapse={handleDesktopDrawerToggle}
                language={language}
                onLanguageChange={handleLanguageChange}
                darkMode={darkMode}
                onDarkModeToggle={handleDarkModeToggle}
              />
            </Box>
          )}

          {/* Mobile Drawer */}
          {isMobile && (
            <Drawer
              variant="temporary"
              anchor={isRTL ? "right" : "left"}
              open={mobileDrawerOpen}
              onClose={handleMobileDrawerToggle}
              ModalProps={{
                keepMounted: true,
              }}
              sx={{
                "& .MuiDrawer-paper": {
                  width: 280,
                  boxSizing: "border-box",
                  border: "none",
                  overflow: "hidden", // Prevent drawer overflow
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: isRTL ? "flex-start" : "flex-end",
                  p: 1,
                }}
              >
                <IconButton onClick={handleMobileDrawerToggle}>
                  <CloseIcon />
                </IconButton>
              </Box>
              <Sidebar
                collapsed={false}
                language={language}
                onLanguageChange={handleLanguageChange}
                darkMode={darkMode}
                onDarkModeToggle={handleDarkModeToggle}
              />
            </Drawer>
          )}

          {/* Main Content Area */}
          <Box
            component="main"
            sx={{
              flex: 1,
              marginLeft: isMobile
                ? 0
                : isRTL
                ? 0
                : desktopDrawerCollapsed
                ? "64px"
                : "260px",
              marginRight: isMobile
                ? 0
                : isRTL
                ? desktopDrawerCollapsed
                  ? "64px"
                  : "260px"
                : 0,
              minHeight: "100vh",
              direction: isRTL ? "rtl" : "ltr",
              bgcolor: "transparent",
              overflow: "auto", // Allow content to scroll
              pt: isMobile ? 8 : 0, // Add top padding for mobile app bar
            }}
          >
            <Box
              sx={{
                padding: { xs: 2, sm: 3, md: 4 },
                minHeight: "100%",
              }}
            >
              {children}
            </Box>
          </Box>

          {/* Scroll to Top Button */}
          <Zoom in={showScrollTop}>
            <Fab
              onClick={scrollToTop}
              color="primary"
              size="medium"
              sx={{
                position: "fixed",
                bottom: 24,
                right: isRTL ? "auto" : 24,
                left: isRTL ? 24 : "auto",
                zIndex: 1000,
              }}
            >
              <KeyboardArrowUpIcon />
            </Fab>
          </Zoom>
        </Box>
      </ThemeProvider>
    </LanguageContext.Provider>
  );
};

export default Layout;
