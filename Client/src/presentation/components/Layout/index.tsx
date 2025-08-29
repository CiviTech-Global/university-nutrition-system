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
  Drawer,
  AppBar,
  Toolbar,
  useMediaQuery,
  useTheme,
  Divider,
  Collapse,
  Fab,
  Zoom,
  Paper,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  CreditCard as CreditIcon,
  Person as ProfileIcon,
  Restaurant as FoodsIcon,
  LocalOffer as SaleDayIcon,
  Language as LanguageIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Translate as TranslateIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
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

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  badge?: string | number;
  color?: string;
}

const DRAWER_WIDTH = 280;
const DRAWER_WIDTH_COLLAPSED = 72;

const Layout = ({ children }: LayoutProps) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [desktopDrawerCollapsed, setDesktopDrawerCollapsed] = useState(false);
  const [language, setLanguageState] = useState<LanguageType>("en");
  const [user, setUser] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.between("md", "lg"));

  const isRTL = language === "fa";
  const t = translations[language];
  const componentStyles = createComponentStyles(language);

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
        default: darkMode ? "#0f172a" : "#f8fafc",
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
            backgroundColor: darkMode ? "#0f172a" : "#f8fafc",
            overflow: "hidden",
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: "none",
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

  const handleLanguageChange = (
    _event: React.MouseEvent<HTMLElement>,
    newLanguage: LanguageType | null
  ) => {
    if (newLanguage !== null) {
      setLanguage(newLanguage);
    }
  };

  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", JSON.stringify(newDarkMode));
  };

  const handleLogout = () => {
    logoutUser();
    window.location.href = "/login";
  };

  const handleMenuItemClick = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleMenuExpansion = (menuKey: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const mainMenuItems: MenuItem[] = [
    {
      text: t.dashboard,
      icon: <DashboardIcon />,
      path: "/dashboard",
      badge: undefined,
    },
    {
      text: t.foods,
      icon: <FoodsIcon />,
      path: "/foods",
      badge: undefined,
    },
    {
      text: t.saleDay,
      icon: <SaleDayIcon />,
      path: "/sale-day",
      badge: "HOT",
      color: "#ef4444",
    },
    {
      text: t.credit,
      icon: <CreditIcon />,
      path: "/credit",
      badge: 3,
    },
    {
      text: t.profile,
      icon: <ProfileIcon />,
      path: "/profile",
      badge: undefined,
    },
  ];

  const toolsMenuItems: MenuItem[] = [
    {
      text: t.settings || "Settings",
      icon: <SettingsIcon />,
      path: "/settings",
      badge: undefined,
    },
    {
      text: t.notifications || "Notifications",
      icon: <NotificationsIcon />,
      path: "/notifications",
      badge: 5,
    },
  ];

  const developmentMenuItems: MenuItem[] = [
    {
      text: "Test Language",
      icon: <TranslateIcon />,
      path: "/test-language",
      badge: undefined,
    },
    {
      text: t.forgotPasswordMenu || "Reset Password",
      icon: <TranslateIcon />,
      path: "/forgot-password",
      badge: undefined,
    },
  ];

  const renderMenuItems = (items: MenuItem[], collapsed: boolean = false) => (
    <List sx={{ p: 0 }}>
      {items.map((item) => {
        const isActive = location.pathname === item.path;
        
        return (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <Tooltip 
              title={collapsed ? item.text : ""}
              placement={isRTL ? "left" : "right"}
              arrow
            >
              <ListItemButton
                selected={isActive}
                onClick={() => handleMenuItemClick(item.path)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  minHeight: 48,
                  justifyContent: collapsed ? "center" : "flex-start",
                  px: collapsed ? 1 : 2,
                  backgroundColor: isActive
                    ? "rgba(59, 130, 246, 0.12)"
                    : "transparent",
                  border: isActive
                    ? `1px solid ${customTheme.palette.primary.main}40`
                    : "1px solid transparent",
                  position: "relative",
                  overflow: "hidden",
                  "&:hover": {
                    backgroundColor: darkMode 
                      ? "rgba(255, 255, 255, 0.08)" 
                      : "rgba(0, 0, 0, 0.04)",
                    transform: "translateX(4px)",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "rgba(59, 130, 246, 0.12)",
                    "&:hover": {
                      backgroundColor: "rgba(59, 130, 246, 0.16)",
                    },
                  },
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                {/* Active indicator */}
                {isActive && (
                  <Box
                    sx={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 3,
                      backgroundColor: customTheme.palette.primary.main,
                      borderRadius: "0 2px 2px 0",
                    }}
                  />
                )}

                <ListItemIcon
                  sx={{
                    minWidth: collapsed ? 0 : 40,
                    color: isActive
                      ? customTheme.palette.primary.main
                      : customTheme.palette.text.secondary,
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                {!collapsed && (
                  <>
                    <ListItemText
                      primary={item.text}
                      sx={{
                        direction: isRTL ? "rtl" : "ltr",
                        textAlign: isRTL ? "right" : "left",
                        "& .MuiListItemText-primary": {
                          fontWeight: isActive ? 600 : 500,
                          color: isActive
                            ? customTheme.palette.primary.main
                            : customTheme.palette.text.primary,
                          fontFamily: isRTL
                            ? "var(--font-persian)"
                            : "var(--font-english)",
                        },
                      }}
                    />

                    {item.badge && (
                      <Chip
                        label={item.badge}
                        size="small"
                        sx={{
                          backgroundColor: item.color || customTheme.palette.error.main,
                          color: "white",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          minWidth: 24,
                          height: 24,
                          animation: item.badge === "HOT" ? "pulse 2s infinite" : "none",
                        }}
                      />
                    )}
                  </>
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        );
      })}
    </List>
  );

  const renderMenuSection = (
    title: string,
    items: MenuItem[],
    collapsed: boolean,
    menuKey?: string
  ) => (
    <Box sx={{ mb: 2 }}>
      {!collapsed && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1,
            cursor: menuKey ? "pointer" : "default",
          }}
          onClick={menuKey ? () => toggleMenuExpansion(menuKey) : undefined}
        >
          <Typography
            variant="caption"
            sx={{
              color: customTheme.palette.text.secondary,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              direction: isRTL ? "rtl" : "ltr",
              fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
            }}
          >
            {title}
          </Typography>
          {menuKey && (
            <IconButton size="small" sx={{ color: customTheme.palette.text.secondary }}>
              {expandedMenus[menuKey] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          )}
        </Box>
      )}
      
      {menuKey ? (
        <Collapse in={!collapsed && (expandedMenus[menuKey] ?? true)}>
          {renderMenuItems(items, collapsed)}
        </Collapse>
      ) : (
        renderMenuItems(items, collapsed)
      )}
    </Box>
  );

  const drawerContent = (collapsed: boolean = false) => (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: darkMode
          ? "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)"
          : "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        borderRight: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: collapsed ? 1 : 3,
          background: darkMode
            ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
            : "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decoration */}
        <Box
          sx={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 80,
            height: 80,
            background: "rgba(255,255,255,0.1)",
            borderRadius: "50%",
            animation: "pulse 3s infinite",
          }}
        />

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: collapsed ? 0 : 2 }}>
          {!collapsed && (
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: "1.1rem",
                direction: isRTL ? "rtl" : "ltr",
                fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
              }}
            >
              {t.title}
            </Typography>
          )}
          
          {!isMobile && (
            <Tooltip title={collapsed ? t.expand || "Expand" : t.collapse || "Collapse"}>
              <IconButton
                onClick={handleDesktopDrawerToggle}
                sx={{
                  color: "white",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    transform: "scale(1.1)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                {collapsed ? 
                  (isRTL ? <ChevronLeftIcon /> : <ChevronRightIcon />) : 
                  (isRTL ? <ChevronRightIcon /> : <ChevronLeftIcon />)
                }
              </IconButton>
            </Tooltip>
          )}
        </Stack>

        {/* User Profile Section */}
        {!collapsed && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              borderRadius: 2,
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  fontWeight: 600,
                }}
              >
                {user?.firstName?.charAt(0) || "U"}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    direction: isRTL ? "rtl" : "ltr",
                    fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
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
                    height: 22,
                    fontWeight: 500,
                  }}
                />
              </Box>
            </Stack>
          </Paper>
        )}
      </Box>

      {/* Navigation Content */}
      <Box
        sx={{
          flex: 1,
          px: 1,
          py: 2,
          overflow: "auto",
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: darkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)",
            borderRadius: "3px",
            "&:hover": {
              background: darkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)",
            },
          },
        }}
      >
        {/* Main Menu */}
        {renderMenuSection(t.mainMenu || "Main Menu", mainMenuItems, collapsed)}
        
        <Divider sx={{ mx: 2, my: 1, opacity: 0.3 }} />
        
        {/* Tools Menu */}
        {renderMenuSection(t.tools || "Tools", toolsMenuItems, collapsed, "tools")}
        
        {/* Development Menu - Only show in development */}
        {process.env.NODE_ENV === "development" && (
          <>
            <Divider sx={{ mx: 2, my: 1, opacity: 0.3 }} />
            {renderMenuSection("Development", developmentMenuItems, collapsed, "dev")}
          </>
        )}
      </Box>

      {/* Footer Actions */}
      <Box
        sx={{
          p: 2,
          borderTop: `1px solid ${darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
        }}
      >
        {/* Dark Mode Toggle */}
        {!collapsed && (
          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={handleDarkModeToggle}
                color="primary"
              />
            }
            label={
              <Stack direction="row" alignItems="center" spacing={1}>
                {darkMode ? <DarkModeIcon /> : <LightModeIcon />}
                <Typography variant="body2">
                  {darkMode ? (language === "fa" ? "حالت تاریک" : "Dark Mode") : (language === "fa" ? "حالت روشن" : "Light Mode")}
                </Typography>
              </Stack>
            }
            sx={{
              width: "100%",
              mb: 2,
              mx: 0,
              "& .MuiFormControlLabel-label": {
                fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                direction: isRTL ? "rtl" : "ltr",
              },
            }}
          />
        )}

        {/* Language Toggle */}
        <Box sx={{ mb: 2 }}>
          {!collapsed && (
            <Typography
              variant="caption"
              sx={{
                color: customTheme.palette.text.secondary,
                mb: 1,
                display: "block",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                direction: isRTL ? "rtl" : "ltr",
                fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
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
                fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
                border: `1px solid ${darkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)"}`,
                color: customTheme.palette.text.primary,
                "&.Mui-selected": {
                  backgroundColor: customTheme.palette.primary.main,
                  color: "white",
                  border: `1px solid ${customTheme.palette.primary.main}`,
                },
                "&:hover": {
                  backgroundColor: darkMode ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.15)",
                },
              },
            }}
          >
            <ToggleButton value="en">
              <LanguageIcon sx={{ mr: 0.5, fontSize: "1rem" }} />
              {!collapsed && "EN"}
            </ToggleButton>
            <ToggleButton value="fa">
              <LanguageIcon sx={{ mr: 0.5, fontSize: "1rem" }} />
              {!collapsed && "فارسی"}
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Logout Button */}
        <Button
          fullWidth
          variant="outlined"
          startIcon={isRTL ? undefined : <LogoutIcon />}
          endIcon={isRTL ? <LogoutIcon /> : undefined}
          onClick={handleLogout}
          sx={{
            color: customTheme.palette.error.main,
            borderColor: customTheme.palette.error.main,
            fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
            fontWeight: 600,
            py: 1.5,
            borderRadius: 2,
            "&:hover": {
              borderColor: customTheme.palette.error.dark,
              backgroundColor: `${customTheme.palette.error.main}10`,
              transform: "translateY(-1px)",
            },
            transition: "all 0.2s ease",
          }}
        >
          {!collapsed && (t.logout || "Logout")}
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
                  fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                }}
              >
                {t.title}
              </Typography>
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

        <Box sx={{ display: "flex", height: "100vh" }}>
          {/* Desktop Drawer */}
          {!isMobile && (
            <Drawer
              variant="permanent"
              sx={{
                width: desktopDrawerCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                  width: desktopDrawerCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
                  boxSizing: "border-box",
                  transition: customTheme.transitions.create("width", {
                    easing: customTheme.transitions.easing.easeOut,
                    duration: customTheme.transitions.duration.enteringScreen,
                  }),
                  overflowX: "hidden",
                  border: "none",
                },
              }}
            >
              {drawerContent(desktopDrawerCollapsed)}
            </Drawer>
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
                  width: DRAWER_WIDTH,
                  boxSizing: "border-box",
                  border: "none",
                },
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
                <IconButton onClick={handleMobileDrawerToggle}>
                  <CloseIcon />
                </IconButton>
              </Box>
              {drawerContent(false)}
            </Drawer>
          )}

          {/* Main Content */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              bgcolor: customTheme.palette.background.default,
              overflow: "auto",
              pt: isMobile ? 8 : 0,
              direction: isRTL ? "rtl" : "ltr",
            }}
          >
            {children}
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