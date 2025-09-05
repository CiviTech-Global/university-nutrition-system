import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Card,
  CardContent,
  Button,
  Chip,
  Badge,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Tabs,
  Tab,
  Switch,
  FormControl,
  FormControlLabel,
  Select,
  MenuItem,
  TextField,
  Divider,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuList,
  MenuItem as MenuItemComponent,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  NotificationsOff as NotificationsOffIcon,
  MarkEmailRead as MarkReadIcon,
  Delete as DeleteIcon,
  Clear as ClearAllIcon,
  Settings as SettingsIcon,
  Send as SendIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  Restaurant as RestaurantIcon,
  Payment as PaymentIcon,
  Computer as SystemIcon,
  Campaign as CampaignIcon,
  Assessment as ReportIcon,
  MoreVert as MoreVertIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import type { SelectChangeEvent } from "@mui/material";
import { getCurrentUser } from "../../utils/userUtils";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  createComponentStyles,
  getTypographyStyles,
  getRelativeTime,
} from "../../utils/languageUtils";

interface Notification {
  id: string;
  title: string;
  titleEn: string;
  message: string;
  messageEn: string;
  type: "info" | "warning" | "error" | "success" | "urgent";
  category: "meal" | "payment" | "system" | "promotion" | "report";
  isRead: boolean;
  createdAt: Date;
  priority: "low" | "medium" | "high" | "urgent";
}

interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  categories: {
    meal: boolean;
    payment: boolean;
    system: boolean;
    promotion: boolean;
    report: boolean;
  };
  timing: {
    mealReminder: number; // minutes before meal
    frequency: "immediately" | "daily" | "weekly" | "never";
  };
}

