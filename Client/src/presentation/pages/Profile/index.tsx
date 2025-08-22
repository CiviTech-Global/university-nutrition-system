import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  TextField,
  Button,
  Avatar,
  Divider,
  Grid,
  Card,
  CardContent,
  Alert,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { translations } from "../../locales";
import type { Language as LanguageType } from "../../locales";
import { getCurrentUser } from "../../utils/userUtils";

const Profile = () => {
  const [language, setLanguage] = useState<LanguageType>("en");
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
  });

  const t = translations[language];

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setLanguage(currentUser.language);
      setFormData({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        email: currentUser.email || "",
        username: currentUser.username || "",
      });
    } else {
      // Redirect to login if no user is logged in
      window.location.href = "/login";
    }
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original values
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      username: user.username || "",
    });
  };

  const handleSave = () => {
    // TODO: Implement save logic
    setIsEditing(false);
  };

  const handleChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({
        ...formData,
        [field]: event.target.value,
      });
    };

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="info">Loading...</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            color="primary"
            sx={{
              direction: language === "fa" ? "rtl" : "ltr",
              fontFamily:
                language === "fa"
                  ? "var(--font-persian)"
                  : "var(--font-english)",
            }}
          >
            {t.profile}
          </Typography>

          {!isEditing ? (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              sx={{
                fontFamily:
                  language === "fa"
                    ? "var(--font-persian)"
                    : "var(--font-english)",
              }}
            >
              {t.edit}
            </Button>
          ) : (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                sx={{
                  fontFamily:
                    language === "fa"
                      ? "var(--font-persian)"
                      : "var(--font-english)",
                }}
              >
                {t.cancel}
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                sx={{
                  fontFamily:
                    language === "fa"
                      ? "var(--font-persian)"
                      : "var(--font-english)",
                }}
              >
                {t.save}
              </Button>
            </Box>
          )}
        </Box>

        <Grid container spacing={3}>
          {/* Profile Picture and Basic Info */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
              <Stack spacing={3} alignItems="center">
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    fontSize: "3rem",
                    backgroundColor: "primary.main",
                  }}
                >
                  {user.firstName?.charAt(0)?.toUpperCase() || "U"}
                </Avatar>

                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h5"
                    sx={{
                      direction: language === "fa" ? "rtl" : "ltr",
                      fontFamily:
                        language === "fa"
                          ? "var(--font-persian)"
                          : "var(--font-english)",
                    }}
                  >
                    {user.firstName} {user.lastName}
                  </Typography>
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
                    {user.email}
                  </Typography>
                </Box>

                <Card sx={{ width: "100%", backgroundColor: "grey.50" }}>
                  <CardContent>
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
                      {t.memberSince}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        direction: language === "fa" ? "rtl" : "ltr",
                        fontFamily:
                          language === "fa"
                            ? "var(--font-persian)"
                            : "var(--font-english)",
                      }}
                    >
                      {new Date(user.createdAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Stack>
            </Paper>
          </Grid>

          {/* Profile Details */}
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
              <Stack spacing={3}>
                <Typography
                  variant="h5"
                  sx={{
                    direction: language === "fa" ? "rtl" : "ltr",
                    fontFamily:
                      language === "fa"
                        ? "var(--font-persian)"
                        : "var(--font-english)",
                  }}
                >
                  {t.personalInformation}
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t.firstName}
                      value={formData.firstName}
                      onChange={handleChange("firstName")}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: (
                          <PersonIcon color="action" sx={{ mr: 1 }} />
                        ),
                      }}
                      sx={{
                        "& .MuiInputLabel-root": {
                          direction: language === "fa" ? "rtl" : "ltr",
                          fontFamily:
                            language === "fa"
                              ? "var(--font-persian)"
                              : "var(--font-english)",
                        },
                        "& .MuiInputBase-input": {
                          direction: language === "fa" ? "rtl" : "ltr",
                          fontFamily:
                            language === "fa"
                              ? "var(--font-persian)"
                              : "var(--font-english)",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t.lastName}
                      value={formData.lastName}
                      onChange={handleChange("lastName")}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: (
                          <PersonIcon color="action" sx={{ mr: 1 }} />
                        ),
                      }}
                      sx={{
                        "& .MuiInputLabel-root": {
                          direction: language === "fa" ? "rtl" : "ltr",
                          fontFamily:
                            language === "fa"
                              ? "var(--font-persian)"
                              : "var(--font-english)",
                        },
                        "& .MuiInputBase-input": {
                          direction: language === "fa" ? "rtl" : "ltr",
                          fontFamily:
                            language === "fa"
                              ? "var(--font-persian)"
                              : "var(--font-english)",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t.email}
                      type="email"
                      value={formData.email}
                      onChange={handleChange("email")}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: (
                          <EmailIcon color="action" sx={{ mr: 1 }} />
                        ),
                      }}
                      sx={{
                        "& .MuiInputLabel-root": {
                          direction: language === "fa" ? "rtl" : "ltr",
                          fontFamily:
                            language === "fa"
                              ? "var(--font-persian)"
                              : "var(--font-english)",
                        },
                        "& .MuiInputBase-input": {
                          direction: language === "fa" ? "rtl" : "ltr",
                          fontFamily:
                            language === "fa"
                              ? "var(--font-persian)"
                              : "var(--font-english)",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t.username}
                      value={formData.username}
                      onChange={handleChange("username")}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: (
                          <PersonIcon color="action" sx={{ mr: 1 }} />
                        ),
                      }}
                      sx={{
                        "& .MuiInputLabel-root": {
                          direction: language === "fa" ? "rtl" : "ltr",
                          fontFamily:
                            language === "fa"
                              ? "var(--font-persian)"
                              : "var(--font-english)",
                        },
                        "& .MuiInputBase-input": {
                          direction: language === "fa" ? "rtl" : "ltr",
                          fontFamily:
                            language === "fa"
                              ? "var(--font-persian)"
                              : "var(--font-english)",
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
};

export default Profile;
