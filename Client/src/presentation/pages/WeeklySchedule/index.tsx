import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Card,
  CardContent,
  Button,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Alert,
  Snackbar,
  TextField,
  Divider,
  Badge,
  CardMedia,
  ListItem,
  ListItemText,
  List,
  Collapse,
} from "@mui/material";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  Restaurant as RestaurantIcon,
  Payment as PaymentIcon,
  LocalOffer as DiscountIcon,
  Cancel as CancelIcon,
  CheckCircle as ConfirmIcon,
  ContentCopy as CopyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  LocalFireDepartment as CaloriesIcon,
  Grass as VegetarianIcon,
  Star as PopularIcon,
} from "@mui/icons-material";
import type { SelectChangeEvent } from "@mui/material";
import { getCurrentUser } from "../../utils/userUtils";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  formatCurrency,
  formatDate,
  createComponentStyles,
  getTypographyStyles,
} from "../../utils/languageUtils";
import DataService, {
  type FoodItem,
  type Restaurant,
  type MealReservation,
} from "../../services/dataService";

interface MealSelection {
  foodId: string;
  restaurantId: string;
  confirmed: boolean;
  paid: boolean;
  discountCode?: string;
  discountAmount?: number;
  faramushiCode?: string;
  price?: number;
  reservationId?: string;
}

interface DayReservations {
  breakfast: MealSelection;
  lunch: MealSelection;
  dinner: MealSelection;
  [key: string]: MealSelection;
}

interface WeekData {
  [date: string]: DayReservations;
}

