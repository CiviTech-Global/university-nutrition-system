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
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  Language,
} from "@mui/icons-material";
import { translations } from "../../locales";
import type { Language as LanguageType } from "../../locales";
import { authenticateUser, setCurrentUser } from "../../utils/userUtils";

const Login = () => {
  const [language, setLanguage] = useState<LanguageType>("en");
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

    if (validateForm()) {
      setIsSubmitting(true);

      try {
        // Authenticate user
        const user = authenticateUser(formData.username, formData.password);

        if (user) {
          // Set current user
          setCurrentUser(user);

          // Show success message
          setSubmitMessage({
            type: "success",
            text: t.loginSuccess,
          });

          // Reset form
          setFormData({
            username: "",
            password: "",
          });
          setErrors({});

          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            // In a real app, you would use React Router navigation here
            window.location.href = "/dashboard";
          }, 2000);
        } else {
          setSubmitMessage({
            type: "error",
            text: t.invalidCredentials,
          });
        }
      } catch (error) {
        setSubmitMessage({
          type: "error",
          text: t.loginError,
        });
      } finally {
        setIsSubmitting(false);
      }
    }
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
                {t.loginTitle}
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
                {t.loginSubtitle}
              </Typography>
            </Box>

            {/* Username */}
            <TextField
              fullWidth
              label={t.username}
              value={formData.username}
              onChange={handleChange("username")}
              error={!!errors.username}
              helperText={errors.username}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
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

            {/* Password */}
            <TextField
              fullWidth
              label={t.password}
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange("password")}
              error={!!errors.password}
              helperText={errors.password}
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
                  {t.loggingIn}
                </Box>
              ) : (
                t.loginButton
              )}
            </Button>

            {/* Forgot Password Link */}
            <Box textAlign="center">
              <Typography
                variant="body2"
                color="primary"
                onClick={() => (window.location.href = "/forgot-password")}
                sx={{
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontFamily:
                    language === "fa"
                      ? "var(--font-persian)"
                      : "var(--font-english)",
                  direction: language === "fa" ? "rtl" : "ltr",
                }}
              >
                {t.forgotPassword}
              </Typography>
            </Box>

            {/* Register Link */}
            <Box textAlign="center">
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  direction: language === "fa" ? "rtl" : "ltr",
                  fontFamily:
                    language === "fa"
                      ? "var(--font-persian)"
                      : "var(--font-english)",
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
                    fontFamily:
                      language === "fa"
                        ? "var(--font-persian)"
                        : "var(--font-english)",
                  }}
                >
                  {t.registerHere}
                </Typography>
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
