import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  Button,
  Switch,
  FormControl,
  FormControlLabel,
  Select,
  MenuItem,
  TextField,
  Divider,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Language as LanguageIcon,
  Palette as PaletteIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Storage as StorageIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  RestoreFromTrash as RestoreIcon,
} from "@mui/icons-material";
import type { SelectChangeEvent } from "@mui/material";
import { getCurrentUser } from "../../utils/userUtils";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  createComponentStyles,
  getTypographyStyles,
} from "../../utils/languageUtils";

interface UserSettings {
  language: "fa" | "en";
  theme: "light" | "dark" | "auto";
  fontSize: "small" | "medium" | "large" | "extraLarge";
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    mealReminders: boolean;
    paymentNotifications: boolean;
    systemUpdates: boolean;
    promotionalOffers: boolean;
    weeklyReports: boolean;
  };
  privacy: {
    dataSharing: boolean;
    analytics: boolean;
    marketing: boolean;
  };
}

const Settings = () => {
  const { language, t, isRTL, setLanguage } = useLanguage();
  const componentStyles = createComponentStyles(language);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showSaveError, setShowSaveError] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  
  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Settings state
  const [settings, setSettings] = useState<UserSettings>({
    language: language,
    theme: "light",
    fontSize: "medium",
    notifications: {
      email: true,
      push: true,
      sms: false,
      mealReminders: true,
      paymentNotifications: true,
      systemUpdates: true,
      promotionalOffers: false,
      weeklyReports: true,
    },
    privacy: {
      dataSharing: false,
      analytics: true,
      marketing: false,
    },
  });

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      loadUserSettings(currentUser.id);
    } else {
      window.location.href = "/login";
    }
    setIsLoading(false);
  }, []);

  const loadUserSettings = (userId: string) => {
    try {
      const savedSettings = localStorage.getItem(`settings_${userId}`);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({ ...settings, ...parsedSettings });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const handleSettingChange = (
    section: keyof UserSettings,
    key: string,
    value: any
  ) => {
    setSettings((prev) => ({
      ...prev,
      [section]: typeof prev[section] === 'object' && prev[section] !== null
        ? { ...prev[section], [key]: value }
        : { [key]: value },
    }));
  };

  const handleLanguageChange = (newLanguage: "fa" | "en") => {
    setLanguage(newLanguage);
    setSettings((prev) => ({ ...prev, language: newLanguage }));
  };

  const handleSaveSettings = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      localStorage.setItem(`settings_${user.id}`, JSON.stringify(settings));
      setShowSaveSuccess(true);
    } catch (error) {
      console.error("Error saving settings:", error);
      setShowSaveError(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    const defaultSettings: UserSettings = {
      language: "fa",
      theme: "light",
      fontSize: "medium",
      notifications: {
        email: true,
        push: true,
        sms: false,
        mealReminders: true,
        paymentNotifications: true,
        systemUpdates: true,
        promotionalOffers: false,
        weeklyReports: true,
      },
      privacy: {
        dataSharing: false,
        analytics: true,
        marketing: false,
      },
    };
    setSettings(defaultSettings);
    handleLanguageChange(defaultSettings.language);
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setShowSaveError(true);
      return;
    }

    // Simulate password change
    setShowPasswordDialog(false);
    setShowSaveSuccess(true);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleExportData = () => {
    try {
      const userData = {
        user,
        settings,
        reservations: localStorage.getItem(`reservations_${user.id}`),
        transactions: localStorage.getItem(`transactions_${user.id}`),
      };
      
      const dataBlob = new Blob([JSON.stringify(userData, null, 2)], {
        type: "application/json",
      });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `user_data_${user.id}_${new Date().toISOString()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setShowSaveSuccess(true);
    } catch (error) {
      console.error("Error exporting data:", error);
      setShowSaveError(true);
    }
  };

  const handleDeleteAccount = () => {
    // Simulate account deletion
    localStorage.removeItem("currentUser");
    localStorage.removeItem("users");
    window.location.href = "/login";
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
          <Typography
            variant="h4"
            component="h1"
            sx={{
              ...getTypographyStyles(language, "h4"),
              color: "white",
              fontWeight: 600,
              mb: 1,
            }}
          >
            {t.settings}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              ...getTypographyStyles(language, "body1"),
              color: "rgba(255, 255, 255, 0.9)",
            }}
          >
            {t.settingsDescription}
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
            startIcon={<RestoreIcon />}
            onClick={handleResetToDefaults}
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
            {t.resetToDefaults}
          </Button>
          
          <Button
            variant="contained"
            startIcon={isSaving ? <RefreshIcon className="animate-spin" /> : <SaveIcon />}
            onClick={handleSaveSettings}
            disabled={isSaving}
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
            {isSaving ? t.saving : t.save}
          </Button>
        </Box>

        {/* Settings Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 4,
            maxWidth: "1200px",
            mx: "auto",
          }}
        >
          {/* Language Settings */}
          <Card sx={{
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            border: "1px solid #e9ecef",
            overflow: "hidden",
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
              transform: "translateY(-2px)",
            },
          }}>
            <CardContent sx={{ p: 3 }}>
              {/* Card Header */}
              <Box sx={{ 
                background: "linear-gradient(135deg, #A8C5E3 0%, #7BA7D1 100%)",
                p: 2,
                borderRadius: "12px",
                mb: 3,
                display: "flex", 
                alignItems: "center"
              }}>
                <LanguageIcon sx={{ fontSize: 28, mr: 2, color: "white" }} />
                <Typography
                  variant="h6"
                  sx={{
                    ...getTypographyStyles(language, "h6"),
                    color: "white",
                    fontWeight: 600,
                  }}
                >
                  {t.languageSettings}
                </Typography>
              </Box>

              <Stack spacing={3}>
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ ...getTypographyStyles(language, "body2"), mb: 1 }}
                  >
                    {t.currentLanguage}
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={settings.language}
                      onChange={(e: SelectChangeEvent) =>
                        handleLanguageChange(e.target.value as "fa" | "en")
                      }
                      sx={componentStyles.form.field}
                    >
                      <MenuItem value="fa">
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Typography sx={{ fontFamily: "var(--font-persian)" }}>
                            {t.persian}
                          </Typography>
                          <Chip label="فارسی" size="small" variant="outlined" />
                        </Box>
                      </MenuItem>
                      <MenuItem value="en">
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Typography sx={{ fontFamily: "var(--font-english)" }}>
                            {t.english}
                          </Typography>
                          <Chip label="English" size="small" variant="outlined" />
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Display Settings */}
          <Card sx={componentStyles.card}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <PaletteIcon color="primary" sx={{ fontSize: 28, mr: 2 }} />
                <Typography
                  variant="h6"
                  sx={getTypographyStyles(language, "h6")}
                >
                  {t.displaySettings}
                </Typography>
              </Box>

              <Stack spacing={3}>
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ ...getTypographyStyles(language, "body2"), mb: 1 }}
                  >
                    {t.theme}
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={settings.theme}
                      onChange={(e: SelectChangeEvent) =>
                        handleSettingChange("theme", "", e.target.value)
                      }
                      sx={componentStyles.form.field}
                    >
                      <MenuItem value="light">{t.lightTheme}</MenuItem>
                      <MenuItem value="dark">{t.darkTheme}</MenuItem>
                      <MenuItem value="auto">{t.autoTheme}</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ ...getTypographyStyles(language, "body2"), mb: 1 }}
                  >
                    {t.fontSize}
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={settings.fontSize}
                      onChange={(e: SelectChangeEvent) =>
                        handleSettingChange("fontSize", "", e.target.value)
                      }
                      sx={componentStyles.form.field}
                    >
                      <MenuItem value="small">{t.small}</MenuItem>
                      <MenuItem value="medium">{t.medium}</MenuItem>
                      <MenuItem value="large">{t.large}</MenuItem>
                      <MenuItem value="extraLarge">{t.extraLarge}</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card sx={componentStyles.card}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <NotificationsIcon color="primary" sx={{ fontSize: 28, mr: 2 }} />
                <Typography
                  variant="h6"
                  sx={getTypographyStyles(language, "h6")}
                >
                  {t.notificationSettingsMenu}
                </Typography>
              </Box>

              <Stack spacing={2}>
                {Object.entries(settings.notifications).map(([key, value]) => (
                  <FormControlLabel
                    key={key}
                    control={
                      <Switch
                        checked={value}
                        onChange={(e) =>
                          handleSettingChange("notifications", key, e.target.checked)
                        }
                        color="primary"
                      />
                    }
                    label={
                      <Typography sx={getTypographyStyles(language, "body2")}>
                        {t[key as keyof typeof t] || key}
                      </Typography>
                    }
                    sx={{
                      "& .MuiFormControlLabel-label": {
                        fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                      },
                    }}
                  />
                ))}
              </Stack>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card sx={componentStyles.card}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <SecurityIcon color="primary" sx={{ fontSize: 28, mr: 2 }} />
                <Typography
                  variant="h6"
                  sx={getTypographyStyles(language, "h6")}
                >
                  {t.accountSettings}
                </Typography>
              </Box>

              <Stack spacing={3}>
                <Button
                  variant="outlined"
                  startIcon={<VisibilityIcon />}
                  onClick={() => setShowPasswordDialog(true)}
                  fullWidth
                  sx={{
                    fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                    justifyContent: "flex-start",
                  }}
                >
                  {t.changePassword}
                </Button>

                <Divider />

                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportData}
                  fullWidth
                  sx={{
                    fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                    justifyContent: "flex-start",
                  }}
                >
                  {t.exportUserData}
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setShowDeleteDialog(true)}
                  fullWidth
                  sx={{
                    fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                    justifyContent: "flex-start",
                  }}
                >
                  {t.deleteAccount}
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* Data & Privacy */}
          <Card sx={{ ...componentStyles.card, gridColumn: { xs: "1", lg: "1 / -1" } }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <StorageIcon color="primary" sx={{ fontSize: 28, mr: 2 }} />
                <Typography
                  variant="h6"
                  sx={getTypographyStyles(language, "h6")}
                >
                  {t.dataSettings}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                  gap: 3,
                }}
              >
                {Object.entries(settings.privacy).map(([key, value]) => (
                  <FormControlLabel
                    key={key}
                    control={
                      <Switch
                        checked={value}
                        onChange={(e) =>
                          handleSettingChange("privacy", key, e.target.checked)
                        }
                        color="primary"
                      />
                    }
                    label={
                      <Typography sx={getTypographyStyles(language, "body2")}>
                        {key === "dataSharing"
                          ? language === "fa"
                            ? "اشتراک داده‌ها"
                            : "Data Sharing"
                          : key === "analytics"
                          ? language === "fa"
                            ? "تحلیلات"
                            : "Analytics"
                          : language === "fa"
                          ? "بازاریابی"
                          : "Marketing"}
                      </Typography>
                    }
                    sx={{
                      "& .MuiFormControlLabel-label": {
                        fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                      },
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Stack>

      {/* Change Password Dialog */}
      <Dialog
        open={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
        sx={componentStyles.dialog}
      >
        <DialogTitle sx={getTypographyStyles(language, "h6")}>
          {t.changePassword}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              type={showPasswordFields ? "text" : "password"}
              label={t.currentPassword}
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
              }
              sx={componentStyles.form.field}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                    edge="end"
                  >
                    {showPasswordFields ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                ),
              }}
            />
            <TextField
              fullWidth
              type={showPasswordFields ? "text" : "password"}
              label={t.newPassword}
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, newPassword: e.target.value })
              }
              sx={componentStyles.form.field}
            />
            <TextField
              fullWidth
              type={showPasswordFields ? "text" : "password"}
              label={t.confirmPassword}
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
              }
              sx={componentStyles.form.field}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowPasswordDialog(false)}
            sx={{ fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)" }}
          >
            {t.cancel}
          </Button>
          <Button
            onClick={handlePasswordChange}
            variant="contained"
            sx={{ fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)" }}
          >
            {t.save}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
        sx={componentStyles.dialog}
      >
        <DialogTitle sx={getTypographyStyles(language, "h6")}>
          {t.deleteAccount}
        </DialogTitle>
        <DialogContent>
          <Typography sx={getTypographyStyles(language, "body1")}>
            {t.confirmDeleteAccount}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowDeleteDialog(false)}
            sx={{ fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)" }}
          >
            {t.cancel}
          </Button>
          <Button
            onClick={handleDeleteAccount}
            variant="contained"
            color="error"
            sx={{ fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)" }}
          >
            {t.deleteAccount}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={showSaveSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSaveSuccess(false)}
        message={t.settingsSaved}
      />

      {/* Error Snackbar */}
      <Snackbar
        open={showSaveError}
        autoHideDuration={3000}
        onClose={() => setShowSaveError(false)}
      >
        <Alert onClose={() => setShowSaveError(false)} severity="error">
          {t.errorSavingSettings}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;