const WeeklySchedule = () => {
  const { language, isRTL } = useLanguage();
  const componentStyles = createComponentStyles(language);
  const [user, setUser] = useState<any>(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [weekData, setWeekData] = useState<WeekData>({});
  const [selectedMeal, setSelectedMeal] = useState<{
    date: string;
    meal: string;
    data: MealSelection;
  } | null>(null);
  const [foodOptions, setFoodOptions] = useState<{
    breakfast: FoodItem[];
    lunch: FoodItem[];
    dinner: FoodItem[];
  }>({ breakfast: [], lunch: [], dinner: [] });
  const [restaurantOptions, setRestaurantOptions] = useState<Restaurant[]>([]);
  const [dataService] = useState(DataService.getInstance());
  const [expandedMeals, setExpandedMeals] = useState<Record<string, boolean>>(
    {}
  );
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [discountDialog, setDiscountDialog] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Load food and restaurant options
  useEffect(() => {
    const breakfastFoods =
      dataService.getAvailableFoodsByCategory("breakfast") || [];
    const lunchFoods = dataService.getAvailableFoodsByCategory("lunch") || [];
    const dinnerFoods = dataService.getAvailableFoodsByCategory("dinner") || [];
    const restaurants = dataService.getActiveRestaurants() || [];

    setFoodOptions({
      breakfast: breakfastFoods,
      lunch: lunchFoods,
      dinner: dinnerFoods,
    });
    setRestaurantOptions(restaurants);
  }, [dataService]);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      loadWeekData(currentUser.id);
    } else {
      window.location.href = "/login";
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      loadWeekData(user.id);
    }
  }, [currentWeek, user]);

  const loadWeekData = (userId: string) => {
    try {
      const weekStart = getWeekStart(currentWeek);
      const weekData: WeekData = {};

      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        const dateString = date.toISOString().split("T")[0];

        // Load existing weekly plan
        const weekStartString = dataService.formatDate(weekStart);
        const weeklyPlan = dataService.getWeeklyPlan(userId, weekStartString);

        if (weeklyPlan && weeklyPlan.meals[dateString]) {
          const dayPlan = weeklyPlan.meals[dateString];
          const restaurantPlan = weeklyPlan.restaurants[dateString] || {};

          weekData[dateString] = {
            breakfast: {
              foodId: dayPlan.breakfast || "",
              restaurantId: restaurantPlan.breakfast || "",
              confirmed: false,
              paid: false,
            },
            lunch: {
              foodId: dayPlan.lunch || "",
              restaurantId: restaurantPlan.lunch || "",
              confirmed: false,
              paid: false,
            },
            dinner: {
              foodId: dayPlan.dinner || "",
              restaurantId: restaurantPlan.dinner || "",
              confirmed: false,
              paid: false,
            },
          };
        } else {
          weekData[dateString] = {
            breakfast: {
              foodId: "",
              restaurantId: "",
              confirmed: false,
              paid: false,
            },
            lunch: {
              foodId: "",
              restaurantId: "",
              confirmed: false,
              paid: false,
            },
            dinner: {
              foodId: "",
              restaurantId: "",
              confirmed: false,
              paid: false,
            },
          };
        }

        // Check for existing reservations
        const reservations = dataService.getAllReservations(userId) || [];
        const dayReservations = reservations.filter(
          (r) => r.date === dateString
        );

        dayReservations.forEach((reservation) => {
          if (weekData[dateString][reservation.meal]) {
            weekData[dateString][reservation.meal] = {
              ...weekData[dateString][reservation.meal],
              foodId: reservation.foodId,
              restaurantId: reservation.restaurantId,
              confirmed: reservation.status !== "pending",
              paid:
                reservation.status === "paid" ||
                reservation.status === "completed",
              faramushiCode: reservation.faramushiCode,
              price: reservation.price,
              reservationId: reservation.id,
            };
          }
        });
      }

      setWeekData(weekData);
    } catch (error) {
      console.error("Error loading week data:", error);
    }
  };

  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    return new Date(d.setDate(diff));
  };

  const getWeekDays = () => {
    const weekStart = getWeekStart(currentWeek);
    const days = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      days.push(date);
    }

    return days;
  };

  const handlePreviousWeek = () => {
    const prevWeek = new Date(currentWeek);
    prevWeek.setDate(currentWeek.getDate() - 7);
    setCurrentWeek(prevWeek);
  };

  const handleNextWeek = () => {
    const nextWeek = new Date(currentWeek);
    nextWeek.setDate(currentWeek.getDate() + 7);
    setCurrentWeek(nextWeek);
  };

  const handleCurrentWeek = () => {
    setCurrentWeek(new Date());
  };

  const handleMealSelect = (
    date: string,
    meal: string,
    field: "foodId" | "restaurantId",
    value: string
  ) => {
    setWeekData((prev) => {
      const updatedData = {
        ...prev,
        [date]: {
          ...prev[date],
          [meal]: {
            ...prev[date][meal],
            [field]: value,
            confirmed: false,
            paid: false,
          },
        },
      };

      // Save to weekly plan
      saveWeeklyPlan(date, meal, field, value);

      return updatedData;
    });
  };

  const saveWeeklyPlan = (
    date: string,
    meal: string,
    field: "foodId" | "restaurantId",
    value: string
  ) => {
    if (!user) return;

    try {
      const weekStart = getWeekStart(currentWeek);
      const weekStartString = dataService.formatDate(weekStart);

      let weeklyPlan = dataService.getWeeklyPlan(user.id, weekStartString);

      if (!weeklyPlan) {
        weeklyPlan = {
          userId: user.id,
          weekStart: weekStartString,
          meals: {},
          restaurants: {},
          lastUpdated: new Date().toISOString(),
        };
      }

      if (!weeklyPlan.meals[date]) {
        weeklyPlan.meals[date] = {};
      }
      if (!weeklyPlan.restaurants[date]) {
        weeklyPlan.restaurants[date] = {};
      }

      if (field === "foodId") {
        weeklyPlan.meals[date][
          meal as keyof (typeof weeklyPlan.meals)[typeof date]
        ] = value;
      } else {
        weeklyPlan.restaurants[date][
          meal as keyof (typeof weeklyPlan.restaurants)[typeof date]
        ] = value;
      }

      weeklyPlan.lastUpdated = new Date().toISOString();
      dataService.saveWeeklyPlan(weeklyPlan);
    } catch (error) {
      console.error("Error saving weekly plan:", error);
    }
  };

  const handleReservationAction = (
    date: string,
    meal: string,
    action: "confirm" | "cancel" | "pay"
  ) => {
    const mealData = weekData[date][meal as keyof DayReservations];

    if (action === "confirm") {
      if (!mealData.foodId || !mealData.restaurantId) {
        setErrorMessage(
          language === "fa"
            ? "لطفاً غذا و رستوران را انتخاب کنید"
            : "Please select food and restaurant"
        );
        setShowError(true);
        return;
      }
      setSelectedMeal({ date, meal, data: mealData });
      setPaymentDialog(true);
    } else if (action === "cancel") {
      // If there's an existing reservation, delete it
      if (mealData.reservationId) {
        dataService.deleteReservation(user!.id, mealData.reservationId);
      }

      setWeekData((prev) => ({
        ...prev,
        [date]: {
          ...prev[date],
          [meal]: {
            foodId: "",
            restaurantId: "",
            confirmed: false,
            paid: false,
            discountCode: undefined,
            discountAmount: undefined,
            faramushiCode: undefined,
            reservationId: undefined,
          },
        },
      }));

      // Clear from weekly plan as well
      saveWeeklyPlan(date, meal, "foodId", "");
      saveWeeklyPlan(date, meal, "restaurantId", "");

      setSuccessMessage(
        language === "fa" ? "رزرو لغو شد" : "Reservation cancelled"
      );
      setShowSuccess(true);
    }
  };

  const applyDiscountCode = () => {
    const discount = dataService.validateDiscountCode(discountCode);
    if (discount > 0 && selectedMeal) {
      const updatedMeal = {
        ...selectedMeal,
        data: {
          ...selectedMeal.data,
          discountCode,
          discountAmount: discount,
        },
      };
      setSelectedMeal(updatedMeal);
      setDiscountDialog(false);
      setSuccessMessage(
        language === "fa"
          ? `تخفیف ${discount}% اعمال شد`
          : `${discount}% discount applied`
      );
      setShowSuccess(true);
    } else {
      setErrorMessage(
        language === "fa" ? "کد تخفیف نامعتبر است" : "Invalid discount code"
      );
      setShowError(true);
    }
    setDiscountCode("");
  };

  const handlePayment = async () => {
    if (!selectedMeal || !user) return;

    try {
      const { date, meal, data } = selectedMeal;
      const foodItem = dataService.getFoodById(data.foodId);
      const restaurant = dataService.getRestaurantById(data.restaurantId);

      if (!foodItem || !restaurant) {
        setErrorMessage(
          language === "fa"
            ? "غذا یا رستوران یافت نشد"
            : "Food or restaurant not found"
        );
        setShowError(true);
        return;
      }

      let finalPrice = foodItem.price;
      if (data.discountAmount) {
        finalPrice = finalPrice * (1 - data.discountAmount / 100);
      }

      // Check wallet balance
      const userBalance = dataService.getUserBalance(user.id);
      if (paymentMethod === "wallet" && userBalance < finalPrice) {
        setErrorMessage(
          language === "fa" ? "موجودی کافی نیست" : "Insufficient balance"
        );
        setShowError(true);
        return;
      }

      // Generate Faramushi code
      const faramushiCode = dataService.generateFaramushiCode();
      const reservationId = dataService.generateId("res");

      // Create reservation
      const reservation: MealReservation = {
        id: reservationId,
        userId: user.id,
        date,
        meal: meal as "breakfast" | "lunch" | "dinner",
        foodId: data.foodId,
        foodName: language === "fa" ? foodItem.name : foodItem.nameEn,
        restaurantId: data.restaurantId,
        restaurantName: language === "fa" ? restaurant.name : restaurant.nameEn,
        price: finalPrice,
        originalPrice: foodItem.originalPrice || foodItem.price,
        discountCode: data.discountCode,
        discountAmount: data.discountAmount,
        faramushiCode,
        status: "paid",
        paymentMethod: paymentMethod as "wallet" | "gateway",
        paymentDate: new Date().toISOString(),
        reservationDate: new Date().toISOString(),
        nutritionalInfo: {
          calories: foodItem.calories,
          protein: foodItem.nutritionalInfo.protein,
          carbs: foodItem.nutritionalInfo.carbs,
          fat: foodItem.nutritionalInfo.fat,
        },
      };

      // Save reservation
      dataService.saveReservation(reservation);

      // Update user balance and create transaction if wallet payment
      if (paymentMethod === "wallet") {
        const newBalance = userBalance - finalPrice;
        dataService.updateUserBalance(user.id, newBalance);

        const transaction = {
          id: dataService.generateId("txn"),
          userId: user.id,
          type: "debit" as const,
          amount: finalPrice,
          date: new Date().toISOString().split("T")[0],
          description: `${
            language === "fa" ? "رزرو غذا" : "Meal reservation"
          } - ${foodItem.name}`,
          category: "food",
          relatedReservationId: reservationId,
          paymentMethod,
          status: "completed" as const,
        };
        dataService.saveTransaction(transaction);
      }

      // Update local state
      const updatedMeal = {
        ...data,
        confirmed: true,
        paid: true,
        faramushiCode,
        price: finalPrice,
        reservationId,
      };

      setWeekData((prev) => ({
        ...prev,
        [date]: {
          ...prev[date],
          [meal]: updatedMeal,
        },
      }));

      setPaymentDialog(false);
      setSelectedMeal(null);
      setSuccessMessage(
        `${
          language === "fa"
            ? "رزرو تأیید شد. کد فرموشی:"
            : "Reservation confirmed. Faramushi code:"
        } ${faramushiCode}`
      );
      setShowSuccess(true);
    } catch (error) {
      console.error("Payment error:", error);
      setErrorMessage(
        language === "fa" ? "خطا در پردازش پرداخت" : "Payment processing error"
      );
      setShowError(true);
    }
  };

  const getMealPrice = (foodId: string) => {
    const foodItem = dataService.getFoodById(foodId);
    return foodItem?.price || 0;
  };

  const toggleMealExpansion = (key: string) => {
    setExpandedMeals((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const calculateWeekTotal = () => {
    return Object.entries(weekData).reduce((total, [, dayData]) => {
      return (
        total +
        Object.entries(dayData).reduce((dayTotal, [, mealData]) => {
          if (mealData.confirmed && mealData.foodId) {
            let price = getMealPrice(mealData.foodId);
            if (mealData.discountAmount) {
              price = price * (1 - mealData.discountAmount / 100);
            }
            return dayTotal + price;
          }
          return dayTotal;
        }, 0)
      );
    }, 0);
  };

  const weekDays = getWeekDays();
  const today = new Date().toISOString().split("T")[0];
  const weekTotal = calculateWeekTotal();

  if (isLoading) {
    return (
      <Box
        sx={{ py: 4, width: "100%", display: "flex", justifyContent: "center" }}
      >
        <Alert severity="info">
          {language === "fa" ? "در حال بارگذاری..." : "Loading..."}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={componentStyles.dashboard.container}>
      <Stack spacing={3}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: isRTL ? "row-reverse" : "row",
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            color="primary"
            sx={getTypographyStyles(language, "h4")}
          >
            {language === "fa" ? "برنامه هفتگی غذا" : "Weekly Meal Schedule"}
          </Typography>

          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <IconButton onClick={handlePreviousWeek} color="primary">
              <ChevronLeftIcon />
            </IconButton>
            <Button
              onClick={handleCurrentWeek}
              variant="outlined"
              startIcon={<TodayIcon />}
              sx={{
                fontFamily: isRTL
                  ? "var(--font-persian)"
                  : "var(--font-english)",
              }}
            >
              {language === "fa" ? "هفته جاری" : "Current Week"}
            </Button>
            <IconButton onClick={handleNextWeek} color="primary">
              <ChevronRightIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Week Navigation */}
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" sx={getTypographyStyles(language, "h6")}>
              {formatDate(weekDays[0], language, {
                month: "long",
                day: "numeric",
              })}{" "}
              -{" "}
              {formatDate(weekDays[6], language, {
                month: "long",
                day: "numeric",
              })}
            </Typography>

            <Chip
              label={`${
                language === "fa" ? "هزینه کل هفته:" : "Week Total:"
              } ${formatCurrency(weekTotal, language)}`}
              color="primary"
              variant="outlined"
              sx={{
                fontFamily: isRTL
                  ? "var(--font-persian)"
                  : "var(--font-english)",
              }}
            />
          </Box>
        </Paper>

        {/* Weekly Calendar */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 3,
          }}
        >
          {weekDays.map((day) => {
            const dateString = day.toISOString().split("T")[0];
            const dayData = weekData[dateString] || {
              breakfast: {
                foodId: "",
                restaurantId: "",
                confirmed: false,
                paid: false,
              },
              lunch: {
                foodId: "",
                restaurantId: "",
                confirmed: false,
                paid: false,
              },
              dinner: {
                foodId: "",
                restaurantId: "",
                confirmed: false,
                paid: false,
              },
            };

            const isToday = dateString === today;
            const isPast = new Date(dateString) < new Date(today);

            return (
              <Box key={dateString}>
                <Card
                  sx={{
                    height: "100%",
                    border: isToday ? "2px solid" : "1px solid",
                    borderColor: isToday ? "primary.main" : "grey.200",
                    opacity: isPast ? 0.7 : 1,
                    background: isToday
                      ? "linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)"
                      : "white",
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          ...getTypographyStyles(language, "h6"),
                          color: isToday ? "primary.main" : "text.primary",
                        }}
                      >
                        {formatDate(day, language, { weekday: "long" })}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {formatDate(day, language, {
                          day: "numeric",
                          month: "short",
                        })}
                      </Typography>
                    </Box>

                    <Stack spacing={2}>
                      {(["breakfast", "lunch", "dinner"] as const).map(
                        (meal) => {
                          const mealData = dayData[meal];
                          const mealLabel =
                            meal === "breakfast"
                              ? language === "fa"
                                ? "صبحانه"
                                : "Breakfast"
                              : meal === "lunch"
                              ? language === "fa"
                                ? "ناهار"
                                : "Lunch"
                              : language === "fa"
                              ? "شام"
                              : "Dinner";

                          return (
                            <Card
                              key={meal}
                              variant="outlined"
                              sx={{
                                p: 1.5,
                                backgroundColor: mealData.paid
                                  ? "success.50"
                                  : mealData.confirmed
                                  ? "warning.50"
                                  : "grey.50",
                                border: mealData.paid
                                  ? "1px solid green"
                                  : mealData.confirmed
                                  ? "1px solid orange"
                                  : undefined,
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  ...getTypographyStyles(language, "body2"),
                                  fontWeight: 600,
                                  mb: 1,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <RestaurantIcon fontSize="small" />
                                {mealLabel}
                                {mealData.paid && (
                                  <Chip
                                    size="small"
                                    label={
                                      language === "fa" ? "پرداخت شده" : "Paid"
                                    }
                                    color="success"
                                    sx={{ fontSize: "0.7rem", height: "20px" }}
                                  />
                                )}
                                {mealData.confirmed && !mealData.paid && (
                                  <Chip
                                    size="small"
                                    label={
                                      language === "fa"
                                        ? "تأیید شده"
                                        : "Confirmed"
                                    }
                                    color="warning"
                                    sx={{ fontSize: "0.7rem", height: "20px" }}
                                  />
                                )}
                              </Typography>

                              {/* Food Selection */}
                              <Box sx={{ mb: 1 }}>
                                <Button
                                  fullWidth
                                  variant="outlined"
                                  size="small"
                                  onClick={() =>
                                    toggleMealExpansion(`${dateString}_${meal}`)
                                  }
                                  endIcon={
                                    expandedMeals[`${dateString}_${meal}`] ? (
                                      <ExpandLessIcon />
                                    ) : (
                                      <ExpandMoreIcon />
                                    )
                                  }
                                  disabled={isPast || mealData.paid}
                                  sx={{
                                    fontSize: "0.75rem",
                                    fontFamily: isRTL
                                      ? "var(--font-persian)"
                                      : "var(--font-english)",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  {mealData.foodId
                                    ? (() => {
                                        const selectedFood =
                                          dataService.getFoodById(
                                            mealData.foodId
                                          );
                                        return selectedFood
                                          ? language === "fa"
                                            ? selectedFood.name
                                            : selectedFood.nameEn
                                          : language === "fa"
                                          ? "غذا انتخاب کنید"
                                          : "Select food";
                                      })()
                                    : language === "fa"
                                    ? "غذا انتخاب کنید"
                                    : "Select food"}
                                </Button>

                                <Collapse
                                  in={expandedMeals[`${dateString}_${meal}`]}
                                >
                                  <Card
                                    variant="outlined"
                                    sx={{
                                      mt: 1,
                                      maxHeight: 300,
                                      overflow: "auto",
                                    }}
                                  >
                                    <List dense>
                                      {foodOptions[
                                        meal as keyof typeof foodOptions
                                      ]?.map((food) => (
                                        <ListItem
                                          key={food.id}
                                          onClick={() => {
                                            handleMealSelect(
                                              dateString,
                                              meal,
                                              "foodId",
                                              food.id
                                            );
                                            toggleMealExpansion(
                                              `${dateString}_${meal}`
                                            );
                                          }}
                                          sx={{
                                            py: 1,
                                            borderRadius: 1,
                                            mb: 0.5,
                                            cursor: "pointer",
                                            backgroundColor:
                                              mealData.foodId === food.id
                                                ? "primary.50"
                                                : "transparent",
                                            opacity:
                                              isPast || mealData.paid ? 0.5 : 1,
                                            pointerEvents:
                                              isPast || mealData.paid
                                                ? "none"
                                                : "auto",
                                          }}
                                        >
                                          <Box
                                            sx={{
                                              display: "flex",
                                              gap: 1,
                                              width: "100%",
                                              alignItems: "center",
                                            }}
                                          >
                                            {food.imageUrl && (
                                              <CardMedia
                                                component="img"
                                                image={food.imageUrl}
                                                alt={food.name}
                                                sx={{
                                                  width: 40,
                                                  height: 40,
                                                  borderRadius: 1,
                                                  objectFit: "cover",
                                                }}
                                              />
                                            )}
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                              <ListItemText
                                                primary={
                                                  <Box
                                                    sx={{
                                                      display: "flex",
                                                      alignItems: "center",
                                                      gap: 0.5,
                                                      flexWrap: "wrap",
                                                    }}
                                                  >
                                                    <Typography
                                                      variant="body2"
                                                      sx={{
                                                        fontSize: "0.75rem",
                                                        fontWeight: 500,
                                                        fontFamily: isRTL
                                                          ? "var(--font-persian)"
                                                          : "var(--font-english)",
                                                      }}
                                                    >
                                                      {language === "fa"
                                                        ? food.name
                                                        : food.nameEn}
                                                    </Typography>
                                                    {food.isPopular && (
                                                      <Chip
                                                        icon={<PopularIcon />}
                                                        label={
                                                          language === "fa"
                                                            ? "محبوب"
                                                            : "Popular"
                                                        }
                                                        size="small"
                                                        color="warning"
                                                        sx={{
                                                          fontSize: "0.6rem",
                                                          height: "16px",
                                                        }}
                                                      />
                                                    )}
                                                    {food.isVegetarian && (
                                                      <Chip
                                                        icon={
                                                          <VegetarianIcon />
                                                        }
                                                        label={
                                                          language === "fa"
                                                            ? "گیاهی"
                                                            : "Veg"
                                                        }
                                                        size="small"
                                                        color="success"
                                                        sx={{
                                                          fontSize: "0.6rem",
                                                          height: "16px",
                                                        }}
                                                      />
                                                    )}
                                                    {food.discount && (
                                                      <Chip
                                                        label={`-${food.discount}%`}
                                                        size="small"
                                                        color="error"
                                                        sx={{
                                                          fontSize: "0.6rem",
                                                          height: "16px",
                                                        }}
                                                      />
                                                    )}
                                                  </Box>
                                                }
                                                secondary={
                                                  <Box sx={{ mt: 0.5 }}>
                                                    <Box
                                                      sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 1,
                                                        flexWrap: "wrap",
                                                      }}
                                                    >
                                                      <Box
                                                        sx={{
                                                          display: "flex",
                                                          alignItems: "center",
                                                          gap: 0.5,
                                                        }}
                                                      >
                                                        <CaloriesIcon
                                                          sx={{
                                                            fontSize: "12px",
                                                            color:
                                                              "text.secondary",
                                                          }}
                                                        />
                                                        <Typography
                                                          variant="caption"
                                                          color="text.secondary"
                                                          component="span"
                                                        >
                                                          {food.calories} cal
                                                        </Typography>
                                                      </Box>
                                                      <Typography
                                                        variant="caption"
                                                        color="primary.main"
                                                        sx={{ fontWeight: 600 }}
                                                        component="span"
                                                      >
                                                        {food.originalPrice &&
                                                        food.originalPrice >
                                                          food.price ? (
                                                          <>
                                                            <span
                                                              style={{
                                                                textDecoration:
                                                                  "line-through",
                                                                color: "#999",
                                                                marginRight:
                                                                  "4px",
                                                              }}
                                                            >
                                                              {formatCurrency(
                                                                food.originalPrice,
                                                                language
                                                              )}
                                                            </span>
                                                            {formatCurrency(
                                                              food.price,
                                                              language
                                                            )}
                                                          </>
                                                        ) : (
                                                          formatCurrency(
                                                            food.price,
                                                            language
                                                          )
                                                        )}
                                                      </Typography>
                                                    </Box>
                                                  </Box>
                                                }
                                              />
                                            </Box>
                                          </Box>
                                        </ListItem>
                                      ))}
                                    </List>
                                  </Card>
                                </Collapse>
                              </Box>

                              {/* Restaurant Selection */}
                              <FormControl
                                fullWidth
                                size="small"
                                sx={{ mb: 1 }}
                              >
                                <Select
                                  value={mealData.restaurantId || ""}
                                  onChange={(e: SelectChangeEvent) =>
                                    handleMealSelect(
                                      dateString,
                                      meal,
                                      "restaurantId",
                                      e.target.value
                                    )
                                  }
                                  displayEmpty
                                  disabled={isPast || mealData.paid}
                                  sx={{
                                    fontSize: "0.8rem",
                                    fontFamily: isRTL
                                      ? "var(--font-persian)"
                                      : "var(--font-english)",
                                  }}
                                >
                                  <MenuItem value="">
                                    <em>
                                      {language === "fa"
                                        ? "سلف انتخاب کنید"
                                        : "Select cafeteria"}
                                    </em>
                                  </MenuItem>
                                  {restaurantOptions.map((restaurant) => (
                                    <MenuItem
                                      key={restaurant.id}
                                      value={restaurant.id}
                                    >
                                      <Box
                                        sx={{
                                          display: "flex",
                                          flexDirection: "column",
                                          width: "100%",
                                        }}
                                      >
                                        <Typography
                                          sx={{
                                            fontSize: "0.8rem",
                                            fontWeight: 500,
                                          }}
                                        >
                                          {language === "fa"
                                            ? restaurant.name
                                            : restaurant.nameEn}
                                        </Typography>
                                        <Typography
                                          sx={{
                                            fontSize: "0.7rem",
                                            color: "text.secondary",
                                          }}
                                        >
                                          {language === "fa"
                                            ? restaurant.location
                                            : restaurant.locationEn}
                                        </Typography>
                                      </Box>
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>

                              {/* Action Buttons */}
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1,
                                  flexWrap: "wrap",
                                }}
                              >
                                {!mealData.paid && (
                                  <>
                                    {!mealData.confirmed ? (
                                      <Button
                                        size="small"
                                        variant="contained"
                                        color="primary"
                                        startIcon={<ConfirmIcon />}
                                        onClick={() =>
                                          handleReservationAction(
                                            dateString,
                                            meal,
                                            "confirm"
                                          )
                                        }
                                        disabled={
                                          isPast ||
                                          !mealData.foodId ||
                                          !mealData.restaurantId
                                        }
                                        sx={{
                                          fontSize: "0.7rem",
                                          minWidth: "auto",
                                          px: 1,
                                          fontFamily: isRTL
                                            ? "var(--font-persian)"
                                            : "var(--font-english)",
                                        }}
                                      >
                                        {language === "fa"
                                          ? "تأیید"
                                          : "Confirm"}
                                      </Button>
                                    ) : (
                                      <Button
                                        size="small"
                                        variant="contained"
                                        color="success"
                                        startIcon={<PaymentIcon />}
                                        onClick={() =>
                                          handleReservationAction(
                                            dateString,
                                            meal,
                                            "confirm"
                                          )
                                        }
                                        sx={{
                                          fontSize: "0.7rem",
                                          minWidth: "auto",
                                          px: 1,
                                          fontFamily: isRTL
                                            ? "var(--font-persian)"
                                            : "var(--font-english)",
                                        }}
                                      >
                                        {language === "fa" ? "پرداخت" : "Pay"}
                                      </Button>
                                    )}
                                  </>
                                )}

                                {(mealData.confirmed || mealData.paid) && (
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    startIcon={<CancelIcon />}
                                    onClick={() =>
                                      handleReservationAction(
                                        dateString,
                                        meal,
                                        "cancel"
                                      )
                                    }
                                    disabled={isPast}
                                    sx={{
                                      fontSize: "0.7rem",
                                      minWidth: "auto",
                                      px: 1,
                                      fontFamily: isRTL
                                        ? "var(--font-persian)"
                                        : "var(--font-english)",
                                    }}
                                  >
                                    {language === "fa" ? "لغو" : "Cancel"}
                                  </Button>
                                )}

                                {mealData.faramushiCode && (
                                  <Tooltip
                                    title={
                                      language === "fa"
                                        ? "کپی کد فرموشی"
                                        : "Copy Faramushi code"
                                    }
                                  >
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        navigator.clipboard.writeText(
                                          mealData.faramushiCode!
                                        );
                                        setSuccessMessage(
                                          language === "fa"
                                            ? "کد کپی شد"
                                            : "Code copied"
                                        );
                                        setShowSuccess(true);
                                      }}
                                    >
                                      <Badge
                                        badgeContent={mealData.faramushiCode}
                                        color="primary"
                                      >
                                        <CopyIcon fontSize="small" />
                                      </Badge>
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Box>
                            </Card>
                          );
                        }
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            );
          })}
        </Box>

        {/* Payment Dialog */}
        <Dialog
          open={paymentDialog}
          onClose={() => setPaymentDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={getTypographyStyles(language, "h6")}>
            {language === "fa"
              ? "تأیید رزرو و پرداخت"
              : "Confirm Reservation & Payment"}
          </DialogTitle>
          <DialogContent>
            {selectedMeal && (
              <Stack spacing={3}>
                <Box>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={getTypographyStyles(language, "h6")}
                  >
                    {language === "fa" ? "جزئیات رزرو" : "Reservation Details"}
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                    <Typography variant="body2">
                      <strong>{language === "fa" ? "تاریخ:" : "Date:"}</strong>{" "}
                      {formatDate(new Date(selectedMeal.date), language)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>{language === "fa" ? "وعده:" : "Meal:"}</strong>{" "}
                      {selectedMeal.meal === "breakfast"
                        ? language === "fa"
                          ? "صبحانه"
                          : "Breakfast"
                        : selectedMeal.meal === "lunch"
                        ? language === "fa"
                          ? "ناهار"
                          : "Lunch"
                        : language === "fa"
                        ? "شام"
                        : "Dinner"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>{language === "fa" ? "غذا:" : "Food:"}</strong>{" "}
                      {(() => {
                        const food = dataService.getFoodById(
                          selectedMeal.data.foodId
                        );
                        return food
                          ? language === "fa"
                            ? food.name
                            : food.nameEn
                          : selectedMeal.data.foodId;
                      })()}
                    </Typography>
                    <Typography variant="body2">
                      <strong>
                        {language === "fa" ? "رستوران:" : "Restaurant:"}
                      </strong>{" "}
                      {(() => {
                        const restaurant = dataService.getRestaurantById(
                          selectedMeal.data.restaurantId
                        );
                        return restaurant
                          ? language === "fa"
                            ? restaurant.name
                            : restaurant.nameEn
                          : selectedMeal.data.restaurantId;
                      })()}
                    </Typography>
                  </Paper>
                </Box>

                <Box>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={getTypographyStyles(language, "h6")}
                  >
                    {language === "fa" ? "محاسبه قیمت" : "Price Calculation"}
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                    {(() => {
                      const foodItem = dataService.getFoodById(
                        selectedMeal.data.foodId
                      );
                      const originalPrice = foodItem?.price || 0;
                      const discountAmount =
                        selectedMeal.data.discountAmount || 0;
                      const finalPrice =
                        originalPrice * (1 - discountAmount / 100);

                      return (
                        <>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography variant="body2">
                              {language === "fa"
                                ? "قیمت اصلی:"
                                : "Original Price:"}
                            </Typography>
                            <Typography variant="body2">
                              {formatCurrency(originalPrice, language)}
                            </Typography>
                          </Box>
                          {discountAmount > 0 && (
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                color: "success.main",
                              }}
                            >
                              <Typography variant="body2">
                                {language === "fa"
                                  ? `تخفیف (${discountAmount}%):`
                                  : `Discount (${discountAmount}%):`}
                              </Typography>
                              <Typography variant="body2">
                                -
                                {formatCurrency(
                                  originalPrice * (discountAmount / 100),
                                  language
                                )}
                              </Typography>
                            </Box>
                          )}
                          <Divider sx={{ my: 1 }} />
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontWeight: "bold",
                            }}
                          >
                            <Typography variant="h6">
                              {language === "fa"
                                ? "مبلغ نهایی:"
                                : "Final Amount:"}
                            </Typography>
                            <Typography variant="h6" color="primary">
                              {formatCurrency(finalPrice, language)}
                            </Typography>
                          </Box>
                        </>
                      );
                    })()}
                  </Paper>
                </Box>

                <Box>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<DiscountIcon />}
                    onClick={() => setDiscountDialog(true)}
                    sx={{
                      fontFamily: isRTL
                        ? "var(--font-persian)"
                        : "var(--font-english)",
                    }}
                  >
                    {language === "fa"
                      ? "اعمال کد تخفیف"
                      : "Apply Discount Code"}
                  </Button>
                </Box>

                <FormControl fullWidth>
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    sx={getTypographyStyles(language, "body2")}
                  >
                    {language === "fa" ? "روش پرداخت" : "Payment Method"}
                  </Typography>
                  <Select
                    value={paymentMethod}
                    onChange={(e: SelectChangeEvent) =>
                      setPaymentMethod(e.target.value)
                    }
                    sx={{
                      fontFamily: isRTL
                        ? "var(--font-persian)"
                        : "var(--font-english)",
                    }}
                  >
                    <MenuItem value="wallet">
                      {language === "fa" ? "کیف پول" : "Wallet"}
                    </MenuItem>
                    <MenuItem value="gateway">
                      {language === "fa"
                        ? "درگاه پرداخت آنلاین"
                        : "Online Payment Gateway"}
                    </MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setPaymentDialog(false)}
              sx={{
                fontFamily: isRTL
                  ? "var(--font-persian)"
                  : "var(--font-english)",
              }}
            >
              {language === "fa" ? "انصراف" : "Cancel"}
            </Button>
            <Button
              onClick={handlePayment}
              variant="contained"
              sx={{
                fontFamily: isRTL
                  ? "var(--font-persian)"
                  : "var(--font-english)",
              }}
            >
              {language === "fa" ? "پرداخت و تأیید" : "Pay & Confirm"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Discount Dialog */}
        <Dialog
          open={discountDialog}
          onClose={() => setDiscountDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={getTypographyStyles(language, "h6")}>
            {language === "fa" ? "کد تخفیف" : "Discount Code"}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label={language === "fa" ? "کد تخفیف" : "Discount Code"}
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                placeholder={
                  language === "fa"
                    ? "کد تخفیف را وارد کنید"
                    : "Enter discount code"
                }
                sx={{
                  "& .MuiInputBase-input": {
                    fontFamily: isRTL
                      ? "var(--font-persian)"
                      : "var(--font-english)",
                  },
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {language === "fa"
                  ? "کدهای موجود: STUDENT10, WELCOME20, SAVE15, FIRST25"
                  : "Available codes: STUDENT10, WELCOME20, SAVE15, FIRST25"}
              </Typography>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDiscountDialog(false)}
              sx={{
                fontFamily: isRTL
                  ? "var(--font-persian)"
                  : "var(--font-english)",
              }}
            >
              {language === "fa" ? "انصراف" : "Cancel"}
            </Button>
            <Button
              onClick={applyDiscountCode}
              variant="contained"
              disabled={!discountCode}
              sx={{
                fontFamily: isRTL
                  ? "var(--font-persian)"
                  : "var(--font-english)",
              }}
            >
              {language === "fa" ? "اعمال تخفیف" : "Apply Discount"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success Snackbar */}
        <Snackbar
          open={showSuccess}
          autoHideDuration={4000}
          onClose={() => setShowSuccess(false)}
          message={successMessage}
        />

        {/* Error Snackbar */}
        <Snackbar
          open={showError}
          autoHideDuration={4000}
          onClose={() => setShowError(false)}
        >
          <Alert onClose={() => setShowError(false)} severity="error">
            {errorMessage}
          </Alert>
        </Snackbar>
      </Stack>
    </Box>
  );
};

export default WeeklySchedule;
