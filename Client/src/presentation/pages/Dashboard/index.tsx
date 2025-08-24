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
  createComponentStyles,
  getTypographyStyles,
} from "../../utils/languageUtils";

interface FoodItem {
  name: string;
  nameEn: string;
  price: number;
  ingredients: string[];
  ingredientsEn: string[];
  description: string;
  descriptionEn: string;
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

  // Persian food options with prices, ingredients, and descriptions (in Toman, multiples of 1000)
  const persianFoods: Record<string, FoodItem[]> = {
    breakfast: [
      {
        name: "نان و پنیر و چای",
        nameEn: "Bread, Cheese & Tea",
        price: 15000,
        ingredients: ["نان تازه", "پنیر سفید", "چای سیاه", "عسل", "کره"],
        ingredientsEn: [
          "Fresh bread",
          "White cheese",
          "Black tea",
          "Honey",
          "Butter",
        ],
        description:
          "صبحانه سنتی ایرانی با نان تازه، پنیر سفید، چای سیاه و عسل طبیعی",
        descriptionEn:
          "Traditional Iranian breakfast with fresh bread, white cheese, black tea, and natural honey",
      },
      {
        name: "شیر و عسل",
        nameEn: "Milk & Honey",
        price: 20000,
        ingredients: ["شیر گرم", "عسل طبیعی", "زعفران", "هل"],
        ingredientsEn: ["Warm milk", "Natural honey", "Saffron", "Cardamom"],
        description: "شیر گرم با عسل طبیعی و زعفران، مناسب برای شروع روز",
        descriptionEn:
          "Warm milk with natural honey and saffron, perfect for starting the day",
      },
      {
        name: "کره و مربا",
        nameEn: "Butter & Jam",
        price: 18000,
        ingredients: ["نان تست", "کره", "مربای آلبالو", "چای"],
        ingredientsEn: ["Toast bread", "Butter", "Cherry jam", "Tea"],
        description: "نان تست با کره و مربای آلبالو خانگی",
        descriptionEn: "Toast with butter and homemade cherry jam",
      },
      {
        name: "تخم مرغ آب پز",
        nameEn: "Boiled Eggs",
        price: 25000,
        ingredients: ["تخم مرغ", "نمک", "فلفل", "نان"],
        ingredientsEn: ["Eggs", "Salt", "Pepper", "Bread"],
        description: "تخم مرغ آب پز با نمک و فلفل، همراه با نان تازه",
        descriptionEn:
          "Boiled eggs with salt and pepper, served with fresh bread",
      },
      {
        name: "حلیم",
        nameEn: "Haleem",
        price: 30000,
        ingredients: ["گندم", "گوشت", "دارچین", "شکر", "کره"],
        ingredientsEn: ["Wheat", "Meat", "Cinnamon", "Sugar", "Butter"],
        description: "حلیم سنتی با گوشت، گندم، دارچین و کره",
        descriptionEn:
          "Traditional haleem with meat, wheat, cinnamon, and butter",
      },
    ],
    lunch: [
      {
        name: "چلو کباب",
        nameEn: "Rice & Kebab",
        price: 45000,
        ingredients: ["برنج", "گوشت کباب", "زعفران", "کره", "پیاز"],
        ingredientsEn: ["Rice", "Kebab meat", "Saffron", "Butter", "Onion"],
        description: "برنج زعفرانی با کباب گوشت و پیاز تازه",
        descriptionEn: "Saffron rice with grilled meat kebab and fresh onion",
      },
      {
        name: "قورمه سبزی",
        nameEn: "Ghormeh Sabzi",
        price: 40000,
        ingredients: ["سبزی قورمه", "لوبیا", "گوشت", "لیمو عمانی", "برنج"],
        ingredientsEn: ["Herbs", "Beans", "Meat", "Dried lime", "Rice"],
        description: "خورشت سبزی با لوبیا، گوشت و لیمو عمانی",
        descriptionEn: "Herb stew with beans, meat, and dried lime",
      },
      {
        name: "فesenجان",
        nameEn: "Fesenjan",
        price: 42000,
        ingredients: ["گردو", "انار", "مرغ", "برنج", "زعفران"],
        ingredientsEn: ["Walnuts", "Pomegranate", "Chicken", "Rice", "Saffron"],
        description: "خورشت فesenجان با گردو، انار و مرغ",
        descriptionEn: "Fesenjan stew with walnuts, pomegranate, and chicken",
      },
      {
        name: "کباب کوبیده",
        nameEn: "Koobideh Kebab",
        price: 48000,
        ingredients: ["گوشت چرخ شده", "پیاز", "ادویه", "برنج", "کره"],
        ingredientsEn: ["Ground meat", "Onion", "Spices", "Rice", "Butter"],
        description: "کباب کوبیده با گوشت چرخ شده و ادویه مخصوص",
        descriptionEn: "Koobideh kebab with ground meat and special spices",
      },
      {
        name: "برنج و خورشت",
        nameEn: "Rice & Stew",
        price: 35000,
        ingredients: ["برنج", "خورشت سبزی", "گوشت", "سبزیجات"],
        ingredientsEn: ["Rice", "Herb stew", "Meat", "Vegetables"],
        description: "برنج با خورشت سبزی و گوشت تازه",
        descriptionEn: "Rice with herb stew and fresh meat",
      },
      {
        name: "آش رشته",
        nameEn: "Ash Reshteh",
        price: 28000,
        ingredients: ["رشته", "سبزی", "لوبیا", "کشک", "پیاز داغ"],
        ingredientsEn: ["Noodles", "Herbs", "Beans", "Kashk", "Fried onion"],
        description: "آش رشته با سبزی، لوبیا و کشک",
        descriptionEn: "Ash reshteh with herbs, beans, and kashk",
      },
      {
        name: "دلمه",
        nameEn: "Dolmeh",
        price: 32000,
        ingredients: ["برگ مو", "برنج", "لپه", "ادویه", "گوشت"],
        ingredientsEn: ["Grape leaves", "Rice", "Split peas", "Spices", "Meat"],
        description: "دلمه برگ مو با برنج، لپه و گوشت",
        descriptionEn: "Grape leaf dolmeh with rice, split peas, and meat",
      },
    ],
    dinner: [
      {
        name: "کباب برگ",
        nameEn: "Barg Kebab",
        price: 50000,
        ingredients: ["گوشت برگ", "ادویه", "برنج", "کره", "زعفران"],
        ingredientsEn: ["Sliced meat", "Spices", "Rice", "Butter", "Saffron"],
        description: "کباب برگ با گوشت نازک و ادویه مخصوص",
        descriptionEn: "Barg kebab with thin sliced meat and special spices",
      },
      {
        name: "خورشت قیمه",
        nameEn: "Gheimeh Stew",
        price: 38000,
        ingredients: ["لپه", "گوشت", "سیب زمینی", "گوجه", "ادویه"],
        ingredientsEn: ["Split peas", "Meat", "Potato", "Tomato", "Spices"],
        description: "خورشت قیمه با لپه، گوشت و سیب زمینی",
        descriptionEn: "Gheimeh stew with split peas, meat, and potato",
      },
      {
        name: "برنج و ماهی",
        nameEn: "Rice & Fish",
        price: 45000,
        ingredients: ["ماهی", "برنج", "سبزیجات", "لیمو", "ادویه"],
        ingredientsEn: ["Fish", "Rice", "Vegetables", "Lemon", "Spices"],
        description: "برنج با ماهی تازه و سبزیجات",
        descriptionEn: "Rice with fresh fish and vegetables",
      },
      {
        name: "آش جو",
        nameEn: "Barley Soup",
        price: 25000,
        ingredients: ["جو", "سبزی", "گوشت", "ادویه", "پیاز"],
        ingredientsEn: ["Barley", "Herbs", "Meat", "Spices", "Onion"],
        description: "آش جو با سبزی و گوشت تازه",
        descriptionEn: "Barley soup with herbs and fresh meat",
      },
      {
        name: "سوپ",
        nameEn: "Soup",
        price: 22000,
        ingredients: ["سبزیجات", "گوشت", "ادویه", "آب مرغ", "نودل"],
        ingredientsEn: [
          "Vegetables",
          "Meat",
          "Spices",
          "Chicken broth",
          "Noodles",
        ],
        description: "سوپ سبزیجات با گوشت و نودل",
        descriptionEn: "Vegetable soup with meat and noodles",
      },
      {
        name: "سالاد",
        nameEn: "Salad",
        price: 18000,
        ingredients: ["کاهو", "گوجه", "خیار", "پیاز", "روغن زیتون"],
        ingredientsEn: ["Lettuce", "Tomato", "Cucumber", "Onion", "Olive oil"],
        description: "سالاد تازه با سبزیجات و روغن زیتون",
        descriptionEn: "Fresh salad with vegetables and olive oil",
      },
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
    _event: React.ChangeEvent<unknown>,
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
                              <Tooltip
                                key={food.name}
                                title={
                                  <Box
                                    sx={{
                                      p: 2,
                                      maxWidth: 320,
                                      background:
                                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                      borderRadius: 2,
                                      border: "1px solid rgba(255,255,255,0.2)",
                                      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                                      backdropFilter: "blur(10px)",
                                    }}
                                  >
                                    {/* Header with Price */}
                                    <Box
                                      sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        mb: 2,
                                        pb: 1,
                                        borderBottom:
                                          "1px solid rgba(255,255,255,0.2)",
                                      }}
                                    >
                                      <Typography
                                        variant="subtitle1"
                                        sx={{
                                          fontWeight: 700,
                                          color: "white",
                                          fontSize: "1rem",
                                          direction: isRTL ? "rtl" : "ltr",
                                          fontFamily: isRTL
                                            ? "var(--font-persian)"
                                            : "var(--font-english)",
                                        }}
                                      >
                                        {language === "fa"
                                          ? food.name
                                          : food.nameEn}
                                      </Typography>
                                      <Chip
                                        label={formatCurrency(
                                          food.price,
                                          language
                                        )}
                                        size="small"
                                        sx={{
                                          bgcolor: "rgba(255,255,255,0.2)",
                                          color: "white",
                                          fontWeight: 600,
                                          fontSize: "0.7rem",
                                          height: 24,
                                          fontFamily: isRTL
                                            ? "var(--font-persian)"
                                            : "var(--font-english)",
                                        }}
                                      />
                                    </Box>

                                    {/* Description */}
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        mb: 2,
                                        color: "rgba(255,255,255,0.9)",
                                        lineHeight: 1.5,
                                        fontSize: "0.8rem",
                                        direction: isRTL ? "rtl" : "ltr",
                                        fontFamily: isRTL
                                          ? "var(--font-persian)"
                                          : "var(--font-english)",
                                      }}
                                    >
                                      {language === "fa"
                                        ? food.description
                                        : food.descriptionEn}
                                    </Typography>

                                    {/* Ingredients Section */}
                                    <Box>
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          fontWeight: 600,
                                          color: "rgba(255,255,255,0.8)",
                                          display: "block",
                                          mb: 1,
                                          fontSize: "0.75rem",
                                          direction: isRTL ? "rtl" : "ltr",
                                          fontFamily: isRTL
                                            ? "var(--font-persian)"
                                            : "var(--font-english)",
                                        }}
                                      >
                                        {language === "fa"
                                          ? "مواد تشکیل دهنده:"
                                          : "Ingredients:"}
                                      </Typography>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          flexWrap: "wrap",
                                          gap: 0.5,
                                        }}
                                      >
                                        {(language === "fa"
                                          ? food.ingredients
                                          : food.ingredientsEn
                                        )
                                          .slice(0, 4)
                                          .map((ingredient, index) => (
                                            <Chip
                                              key={index}
                                              label={ingredient}
                                              size="small"
                                              sx={{
                                                fontSize: "0.65rem",
                                                height: 22,
                                                bgcolor:
                                                  "rgba(255,255,255,0.15)",
                                                color: "white",
                                                border:
                                                  "1px solid rgba(255,255,255,0.3)",
                                                borderRadius: 1.5,
                                                fontFamily: isRTL
                                                  ? "var(--font-persian)"
                                                  : "var(--font-english)",
                                                "&:hover": {
                                                  bgcolor:
                                                    "rgba(255,255,255,0.25)",
                                                },
                                              }}
                                            />
                                          ))}
                                        {food.ingredients.length > 4 && (
                                          <Chip
                                            label={
                                              language === "fa"
                                                ? `+${
                                                    food.ingredients.length - 4
                                                  } بیشتر`
                                                : `+${
                                                    food.ingredients.length - 4
                                                  } more`
                                            }
                                            size="small"
                                            sx={{
                                              fontSize: "0.65rem",
                                              height: 22,
                                              bgcolor: "rgba(255,255,255,0.1)",
                                              color: "rgba(255,255,255,0.7)",
                                              border:
                                                "1px solid rgba(255,255,255,0.2)",
                                              borderRadius: 1.5,
                                              fontFamily: isRTL
                                                ? "var(--font-persian)"
                                                : "var(--font-english)",
                                            }}
                                          />
                                        )}
                                      </Box>
                                    </Box>

                                    {/* Nutritional Info */}
                                    <Box
                                      sx={{
                                        mt: 2,
                                        pt: 1,
                                        borderTop:
                                          "1px solid rgba(255,255,255,0.2)",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        direction: isRTL ? "rtl" : "ltr",
                                      }}
                                    >
                                      <Box sx={{ textAlign: "center" }}>
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            display: "block",
                                            color: "rgba(255,255,255,0.7)",
                                            fontSize: "0.65rem",
                                            fontFamily: isRTL
                                              ? "var(--font-persian)"
                                              : "var(--font-english)",
                                          }}
                                        >
                                          {language === "fa"
                                            ? "زمان آماده‌سازی"
                                            : "Prep Time"}
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            color: "white",
                                            fontWeight: 600,
                                            fontSize: "0.8rem",
                                            fontFamily: isRTL
                                              ? "var(--font-persian)"
                                              : "var(--font-english)",
                                          }}
                                        >
                                          {Math.floor(food.price / 1000)}{" "}
                                          {language === "fa" ? "دقیقه" : "min"}
                                        </Typography>
                                      </Box>
                                      <Box sx={{ textAlign: "center" }}>
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            display: "block",
                                            color: "rgba(255,255,255,0.7)",
                                            fontSize: "0.65rem",
                                            fontFamily: isRTL
                                              ? "var(--font-persian)"
                                              : "var(--font-english)",
                                          }}
                                        >
                                          {language === "fa"
                                            ? "سطح دشواری"
                                            : "Difficulty"}
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            color: "white",
                                            fontWeight: 600,
                                            fontSize: "0.8rem",
                                            fontFamily: isRTL
                                              ? "var(--font-persian)"
                                              : "var(--font-english)",
                                          }}
                                        >
                                          {language === "fa"
                                            ? "متوسط"
                                            : "Medium"}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </Box>
                                }
                                arrow
                                placement="right"
                                PopperProps={{
                                  sx: {
                                    "& .MuiTooltip-arrow": {
                                      color: "#667eea",
                                    },
                                  },
                                }}
                                sx={{
                                  "& .MuiTooltip-tooltip": {
                                    backgroundColor: "transparent",
                                    padding: 0,
                                    maxWidth: "none",
                                    boxShadow: "none",
                                  },
                                }}
                              >
                                <MenuItem value={food.name}>
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
                                      label={formatCurrency(
                                        food.price,
                                        language
                                      )}
                                      size="small"
                                      color="primary"
                                      variant="outlined"
                                    />
                                  </Box>
                                </MenuItem>
                              </Tooltip>
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
