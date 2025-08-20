import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
} from "@mui/material";
import { Language, Logout, Person, Email } from "@mui/icons-material";
import { translations } from "../../locales";
import type { Language as LanguageType } from "../../locales";
import { getCurrentUser, logoutUser } from "../../utils/userUtils";

const Dashboard = () => {
  const [language, setLanguage] = useState<LanguageType>("en");
  const [user, setUser] = useState<any>(null);

  const t = translations[language];

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setLanguage(currentUser.language);
    } else {
      // Redirect to login if no user is logged in
      window.location.href = "/login";
    }
  }, []);

  const handleLanguageChange = (
    _event: React.MouseEvent<HTMLElement>,
    newLanguage: LanguageType | null
  ) => {
    if (newLanguage !== null) {
      setLanguage(newLanguage);
    }
  };

  const handleLogout = () => {
    logoutUser();
    window.location.href = "/login";
  };

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="info">Loading...</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Stack spacing={3}>
          {/* Header with Language Switcher and Logout */}
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
              {t.title}
            </Typography>

            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
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

              <Button
                variant="outlined"
                startIcon={<Logout />}
                onClick={handleLogout}
                sx={{
                  fontFamily:
                    language === "fa"
                      ? "var(--font-persian)"
                      : "var(--font-english)",
                }}
              >
                {t.logout}
              </Button>
            </Box>
          </Box>

          {/* Welcome Message */}
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
            {`${t.welcomeMessage}, ${user.firstName} ${user.lastName}!`}
          </Typography>

          {/* User Information */}
          <Paper elevation={1} sx={{ p: 3, backgroundColor: "grey.50" }}>
            <Stack spacing={2}>
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
                {t.userInformation}
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Person color="action" />
                <Typography
                  sx={{
                    direction: language === "fa" ? "rtl" : "ltr",
                    fontFamily:
                      language === "fa"
                        ? "var(--font-persian)"
                        : "var(--font-english)",
                  }}
                >
                  <strong>{t.username}:</strong> {user.username}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Email color="action" />
                <Typography
                  sx={{
                    direction: language === "fa" ? "rtl" : "ltr",
                    fontFamily:
                      language === "fa"
                        ? "var(--font-persian)"
                        : "var(--font-english)",
                  }}
                >
                  <strong>{t.email}:</strong> {user.email}
                </Typography>
              </Box>

              <Typography
                sx={{
                  direction: language === "fa" ? "rtl" : "ltr",
                  fontFamily:
                    language === "fa"
                      ? "var(--font-persian)"
                      : "var(--font-english)",
                }}
              >
                <strong>{t.memberSince}:</strong>{" "}
                {new Date(user.createdAt).toLocaleDateString()}
              </Typography>
            </Stack>
          </Paper>

          {/* Dashboard Content Placeholder */}
          <Paper elevation={1} sx={{ p: 3, backgroundColor: "primary.50" }}>
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
              {t.dashboardContent}
            </Typography>
            <Typography
              sx={{
                direction: language === "fa" ? "rtl" : "ltr",
                fontFamily:
                  language === "fa"
                    ? "var(--font-persian)"
                    : "var(--font-english)",
              }}
            >
              {t.dashboardDescription}
            </Typography>
          </Paper>
        </Stack>
      </Paper>
    </Container>
  );
};

export default Dashboard;
