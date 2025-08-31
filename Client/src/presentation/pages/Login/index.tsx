import { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Stack,
  InputAdornment,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Avatar,
  Fade,
  Slide,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  Language,
  Announcement,
  Info,
  Warning,
  CheckCircle,
  Restaurant,
  Security,
  Notifications,
  School,
} from "@mui/icons-material";
import type { Language as LanguageType } from "../../locales";
import { authenticateUser, setCurrentUser } from "../../utils/userUtils";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  createComponentStyles,
  getTypographyStyles,
} from "../../utils/languageUtils";

// Announcement interface
interface Announcement {
  id: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  titleEn: string;
  message: string;
  messageEn: string;
  date: string;
  priority: "low" | "medium" | "high";
}

// Sample announcements data
const sampleAnnouncements: Announcement[] = [
  {
    id: "1",
    type: "info",
    title: "تعطیلات نوروز",
    titleEn: "Nowruz Holiday",
    message: "سامانه تغذیه در تاریخ ۱ تا ۴ فروردین تعطیل خواهد بود",
    messageEn:
      "The nutrition system will be closed from March 21-24 for Nowruz holiday",
    date: "2024-03-20",
    priority: "high",
  },
  {
    id: "2",
    type: "warning",
    title: "نگهداری سیستم",
    titleEn: "System Maintenance",
    message:
      "سامانه در تاریخ ۱۵ فروردین از ساعت ۲ تا ۴ صبح برای نگهداری در دسترس نخواهد بود",
    messageEn:
      "System will be unavailable on April 4 from 2-4 AM for maintenance",
    date: "2024-04-03",
    priority: "medium",
  },
  {
    id: "3",
    type: "success",
    title: "پیشنهاد ویژه",
    titleEn: "Special Offer",
    message: "۲۰٪ تخفیف برای دانشجویان جدید در ماه فروردین",
    messageEn: "20% discount for new students in April",
    date: "2024-04-01",
    priority: "low",
  },
];

