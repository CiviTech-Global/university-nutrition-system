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
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  Email,
  ArrowBack,
  Lock,
  Visibility,
  VisibilityOff,
  LockReset,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getUserByEmail } from "../../utils/userUtils";
import { useLanguage } from "../../components/Layout";
import {
  createComponentStyles,
  getTypographyStyles,
} from "../../utils/languageUtils";

const ForgotPassword = () => {
  const { language, t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const componentStyles = createComponentStyles(language);
  const typographyStyles = getTypographyStyles(language);

  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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
    };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = t.emailRequired;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t.emailInvalid;
    }

    if (!formData.newPassword) {
      newErrors.newPassword = t.passwordRequired;
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = t.passwordMinLength;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t.confirmPasswordRequired;
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = t.passwordsDoNotMatch;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitMessage(null);

    if (validateForm()) {
      setIsSubmitting(true);

      try {
        // Check if email exists in our system
        const user = getUserByEmail(formData.email);

        if (user) {
          // Update user's password in localStorage
          const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
          const updatedUsers = allUsers.map((u: any) =>
            u.email === formData.email
              ? { ...u, password: formData.newPassword }
              : u
          );
          localStorage.setItem("users", JSON.stringify(updatedUsers));

          // Show success message
          setSubmitMessage({
            type: "success",
            text: t.passwordResetSuccess,
          });

          // Reset form
          setFormData({
            email: "",
            newPassword: "",
            confirmPassword: "",
          });
          setErrors({});

          // Clear success message after 3 seconds
          setTimeout(() => {
            setSubmitMessage(null);
          }, 3000);
        } else {
          setSubmitMessage({
            type: "error",
            text: t.emailNotFound,
          });
        }
      } catch (error) {
        setSubmitMessage({
          type: "error",
          text: t.forgotPasswordError,
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <Container maxWidth="md">
      <Stack spacing={4}>
        {/* Header Section */}
        <Paper
          elevation={0}
          sx={{
            ...componentStyles.card,
            p: 4,
            textAlign: "center",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <LockReset sx={{ fontSize: 48, opacity: 0.9 }} />
          </Box>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              ...typographyStyles.title,
              color: "white",
              fontWeight: 700,
            }}
          >
            {t.forgotPasswordTitle}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              ...typographyStyles.subtitle,
              color: "rgba(255, 255, 255, 0.9)",
              fontWeight: 400,
            }}
          >
            {t.forgotPasswordSubtitle}
          </Typography>
        </Paper>

        {/* Main Form Section */}
        <Paper elevation={0} sx={{ ...componentStyles.card, p: 4 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {/* Success/Error Message */}
              {submitMessage && (
                <Alert
                  severity={submitMessage.type}
                  sx={{
                    ...typographyStyles.body,
                    borderRadius: 0,
                  }}
                >
                  {submitMessage.text}
                </Alert>
              )}

              {/* Email Field */}
              <TextField
                fullWidth
                label={t.email}
                type="email"
                value={formData.email}
                onChange={handleChange("email")}
                error={!!errors.email}
                helperText={errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  ...componentStyles.form.field,
                  ...typographyStyles.body,
                }}
              />

              <Divider sx={{ my: 2 }} />

              {/* New Password Field */}
              <TextField
                fullWidth
                label={t.newPassword}
                type={showPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={handleChange("newPassword")}
                error={!!errors.newPassword}
                helperText={errors.newPassword}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  ...componentStyles.form.field,
                  ...typographyStyles.body,
                }}
              />

              {/* Confirm New Password Field */}
              <TextField
                fullWidth
                label={t.confirmPassword}
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange("confirmPassword")}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        edge="end"
                      >
                        {showConfirmPassword ? (
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
                  ...typographyStyles.body,
                }}
              />

              {/* Action Buttons */}
              <Stack spacing={2} direction={isRTL ? "row-reverse" : "row"}>
                <Button
                  variant="outlined"
                  startIcon={isRTL ? undefined : <ArrowBack />}
                  endIcon={isRTL ? <ArrowBack /> : undefined}
                  onClick={handleBackToLogin}
                  sx={{
                    ...componentStyles.button,
                    ...typographyStyles.button,
                    flex: 1,
                  }}
                >
                  {t.backToLogin}
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  sx={{
                    ...componentStyles.button,
                    ...typographyStyles.button,
                    flex: 2,
                    py: 1.5,
                    fontSize: "1.1rem",
                  }}
                >
                  {isSubmitting ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CircularProgress size={20} color="inherit" />
                      {t.resettingPassword}
                    </Box>
                  ) : (
                    t.resetPasswordButton
                  )}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Paper>

        {/* Additional Help Section */}
        <Paper
          elevation={0}
          sx={{
            ...componentStyles.card,
            p: 3,
            backgroundColor: "rgba(102, 126, 234, 0.05)",
            border: "1px solid rgba(102, 126, 234, 0.2)",
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              ...typographyStyles.body,
              textAlign: "center",
              lineHeight: 1.6,
            }}
          >
            {language === "fa"
              ? "پس از تغییر رمز عبور، از رمز جدید برای ورود به سیستم استفاده کنید. در صورت بروز مشکل، با پشتیبانی تماس بگیرید."
              : "After resetting your password, use the new password to log into the system. If you encounter any issues, please contact support."}
          </Typography>
        </Paper>
      </Stack>
    </Container>
  );
};

export default ForgotPassword;
