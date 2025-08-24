import { useState, useEffect, createContext, useContext } from "react";
import {
  Box,
  List,
  Typography,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Avatar,
  Chip,
  Tooltip,
  Badge,
  Stack,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  CreditCard as CreditIcon,
  Person as ProfileIcon,
  Restaurant as FoodsIcon,
  Language,
  Logout,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Settings,
  Notifications,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { translations } from "../../locales";
import type { Language as LanguageType } from "../../locales";
import { getCurrentUser, logoutUser } from "../../utils/userUtils";
import { createComponentStyles } from "../../utils/languageUtils";
import "./index.css";

// Language Context
interface LanguageContextType {
  language: LanguageType;
  setLanguage: (lang: LanguageType) => void;
  t: any;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [language, setLanguageState] = useState<LanguageType>("en");
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isRTL = language === "fa";
  const t = translations[language];
  const componentStyles = createComponentStyles(language);

  // Create theme based on language
  const theme = createTheme({
    direction: isRTL ? "rtl" : "ltr",
    typography: {
      fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
    },
    palette: {
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
        default: "#f8fafc",
        paper: "#ffffff",
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            direction: isRTL ? "rtl" : "ltr",
            fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
            backgroundColor: "#f8fafc",
          },
        },
      },
    },
  });

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setLanguageState(currentUser.language);
    } else {
      window.location.href = "/login";
    }
  }, []);

  const setLanguage = (newLanguage: LanguageType) => {
    setLanguageState(newLanguage);
    if (user) {
      const updatedUser = { ...user, language: newLanguage };
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleLanguageChange = (
    _event: React.MouseEvent<HTMLElement>,
    newLanguage: LanguageType | null
  ) => {
    if (newLanguage !== null) {
      setLanguage(newLanguage);
    }
  };

  const handleLogout = () => {
    logoutUser();
    window.location.href = "/login";
  };

  const mainMenuItems = [
    {
      text: t.dashboard,
      icon: <DashboardIcon />,
      path: "/dashboard",
      badge: null,
    },
    {
      text: t.foods,
      icon: <FoodsIcon />,
      path: "/foods",
      badge: null,
    },
    {
      text: t.credit,
      icon: <CreditIcon />,
      path: "/credit",
      badge: "3",
    },
    {
      text: t.profile,
      icon: <ProfileIcon />,
      path: "/profile",
      badge: null,
    },
  ];

  const secondaryMenuItems = [
    {
      text: t.settings,
      icon: <Settings />,
      path: "/settings",
      badge: null,
    },
    {
      text: t.notifications,
      icon: <Notifications />,
      path: "/notifications",
      badge: "5",
    },
  ];

  const drawer = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(180deg, #1e293b 0%, #334155 100%)",
        color: "#ffffff",
        boxShadow: "4px 0 20px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
          borderRadius: "0 0 0px 0px",
          mb: 2,
        }}
      >
        <Stack
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          {!sidebarCollapsed && (
            <Typography
              variant="h6"
              sx={{
                color: "white",
                fontWeight: 700,
                fontSize: "1.1rem",
                direction: isRTL ? "rtl" : "ltr",
                fontFamily: isRTL
                  ? "var(--font-persian)"
                  : "var(--font-english)",
              }}
            >
              {t.title}
            </Typography>
          )}
          <Tooltip title={sidebarCollapsed ? t.expand : t.collapse}>
            <IconButton
              onClick={handleSidebarToggle}
              sx={{
                color: "white",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                },
              }}
            >
              {isRTL ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Tooltip>
        </Stack>

        {/* User Profile Section */}
        {!sidebarCollapsed && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                border: "2px solid rgba(255, 255, 255, 0.3)",
              }}
            >
              {user?.firstName?.charAt(0) || "U"}
            </Avatar>
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  color: "white",
                  fontWeight: 600,
                  direction: isRTL ? "rtl" : "ltr",
                  fontFamily: isRTL
                    ? "var(--font-persian)"
                    : "var(--font-english)",
                }}
              >
                {user?.firstName} {user?.lastName}
              </Typography>
              <Chip
                label={user?.role || "Student"}
                size="small"
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  color: "white",
                  fontSize: "0.75rem",
                  height: 20,
                }}
              />
            </Box>
          </Box>
        )}
      </Box>

      {/* Main Navigation - Scrollable */}
      <Box
        sx={{
          flex: 1,
          px: 1,
          overflow: "auto",
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-track": {
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "0px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(255, 255, 255, 0.3)",
            borderRadius: "0px",
            "&:hover": {
              background: "rgba(255, 255, 255, 0.5)",
            },
          },
        }}
      >
        {/* Main Menu Section */}
        <Box sx={{ mb: 3 }}>
          {!sidebarCollapsed && (
            <Typography
              variant="caption"
              sx={{
                color: "rgba(255, 255, 255, 0.7)",
                px: 2,
                py: 1,
                display: "block",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                direction: isRTL ? "rtl" : "ltr",
                fontFamily: isRTL
                  ? "var(--font-persian)"
                  : "var(--font-english)",
              }}
            >
              {t.mainMenu || "Main Menu"}
            </Typography>
          )}
          <List sx={{ p: 0 }}>
            {mainMenuItems.map((item) => (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 0,
                    mx: 1,
                    minHeight: 48,
                    justifyContent: sidebarCollapsed ? "center" : "flex-start",
                    px: sidebarCollapsed ? 2 : 2,
                    backgroundColor:
                      location.pathname === item.path
                        ? "rgba(59, 130, 246, 0.2)"
                        : "transparent",
                    border:
                      location.pathname === item.path
                        ? "1px solid rgba(59, 130, 246, 0.3)"
                        : "1px solid transparent",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                    },
                    "&.Mui-selected": {
                      backgroundColor: "rgba(59, 130, 246, 0.2)",
                      border: "1px solid rgba(59, 130, 246, 0.3)",
                      "&:hover": {
                        backgroundColor: "rgba(59, 130, 246, 0.3)",
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: sidebarCollapsed ? 0 : 40,
                      color:
                        location.pathname === item.path
                          ? "#3b82f6"
                          : "rgba(255, 255, 255, 0.8)",
                      justifyContent: "center",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!sidebarCollapsed && (
                    <ListItemText
                      primary={item.text}
                      sx={{
                        direction: isRTL ? "rtl" : "ltr",
                        fontFamily: isRTL
                          ? "var(--font-persian)"
                          : "var(--font-english)",
                        "& .MuiListItemText-primary": {
                          fontWeight:
                            location.pathname === item.path ? 600 : 500,
                          color:
                            location.pathname === item.path
                              ? "#3b82f6"
                              : "rgba(255, 255, 255, 0.9)",
                        },
                      }}
                    />
                  )}
                  {!sidebarCollapsed && item.badge && (
                    <Badge
                      badgeContent={item.badge}
                      color="error"
                      sx={{
                        "& .MuiBadge-badge": {
                          backgroundColor: "#ef4444",
                          color: "white",
                          fontSize: "0.75rem",
                          minWidth: 20,
                          height: 20,
                        },
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Secondary Menu Section */}
        <Box sx={{ mb: 3 }}>
          {!sidebarCollapsed && (
            <Typography
              variant="caption"
              sx={{
                color: "rgba(255, 255, 255, 0.7)",
                px: 2,
                py: 1,
                display: "block",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                direction: isRTL ? "rtl" : "ltr",
                fontFamily: isRTL
                  ? "var(--font-persian)"
                  : "var(--font-english)",
              }}
            >
              {t.tools || "Tools"}
            </Typography>
          )}
          <List sx={{ p: 0 }}>
            {secondaryMenuItems.map((item) => (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 0,
                    mx: 1,
                    minHeight: 48,
                    justifyContent: sidebarCollapsed ? "center" : "flex-start",
                    px: sidebarCollapsed ? 2 : 2,
                    backgroundColor:
                      location.pathname === item.path
                        ? "rgba(245, 158, 11, 0.2)"
                        : "transparent",
                    border:
                      location.pathname === item.path
                        ? "1px solid rgba(245, 158, 11, 0.3)"
                        : "1px solid transparent",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                    },
                    "&.Mui-selected": {
                      backgroundColor: "rgba(245, 158, 11, 0.2)",
                      border: "1px solid rgba(245, 158, 11, 0.3)",
                      "&:hover": {
                        backgroundColor: "rgba(245, 158, 11, 0.3)",
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: sidebarCollapsed ? 0 : 40,
                      color:
                        location.pathname === item.path
                          ? "#f59e0b"
                          : "rgba(255, 255, 255, 0.8)",
                      justifyContent: "center",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!sidebarCollapsed && (
                    <ListItemText
                      primary={item.text}
                      sx={{
                        direction: isRTL ? "rtl" : "ltr",
                        fontFamily: isRTL
                          ? "var(--font-persian)"
                          : "var(--font-english)",
                        "& .MuiListItemText-primary": {
                          fontWeight:
                            location.pathname === item.path ? 600 : 500,
                          color:
                            location.pathname === item.path
                              ? "#f59e0b"
                              : "rgba(255, 255, 255, 0.9)",
                        },
                      }}
                    />
                  )}
                  {!sidebarCollapsed && item.badge && (
                    <Badge
                      badgeContent={item.badge}
                      color="error"
                      sx={{
                        "& .MuiBadge-badge": {
                          backgroundColor: "#ef4444",
                          color: "white",
                          fontSize: "0.75rem",
                          minWidth: 20,
                          height: 20,
                        },
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>

      {/* Footer Actions */}
      <Box sx={{ p: 2, borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
        {/* Language Toggle */}
        <Box sx={{ mb: 2 }}>
          {!sidebarCollapsed && (
            <Typography
              variant="caption"
              sx={{
                color: "rgba(255, 255, 255, 0.7)",
                mb: 1,
                display: "block",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                direction: isRTL ? "rtl" : "ltr",
                fontFamily: isRTL
                  ? "var(--font-persian)"
                  : "var(--font-english)",
              }}
            >
              {t.language || "Language"}
            </Typography>
          )}
          <ToggleButtonGroup
            value={language}
            exclusive
            onChange={handleLanguageChange}
            size="small"
            sx={{
              width: "100%",
              "& .MuiToggleButton-root": {
                flex: 1,
                py: 1,
                fontSize: "0.875rem",
                fontFamily: isRTL
                  ? "var(--font-persian)"
                  : "var(--font-english)",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "rgba(255, 255, 255, 0.8)",
                "&.Mui-selected": {
                  backgroundColor: "rgba(59, 130, 246, 0.3)",
                  color: "#3b82f6",
                  border: "1px solid rgba(59, 130, 246, 0.5)",
                },
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                },
              },
            }}
          >
            <ToggleButton value="en">
              <Language sx={{ mr: 0.5, fontSize: "1rem" }} />
              {!sidebarCollapsed && "EN"}
            </ToggleButton>
            <ToggleButton value="fa">
              <Language sx={{ mr: 0.5, fontSize: "1rem" }} />
              {!sidebarCollapsed && "فارسی"}
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Logout Button */}
        <Button
          fullWidth
          variant="outlined"
          startIcon={isRTL ? undefined : <Logout />}
          endIcon={isRTL ? <Logout /> : undefined}
          onClick={handleLogout}
          sx={{
            color: "#ef4444",
            borderColor: "#ef4444",
            fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
            fontWeight: 600,
            py: 1.5,
            borderRadius: 0,
            "&:hover": {
              borderColor: "#dc2626",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
            },
          }}
        >
          {!sidebarCollapsed && t.logout}
        </Button>
      </Box>
    </Box>
  );

  if (!user) {
    return null;
  }

  const contextValue: LanguageContextType = {
    language,
    setLanguage,
    t,
    isRTL,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Stack
          className="home-layout"
          flexDirection={isRTL ? "row-reverse" : "row"}
          sx={{
            backgroundColor: "#FCFCFD",
            direction: isRTL ? "rtl" : "ltr",
            width: "100%",
            height: "100vh",
            overflow: "hidden",
          }}
        >
          <Box
            component="aside"
            sx={{
              ...componentStyles.sidebar.container,
              maxWidth: sidebarCollapsed ? 80 : 280,
              minWidth: sidebarCollapsed ? 80 : 280,
              left: isRTL ? "auto" : 0,
              right: isRTL ? 0 : "auto",
              zIndex: 1,
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {drawer}
          </Box>
          <Stack
            spacing={3}
            sx={{
              flex: 1,
              overflow: "auto",
              ...componentStyles.dashboard.container,
              height: "100vh",
            }}
          >
            {children}
          </Stack>
        </Stack>
      </ThemeProvider>
    </LanguageContext.Provider>
  );
};

export default Layout;
