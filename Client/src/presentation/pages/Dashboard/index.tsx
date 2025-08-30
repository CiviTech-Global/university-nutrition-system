import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Card,
  CardContent,
  Alert,
  Button,
  Chip,
  FormControl,
  Select,
  MenuItem,
  Tooltip,
  Snackbar,
  IconButton,
} from "@mui/material";
import {
  Restaurant as RestaurantIcon,
  TrendingUp as TrendingUpIcon,
  Notifications as NotificationsIcon,
  Schedule as ScheduleIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  Today as TodayIcon,
} from "@mui/icons-material";
import type { SelectChangeEvent } from "@mui/material";
import { getCurrentUser } from "../../utils/userUtils";
import { useLanguage } from "../../contexts/LanguageContext";
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

interface Restaurant {
  id: string;
  name: string;
  nameEn: string;
  location: string;
  locationEn: string;
}

interface MealReservation {
  food: string;
  restaurant: string;
}

interface DayReservations {
  breakfast: MealReservation;
  lunch: MealReservation;
  dinner: MealReservation;
}

const Dashboard = () => {
  const { language, t, isRTL } = useLanguage();
  const componentStyles = createComponentStyles(language);
  const [user, setUser] = useState<any>(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [reservations, setReservations] = useState<
    Record<string, Record<string, MealReservation>>
  >({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [todayReservations, setTodayReservations] = useState<DayReservations>({
    breakfast: { food: "", restaurant: "" },
    lunch: { food: "", restaurant: "" },
    dinner: { food: "", restaurant: "" },
  });
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showSaveError, setShowSaveError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Restaurant options
  const restaurants: Restaurant[] = [
    {
      id: "selaf1",
      name: "سلف دانشجوئی شماره ۱",
      nameEn: "Student Cafeteria No. 1",
      location: "ساختمان مرکزی",
      locationEn: "Main Building",
    },
    {
      id: "selaf2", 
      name: "سلف دانشجوئی شماره ۲",
      nameEn: "Student Cafeteria No. 2",
      location: "ساختمان مهندسی",
      locationEn: "Engineering Building",
    },
    {
      id: "selaf3",
      name: "سلف دانشجوئی شماره ۳",
      nameEn: "Student Cafeteria No. 3",
      location: "خوابگاه",
      locationEn: "Dormitory",
    },
    {
      id: "selafvip",
      name: "سلف ویژه اساتید",
      nameEn: "Faculty Special Cafeteria",
      location: "ساختمان اداری",
      locationEn: "Administrative Building",
    },
  ];

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

  // Load reservations when selected date changes
  useEffect(() => {
    if (user) {
      loadSelectedDateReservations(user.id, selectedDate);
    }
  }, [selectedDate, user]);

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

  // Load reservations for selected date
  const loadSelectedDateReservations = (userId: string, date: Date) => {
    try {
      const dateString = getCurrentDayString(date);
      
      // Load restaurant reservations for the selected date
      const savedRestaurantReservations = localStorage.getItem(`restaurant_reservations_${userId}`);
      if (savedRestaurantReservations) {
        const restaurantReservations = JSON.parse(savedRestaurantReservations);
        if (restaurantReservations[dateString]) {
          setTodayReservations(restaurantReservations[dateString]);
        } else {
          // Reset to empty if no data for this date
          setTodayReservations({
            breakfast: { food: "", restaurant: "" },
            lunch: { food: "", restaurant: "" },
            dinner: { food: "", restaurant: "" },
          });
        }
      } else {
        // Reset to empty if no restaurant reservations exist
        setTodayReservations({
          breakfast: { food: "", restaurant: "" },
          lunch: { food: "", restaurant: "" },
          dinner: { food: "", restaurant: "" },
        });
      }
    } catch (error) {
      console.error("Error loading selected date reservations:", error);
    }
  };



  // Calculate dashboard statistics
  const dashboardStats: DashboardStats = useMemo(() => {
    const totalReservations = Object.values(reservations).reduce(
      (acc, dayReservations) => {
        return (
          acc +
          Object.values(dayReservations).filter((meal) => typeof meal === 'string' && meal !== "").length
        );
      },
      0
    );

    const currentWeekReservations = Object.values(reservations).reduce(
      (acc, dayReservations) => {
        return (
          acc +
          Object.values(dayReservations).filter((meal) => typeof meal === 'string' && meal !== "").length
        );
      },
      0
    );

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
  }, [reservations, user]);

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


  const handleTodayReservation = (meal: string, field: 'food' | 'restaurant', value: string) => {
    setTodayReservations((prev) => ({
      ...prev,
      [meal]: {
        ...prev[meal as keyof DayReservations],
        [field]: value,
      },
    }));
  };

  const getCurrentDayString = (date: Date = selectedDate) => {
    return date.toISOString().split('T')[0];
  };

  const handlePreviousDay = () => {
    const previousDay = new Date(selectedDate);
    previousDay.setDate(selectedDate.getDate() - 1);
    setSelectedDate(previousDay);
  };

  const handleNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(selectedDate.getDate() + 1);
    setSelectedDate(nextDay);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };

  const saveSelectedDateReservations = async () => {
    if (!user) return;
    
    const selectedDateString = getCurrentDayString();
    setIsSaving(true);
    try {
      // Convert selected date reservations to old format for storage
      const oldFormatReservations = {
        breakfast: todayReservations.breakfast.food,
        lunch: todayReservations.lunch.food,
        dinner: todayReservations.dinner.food,
      };
      
      const updatedReservations = {
        ...reservations,
        [selectedDateString]: oldFormatReservations,
      };
      
      localStorage.setItem(
        `reservations_${user.id}`,
        JSON.stringify(updatedReservations)
      );
      
      // Also save restaurant selections separately
      const existingRestaurantReservations = JSON.parse(
        localStorage.getItem(`restaurant_reservations_${user.id}`) || "{}"
      );
      const updatedRestaurantReservations = {
        ...existingRestaurantReservations,
        [selectedDateString]: todayReservations,
      };
      localStorage.setItem(
        `restaurant_reservations_${user.id}`,
        JSON.stringify(updatedRestaurantReservations)
      );
      
      // Update the reservations state by converting old format reservations to MealReservation objects
      const convertedReservations: Record<string, Record<string, MealReservation>> = {};
      Object.entries(updatedReservations).forEach(([date, dayMeals]) => {
        convertedReservations[date] = {};
        Object.entries(dayMeals).forEach(([meal, food]) => {
          convertedReservations[date][meal] = { food: food as string, restaurant: "" };
        });
      });
      
      setReservations(convertedReservations);
      setShowSaveSuccess(true);
    } catch (error) {
      console.error("Error saving selected date reservations:", error);
      setShowSaveError(true);
    } finally {
      setIsSaving(false);
    }
  };



  const calculateTodayTotalCost = () => {
    return Object.entries(todayReservations).reduce((total, [meal, mealData]) => {
      if (mealData.food) {
        const food = persianFoods[meal]?.find(f => f.name === mealData.food);
        return total + (food?.price || 0);
      }
      return total;
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

        {/* Today's Meal Reservation Cards */}
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
              {language === "fa" ? "رزرو غذا" : "Meal Reservation"}
            </Typography>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              {/* Date Navigation */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Tooltip title={language === "fa" ? "روز قبل" : "Previous Day"}>
                  <IconButton
                    onClick={handlePreviousDay}
                    color="primary"
                    sx={{
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "primary.main",
                    }}
                  >
                    <NavigateBeforeIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title={language === "fa" ? "روز بعد" : "Next Day"}>
                  <IconButton
                    onClick={handleNextDay}
                    color="primary"
                    sx={{
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "primary.main",
                    }}
                  >
                    <NavigateNextIcon />
                  </IconButton>
                </Tooltip>
                
                {!isToday(selectedDate) && (
                  <Tooltip title={language === "fa" ? "برگشت به امروز" : "Go to Today"}>
                    <IconButton
                      onClick={handleToday}
                      color="secondary"
                      sx={{
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "secondary.main",
                      }}
                    >
                      <TodayIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
              
              <Tooltip title={t.saveReservations}>
                <Button
                  variant="contained"
                  startIcon={isSaving ? <RefreshIcon /> : <SaveIcon />}
                  onClick={saveSelectedDateReservations}
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

          {/* Selected Date Display */}
          <Box sx={{ mb: 3, textAlign: "center" }}>
            <Chip
              label={formatDate(selectedDate, language, {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "long",
              })}
              color={isToday(selectedDate) ? "primary" : "secondary"}
              variant={isToday(selectedDate) ? "filled" : "outlined"}
              icon={isToday(selectedDate) ? <TodayIcon /> : undefined}
              sx={{
                fontSize: "1rem",
                py: 2,
                px: 3,
                height: "auto",
                fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                direction: isRTL ? "rtl" : "ltr",
                ...(isPastDate(selectedDate) && {
                  opacity: 0.7,
                  backgroundColor: "grey.100",
                  borderColor: "grey.300",
                }),
              }}
            />
            {isPastDate(selectedDate) && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                  mt: 1,
                  fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                }}
              >
                {language === "fa" ? "روز گذشته" : "Past Date"}
              </Typography>
            )}
          </Box>

          {/* Meal Cards Grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 3,
              mb: 3,
            }}
          >
            {["breakfast", "lunch", "dinner"].map((meal) => {
              const mealTitle = meal === "breakfast" ? t.breakfast : meal === "lunch" ? t.lunch : t.dinner;
              const selectedFood = todayReservations[meal as keyof DayReservations].food;
              const selectedRestaurant = todayReservations[meal as keyof DayReservations].restaurant;
              const selectedFoodData = selectedFood ? persianFoods[meal].find(f => f.name === selectedFood) : null;
              const selectedRestaurantData = selectedRestaurant ? restaurants.find(r => r.id === selectedRestaurant) : null;
              
              return (
                <Card
                  key={meal}
                  sx={{
                    border: "2px solid",
                    borderColor: selectedFood ? "primary.main" : "grey.200",
                    borderRadius: 3,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                      transform: "translateY(-2px)",
                    },
                    background: selectedFood 
                      ? "linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)"
                      : "rgba(248, 250, 252, 0.8)",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Meal Header */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 3,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          ...getTypographyStyles(language, "h6"),
                          fontWeight: 600,
                          color: "primary.main",
                        }}
                      >
                        {mealTitle}
                      </Typography>
                      <RestaurantIcon color="primary" />
                    </Box>

                    {/* Food Selection */}
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          ...getTypographyStyles(language, "body2"),
                          mb: 1,
                          fontWeight: 600,
                          color: "text.primary",
                        }}
                      >
                        {language === "fa" ? "انتخاب غذا" : "Select Food"}
                      </Typography>
                      <FormControl fullWidth>
                        <Select
                          value={selectedFood}
                          onChange={(e: SelectChangeEvent) =>
                            handleTodayReservation(meal, 'food', e.target.value)
                          }
                          displayEmpty
                          sx={{
                            ...componentStyles.form.field,
                            borderRadius: 2,
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "grey.300",
                            },
                          }}
                        >
                          <MenuItem value="">
                            <em>{language === "fa" ? "غذا انتخاب کنید" : "Select a meal"}</em>
                          </MenuItem>
                          {persianFoods[meal].map((food) => (
                            <MenuItem key={food.name} value={food.name}>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  width: "100%",
                                  alignItems: "center",
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                                  }}
                                >
                                  {language === "fa" ? food.name : food.nameEn}
                                </Typography>
                                <Chip
                                  label={formatCurrency(food.price, language)}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                  sx={{
                                    fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                                  }}
                                />
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>

                    {/* Restaurant Selection */}
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          ...getTypographyStyles(language, "body2"),
                          mb: 1,
                          fontWeight: 600,
                          color: "text.primary",
                        }}
                      >
                        {language === "fa" ? "انتخاب سلف" : "Select Cafeteria"}
                      </Typography>
                      <FormControl fullWidth>
                        <Select
                          value={selectedRestaurant}
                          onChange={(e: SelectChangeEvent) =>
                            handleTodayReservation(meal, 'restaurant', e.target.value)
                          }
                          displayEmpty
                          sx={{
                            ...componentStyles.form.field,
                            borderRadius: 2,
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "grey.300",
                            },
                          }}
                        >
                          <MenuItem value="">
                            <em>{language === "fa" ? "سلف انتخاب کنید" : "Select a cafeteria"}</em>
                          </MenuItem>
                          {restaurants.map((restaurant) => (
                            <MenuItem key={restaurant.id} value={restaurant.id}>
                              <Box sx={{ direction: isRTL ? "rtl" : "ltr" }}>
                                <Typography
                                  variant="body1"
                                  sx={{
                                    fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                                    fontWeight: 500,
                                  }}
                                >
                                  {language === "fa" ? restaurant.name : restaurant.nameEn}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                                  }}
                                >
                                  {language === "fa" ? restaurant.location : restaurant.locationEn}
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>

                    {/* Selected Summary */}
                    {(selectedFood || selectedRestaurant) && (
                      <Box
                        sx={{
                          p: 2,
                          backgroundColor: "rgba(37, 99, 235, 0.05)",
                          borderRadius: 2,
                          border: "1px solid rgba(37, 99, 235, 0.1)",
                        }}
                      >
                        {selectedFoodData && (
                          <Box sx={{ mb: selectedRestaurantData ? 2 : 0 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color: "primary.main",
                                mb: 0.5,
                                fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                              }}
                            >
                              {language === "fa" ? "غذا انتخابی:" : "Selected Food:"}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                                color: "text.primary",
                              }}
                            >
                              {language === "fa" ? selectedFoodData.name : selectedFoodData.nameEn} - {formatCurrency(selectedFoodData.price, language)}
                            </Typography>
                          </Box>
                        )}
                        {selectedRestaurantData && (
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color: "primary.main",
                                mb: 0.5,
                                fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                              }}
                            >
                              {language === "fa" ? "سلف انتخابی:" : "Selected Cafeteria:"}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                                color: "text.primary",
                              }}
                            >
                              {language === "fa" ? selectedRestaurantData.name : selectedRestaurantData.nameEn}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                                color: "text.secondary",
                              }}
                            >
                              {language === "fa" ? selectedRestaurantData.location : selectedRestaurantData.locationEn}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </Box>

          {/* Total Cost Summary */}
          <Box
            sx={{
              p: 3,
              backgroundColor: "primary.50",
              borderRadius: 2,
              textAlign: "center",
            }}
          >
            <Typography variant="h6" sx={getTypographyStyles(language, "h6")}>
              {language === "fa" ? "هزینه کل امروز:" : "Today's Total Cost:"} {" "}
              {formatCurrency(calculateTodayTotalCost(), language)}
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
