import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Card,
  CardContent,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  Pagination,
  FormControl,
  Select,
  MenuItem,
  Tooltip,
  Snackbar,
} from "@mui/material";
import {
  Restaurant as RestaurantIcon,
  TrendingUp as TrendingUpIcon,
  Notifications as NotificationsIcon,
  Schedule as ScheduleIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import type { SelectChangeEvent } from "@mui/material";
import { getCurrentUser } from "../../utils/userUtils";
import { useLanguage } from "../../components/Layout";
import {
  formatCurrency,
  formatDate,
  formatTime,
  toPersianNumber,
  createLanguageStyles,
  createComponentStyles,
  getTypographyStyles,
} from "../../utils/languageUtils";

interface FoodItem {
  name: string;
  price: number;
}

interface DashboardStats {
  totalReservations: number;
  currentWeekReservations: number;
  userCredit: number;
  notifications: number;
  attendanceRate: number;
}

const Dashboard = () => {
  const { language, t, isRTL } = useLanguage();
  const componentStyles = createComponentStyles(language);
  const [user, setUser] = useState<any>(null);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [reservations, setReservations] = useState<
    Record<string, Record<string, string>>
  >({});
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showSaveError, setShowSaveError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Update current date and time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      loadReservations(currentUser.id);
    } else {
      window.location.href = "/login";
    }
    setIsLoading(false);
  }, []);

  // Load reservations from localStorage
  const loadReservations = (userId: string) => {
    try {
      const savedReservations = localStorage.getItem(`reservations_${userId}`);
      if (savedReservations) {
        setReservations(JSON.parse(savedReservations));
      }
    } catch (error) {
      console.error("Error loading reservations:", error);
    }
  };

  // Save reservations to localStorage
  const saveReservations = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      localStorage.setItem(
        `reservations_${user.id}`,
        JSON.stringify(reservations)
      );
      setShowSaveSuccess(true);
    } catch (error) {
      console.error("Error saving reservations:", error);
      setShowSaveError(true);
    } finally {
      setIsSaving(false);
    }
  };

  // Get week dates
  const getWeekDates = (weekOffset: number) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + weekOffset * 7);

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  const weekDates = getWeekDates(currentWeek);

  // Calculate dashboard statistics
  const dashboardStats: DashboardStats = useMemo(() => {
    const totalReservations = Object.values(reservations).reduce(
      (acc, dayReservations) => {
        return (
          acc +
          Object.values(dayReservations).filter((meal) => meal !== "").length
        );
      },
      0
    );

    const currentWeekReservations = weekDates.reduce((acc, date) => {
      const dayReservations = reservations[date.toISOString()] || {};
      return (
        acc +
        Object.values(dayReservations).filter((meal) => meal !== "").length
      );
    }, 0);

    const userCredit = user?.credit || 1250000;
    const notifications = Math.floor(Math.random() * 5) + 1;
    const attendanceRate = Math.floor(Math.random() * 20) + 80;

    return {
      totalReservations,
      currentWeekReservations,
      userCredit,
      notifications,
      attendanceRate,
    };
  }, [reservations, user, weekDates]);

  // Persian food options with prices (in Toman, multiples of 1000)
  const persianFoods: Record<string, FoodItem[]> = {
    breakfast: [
      { name: "نان و پنیر و چای", price: 15000 },
      { name: "شیر و عسل", price: 20000 },
      { name: "کره و مربا", price: 18000 },
      { name: "تخم مرغ آب پز", price: 25000 },
      { name: "حلیم", price: 30000 },
    ],
    lunch: [
      { name: "چلو کباب", price: 45000 },
      { name: "قورمه سبزی", price: 40000 },
      { name: "فesenجان", price: 42000 },
      { name: "کباب کوبیده", price: 48000 },
      { name: "برنج و خورشت", price: 35000 },
      { name: "آش رشته", price: 28000 },
      { name: "دلمه", price: 32000 },
    ],
    dinner: [
      { name: "کباب برگ", price: 50000 },
      { name: "خورشت قیمه", price: 38000 },
      { name: "برنج و ماهی", price: 45000 },
      { name: "آش جو", price: 25000 },
      { name: "سوپ", price: 22000 },
      { name: "سالاد", price: 18000 },
    ],
  };

  const handleReservation = (date: string, meal: string, food: string) => {
    setReservations((prev) => ({
      ...prev,
      [date]: {
        ...prev[date],
        [meal]: food,
      },
    }));
  };

  const handleWeekChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentWeek(value - 1);
  };

  const handlePreviousWeek = () => {
    if (currentWeek > -2) {
      setCurrentWeek(currentWeek - 1);
    }
  };

  const handleNextWeek = () => {
    if (currentWeek < 2) {
      setCurrentWeek(currentWeek + 1);
    }
  };

  const formatDateDisplay = (date: Date) => {
    return formatDate(date, language, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  const getFoodPrice = (meal: string, foodName: string) => {
    const mealFoods = persianFoods[meal];
    const food = mealFoods.find((f) => f.name === foodName);
    return food?.price || 0;
  };

  const calculateTotalCost = () => {
    return Object.values(reservations).reduce((total, dayReservations) => {
      return (
        total +
        Object.entries(dayReservations).reduce((dayTotal, [meal, food]) => {
          return dayTotal + getFoodPrice(meal, food);
        }, 0)
      );
    }, 0);
  };

  if (isLoading) {
    return (
      <Box
        sx={{ py: 4, width: "100%", display: "flex", justifyContent: "center" }}
      >
        <Alert severity="info">{t.loading}</Alert>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box
        sx={{ py: 4, width: "100%", display: "flex", justifyContent: "center" }}
      >
        <Alert severity="error">{t.userNotFound}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={componentStyles.dashboard.container}>
      <Stack spacing={3}>
        {/* Header */}
        <Typography
          variant="h4"
          component="h1"
          color="primary"
          sx={getTypographyStyles(language, "h4")}
        >
          {t.dashboard}
        </Typography>

        {/* Welcome Message */}
        <Typography variant="h5" sx={getTypographyStyles(language, "h5")}>
          {`${t.welcomeMessage}, ${user.firstName} ${user.lastName}!`}
        </Typography>

        {/* Dashboard Stats */}
        <Box sx={componentStyles.dashboard.statsGrid}>
          <Card
            sx={{
              ...componentStyles.dashboard.statCard,
              backgroundColor: "primary.50",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <RestaurantIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography
                    variant="h4"
                    color="primary"
                    sx={getTypographyStyles(language, "h4")}
                  >
                    {dashboardStats.currentWeekReservations}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={getTypographyStyles(language, "body2")}
                  >
                    {t.mealsThisWeek}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card
            sx={{
              ...componentStyles.dashboard.statCard,
              backgroundColor: "success.50",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <TrendingUpIcon color="success" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography
                    variant="h4"
                    color="success.main"
                    sx={getTypographyStyles(language, "h4")}
                  >
                    {formatCurrency(dashboardStats.userCredit, language)}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={getTypographyStyles(language, "body2")}
                  >
                    {t.availableCredit}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card
            sx={{
              ...componentStyles.dashboard.statCard,
              backgroundColor: "warning.50",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <NotificationsIcon color="warning" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography
                    variant="h4"
                    color="warning.main"
                    sx={getTypographyStyles(language, "h4")}
                  >
                    {dashboardStats.notifications}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={getTypographyStyles(language, "body2")}
                  >
                    {t.newNotifications}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card
            sx={{
              ...componentStyles.dashboard.statCard,
              backgroundColor: "info.50",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <ScheduleIcon color="info" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography
                    variant="h4"
                    color="info.main"
                    sx={getTypographyStyles(language, "h4")}
                  >
                    {dashboardStats.attendanceRate}%
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={getTypographyStyles(language, "body2")}
                  >
                    {t.attendanceRate}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Current Date and Time */}
        <Paper
          elevation={3}
          sx={{
            ...componentStyles.card,
            backgroundColor: "info.50",
            textAlign: "center",
          }}
        >
          <Typography
            variant="h6"
            sx={{ ...getTypographyStyles(language, "h6"), textAlign: "center" }}
          >
            {formatDate(currentDateTime, language, {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              ...getTypographyStyles(language, "h4"),
              textAlign: "center",
              color: "primary.main",
            }}
          >
            {formatTime(currentDateTime, language)}
          </Typography>
        </Paper>

        {/* Meal Reservation Table */}
        <Paper elevation={3} sx={componentStyles.card}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
              flexDirection: isRTL ? "row-reverse" : "row",
            }}
          >
            <Typography variant="h5" sx={getTypographyStyles(language, "h5")}>
              {t.mealReservation}
            </Typography>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Tooltip title={t.previousWeek}>
                <IconButton
                  onClick={handlePreviousWeek}
                  disabled={currentWeek <= -2}
                  color="primary"
                >
                  <NavigateBeforeIcon />
                </IconButton>
              </Tooltip>
              <Pagination
                count={5}
                page={currentWeek + 3}
                onChange={handleWeekChange}
                color="primary"
                size="large"
              />
              <Tooltip title={t.nextWeek}>
                <IconButton
                  onClick={handleNextWeek}
                  disabled={currentWeek >= 2}
                  color="primary"
                >
                  <NavigateNextIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={t.saveReservations}>
                <Button
                  variant="contained"
                  startIcon={isSaving ? <RefreshIcon /> : <SaveIcon />}
                  onClick={saveReservations}
                  disabled={isSaving}
                  sx={{
                    fontFamily: isRTL
                      ? "var(--font-persian)"
                      : "var(--font-english)",
                    direction: isRTL ? "rtl" : "ltr",
                  }}
                >
                  {isSaving ? t.saving : t.save}
                </Button>
              </Tooltip>
            </Box>
          </Box>

          <TableContainer sx={componentStyles.table.container}>
            <Table sx={componentStyles.table.table}>
              <TableHead>
                <TableRow>
                  <TableCell sx={componentStyles.table.head}>{t.day}</TableCell>
                  <TableCell sx={componentStyles.table.head}>
                    {t.breakfast}
                  </TableCell>
                  <TableCell sx={componentStyles.table.head}>
                    {t.lunch}
                  </TableCell>
                  <TableCell sx={componentStyles.table.head}>
                    {t.dinner}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {weekDates.map((date) => (
                  <TableRow
                    key={date.toISOString()}
                    sx={{
                      ...componentStyles.table.row,
                      backgroundColor: isToday(date) ? "primary.50" : "inherit",
                    }}
                  >
                    <TableCell
                      sx={{
                        ...componentStyles.table.cell,
                        fontWeight: isToday(date) ? "bold" : "normal",
                      }}
                    >
                      <Box>
                        <Typography variant="body1">
                          {formatDateDisplay(date)}
                        </Typography>
                        {isToday(date) && (
                          <Chip
                            label={t.today}
                            color="primary"
                            size="small"
                            sx={{
                              fontFamily: isRTL
                                ? "var(--font-persian)"
                                : "var(--font-english)",
                              direction: isRTL ? "rtl" : "ltr",
                            }}
                          />
                        )}
                        {isPastDate(date) && (
                          <Chip
                            icon={<WarningIcon />}
                            label={t.past}
                            color="error"
                            size="small"
                            sx={{
                              fontFamily: isRTL
                                ? "var(--font-persian)"
                                : "var(--font-english)",
                              direction: isRTL ? "rtl" : "ltr",
                            }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    {["breakfast", "lunch", "dinner"].map((meal) => (
                      <TableCell key={meal} sx={componentStyles.table.cell}>
                        <FormControl fullWidth size="small">
                          <Select
                            value={
                              reservations[date.toISOString()]?.[meal] || ""
                            }
                            onChange={(e: SelectChangeEvent) =>
                              handleReservation(
                                date.toISOString(),
                                meal,
                                e.target.value
                              )
                            }
                            displayEmpty
                            disabled={isPastDate(date)}
                            sx={componentStyles.form.field}
                          >
                            <MenuItem value="">
                              <em>{t.selectMeal}</em>
                            </MenuItem>
                            {persianFoods[meal].map((food) => (
                              <MenuItem key={food.name} value={food.name}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    width: "100%",
                                    direction: isRTL ? "rtl" : "ltr",
                                  }}
                                >
                                  <span>{food.name}</span>
                                  <Chip
                                    label={formatCurrency(food.price, language)}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                  />
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Total Cost Summary */}
          <Box
            sx={{ mt: 3, p: 2, backgroundColor: "grey.50", borderRadius: 0 }}
          >
            <Typography variant="h6" sx={getTypographyStyles(language, "h6")}>
              {t.totalCost}: {formatCurrency(calculateTotalCost(), language)}
            </Typography>
          </Box>
        </Paper>
      </Stack>

      {/* Success Snackbar */}
      <Snackbar
        open={showSaveSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSaveSuccess(false)}
        message={t.reservationsSaved}
      />

      {/* Error Snackbar */}
      <Snackbar
        open={showSaveError}
        autoHideDuration={3000}
        onClose={() => setShowSaveError(false)}
      >
        <Alert onClose={() => setShowSaveError(false)} severity="error">
          {t.errorSavingReservations}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;
