import { useState, useEffect } from "react";
import {
  Box,
  List,
  Typography,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Stack,
  Divider,
  Collapse,
  ListSubheader,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  CreditCard as CreditIcon,
  Person as ProfileIcon,
  Restaurant as FoodsIcon,
  LocalOffer as SaleDayIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Language as LanguageIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { getCurrentUser, logoutUser } from "../../utils/userUtils";
import "./index.css";

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  badge?: string | number;
  color?: string;
}

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  language?: string;
  onLanguageChange?: (language: string) => void;
  darkMode?: boolean;
  onDarkModeToggle?: () => void;
}

const Sidebar = ({ 
  collapsed = false, 
  onToggleCollapse,
  language = "en",
  onLanguageChange,
  darkMode = false,
  onDarkModeToggle,
}: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, isRTL } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    Dashboard: true,
    Account: false,
  });

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleMenuItemClick = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    logoutUser();
    window.location.href = "/login";
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
    },
    {
      text: t.foods,
      icon: <FoodsIcon />,
      path: "/foods",
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
    },
  ];

  const accountMenuItems: MenuItem[] = [
    {
      text: t.settings || "Settings",
      icon: <SettingsIcon />,
      path: "/settings",
    },
    {
      text: t.notifications || "Notifications",
      icon: <NotificationsIcon />,
      path: "/notifications",
      badge: 5,
    },
  ];

  const renderMenuItems = (items: MenuItem[]) => (
    <List sx={{ p: 0 }}>
      {items.map((item) => {
        const isActive = location.pathname === item.path;
        
        return (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.75 }}>
            <ListItemButton
              className={isActive ? "selected-path" : ""}
              onClick={() => handleMenuItemClick(item.path)}
              sx={{
                borderRadius: "6px",
                mx: collapsed ? 0.5 : 0,
                minHeight: 40,
                px: collapsed ? 1 : 1.5,
                py: 0.75,
                justifyContent: collapsed ? "center" : "flex-start",
                "&.selected-path": {
                  backgroundColor: "#3b82f6",
                  color: "white",
                  boxShadow: "0 1px 3px rgba(59, 130, 246, 0.3)",
                  "& .MuiListItemIcon-root": {
                    color: "white",
                  },
                  "& .MuiListItemText-primary": {
                    color: "white",
                    fontWeight: 500,
                  },
                },
                "&:hover": {
                  backgroundColor: isActive ? "#3b82f6" : "#f8fafc",
                  "&:not(.selected-path)": {
                    backgroundColor: "#f1f5f9",
                  },
                },
                direction: isRTL ? "rtl" : "ltr",
                transition: "all 0.15s ease",
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: collapsed ? 0 : 32,
                  color: "inherit",
                  justifyContent: "center",
                  mr: isRTL && !collapsed ? 1 : undefined,
                  ml: !isRTL && !collapsed ? 0 : undefined,
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
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "inherit",
                        fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                        lineHeight: 1.4,
                      },
                    }}
                  />

                  {item.badge && (
                    <Box
                      sx={{
                        minWidth: 20,
                        height: 18,
                        borderRadius: "9px",
                        backgroundColor: item.color || "#ef4444",
                        color: "white",
                        fontSize: "10px",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        px: 0.75,
                      }}
                    >
                      {item.badge}
                    </Box>
                  )}
                </>
              )}
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );

  return (
    <Box
      component="aside"
      sx={{
        width: collapsed ? 64 : 260,
        height: "100vh",
        backgroundColor: "#ffffff",
        borderRight: isRTL ? "none" : "1px solid #f1f5f9",
        borderLeft: isRTL ? "1px solid #f1f5f9" : "none",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        zIndex: 1,
        direction: isRTL ? "rtl" : "ltr",
        boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.05)",
      }}
      className={collapsed ? "collapsed" : ""}
    >
      {/* Header */}
      <Box sx={{ p: collapsed ? 2 : 3, pb: collapsed ? 2 : 3, borderBottom: "1px solid #f8fafc" }}>
        <Stack direction="row" alignItems="center" spacing={collapsed ? 0 : 2} sx={{ mb: collapsed ? 0 : 2 }}>
          <Avatar
            sx={{
              width: collapsed ? 28 : 36,
              height: collapsed ? 28 : 36,
              backgroundColor: "#3b82f6",
              fontSize: collapsed ? "14px" : "16px",
              fontWeight: 600,
              boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)",
            }}
          >
            {user?.firstName?.charAt(0) || "U"}
          </Avatar>
          {!collapsed && (
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography 
                variant="subtitle1"
                sx={{ 
                  fontWeight: 600,
                  fontSize: "15px",
                  lineHeight: 1.4,
                  color: "#1f2937",
                  direction: isRTL ? "rtl" : "ltr",
                  textAlign: isRTL ? "right" : "left",
                  fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                  mb: 0.5,
                }}
              >
                {t.title}
              </Typography>
              <Typography 
                variant="caption"
                sx={{
                  fontSize: "12px",
                  color: "#64748b",
                  direction: isRTL ? "rtl" : "ltr",
                  fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                }}
              >
                {user?.role || "Student"}
              </Typography>
            </Box>
          )}
          
          {/* Collapse Toggle Button */}
          {onToggleCollapse && (
            <Tooltip title={collapsed ? (isRTL ? "توسعه" : "Expand") : (isRTL ? "جمع کردن" : "Collapse")}>
              <IconButton
                onClick={onToggleCollapse}
                size="small"
                sx={{
                  width: 28,
                  height: 28,
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  color: "#64748b",
                  "&:hover": {
                    backgroundColor: "#f1f5f9",
                    borderColor: "#cbd5e1",
                    color: "#475569",
                  },
                  transition: "all 0.15s ease",
                }}
              >
                {collapsed ? 
                  (isRTL ? <ChevronLeftIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />) : 
                  (isRTL ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />)
                }
              </IconButton>
            </Tooltip>
          )}
        </Stack>

        {/* User Info */}
        {!collapsed && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              backgroundColor: "#f8fafc",
              border: "1px solid #f1f5f9",
              borderRadius: "8px",
              direction: isRTL ? "rtl" : "ltr",
            }}
          >
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 500,
                fontSize: "13px",
                color: "#374151",
                direction: isRTL ? "rtl" : "ltr",
                textAlign: isRTL ? "right" : "left",
                fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                mb: 0.5,
              }}
            >
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{
                fontSize: "11px",
                color: "#6b7280",
                direction: isRTL ? "rtl" : "ltr",
                textAlign: isRTL ? "right" : "left",
                fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
              }}
            >
              {user?.email}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, px: 1 }}>
        {/* Dashboard Section */}
        {!collapsed && (
          <List
            subheader={
              <ListSubheader
                component="div"
                sx={{
                  backgroundColor: "transparent",
                  lineHeight: 1.4,
                  fontWeight: 600,
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  color: "#64748b",
                  mb: 1,
                  mt: 0.5,
                  px: 1.5,
                  cursor: "pointer",
                  direction: isRTL ? "rtl" : "ltr",
                  textAlign: isRTL ? "right" : "left",
                  fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                  "&:hover": {
                    color: "#475569",
                  },
                  transition: "color 0.15s ease",
                }}
                onClick={() => toggleMenuExpansion("Dashboard")}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <span>Dashboard</span>
                  {expandedMenus.Dashboard ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                </Stack>
              </ListSubheader>
            }
          >
            <Collapse in={expandedMenus.Dashboard}>
              {renderMenuItems(mainMenuItems)}
            </Collapse>
          </List>
        )}

        {collapsed && renderMenuItems(mainMenuItems)}

        <Divider sx={{ mx: 2, my: 1 }} />

        {/* Account Section */}
        {!collapsed && (
          <List
            subheader={
              <ListSubheader
                component="div"
                sx={{
                  backgroundColor: "transparent",
                  lineHeight: 1.4,
                  fontWeight: 600,
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  color: "#64748b",
                  mb: 1,
                  mt: 0.5,
                  px: 1.5,
                  cursor: "pointer",
                  direction: isRTL ? "rtl" : "ltr",
                  textAlign: isRTL ? "right" : "left",
                  fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                  "&:hover": {
                    color: "#475569",
                  },
                  transition: "color 0.15s ease",
                }}
                onClick={() => toggleMenuExpansion("Account")}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <span>Account</span>
                  {expandedMenus.Account ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                </Stack>
              </ListSubheader>
            }
          >
            <Collapse in={expandedMenus.Account}>
              {renderMenuItems(accountMenuItems)}
            </Collapse>
          </List>
        )}
        
        {collapsed && renderMenuItems(accountMenuItems)}
      </Box>

      {/* Footer */}
      <Box sx={{ 
        p: collapsed ? 1.5 : 2, 
        borderTop: "1px solid #f1f5f9",
        backgroundColor: "#fafbfc",
      }}>
        {/* Settings Row */}
        {!collapsed && (
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            {/* Language Switcher */}
            {onLanguageChange && (
              <Box
                onClick={() => onLanguageChange(language === "en" ? "fa" : "en")}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  px: 1.5,
                  py: 0.75,
                  borderRadius: "20px",
                  backgroundColor: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    backgroundColor: "#e2e8f0",
                    borderColor: "#cbd5e1",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    backgroundColor: language === "en" ? "#3b82f6" : "#10b981",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "9px",
                    fontWeight: 600,
                    color: "white",
                  }}
                >
                  {language === "en" ? "EN" : "فا"}
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "11px",
                    fontWeight: 500,
                    color: "#64748b",
                    fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                  }}
                >
                  {language === "en" ? "English" : "فارسی"}
                </Typography>
              </Box>
            )}
            
            {/* Dark Mode Toggle */}
            {onDarkModeToggle && (
              <IconButton
                onClick={onDarkModeToggle}
                size="small"
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: darkMode ? "#374151" : "#f9fafb",
                  border: "1px solid",
                  borderColor: darkMode ? "#4b5563" : "#e5e7eb",
                  color: darkMode ? "#fbbf24" : "#6b7280",
                  "&:hover": {
                    backgroundColor: darkMode ? "#4b5563" : "#f3f4f6",
                  },
                  transition: "all 0.15s ease",
                }}
              >
                {darkMode ? <LightModeIcon sx={{ fontSize: 16 }} /> : <DarkModeIcon sx={{ fontSize: 16 }} />}
              </IconButton>
            )}
          </Stack>
        )}

        {/* Collapsed Controls */}
        {collapsed && (
          <Stack direction="column" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
            {onLanguageChange && (
              <Tooltip title={language === "en" ? "Switch to Persian" : "Switch to English"}>
                <IconButton
                  onClick={() => onLanguageChange(language === "en" ? "fa" : "en")}
                  size="small"
                  sx={{
                    width: 28,
                    height: 28,
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    color: "#64748b",
                    "&:hover": {
                      backgroundColor: "#f1f5f9",
                      borderColor: "#cbd5e1",
                    },
                  }}
                >
                  <LanguageIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            )}
            
            {onDarkModeToggle && (
              <Tooltip title={darkMode ? "Light Mode" : "Dark Mode"}>
                <IconButton
                  onClick={onDarkModeToggle}
                  size="small"
                  sx={{
                    width: 28,
                    height: 28,
                    backgroundColor: darkMode ? "#374151" : "#f8fafc",
                    border: "1px solid",
                    borderColor: darkMode ? "#4b5563" : "#e2e8f0",
                    color: darkMode ? "#fbbf24" : "#64748b",
                    "&:hover": {
                      backgroundColor: darkMode ? "#4b5563" : "#f1f5f9",
                    },
                  }}
                >
                  {darkMode ? <LightModeIcon sx={{ fontSize: 14 }} /> : <DarkModeIcon sx={{ fontSize: 14 }} />}
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        )}

        {/* Logout Button */}
        <Button
          fullWidth={!collapsed}
          variant="text"
          onClick={handleLogout}
          startIcon={(!collapsed && !isRTL) ? <LogoutIcon sx={{ fontSize: 16 }} /> : undefined}
          endIcon={(!collapsed && isRTL) ? <LogoutIcon sx={{ fontSize: 16 }} /> : undefined}
          sx={{
            minHeight: 36,
            color: "#dc2626",
            justifyContent: collapsed ? "center" : isRTL ? "flex-end" : "flex-start",
            fontSize: collapsed ? 0 : "12px",
            fontWeight: 500,
            borderRadius: "6px",
            "&:hover": {
              backgroundColor: "rgba(220, 38, 38, 0.06)",
              color: "#b91c1c",
            },
            fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
            transition: "all 0.15s ease",
          }}
        >
          {collapsed ? <LogoutIcon sx={{ fontSize: 16 }} /> : (t.logout || "Sign Out")}
        </Button>
      </Box>
    </Box>
  );
};

export default Sidebar;