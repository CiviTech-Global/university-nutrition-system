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
} from "@mui/material";
import {
  Email,
  Language,
  ArrowBack,
  Lock,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { translations } from "../../locales";
import type { Language as LanguageType } from "../../locales";
import { getUserByEmail } from "../../utils/userUtils";

const ForgotPassword = () => {
  const [language, setLanguage] = useState<LanguageType>("en");
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

  const t = translations[language];

  const handleLanguageChange = (
    _event: React.MouseEvent<HTMLElement>,
    newLanguage: LanguageType | null
  ) => {
    if (newLanguage !== null) {
      setLanguage(newLanguage);
      // Clear errors when language changes
      setErrors({});
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
    // In a real app, you would use React Router navigation here
    window.location.href = "/login";
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {/* Header with Language Switcher */}
            <Box textAlign="center">
              <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
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
              </Box>

              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                color="primary"
                sx={{
                  direction: language === "fa" ? "rtl" : "ltr",
                  fontFamily:
                    language === "fa"
                      ? "var(--font-persian)"
                      : "var(--font-english)",
                }}
              >
                {t.forgotPasswordTitle}
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{
                  direction: language === "fa" ? "rtl" : "ltr",
                  fontFamily:
                    language === "fa"
                      ? "var(--font-persian)"
                      : "var(--font-english)",
                }}
              >
                {t.forgotPasswordSubtitle}
              </Typography>
            </Box>

            {/* Email */}
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
                direction: language === "fa" ? "rtl" : "ltr",
                "& .MuiInputLabel-root": {
                  fontFamily:
                    language === "fa"
                      ? "var(--font-persian)"
                      : "var(--font-english)",
                },
                "& .MuiInputBase-input": {
                  fontFamily:
                    language === "fa"
                      ? "var(--font-persian)"
                      : "var(--font-english)",
                },
              }}
            />

            {/* New Password */}
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
                direction: language === "fa" ? "rtl" : "ltr",
                "& .MuiInputLabel-root": {
                  fontFamily:
                    language === "fa"
                      ? "var(--font-persian)"
                      : "var(--font-english)",
                },
                "& .MuiInputBase-input": {
                  fontFamily:
                    language === "fa"
                      ? "var(--font-persian)"
                      : "var(--font-english)",
                },
              }}
            />

            {/* Confirm New Password */}
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
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                direction: language === "fa" ? "rtl" : "ltr",
                "& .MuiInputLabel-root": {
                  fontFamily:
                    language === "fa"
                      ? "var(--font-persian)"
                      : "var(--font-english)",
                },
                "& .MuiInputBase-input": {
                  fontFamily:
                    language === "fa"
                      ? "var(--font-persian)"
                      : "var(--font-english)",
                },
              }}
            />

            {/* Success/Error Message */}
            {submitMessage && (
              <Alert
                severity={submitMessage.type}
                sx={{
                  fontFamily:
                    language === "fa"
                      ? "var(--font-persian)"
                      : "var(--font-english)",
                  direction: language === "fa" ? "rtl" : "ltr",
                }}
              >
                {submitMessage.text}
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{
                py: 1.5,
                fontSize: "1.1rem",
                fontFamily:
                  language === "fa"
                    ? "var(--font-persian)"
                    : "var(--font-english)",
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

            {/* Back to Login Link */}
            <Box textAlign="center">
              <Button
                startIcon={<ArrowBack />}
                onClick={handleBackToLogin}
                sx={{
                  fontFamily:
                    language === "fa"
                      ? "var(--font-persian)"
                      : "var(--font-english)",
                  direction: language === "fa" ? "rtl" : "ltr",
                }}
              >
                {t.backToLogin}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default ForgotPassword;