const Notifications = () => {
  const { language, t, isRTL } = useLanguage();
  const componentStyles = createComponentStyles(language);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showPreferencesDialog, setShowPreferencesDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedNotification, setSelectedNotification] = useState<string | null>(null);
  
  // Notification preferences state
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: true,
    push: true,
    sms: false,
    categories: {
      meal: true,
      payment: true,
      system: true,
      promotion: false,
      report: true,
    },
    timing: {
      mealReminder: 30,
      frequency: "immediately",
    },
  });

  // Sample notifications data
  const sampleNotifications: Notification[] = [
    {
      id: "1",
      title: "یادآوری وعده ناهار",
      titleEn: "Lunch Meal Reminder",
      message: "وعده ناهار شما در ۳۰ دقیقه دیگر شروع خواهد شد. سلف دانشجوئی شماره ۱",
      messageEn: "Your lunch meal will start in 30 minutes. Student Cafeteria No. 1",
      type: "info",
      category: "meal",
      isRead: false,
      createdAt: new Date(Date.now() - 10 * 60 * 1000),
      priority: "high",
    },
    {
      id: "2",
      title: "پرداخت موفق",
      titleEn: "Payment Successful",
      message: "پرداخت شما به مبلغ ۱۵۰٬۰۰۰ تومان با موفقیت انجام شد",
      messageEn: "Your payment of 150,000 Tomans was successful",
      type: "success",
      category: "payment",
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      priority: "medium",
    },
    {
      id: "3",
      title: "نگهداری سیستم",
      titleEn: "System Maintenance",
      message: "سیستم از ساعت ۲۴ امشب به مدت ۲ ساعت در دسترس نخواهد بود",
      messageEn: "System will be unavailable tonight from 24:00 for 2 hours",
      type: "warning",
      category: "system",
      isRead: true,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      priority: "medium",
    },
    {
      id: "4",
      title: "تخفیف ویژه",
      titleEn: "Special Discount",
      message: "تخفیف ۲۰٪ برای تمام وعده‌های غذایی این هفته",
      messageEn: "20% discount for all meals this week",
      type: "success",
      category: "promotion",
      isRead: false,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      priority: "low",
    },
    {
      id: "5",
      title: "گزارش هفتگی",
      titleEn: "Weekly Report",
      message: "گزارش مصرف غذا و هزینه‌های این هفته آماده است",
      messageEn: "Your weekly food consumption and expense report is ready",
      type: "info",
      category: "report",
      isRead: true,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      priority: "low",
    },
  ];

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      loadNotifications(currentUser.id);
      loadPreferences(currentUser.id);
    } else {
      window.location.href = "/login";
    }
    setIsLoading(false);
  }, []);

  const loadNotifications = (userId: string) => {
    try {
      const savedNotifications = localStorage.getItem(`notifications_${userId}`);
      if (savedNotifications) {
        const parsed = JSON.parse(savedNotifications).map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt),
        }));
        setNotifications(parsed);
      } else {
        // Use sample data if no saved notifications
        setNotifications(sampleNotifications);
        localStorage.setItem(`notifications_${userId}`, JSON.stringify(sampleNotifications));
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
      setNotifications(sampleNotifications);
    }
  };

  const loadPreferences = (userId: string) => {
    try {
      const savedPreferences = localStorage.getItem(`notification_preferences_${userId}`);
      if (savedPreferences) {
        setPreferences({ ...preferences, ...JSON.parse(savedPreferences) });
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  };

  const saveNotifications = () => {
    if (!user) return;
    localStorage.setItem(`notifications_${user.id}`, JSON.stringify(notifications));
  };

  const savePreferences = () => {
    if (!user) return;
    localStorage.setItem(`notification_preferences_${user.id}`, JSON.stringify(preferences));
    setSuccessMessage(t.notificationSettingsSaved);
    setShowSuccess(true);
  };

  // Filtered notifications based on active tab
  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case 0: // All
        return notifications;
      case 1: // Unread
        return notifications.filter(n => !n.isRead);
      case 2: // Read
        return notifications.filter(n => n.isRead);
      default:
        return notifications;
    }
  }, [notifications, activeTab]);

  // Unread count
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
    saveNotifications();
    setSuccessMessage(t.markAsRead);
    setShowSuccess(true);
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    saveNotifications();
    setSuccessMessage(t.markAllAsRead);
    setShowSuccess(true);
  };

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    saveNotifications();
    setSuccessMessage(t.notificationDeleted);
    setShowSuccess(true);
    setAnchorEl(null);
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    localStorage.removeItem(`notifications_${user.id}`);
    setSuccessMessage(t.notificationsCleared);
    setShowSuccess(true);
  };

  const handleSendTestNotification = () => {
    const testNotification: Notification = {
      id: Date.now().toString(),
      title: "اعلان آزمایشی",
      titleEn: "Test Notification",
      message: "این یک اعلان آزمایشی است",
      messageEn: "This is a test notification",
      type: "info",
      category: "system",
      isRead: false,
      createdAt: new Date(),
      priority: "low",
    };
    
    setNotifications(prev => [testNotification, ...prev]);
    saveNotifications();
    setSuccessMessage(t.testNotificationSent);
    setShowSuccess(true);
  };

  const handlePreferenceChange = (
    section: keyof NotificationPreferences,
    key: string,
    value: any
  ) => {
    setPreferences(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' && prev[section] !== null
        ? { ...prev[section], [key]: value }
        : { [key]: value },
    }));
  };

  const getNotificationIcon = (type: string, category: string) => {
    const iconProps = { fontSize: 24 };
    
    switch (type) {
      case "error":
        return <ErrorIcon color="error" sx={iconProps} />;
      case "warning":
        return <WarningIcon color="warning" sx={iconProps} />;
      case "success":
        return <SuccessIcon color="success" sx={iconProps} />;
      case "urgent":
        return <NotificationsActiveIcon color="error" sx={iconProps} />;
      default:
        switch (category) {
          case "meal":
            return <RestaurantIcon color="primary" sx={iconProps} />;
          case "payment":
            return <PaymentIcon color="success" sx={iconProps} />;
          case "system":
            return <SystemIcon color="info" sx={iconProps} />;
          case "promotion":
            return <CampaignIcon color="warning" sx={iconProps} />;
          case "report":
            return <ReportIcon color="info" sx={iconProps} />;
          default:
            return <InfoIcon color="info" sx={iconProps} />;
        }
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "error":
        return "error.50";
      case "warning":
        return "warning.50";
      case "success":
        return "success.50";
      case "urgent":
        return "error.100";
      default:
        return "info.50";
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, notificationId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedNotification(notificationId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNotification(null);
  };

  if (isLoading) {
    return (
      <Box sx={{ py: 4, width: "100%", display: "flex", justifyContent: "center" }}>
        <Alert severity="info">{t.loading}</Alert>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ py: 4, width: "100%", display: "flex", justifyContent: "center" }}>
        <Alert severity="error">{t.userNotFound}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      py: 4, 
      px: 3, 
      minHeight: "100vh",
      backgroundColor: "#f8f9fa",
      direction: isRTL ? "rtl" : "ltr"
    }}>
      <Stack spacing={4}>
        {/* Header with blue gradient background */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #A8C5E3 0%, #7BA7D1 100%)",
            borderRadius: "12px",
            p: 3,
            color: "white",
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(123, 167, 209, 0.3)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, mb: 1 }}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon sx={{ fontSize: 32, color: "white" }} />
            </Badge>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                ...getTypographyStyles(language, "h4"),
                color: "white",
                fontWeight: 600,
              }}
            >
              {t.notificationCenter}
            </Typography>
          </Box>
          <Typography
            variant="body1"
            sx={{
              ...getTypographyStyles(language, "body1"),
              color: "rgba(255, 255, 255, 0.9)",
            }}
          >
            {unreadCount > 0 
              ? `${unreadCount} ${t.unreadNotifications}`
              : t.noNewNotifications
            }
          </Typography>
        </Box>

        {/* Action buttons */}
        <Box sx={{ 
          display: "flex", 
          gap: 2, 
          justifyContent: "center",
          flexWrap: "wrap" 
        }}>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setShowPreferencesDialog(true)}
            sx={{
              fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
              borderColor: "#A8C5E3",
              color: "#7BA7D1",
              "&:hover": {
                borderColor: "#7BA7D1",
                backgroundColor: "rgba(123, 167, 209, 0.1)",
              },
              borderRadius: "25px",
              px: 3,
            }}
          >
            {t.settings}
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<SendIcon />}
            onClick={handleSendTestNotification}
            sx={{
              fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
              borderColor: "#A8C5E3",
              color: "#7BA7D1",
              "&:hover": {
                borderColor: "#7BA7D1",
                backgroundColor: "rgba(123, 167, 209, 0.1)",
              },
              borderRadius: "25px",
              px: 3,
            }}
          >
            {t.testNotification}
          </Button>

          {unreadCount > 0 && (
            <Button
              variant="contained"
              startIcon={<MarkReadIcon />}
              onClick={handleMarkAllAsRead}
              sx={{
                fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                background: "linear-gradient(135deg, #A8C5E3 0%, #7BA7D1 100%)",
                boxShadow: "0 4px 15px rgba(123, 167, 209, 0.4)",
                "&:hover": {
                  background: "linear-gradient(135deg, #7BA7D1 0%, #6B95C4 100%)",
                  boxShadow: "0 6px 20px rgba(123, 167, 209, 0.6)",
                },
                borderRadius: "25px",
                px: 4,
              }}
            >
              {t.markAllAsRead}
            </Button>
          )}
        </Box>

        {/* Tabs */}
        <Paper 
          elevation={3} 
          sx={{ 
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(123, 167, 209, 0.1)",
            overflow: "hidden",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{
              "& .MuiTabs-indicator": {
                background: "linear-gradient(135deg, #A8C5E3 0%, #7BA7D1 100%)",
                height: 3,
              },
              "& .MuiTab-root": {
                fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                fontSize: "1rem",
                fontWeight: 500,
                textTransform: "none",
                py: 2,
                "&.Mui-selected": {
                  color: "#7BA7D1",
                  fontWeight: 600,
                },
                "&:hover": {
                  backgroundColor: "rgba(123, 167, 209, 0.05)",
                },
              },
            }}
          >
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography>{t.allNotifications}</Typography>
                  <Chip 
                    label={notifications.length} 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                  />
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography>{t.unreadNotifications}</Typography>
                  {unreadCount > 0 && (
                    <Chip 
                      label={unreadCount} 
                      size="small" 
                      color="error" 
                    />
                  )}
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography>{t.readNotifications}</Typography>
                  <Chip 
                    label={notifications.filter(n => n.isRead).length} 
                    size="small" 
                    color="success" 
                    variant="outlined" 
                  />
                </Box>
              }
            />
          </Tabs>
        </Paper>

        {/* Notifications List */}
        <Card 
          sx={{
            ...componentStyles.card,
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(123, 167, 209, 0.1)",
            border: "1px solid rgba(168, 197, 227, 0.2)",
          }}
        >
          <CardContent sx={{ p: 0 }}>
            {filteredNotifications.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <NotificationsOffIcon
                  sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                />
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={getTypographyStyles(language, "h6")}
                >
                  {activeTab === 1 ? t.noNewNotifications : t.noNotifications}
                </Typography>
                {notifications.length > 0 && activeTab === 1 && (
                  <Button
                    variant="outlined"
                    startIcon={<ClearAllIcon />}
                    onClick={handleClearAllNotifications}
                    sx={{
                      mt: 2,
                      fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                    }}
                  >
                    {t.clearAllNotifications}
                  </Button>
                )}
              </Box>
            ) : (
              <List sx={{ padding: 0 }}>
                {filteredNotifications.map((notification, index) => (
                  <Box key={notification.id}>
                    <ListItem
                      sx={{
                        backgroundColor: notification.isRead 
                          ? "transparent" 
                          : getNotificationColor(notification.type),
                        "&:hover": {
                          backgroundColor: "action.hover",
                        },
                        cursor: "pointer",
                      }}
                      onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            backgroundColor: notification.isRead 
                              ? "rgba(123, 167, 209, 0.1)" 
                              : "rgba(123, 167, 209, 0.2)",
                            border: "2px solid",
                            borderColor: notification.isRead 
                              ? "rgba(123, 167, 209, 0.4)" 
                              : "#7BA7D1",
                          }}
                        >
                          {getNotificationIcon(notification.type, notification.category)}
                        </Avatar>
                      </ListItemAvatar>
                      
                      <ListItemText
                        primary={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            <Typography
                              variant="subtitle1"
                              sx={{
                                ...getTypographyStyles(language, "body1"),
                                fontWeight: notification.isRead ? 400 : 600,
                              }}
                            >
                              {language === "fa" ? notification.title : notification.titleEn}
                            </Typography>
                            <Chip
                              label={notification.priority}
                              size="small"
                              color={
                                notification.priority === "urgent" ? "error" :
                                notification.priority === "high" ? "warning" :
                                notification.priority === "medium" ? "primary" : "default"
                              }
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Stack spacing={1}>
                            <Typography
                              variant="body2"
                              sx={{
                                ...getTypographyStyles(language, "body2"),
                                color: "text.secondary",
                              }}
                            >
                              {language === "fa" ? notification.message : notification.messageEn}
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                              <Chip
                                icon={<ScheduleIcon />}
                                label={getRelativeTime(notification.createdAt, language)}
                                size="small"
                                variant="outlined"
                                sx={{
                                  "& .MuiChip-label": {
                                    fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                                  },
                                }}
                              />
                              <Chip
                                label={t[notification.category] || notification.category}
                                size="small"
                                color="secondary"
                                variant="outlined"
                                sx={{
                                  "& .MuiChip-label": {
                                    fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                                  },
                                }}
                              />
                            </Box>
                          </Stack>
                        }
                      />
                      
                      <ListItemSecondaryAction>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuClick(e, notification.id);
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                    {index < filteredNotifications.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        {notifications.length > 0 && (
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ClearAllIcon />}
              onClick={handleClearAllNotifications}
              sx={{
                fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                borderColor: "#A8C5E3",
                color: "#7BA7D1",
                "&:hover": {
                  borderColor: "#7BA7D1",
                  backgroundColor: "rgba(123, 167, 209, 0.1)",
                },
                borderRadius: "25px",
                px: 3,
              }}
            >
              {t.clearAllNotifications}
            </Button>
          </Box>
        )}
      </Stack>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuList>
          <MenuItemComponent
            onClick={() => {
              if (selectedNotification) {
                handleMarkAsRead(selectedNotification);
                handleMenuClose();
              }
            }}
          >
            <MarkReadIcon sx={{ mr: 2 }} />
            <Typography sx={{ fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)" }}>
              {t.markAsRead}
            </Typography>
          </MenuItemComponent>
          <MenuItemComponent
            onClick={() => {
              if (selectedNotification) {
                handleDeleteNotification(selectedNotification);
                handleMenuClose();
              }
            }}
          >
            <DeleteIcon sx={{ mr: 2 }} />
            <Typography sx={{ fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)" }}>
              {t.deleteNotification}
            </Typography>
          </MenuItemComponent>
        </MenuList>
      </Menu>

      {/* Notification Preferences Dialog */}
      <Dialog
        open={showPreferencesDialog}
        onClose={() => setShowPreferencesDialog(false)}
        maxWidth="md"
        fullWidth
        sx={componentStyles.dialog}
      >
        <DialogTitle sx={getTypographyStyles(language, "h6")}>
          {t.notificationPreferences}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={4} sx={{ mt: 2 }}>
            {/* Notification Types */}
            <Box>
              <Typography variant="h6" sx={{ ...getTypographyStyles(language, "h6"), mb: 2 }}>
                {t.notificationTypes}
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.email}
                      onChange={(e) =>
                        setPreferences({ ...preferences, email: e.target.checked })
                      }
                    />
                  }
                  label={t.emailNotifications}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.push}
                      onChange={(e) =>
                        setPreferences({ ...preferences, push: e.target.checked })
                      }
                    />
                  }
                  label={t.pushNotifications}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.sms}
                      onChange={(e) =>
                        setPreferences({ ...preferences, sms: e.target.checked })
                      }
                    />
                  }
                  label={t.smsNotifications}
                />
              </Box>
            </Box>

            <Divider />

            {/* Categories */}
            <Box>
              <Typography variant="h6" sx={{ ...getTypographyStyles(language, "h6"), mb: 2 }}>
                {language === "fa" ? "دسته‌بندی اعلان‌ها" : "Notification Categories"}
              </Typography>
              <Stack spacing={2}>
                {Object.entries(preferences.categories).map(([key, value]) => (
                  <FormControlLabel
                    key={key}
                    control={
                      <Switch
                        checked={value}
                        onChange={(e) =>
                          handlePreferenceChange("categories", key, e.target.checked)
                        }
                      />
                    }
                    label={
                      key === "meal" ? t.mealReminders :
                      key === "payment" ? t.paymentNotifications :
                      key === "system" ? t.systemUpdates :
                      key === "promotion" ? t.promotionalOffers :
                      key === "report" ? t.weeklyReports : key
                    }
                    sx={{
                      "& .MuiFormControlLabel-label": {
                        fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                      },
                    }}
                  />
                ))}
              </Stack>
            </Box>

            <Divider />

            {/* Timing Settings */}
            <Box>
              <Typography variant="h6" sx={{ ...getTypographyStyles(language, "h6"), mb: 2 }}>
                {language === "fa" ? "تنظیمات زمان‌بندی" : "Timing Settings"}
              </Typography>
              <Stack spacing={3}>
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ ...getTypographyStyles(language, "body2"), mb: 1 }}
                  >
                    {t.beforeMealTime} ({t.minutes})
                  </Typography>
                  <TextField
                    type="number"
                    value={preferences.timing.mealReminder}
                    onChange={(e) =>
                      handlePreferenceChange("timing", "mealReminder", parseInt(e.target.value))
                    }
                    inputProps={{ min: 5, max: 120 }}
                    sx={componentStyles.form.field}
                  />
                </Box>
                
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ ...getTypographyStyles(language, "body2"), mb: 1 }}
                  >
                    {t.notificationFrequency}
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={preferences.timing.frequency}
                      onChange={(e: SelectChangeEvent) =>
                        handlePreferenceChange("timing", "frequency", e.target.value)
                      }
                      sx={componentStyles.form.field}
                    >
                      <MenuItem value="immediately">{t.immediately}</MenuItem>
                      <MenuItem value="daily">{t.daily}</MenuItem>
                      <MenuItem value="weekly">{t.weekly}</MenuItem>
                      <MenuItem value="never">{t.never}</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowPreferencesDialog(false)}
            sx={{ fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)" }}
          >
            {t.cancel}
          </Button>
          <Button
            onClick={() => {
              savePreferences();
              setShowPreferencesDialog(false);
            }}
            variant="contained"
            sx={{ fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)" }}
          >
            {t.save}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        message={successMessage}
      />

      {/* Error Snackbar */}
      <Snackbar
        open={showError}
        autoHideDuration={3000}
        onClose={() => setShowError(false)}
      >
        <Alert onClose={() => setShowError(false)} severity="error">
          {t.errorSavingSettings}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Notifications;