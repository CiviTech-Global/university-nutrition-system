import { useState, useEffect } from "react";
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
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  CreditCard as CreditIcon,
  Person as ProfileIcon,
  Language,
  Logout,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { translations } from "../../locales";
import type { Language as LanguageType } from "../../locales";
import { getCurrentUser, logoutUser } from "../../utils/userUtils";

const drawerWidth = 240;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [language, setLanguage] = useState<LanguageType>("en");
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const t = translations[language];

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setLanguage(currentUser.language);
    } else {
      // Redirect to login if no user is logged in
      window.location.href = "/login";
    }
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
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
      <Toolbar>
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            direction: language === "fa" ? "rtl" : "ltr",
            fontFamily:
              language === "fa" ? "var(--font-persian)" : "var(--font-english)",
          }}
        >
          {t.title}
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                direction: language === "fa" ? "rtl" : "ltr",
                fontFamily:
                  language === "fa"
                    ? "var(--font-persian)"
                    : "var(--font-english)",
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  if (!user) {
    return null;
  }

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
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
                },
              }}
            >
              <ToggleButton value="en">
                <Language sx={{ mr: 0.5, fontSize: "1rem" }} />
                EN
              </ToggleButton>
              <ToggleButton value="fa">
                <Language sx={{ mr: 0.5, fontSize: "1rem" }} />
                فارسی
              </ToggleButton>
            </ToggleButtonGroup>

            <Button
              variant="outlined"
              startIcon={<Logout />}
              onClick={handleLogout}
              sx={{
                color: "white",
                borderColor: "white",
                fontFamily:
                  language === "fa"
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
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
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
              width: drawerWidth,
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
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
