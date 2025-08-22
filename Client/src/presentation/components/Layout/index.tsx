import { useState, useEffect, createContext, useContext } from "react";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
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
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  CreditCard as CreditIcon,
  Person as ProfileIcon,
  Language,
  Logout,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { translations } from "../../locales";
import type { Language as LanguageType } from "../../locales";
import { getCurrentUser, logoutUser } from "../../utils/userUtils";

const drawerWidth = 240;
const collapsedDrawerWidth = 64;

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [language, setLanguageState] = useState<LanguageType>("en");
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isRTL = language === "fa";
  const t = translations[language];
  const currentDrawerWidth = sidebarCollapsed
    ? collapsedDrawerWidth
    : drawerWidth;

  // Create theme based on language
  const theme = createTheme({
    direction: isRTL ? "rtl" : "ltr",
    typography: {
      fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            direction: isRTL ? "rtl" : "ltr",
            fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
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

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
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

  const menuItems = [
    {
      text: t.dashboard,
      icon: <DashboardIcon />,
      path: "/dashboard",
    },
    {
      text: t.credit,
      icon: <CreditIcon />,
      path: "/credit",
    },
    {
      text: t.profile,
      icon: <ProfileIcon />,
      path: "/profile",
    },
  ];

  const drawer = (
    <Box>
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1,
        }}
      >
        {!sidebarCollapsed && (
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              direction: isRTL ? "rtl" : "ltr",
              fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
              textAlign: isRTL ? "right" : "left",
            }}
          >
            {t.title}
          </Typography>
        )}
        <IconButton onClick={handleSidebarToggle}>
          {isRTL ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                direction: isRTL ? "rtl" : "ltr",
                fontFamily: isRTL
                  ? "var(--font-persian)"
                  : "var(--font-english)",
                textAlign: isRTL ? "right" : "left",
                minHeight: 48,
                justifyContent: sidebarCollapsed ? "center" : "flex-start",
                px: sidebarCollapsed ? 2 : 3,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: sidebarCollapsed ? 0 : isRTL ? "auto" : 40,
                  mr: sidebarCollapsed ? 0 : isRTL ? 2 : 0,
                  ml: sidebarCollapsed ? 0 : isRTL ? 0 : 2,
                  justifyContent: "center",
                }}
              >
                {item.icon}
              </ListItemIcon>
              {!sidebarCollapsed && (
                <ListItemText
                  primary={item.text}
                  sx={{
                    textAlign: isRTL ? "right" : "left",
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
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
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
          <AppBar
            position="fixed"
            sx={{
              width: { sm: `calc(100% - ${currentDrawerWidth}px)` },
              ml: { sm: isRTL ? 0 : `${currentDrawerWidth}px` },
              mr: { sm: isRTL ? `${currentDrawerWidth}px` : 0 },
              zIndex: (theme) => theme.zIndex.drawer + 1,
            }}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge={isRTL ? "end" : "start"}
                onClick={handleDrawerToggle}
                sx={{
                  mr: isRTL ? 0 : 2,
                  ml: isRTL ? 2 : 0,
                  display: { sm: "none" },
                }}
              >
                <MenuIcon />
              </IconButton>
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{ flexGrow: 1 }}
              />
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <ToggleButtonGroup
                  value={language}
                  exclusive
                  onChange={handleLanguageChange}
                  size="small"
                  sx={{
                    "& .MuiToggleButton-root": {
                      px: 2,
                      py: 0.5,
                      fontSize: "0.875rem",
                      fontFamily: isRTL
                        ? "var(--font-persian)"
                        : "var(--font-english)",
                    },
                  }}
                >
                  <ToggleButton value="en">
                    <Language
                      sx={{
                        mr: isRTL ? 0 : 0.5,
                        ml: isRTL ? 0.5 : 0,
                        fontSize: "1rem",
                      }}
                    />
                    EN
                  </ToggleButton>
                  <ToggleButton value="fa">
                    <Language
                      sx={{
                        mr: isRTL ? 0 : 0.5,
                        ml: isRTL ? 0.5 : 0,
                        fontSize: "1rem",
                      }}
                    />
                    فارسی
                  </ToggleButton>
                </ToggleButtonGroup>

                <Button
                  variant="outlined"
                  startIcon={isRTL ? undefined : <Logout />}
                  endIcon={isRTL ? <Logout /> : undefined}
                  onClick={handleLogout}
                  sx={{
                    color: "white",
                    borderColor: "white",
                    fontFamily: isRTL
                      ? "var(--font-persian)"
                      : "var(--font-english)",
                    "&:hover": {
                      borderColor: "white",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                >
                  {t.logout}
                </Button>
              </Box>
            </Toolbar>
          </AppBar>
          <Box
            component="nav"
            sx={{ width: { sm: currentDrawerWidth }, flexShrink: { sm: 0 } }}
            aria-label="mailbox folders"
          >
            <Drawer
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{
                keepMounted: true,
              }}
              sx={{
                display: { xs: "block", sm: "none" },
                "& .MuiDrawer-paper": {
                  boxSizing: "border-box",
                  width: drawerWidth,
                  direction: isRTL ? "rtl" : "ltr",
                },
              }}
            >
              {drawer}
            </Drawer>
            <Drawer
              variant="permanent"
              sx={{
                display: { xs: "none", sm: "block" },
                "& .MuiDrawer-paper": {
                  boxSizing: "border-box",
                  width: currentDrawerWidth,
                  direction: isRTL ? "rtl" : "ltr",
                  transition: "width 0.2s ease-in-out",
                  overflowX: "hidden",
                },
              }}
              open
            >
              {drawer}
            </Drawer>
          </Box>
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              width: { sm: `calc(100% - ${currentDrawerWidth}px)` },
              direction: isRTL ? "rtl" : "ltr",
              minHeight: "100vh",
              backgroundColor: "background.default",
            }}
          >
            <Toolbar />
            {children}
          </Box>
        </Box>
      </ThemeProvider>
    </LanguageContext.Provider>
  );
};

export default Layout;
