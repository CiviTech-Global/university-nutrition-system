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
  Email,
  Lock,
  Language,
} from "@mui/icons-material";
import { translations } from "../../locales";
import type { Language as LanguageType } from "../../locales";
import { isUsernameTaken, isEmailTaken } from "../../utils/userUtils";

const Register = () => {
  const [language, setLanguage] = useState<LanguageType>("en");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    rePassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
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

    if (!formData.firstName.trim()) {
      newErrors.firstName = t.firstNameRequired;
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = t.lastNameRequired;
    }

    if (!formData.email.trim()) {
      newErrors.email = t.emailRequired;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t.emailInvalid;
    }

    if (!formData.username.trim()) {
      newErrors.username = t.usernameRequired;
    } else if (formData.username.length < 3) {
      newErrors.username = t.usernameMinLength;
    }

    if (!formData.password) {
      newErrors.password = t.passwordRequired;
    } else if (formData.password.length < 6) {
      newErrors.password = t.passwordMinLength;
    }

    if (!formData.rePassword) {
      newErrors.rePassword = t.confirmPasswordRequired;
    } else if (formData.password !== formData.rePassword) {
      newErrors.rePassword = t.passwordsDoNotMatch;
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
        // Check for duplicate username
        if (isUsernameTaken(formData.username)) {
          setErrors((prev) => ({
            ...prev,
            username: t.usernameTaken,
          }));
          setIsSubmitting(false);
          return;
        }

        // Check for duplicate email
        if (isEmailTaken(formData.email)) {
          setErrors((prev) => ({
            ...prev,
            email: t.emailRegistered,
          }));
          setIsSubmitting(false);
          return;
        }

        // Create user object
        const newUser = {
          id: Date.now().toString(),
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          username: formData.username,
          password: formData.password, // In a real app, this should be hashed
          createdAt: new Date().toISOString(),
          language: language,
        };

        // Get existing users
        const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");

        // Add new user
        const updatedUsers = [...existingUsers, newUser];

        // Save to localStorage
        localStorage.setItem("users", JSON.stringify(updatedUsers));

        // Show success message
        setSubmitMessage({
          type: "success",
          text: t.accountCreated,
        });

        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          username: "",
          password: "",
          rePassword: "",
        });
        setErrors({});

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSubmitMessage(null);
        }, 3000);
      } catch (error) {
        setSubmitMessage({
          type: "error",
          text: t.errorCreatingAccount,
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 0 }}>
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
                {t.title}
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
                {t.subtitle}
              </Typography>
            </Box>

            {/* Name Fields */}
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label={t.firstName}
                value={formData.firstName}
                onChange={handleChange("firstName")}
                error={!!errors.firstName}
                helperText={errors.firstName}
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
              <TextField
                fullWidth
                label={t.lastName}
                value={formData.lastName}
                onChange={handleChange("lastName")}
                error={!!errors.lastName}
                helperText={errors.lastName}
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
            </Stack>

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

            {/* Re-enter Password */}
            <TextField
              fullWidth
              label={t.confirmPassword}
              type={showRePassword ? "text" : "password"}
              value={formData.rePassword}
              onChange={handleChange("rePassword")}
              error={!!errors.rePassword}
              helperText={errors.rePassword}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowRePassword(!showRePassword)}
                      edge="end"
                    >
                      {showRePassword ? <VisibilityOff /> : <Visibility />}
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
                  {t.creatingAccount}
                </Box>
              ) : (
                t.createAccount
              )}
            </Button>

            {/* Login Link */}
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
                {t.alreadyHaveAccount}{" "}
                <Typography
                  component="span"
                  variant="body2"
                  color="primary"
                  onClick={() => (window.location.href = "/login")}
                  sx={{
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontFamily:
                      language === "fa"
                        ? "var(--font-persian)"
                        : "var(--font-english)",
                  }}
                >
                  {t.signInHere}
                </Typography>
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
