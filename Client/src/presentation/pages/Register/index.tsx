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
  Avatar,
  Fade,
  Slide,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Lock,
  Language,
  School,
  Security,
  CheckCircle,
  Restaurant,
  TrendingUp,
} from "@mui/icons-material";
import type { Language as LanguageType } from "../../locales";
import { isUsernameTaken, isEmailTaken } from "../../utils/userUtils";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  createComponentStyles,
  getTypographyStyles,
} from "../../utils/languageUtils";

// Benefits interface for registration
interface Benefit {
  id: string;
  icon: React.ReactNode;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
}

// Sample benefits data
const sampleBenefits: Benefit[] = [
  {
    id: "1",
    icon: <Restaurant color="primary" />,
    title: "دسترسی به منوی متنوع",
    titleEn: "Access to Diverse Menu",
    description: "انواع غذاهای ایرانی و بین‌المللی",
    descriptionEn: "Various Iranian and international dishes",
  },
  {
    id: "2",
    icon: <TrendingUp color="primary" />,
    title: "رزرو آسان و سریع",
    titleEn: "Easy & Quick Reservation",
    description: "رزرو وعده‌های غذایی در چند ثانیه",
    descriptionEn: "Reserve meals in seconds",
  },
  {
    id: "3",
    icon: <Security color="primary" />,
    title: "امنیت بالا",
    titleEn: "High Security",
    description: "حفاظت کامل از اطلاعات شخصی",
    descriptionEn: "Complete protection of personal data",
  },
];

const Register = () => {
  const { language, t, setLanguage } = useLanguage();
  const componentStyles = createComponentStyles(language);
  const typographyStyles = getTypographyStyles(language, "body1");

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

  // Get benefits for current language
  const benefits = sampleBenefits.map((benefit) => ({
    ...benefit,
    title: language === "fa" ? benefit.title : benefit.titleEn,
    description:
      language === "fa" ? benefit.description : benefit.descriptionEn,
  }));

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
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

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
          {/* Left Side - Registration Form */}
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
                        {t.title}
                      </Typography>
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        sx={{
                          ...typographyStyles,
                          mb: 3,
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
                          [language === "fa"
                            ? "endAdornment"
                            : "startAdornment"]: (
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
                      <TextField
                        fullWidth
                        label={t.lastName}
                        value={formData.lastName}
                        onChange={handleChange("lastName")}
                        error={!!errors.lastName}
                        helperText={errors.lastName}
                        InputProps={{
                          [language === "fa"
                            ? "endAdornment"
                            : "startAdornment"]: (
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
                        [language === "fa" ? "endAdornment" : "startAdornment"]:
                          (
                            <InputAdornment
                              position={language === "fa" ? "end" : "start"}
                            >
                              <Email color="action" />
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

                    {/* Username */}
                    <TextField
                      fullWidth
                      label={t.username}
                      value={formData.username}
                      onChange={handleChange("username")}
                      error={!!errors.username}
                      helperText={errors.username}
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
                                onClick={() =>
                                  setShowRePassword(!showRePassword)
                                }
                                edge={language === "fa" ? "start" : "end"}
                              >
                                {showRePassword ? (
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
                      disabled={isSubmitting}
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
                          ...typographyStyles,
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
                            ...typographyStyles,
                            "&:hover": {
                              color: "primary.dark",
                            },
                          }}
                        >
                          {t.signInHere}
                        </Typography>
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Paper>
            </Fade>
          </Box>

          {/* Right Side - Benefits and Info */}
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
                      background: `url('/src/presentation/assets/images/چلو جوجه کباب و ته چین.jpg')`,
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
                        ? "به جمع ما بپیوندید"
                        : "Join Our Community"}
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
                        ? "تجربه غذایی بهتر"
                        : "Better Dining Experience"}
                    </Typography>
                  </Box>
                </Paper>
              </Fade>

              {/* Benefits */}
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
                    <CheckCircle color="primary" sx={{ mr: 1 }} />
                    <Typography
                      variant="h6"
                      sx={{
                        ...typographyStyles,
                        fontWeight: 600,
                      }}
                    >
                      {language === "fa"
                        ? "مزایای عضویت"
                        : "Membership Benefits"}
                    </Typography>
                  </Box>

                  <Stack spacing={2}>
                    {benefits.map((benefit) => (
                      <Card
                        key={benefit.id}
                        sx={{
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: "primary.light",
                          background: "primary.50",
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
                            {benefit.icon}
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  ...typographyStyles,
                                  fontWeight: 600,
                                  mb: 0.5,
                                }}
                              >
                                {benefit.title}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  ...typographyStyles,
                                }}
                              >
                                {benefit.description}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                </Paper>
              </Fade>

              {/* Security Info */}
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
                      {language === "fa" ? "امنیت اطلاعات" : "Data Security"}
                    </Typography>
                  </Box>

                  <Stack spacing={1}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CheckCircle color="success" fontSize="small" />
                      <Typography variant="body2" sx={{ ...typographyStyles }}>
                        {language === "fa" ? "رمزگذاری SSL" : "SSL Encryption"}
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
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CheckCircle color="success" fontSize="small" />
                      <Typography variant="body2" sx={{ ...typographyStyles }}>
                        {language === "fa"
                          ? "ذخیره‌سازی امن"
                          : "Secure Storage"}
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

export default Register;
