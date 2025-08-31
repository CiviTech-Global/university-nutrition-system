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
  Avatar,
  Fade,
  Slide,
} from "@mui/material";
import {
  Email,
  ArrowBack,
  Lock,
  Visibility,
  VisibilityOff,
  LockReset,
  Security,
  CheckCircle,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getUserByEmail } from "../../utils/userUtils";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  createComponentStyles,
  getTypographyStyles,
} from "../../utils/languageUtils";

const ForgotPassword = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const componentStyles = createComponentStyles(language);
  const typographyStyles = getTypographyStyles(language, "body1");

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
          {/* Left Side - Password Reset Form */}
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
                    {/* Header */}
                    <Box textAlign="center">
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
                          <LockReset sx={{ fontSize: 40 }} />
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
                        {t.forgotPasswordTitle}
                      </Typography>
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        sx={{
                          ...typographyStyles,
                          mb: 3,
                        }}
                      >
                        {t.forgotPasswordSubtitle}
                      </Typography>
                    </Box>

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
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                                edge={language === "fa" ? "start" : "end"}
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
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />

                    {/* Action Buttons */}
                    <Stack spacing={2} direction="row">
                      <Button
                        variant="outlined"
                        startIcon={
                          language === "fa" ? undefined : <ArrowBack />
                        }
                        endIcon={language === "fa" ? <ArrowBack /> : undefined}
                        onClick={handleBackToLogin}
                        sx={{
                          flex: 1,
                          borderRadius: 2,
                          py: 1.5,
                        }}
                      >
                        {t.backToLogin}
                      </Button>

                      <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting}
                        sx={{
                          flex: 2,
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
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
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
            </Fade>
          </Box>

          {/* Right Side - Info and Help */}
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
                      background: `url('/src/presentation/assets/images/قیمه_بادمجان_غذای_روز_تمامی_گروه_های_سنی_1024x1005.jpg')`,
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
                    <Security sx={{ fontSize: 48, mb: 2 }} />
                    <Typography
                      variant="h4"
                      sx={{
                        ...typographyStyles,
                        fontWeight: 700,
                        textAlign: "center",
                      }}
                    >
                      {language === "fa"
                        ? "بازیابی رمز عبور"
                        : "Password Recovery"}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        ...typographyStyles,
                        textAlign: "center",
                        opacity: 0.9,
                      }}
                    >
                      {language === "fa" ? "امن و سریع" : "Secure & Fast"}
                    </Typography>
                  </Box>
                </Paper>
              </Fade>

              {/* Security Info */}
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
                    <Security color="primary" sx={{ mr: 1 }} />
                    <Typography
                      variant="h6"
                      sx={{
                        ...typographyStyles,
                        fontWeight: 600,
                      }}
                    >
                      {language === "fa" ? "امنیت بالا" : "High Security"}
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
                          ? "تأیید ایمیل"
                          : "Email Verification"}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CheckCircle color="success" fontSize="small" />
                      <Typography variant="body2" sx={{ ...typographyStyles }}>
                        {language === "fa"
                          ? "حفاظت از داده‌ها"
                          : "Data Protection"}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Fade>

              {/* Help Section */}
              <Fade in timeout={1400}>
                <Paper
                  elevation={4}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(10px)",
                    backgroundColor: "rgba(102, 126, 234, 0.05)",
                    border: "1px solid rgba(102, 126, 234, 0.2)",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      ...typographyStyles,
                      textAlign: "center",
                      lineHeight: 1.6,
                    }}
                  >
                    {language === "fa"
                      ? "پس از تغییر رمز عبور، از رمز جدید برای ورود به سیستم استفاده کنید. در صورت بروز مشکل، با پشتیبانی تماس بگیرید."
                      : "After resetting your password, use the new password to log into the system. If you encounter any issues, please contact support."}
                  </Typography>
                </Paper>
              </Fade>
            </Stack>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