const Login = () => {
  const { language, t, setLanguage } = useLanguage();
  const componentStyles = createComponentStyles(language);
  const typographyStyles = getTypographyStyles(language, "body1");

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isAccountLocked, setIsAccountLocked] = useState(false);

  // Get announcements for current language
  const announcements = sampleAnnouncements.map((announcement) => ({
    ...announcement,
    title: language === "fa" ? announcement.title : announcement.titleEn,
    message: language === "fa" ? announcement.message : announcement.messageEn,
  }));

  // Get announcement icon based on type
  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case "info":
        return <Info color="info" />;
      case "warning":
        return <Warning color="warning" />;
      case "success":
        return <CheckCircle color="success" />;
      case "error":
        return <Warning color="error" />;
      default:
        return <Announcement color="primary" />;
    }
  };

  // Get announcement color based on type
  const getAnnouncementColor = (type: string) => {
    switch (type) {
      case "info":
        return "info";
      case "warning":
        return "warning";
      case "success":
        return "success";
      case "error":
        return "error";
      default:
        return "primary";
    }
  };

  const handleLanguageChange = (
    _event: React.MouseEvent<HTMLElement>,
    newLanguage: LanguageType | null
  ) => {
    if (newLanguage !== null) {
      // Update language in context
      setLanguage(newLanguage);
      // Clear errors when language changes
      setErrors({});
      setSubmitMessage(null);
    }
  };

  const handleChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({
        ...formData,
        [field]: event.target.value,
      });
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors({
          ...errors,
          [field]: "",
        });
      }
      // Clear submit message when user starts typing
      if (submitMessage) {
        setSubmitMessage(null);
      }
    };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = t.usernameRequired;
    }

    if (!formData.password) {
      newErrors.password = t.passwordRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitMessage(null);

    if (isAccountLocked) {
      setSubmitMessage({
        type: "error",
        text: t.accountLocked,
      });
      return;
    }

    if (validateForm()) {
      setIsSubmitting(true);

      try {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Authenticate user
        const user = authenticateUser(formData.username, formData.password);

        if (user) {
          // Set current user
          setCurrentUser(user);

          // Show success message
          setSubmitMessage({
            type: "success",
            text: t.loginRedirecting,
          });

          // Reset form and attempts
          setFormData({
            username: "",
            password: "",
          });
          setErrors({});
          setLoginAttempts(0);
          setIsAccountLocked(false);

          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 2000);
        } else {
          // Increment login attempts
          const newAttempts = loginAttempts + 1;
          setLoginAttempts(newAttempts);

          // Lock account after 5 failed attempts
          if (newAttempts >= 5) {
            setIsAccountLocked(true);
            setSubmitMessage({
              type: "error",
              text: t.accountLocked,
            });
          } else {
            setSubmitMessage({
              type: "error",
              text: t.invalidCredentials,
            });
          }
        }
      } catch (error) {
        setSubmitMessage({
          type: "error",
          text: t.networkError,
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
          }}
        >
          {/* Left Side - Login Form */}
          <Box sx={{ flex: 1 }}>
            <Fade in timeout={800}>
              <Paper
                elevation={8}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Box component="form" onSubmit={handleSubmit}>
                  <Stack spacing={3}>
                    {/* Header with Language Switcher */}
                    <Box textAlign="center">
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent:
                            language === "fa" ? "flex-start" : "flex-end",
                          mb: 2,
                        }}
                      >
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
                              borderRadius: 2,
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
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          mb: 2,
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 80,
                            height: 80,
                            bgcolor: "primary.main",
                            mb: 2,
                          }}
                        >
                          <School sx={{ fontSize: 40 }} />
                        </Avatar>
                      </Box>

                      <Typography
                        variant="h3"
                        component="h1"
                        gutterBottom
                        color="primary"
                        sx={{
                          ...typographyStyles,
                          fontWeight: 700,
                          fontSize: "2.5rem",
                          mb: 1,
                        }}
                      >
                        {t.welcomeBack}
                      </Typography>
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        sx={{
                          ...typographyStyles,
                          mb: 3,
                        }}
                      >
                        {t.signInToContinue}
                      </Typography>

                      {/* System Status */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mb: 2,
                        }}
                      >
                        <CheckCircle
                          color="success"
                          sx={{
                            mr: language === "fa" ? 0 : 1,
                            ml: language === "fa" ? 1 : 0,
                          }}
                        />
                        <Typography
                          variant="body2"
                          color="success.main"
                          sx={{ ...typographyStyles }}
                        >
                          {t.allSystemsOperational}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Username */}
                    <TextField
                      fullWidth
                      label={t.username}
                      value={formData.username}
                      onChange={handleChange("username")}
                      error={!!errors.username}
                      helperText={errors.username}
                      disabled={isAccountLocked}
                      InputProps={{
                        [language === "fa" ? "endAdornment" : "startAdornment"]:
                          (
                            <InputAdornment
                              position={language === "fa" ? "end" : "start"}
                            >
                              <Person color="action" />
                            </InputAdornment>
                          ),
                      }}
                      sx={{
                        ...componentStyles.form.field,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />

                    {/* Password */}
                    <TextField
                      fullWidth
                      label={t.password}
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange("password")}
                      error={!!errors.password}
                      helperText={errors.password}
                      disabled={isAccountLocked}
                      InputProps={{
                        [language === "fa" ? "endAdornment" : "startAdornment"]:
                          (
                            <InputAdornment
                              position={language === "fa" ? "end" : "start"}
                            >
                              <Lock color="action" />
                            </InputAdornment>
                          ),
                        [language === "fa" ? "startAdornment" : "endAdornment"]:
                          (
                            <InputAdornment
                              position={language === "fa" ? "start" : "end"}
                            >
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge={language === "fa" ? "start" : "end"}
                                disabled={isAccountLocked}
                              >
                                {showPassword ? (
                                  <VisibilityOff />
                                ) : (
                                  <Visibility />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                      }}
                      sx={{
                        ...componentStyles.form.field,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />

                    {/* Success/Error Message */}
                    {submitMessage && (
                      <Slide direction="up" in timeout={300}>
                        <Alert
                          severity={submitMessage.type}
                          sx={{
                            ...typographyStyles,
                            borderRadius: 2,
                            "& .MuiAlert-icon": {
                              fontSize: "1.5rem",
                            },
                          }}
                        >
                          {submitMessage.text}
                        </Alert>
                      </Slide>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={isSubmitting || isAccountLocked}
                      sx={{
                        py: 1.5,
                        fontSize: "1.1rem",
                        borderRadius: 2,
                        background:
                          "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
                        boxShadow: "0 3px 5px 2px rgba(102, 126, 234, .3)",
                        "&:hover": {
                          background:
                            "linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)",
                        },
                      }}
                    >
                      {isSubmitting ? (
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <CircularProgress size={20} color="inherit" />
                          {t.loggingIn}
                        </Box>
                      ) : (
                        t.loginButton
                      )}
                    </Button>

                    {/* Links */}
                    <Stack spacing={1}>
                      <Box textAlign="center">
                        <Typography
                          variant="body2"
                          color="primary"
                          onClick={() =>
                            (window.location.href = "/forgot-password")
                          }
                          sx={{
                            cursor: "pointer",
                            textDecoration: "underline",
                            ...typographyStyles,
                            "&:hover": {
                              color: "primary.dark",
                            },
                          }}
                        >
                          {t.forgotPassword}
                        </Typography>
                      </Box>

                      <Box textAlign="center">
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            ...typographyStyles,
                          }}
                        >
                          {t.dontHaveAccount}{" "}
                          <Typography
                            component="span"
                            variant="body2"
                            color="primary"
                            onClick={() => (window.location.href = "/register")}
                            sx={{
                              cursor: "pointer",
                              textDecoration: "underline",
                              ...typographyStyles,
                              "&:hover": {
                                color: "primary.dark",
                              },
                            }}
                          >
                            {t.registerHere}
                          </Typography>
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </Box>
              </Paper>
            </Fade>
          </Box>

          {/* Right Side - Announcements and Info */}
          <Box sx={{ flex: 1 }}>
            <Stack spacing={3}>
              {/* Welcome Image */}
              <Fade in timeout={1000}>
                <Paper
                  elevation={4}
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    position: "relative",
                    height: 200,
                    background:
                      "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `url('/src/presentation/assets/images/چلو-کباب-بختیاری-scaled.jpg')`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      opacity: 0.3,
                    }}
                  />
                  <Box
                    sx={{
                      position: "relative",
                      zIndex: 1,
                      p: 3,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "white",
                    }}
                  >
                    <Restaurant sx={{ fontSize: 48, mb: 2 }} />
                    <Typography
                      variant="h4"
                      sx={{
                        ...typographyStyles,
                        fontWeight: 700,
                        textAlign: "center",
                      }}
                    >
                      {language === "fa"
                        ? "سیستم تغذیه دانشگاهی"
                        : "University Nutrition System"}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        ...typographyStyles,
                        textAlign: "center",
                        opacity: 0.9,
                      }}
                    >
                      {language === "fa"
                        ? "بهترین تجربه غذایی"
                        : "Best Dining Experience"}
                    </Typography>
                  </Box>
                </Paper>
              </Fade>

              {/* Announcements */}
              <Fade in timeout={1200}>
                <Paper
                  elevation={4}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Notifications color="primary" sx={{ mr: 1 }} />
                    <Typography
                      variant="h6"
                      sx={{
                        ...typographyStyles,
                        fontWeight: 600,
                      }}
                    >
                      {t.announcements}
                    </Typography>
                  </Box>

                  {announcements.length > 0 ? (
                    <Stack spacing={2}>
                      {announcements.map((announcement) => (
                        <Card
                          key={announcement.id}
                          sx={{
                            borderRadius: 2,
                            border: `1px solid ${getAnnouncementColor(
                              announcement.type
                            )}.light`,
                            background: `${getAnnouncementColor(
                              announcement.type
                            )}.50`,
                          }}
                        >
                          <CardContent sx={{ p: 2 }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 1,
                              }}
                            >
                              {getAnnouncementIcon(announcement.type)}
                              <Box sx={{ flex: 1 }}>
                                <Typography
                                  variant="subtitle2"
                                  sx={{
                                    ...typographyStyles,
                                    fontWeight: 600,
                                    mb: 0.5,
                                  }}
                                >
                                  {announcement.title}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    ...typographyStyles,
                                    mb: 1,
                                  }}
                                >
                                  {announcement.message}
                                </Typography>
                                <Chip
                                  label={announcement.priority}
                                  size="small"
                                  color={
                                    getAnnouncementColor(
                                      announcement.type
                                    ) as any
                                  }
                                  variant="outlined"
                                />
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        ...typographyStyles,
                        textAlign: "center",
                        py: 2,
                      }}
                    >
                      {t.noAnnouncements}
                    </Typography>
                  )}
                </Paper>
              </Fade>

              {/* System Info */}
              <Fade in timeout={1400}>
                <Paper
                  elevation={4}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Security color="primary" sx={{ mr: 1 }} />
                    <Typography
                      variant="h6"
                      sx={{
                        ...typographyStyles,
                        fontWeight: 600,
                      }}
                    >
                      {t.secureLogin}
                    </Typography>
                  </Box>

                  <Stack spacing={1}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CheckCircle color="success" fontSize="small" />
                      <Typography variant="body2" sx={{ ...typographyStyles }}>
                        {language === "fa"
                          ? "احراز هویت امن"
                          : "Secure Authentication"}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CheckCircle color="success" fontSize="small" />
                      <Typography variant="body2" sx={{ ...typographyStyles }}>
                        {language === "fa"
                          ? "رمزگذاری داده‌ها"
                          : "Data Encryption"}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CheckCircle color="success" fontSize="small" />
                      <Typography variant="body2" sx={{ ...typographyStyles }}>
                        {language === "fa"
                          ? "حفاظت از حریم خصوصی"
                          : "Privacy Protection"}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Fade>
            </Stack>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
