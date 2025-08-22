import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Card,
  CardContent,
  Alert,
} from "@mui/material";
import {
  Restaurant as RestaurantIcon,
  TrendingUp as TrendingUpIcon,
  Notifications as NotificationsIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { translations } from "../../locales";
import type { Language as LanguageType } from "../../locales";
import { getCurrentUser } from "../../utils/userUtils";

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
        <Typography
          variant="h4"
          component="h1"
          color="primary"
          sx={{
            direction: language === "fa" ? "rtl" : "ltr",
            fontFamily:
              language === "fa" ? "var(--font-persian)" : "var(--font-english)",
          }}
        >
          {t.dashboard}
        </Typography>

        {/* Welcome Message */}
        <Typography
          variant="h5"
          sx={{
            direction: language === "fa" ? "rtl" : "ltr",
            fontFamily:
              language === "fa" ? "var(--font-persian)" : "var(--font-english)",
          }}
        >
          {`${t.welcomeMessage}, ${user.firstName} ${user.lastName}!`}
        </Typography>

        {/* Dashboard Stats */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "1fr 1fr 1fr 1fr",
            },
            gap: 3,
          }}
        >
          <Card sx={{ backgroundColor: "primary.50" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <RestaurantIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography
                    variant="h4"
                    color="primary"
                    sx={{
                      direction: language === "fa" ? "rtl" : "ltr",
                      fontFamily:
                        language === "fa"
                          ? "var(--font-persian)"
                          : "var(--font-english)",
                    }}
                  >
                    12
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
                    {t.mealsThisWeek}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ backgroundColor: "success.50" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <TrendingUpIcon color="success" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography
                    variant="h4"
                    color="success.main"
                    sx={{
                      direction: language === "fa" ? "rtl" : "ltr",
                      fontFamily:
                        language === "fa"
                          ? "var(--font-persian)"
                          : "var(--font-english)",
                    }}
                  >
                    $1,250
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
                    {t.availableCredit}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ backgroundColor: "warning.50" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <NotificationsIcon color="warning" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography
                    variant="h4"
                    color="warning.main"
                    sx={{
                      direction: language === "fa" ? "rtl" : "ltr",
                      fontFamily:
                        language === "fa"
                          ? "var(--font-persian)"
                          : "var(--font-english)",
                    }}
                  >
                    3
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
                    {t.newNotifications}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ backgroundColor: "info.50" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <ScheduleIcon color="info" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography
                    variant="h4"
                    color="info.main"
                    sx={{
                      direction: language === "fa" ? "rtl" : "ltr",
                      fontFamily:
                        language === "fa"
                          ? "var(--font-persian)"
                          : "var(--font-english)",
                    }}
                  >
                    85%
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
                    {t.attendanceRate}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Dashboard Content */}
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography
            variant="h5"
            sx={{
              direction: language === "fa" ? "rtl" : "ltr",
              fontFamily:
                language === "fa"
                  ? "var(--font-persian)"
                  : "var(--font-english)",
              mb: 2,
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
    </Container>
  );
};

export default Dashboard;
