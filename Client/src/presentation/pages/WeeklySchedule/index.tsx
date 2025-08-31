import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Card,
  CardContent,
  Grid,
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
} from "@mui/material";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  Restaurant as RestaurantIcon,
  Schedule as ScheduleIcon,
  Payment as PaymentIcon,
  LocalOffer as DiscountIcon,
  Cancel as CancelIcon,
  CheckCircle as ConfirmIcon,
  Receipt as ReceiptIcon,
  ContentCopy as CopyIcon,
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

interface FoodItem {
  id: string;
  name: string;
  nameEn: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  ingredients: string[];
  ingredientsEn: string[];
  description: string;
  descriptionEn: string;
  calories: number;
  imageUrl: string;
  isPopular?: boolean;
  isVegetarian?: boolean;
  isAvailable?: boolean;
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
  confirmed: boolean;
  paid: boolean;
  discountCode?: string;
  discountAmount?: number;
  faramushiCode?: string;
}

interface DayReservations {
  breakfast: MealReservation;
  lunch: MealReservation;
  dinner: MealReservation;
}

interface WeekData {
  [date: string]: DayReservations;
}

const WeeklySchedule = () => {
  const { language, t, isRTL } = useLanguage();
  const componentStyles = createComponentStyles(language);
  const [user, setUser] = useState<any>(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [weekData, setWeekData] = useState<WeekData>({});
  const [selectedMeal, setSelectedMeal] = useState<{
    date: string;
    meal: string;
    data: MealReservation;
  } | null>(null);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [discountDialog, setDiscountDialog] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [faramushiCode, setFaramushiCode] = useState("");

  // Sample foods data (in a real app, this would come from an API)
  const foods: Record<string, FoodItem[]> = {
    breakfast: [
      {
        id: "b1",
        name: "نان و پنیر و چای",
        nameEn: "Bread, Cheese & Tea",
        price: 15000,
        ingredients: ["نان تازه", "پنیر سفید", "چای سیاه", "عسل"],
        ingredientsEn: ["Fresh bread", "White cheese", "Black tea", "Honey"],
        description: "صبحانه سنتی ایرانی",
        descriptionEn: "Traditional Iranian breakfast",
        calories: 320,
        imageUrl: "/api/placeholder/300/200",
        isPopular: true,
        isVegetarian: true,
        isAvailable: true,
      },
      {
        id: "b2",
        name: "تخم مرغ و نان",
        nameEn: "Eggs & Bread",
        price: 25000,
        originalPrice: 28000,
        discount: 10,
        ingredients: ["تخم مرغ", "نان", "کره", "فلفل"],
        ingredientsEn: ["Eggs", "Bread", "Butter", "Pepper"],
        description: "تخم مرغ آب پز با نان تازه",
        descriptionEn: "Boiled eggs with fresh bread",
        calories: 280,
        imageUrl: "/api/placeholder/300/200",
        isAvailable: true,
      },
    ],
    lunch: [
      {
        id: "l1",
        name: "چلو کباب",
        nameEn: "Rice & Kebab",
        price: 45000,
        ingredients: ["برنج", "گوشت کباب", "زعفران", "پیاز"],
        ingredientsEn: ["Rice", "Kebab meat", "Saffron", "Onion"],
        description: "برنج زعفرانی با کباب",
        descriptionEn: "Saffron rice with kebab",
        calories: 650,
        imageUrl: "/api/placeholder/300/200",
        isPopular: true,
        isAvailable: true,
      },
      {
        id: "l2",
        name: "قورمه سبزی",
        nameEn: "Ghormeh Sabzi",
        price: 40000,
        ingredients: ["سبزی قورمه", "لوبیا", "گوشت", "برنج"],
        ingredientsEn: ["Herbs", "Beans", "Meat", "Rice"],
        description: "خورشت سبزی با گوشت",
        descriptionEn: "Herb stew with meat",
        calories: 520,
        imageUrl: "/api/placeholder/300/200",
        isVegetarian: false,
        isAvailable: true,
      },
    ],
    dinner: [
      {
        id: "d1",
        name: "سوپ و سالاد",
        nameEn: "Soup & Salad",
        price: 22000,
        ingredients: ["سبزیجات", "آب مرغ", "کاهو", "گوجه"],
        ingredientsEn: ["Vegetables", "Chicken broth", "Lettuce", "Tomato"],
        description: "سوپ گرم با سالاد تازه",
        descriptionEn: "Warm soup with fresh salad",
        calories: 180,
        imageUrl: "/api/placeholder/300/200",
        isVegetarian: true,
        isAvailable: true,
      },
    ],
  };

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
  ];

  const discountCodes = {
    "STUDENT10": 10,
    "WELCOME20": 20,
    "SAVE15": 15,
    "FIRST25": 25,
  };

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
        const dateString = date.toISOString().split('T')[0];
        
        const savedData = localStorage.getItem(`weekly_reservations_${userId}_${dateString}`);
        if (savedData) {
          weekData[dateString] = JSON.parse(savedData);
        } else {
          weekData[dateString] = {
            breakfast: { food: "", restaurant: "", confirmed: false, paid: false },
            lunch: { food: "", restaurant: "", confirmed: false, paid: false },
            dinner: { food: "", restaurant: "", confirmed: false, paid: false },
          };
        }
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

  const handleMealSelect = (date: string, meal: string, field: 'food' | 'restaurant', value: string) => {
    setWeekData(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        [meal]: {
          ...prev[date][meal],
          [field]: value,
          confirmed: false,
          paid: false,
        }
      }
    }));
  };

  const handleReservationAction = (date: string, meal: string, action: 'confirm' | 'cancel' | 'pay') => {
    const mealData = weekData[date][meal as keyof DayReservations];
    
    if (action === 'confirm') {
      if (!mealData.food || !mealData.restaurant) {
        setErrorMessage(language === "fa" ? "لطفاً غذا و رستوران را انتخاب کنید" : "Please select food and restaurant");
        setShowError(true);
        return;
      }
      setSelectedMeal({ date, meal, data: mealData });
      setPaymentDialog(true);
    } else if (action === 'cancel') {
      setWeekData(prev => ({
        ...prev,
        [date]: {
          ...prev[date],
          [meal]: {
            food: "",
            restaurant: "",
            confirmed: false,
            paid: false,
            discountCode: undefined,
            discountAmount: undefined,
            faramushiCode: undefined,
          }
        }
      }));
      saveWeekData(date);
      setSuccessMessage(language === "fa" ? "رزرو لغو شد" : "Reservation cancelled");
      setShowSuccess(true);
    }
  };

  const generateFaramushiCode = () => {
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    setFaramushiCode(code);
    return code;
  };

  const applyDiscountCode = () => {
    const discount = discountCodes[discountCode as keyof typeof discountCodes];
    if (discount && selectedMeal) {
      const updatedMeal = {
        ...selectedMeal,
        data: {
          ...selectedMeal.data,
          discountCode,
          discountAmount: discount,
        }
      };
      setSelectedMeal(updatedMeal);
      setDiscountDialog(false);
      setSuccessMessage(language === "fa" ? `تخفیف ${discount}% اعمال شد` : `${discount}% discount applied`);
      setShowSuccess(true);
    } else {
      setErrorMessage(language === "fa" ? "کد تخفیف نامعتبر است" : "Invalid discount code");
      setShowError(true);
    }
    setDiscountCode("");
  };

  const handlePayment = async () => {
    if (!selectedMeal || !user) return;

    try {
      const { date, meal, data } = selectedMeal;
      const foodItem = foods[meal]?.find(f => f.name === data.food || f.nameEn === data.food);
      
      if (!foodItem) {
        setErrorMessage(language === "fa" ? "غذای انتخابی یافت نشد" : "Selected food not found");
        setShowError(true);
        return;
      }

      let finalPrice = foodItem.price;
      if (data.discountAmount) {
        finalPrice = finalPrice * (1 - data.discountAmount / 100);
      }

      // Check wallet balance
      const userBalance = parseFloat(localStorage.getItem(`balance_${user.id}`) || "0");
      if (paymentMethod === "wallet" && userBalance < finalPrice) {
        setErrorMessage(language === "fa" ? "موجودی کافی نیست" : "Insufficient balance");
        setShowError(true);
        return;
      }

      // Generate Faramushi code
      const faramushiCode = generateFaramushiCode();

      // Update reservation
      const updatedMeal = {
        ...data,
        confirmed: true,
        paid: true,
        faramushiCode,
      };

      setWeekData(prev => ({
        ...prev,
        [date]: {
          ...prev[date],
          [meal]: updatedMeal
        }
      }));

      // Update user balance if wallet payment
      if (paymentMethod === "wallet") {
        const newBalance = userBalance - finalPrice;
        localStorage.setItem(`balance_${user.id}`, newBalance.toString());
        
        // Add transaction
        const transactions = JSON.parse(localStorage.getItem(`transactions_${user.id}`) || "[]");
        const newTransaction = {
          id: Date.now().toString(),
          type: "debit",
          amount: finalPrice,
          date: new Date().toISOString().split("T")[0],
          description: `${language === "fa" ? "رزرو غذا" : "Meal reservation"} - ${foodItem.name}`,
          category: "food",
        };
        transactions.unshift(newTransaction);
        localStorage.setItem(`transactions_${user.id}`, JSON.stringify(transactions));
      }

      saveWeekData(date);
      setPaymentDialog(false);
      setSelectedMeal(null);
      setSuccessMessage(
        `${language === "fa" ? "رزرو تأیید شد. کد فرموشی:" : "Reservation confirmed. Faramushi code:"} ${faramushiCode}`
      );
      setShowSuccess(true);
      
    } catch (error) {
      console.error("Payment error:", error);
      setErrorMessage(language === "fa" ? "خطا در پردازش پرداخت" : "Payment processing error");
      setShowError(true);
    }
  };

  const saveWeekData = (date: string) => {
    if (!user) return;
    try {
      localStorage.setItem(
        `weekly_reservations_${user.id}_${date}`,
        JSON.stringify(weekData[date])
      );
    } catch (error) {
      console.error("Error saving week data:", error);
    }
  };

  const getMealPrice = (meal: string, foodName: string) => {
    const foodItem = foods[meal]?.find(f => f.name === foodName || f.nameEn === foodName);
    return foodItem?.price || 0;
  };

  const calculateWeekTotal = () => {
    return Object.entries(weekData).reduce((total, [date, dayData]) => {
      return total + Object.entries(dayData).reduce((dayTotal, [meal, mealData]) => {
        if (mealData.confirmed && mealData.food) {
          let price = getMealPrice(meal, mealData.food);
          if (mealData.discountAmount) {
            price = price * (1 - mealData.discountAmount / 100);
          }
          return dayTotal + price;
        }
        return dayTotal;
      }, 0);
    }, 0);
  };

  const weekDays = getWeekDays();
  const today = new Date().toISOString().split('T')[0];
  const weekTotal = calculateWeekTotal();

  if (isLoading) {
    return (
      <Box sx={{ py: 4, width: "100%", display: "flex", justifyContent: "center" }}>
        <Alert severity="info">{language === "fa" ? "در حال بارگذاری..." : "Loading..."}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={componentStyles.dashboard.container}>
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: isRTL ? "row-reverse" : "row",
        }}>
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
              sx={{ fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)" }}
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
          <Box sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            mb: 2,
          }}>
            <Typography variant="h6" sx={getTypographyStyles(language, "h6")}>
              {formatDate(weekDays[0], language, { 
                month: 'long', 
                day: 'numeric' 
              })} - {formatDate(weekDays[6], language, { 
                month: 'long', 
                day: 'numeric' 
              })}
            </Typography>
            
            <Chip 
              label={`${language === "fa" ? "هزینه کل هفته:" : "Week Total:"} ${formatCurrency(weekTotal, language)}`}
              color="primary"
              variant="outlined"
              sx={{ fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)" }}
            />
          </Box>
        </Paper>

        {/* Weekly Calendar */}
        <Grid container spacing={3}>
          {weekDays.map((day, index) => {
            const dateString = day.toISOString().split('T')[0];
            const dayData = weekData[dateString] || {
              breakfast: { food: "", restaurant: "", confirmed: false, paid: false },
              lunch: { food: "", restaurant: "", confirmed: false, paid: false },
              dinner: { food: "", restaurant: "", confirmed: false, paid: false },
            };
            
            const isToday = dateString === today;
            const isPast = new Date(dateString) < new Date(today);

            return (
              <Grid item xs={12} sm={6} lg={3} key={dateString}>
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
                    <Box sx={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center", 
                      mb: 2 
                    }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          ...getTypographyStyles(language, "h6"),
                          color: isToday ? "primary.main" : "text.primary",
                        }}
                      >
                        {formatDate(day, language, { weekday: 'long' })}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(day, language, { day: 'numeric', month: 'short' })}
                      </Typography>
                    </Box>

                    <Stack spacing={2}>
                      {(["breakfast", "lunch", "dinner"] as const).map((meal) => {
                        const mealData = dayData[meal];
                        const mealLabel = meal === "breakfast" 
                          ? (language === "fa" ? "صبحانه" : "Breakfast")
                          : meal === "lunch"
                          ? (language === "fa" ? "ناهار" : "Lunch")
                          : (language === "fa" ? "شام" : "Dinner");

                        return (
                          <Card 
                            key={meal}
                            variant="outlined" 
                            sx={{
                              p: 1.5,
                              backgroundColor: mealData.paid ? "success.50" : 
                                             mealData.confirmed ? "warning.50" : 
                                             "grey.50",
                              border: mealData.paid ? "1px solid green" : 
                                     mealData.confirmed ? "1px solid orange" : undefined,
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
                                  label={language === "fa" ? "پرداخت شده" : "Paid"} 
                                  color="success"
                                  sx={{ fontSize: "0.7rem", height: "20px" }}
                                />
                              )}
                              {mealData.confirmed && !mealData.paid && (
                                <Chip 
                                  size="small" 
                                  label={language === "fa" ? "تأیید شده" : "Confirmed"} 
                                  color="warning"
                                  sx={{ fontSize: "0.7rem", height: "20px" }}
                                />
                              )}
                            </Typography>

                            {/* Food Selection */}
                            <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                              <Select
                                value={mealData.food}
                                onChange={(e: SelectChangeEvent) =>
                                  handleMealSelect(dateString, meal, 'food', e.target.value)
                                }
                                displayEmpty
                                disabled={isPast || mealData.paid}
                                sx={{
                                  fontSize: "0.8rem",
                                  fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                                }}
                              >
                                <MenuItem value="">
                                  <em>{language === "fa" ? "غذا انتخاب کنید" : "Select food"}</em>
                                </MenuItem>
                                {foods[meal]?.map((food) => (
                                  <MenuItem key={food.id} value={food.name}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                                      <Typography sx={{ fontSize: "0.8rem" }}>
                                        {language === "fa" ? food.name : food.nameEn}
                                      </Typography>
                                      <Typography sx={{ fontSize: "0.7rem", color: "primary.main" }}>
                                        {formatCurrency(food.price, language)}
                                      </Typography>
                                    </Box>
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>

                            {/* Restaurant Selection */}
                            <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                              <Select
                                value={mealData.restaurant}
                                onChange={(e: SelectChangeEvent) =>
                                  handleMealSelect(dateString, meal, 'restaurant', e.target.value)
                                }
                                displayEmpty
                                disabled={isPast || mealData.paid}
                                sx={{
                                  fontSize: "0.8rem",
                                  fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                                }}
                              >
                                <MenuItem value="">
                                  <em>{language === "fa" ? "سلف انتخاب کنید" : "Select cafeteria"}</em>
                                </MenuItem>
                                {restaurants.map((restaurant) => (
                                  <MenuItem key={restaurant.id} value={restaurant.id}>
                                    <Typography sx={{ fontSize: "0.8rem" }}>
                                      {language === "fa" ? restaurant.name : restaurant.nameEn}
                                    </Typography>
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>

                            {/* Action Buttons */}
                            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                              {!mealData.paid && (
                                <>
                                  {!mealData.confirmed ? (
                                    <Button
                                      size="small"
                                      variant="contained"
                                      color="primary"
                                      startIcon={<ConfirmIcon />}
                                      onClick={() => handleReservationAction(dateString, meal, 'confirm')}
                                      disabled={isPast || !mealData.food || !mealData.restaurant}
                                      sx={{ 
                                        fontSize: "0.7rem",
                                        minWidth: "auto",
                                        px: 1,
                                        fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                                      }}
                                    >
                                      {language === "fa" ? "تأیید" : "Confirm"}
                                    </Button>
                                  ) : (
                                    <Button
                                      size="small"
                                      variant="contained"
                                      color="success"
                                      startIcon={<PaymentIcon />}
                                      onClick={() => handleReservationAction(dateString, meal, 'confirm')}
                                      sx={{ 
                                        fontSize: "0.7rem",
                                        minWidth: "auto",
                                        px: 1,
                                        fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
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
                                  onClick={() => handleReservationAction(dateString, meal, 'cancel')}
                                  disabled={isPast}
                                  sx={{ 
                                    fontSize: "0.7rem",
                                    minWidth: "auto",
                                    px: 1,
                                    fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                                  }}
                                >
                                  {language === "fa" ? "لغو" : "Cancel"}
                                </Button>
                              )}

                              {mealData.faramushiCode && (
                                <Tooltip title={language === "fa" ? "کپی کد فرموشی" : "Copy Faramushi code"}>
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      navigator.clipboard.writeText(mealData.faramushiCode!);
                                      setSuccessMessage(language === "fa" ? "کد کپی شد" : "Code copied");
                                      setShowSuccess(true);
                                    }}
                                  >
                                    <Badge badgeContent={mealData.faramushiCode} color="primary">
                                      <CopyIcon fontSize="small" />
                                    </Badge>
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          </Card>
                        );
                      })}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Payment Dialog */}
        <Dialog 
          open={paymentDialog} 
          onClose={() => setPaymentDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={getTypographyStyles(language, "h6")}>
            {language === "fa" ? "تأیید رزرو و پرداخت" : "Confirm Reservation & Payment"}
          </DialogTitle>
          <DialogContent>
            {selectedMeal && (
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" gutterBottom sx={getTypographyStyles(language, "h6")}>
                    {language === "fa" ? "جزئیات رزرو" : "Reservation Details"}
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                    <Typography variant="body2">
                      <strong>{language === "fa" ? "تاریخ:" : "Date:"}</strong> {formatDate(new Date(selectedMeal.date), language)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>{language === "fa" ? "وعده:" : "Meal:"}</strong> {
                        selectedMeal.meal === "breakfast" ? (language === "fa" ? "صبحانه" : "Breakfast") :
                        selectedMeal.meal === "lunch" ? (language === "fa" ? "ناهار" : "Lunch") :
                        (language === "fa" ? "شام" : "Dinner")
                      }
                    </Typography>
                    <Typography variant="body2">
                      <strong>{language === "fa" ? "غذا:" : "Food:"}</strong> {selectedMeal.data.food}
                    </Typography>
                    <Typography variant="body2">
                      <strong>{language === "fa" ? "رستوران:" : "Restaurant:"}</strong> {
                        restaurants.find(r => r.id === selectedMeal.data.restaurant)?.[language === "fa" ? "name" : "nameEn"]
                      }
                    </Typography>
                  </Paper>
                </Box>

                <Box>
                  <Typography variant="h6" gutterBottom sx={getTypographyStyles(language, "h6")}>
                    {language === "fa" ? "محاسبه قیمت" : "Price Calculation"}
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                    {(() => {
                      const foodItem = foods[selectedMeal.meal]?.find(f => f.name === selectedMeal.data.food || f.nameEn === selectedMeal.data.food);
                      const originalPrice = foodItem?.price || 0;
                      const discountAmount = selectedMeal.data.discountAmount || 0;
                      const finalPrice = originalPrice * (1 - discountAmount / 100);

                      return (
                        <>
                          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography variant="body2">
                              {language === "fa" ? "قیمت اصلی:" : "Original Price:"}
                            </Typography>
                            <Typography variant="body2">
                              {formatCurrency(originalPrice, language)}
                            </Typography>
                          </Box>
                          {discountAmount > 0 && (
                            <Box sx={{ display: "flex", justifyContent: "space-between", color: "success.main" }}>
                              <Typography variant="body2">
                                {language === "fa" ? `تخفیف (${discountAmount}%):` : `Discount (${discountAmount}%):`}
                              </Typography>
                              <Typography variant="body2">
                                -{formatCurrency(originalPrice * (discountAmount / 100), language)}
                              </Typography>
                            </Box>
                          )}
                          <Divider sx={{ my: 1 }} />
                          <Box sx={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                            <Typography variant="h6">
                              {language === "fa" ? "مبلغ نهایی:" : "Final Amount:"}
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
                    sx={{ fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)" }}
                  >
                    {language === "fa" ? "اعمال کد تخفیف" : "Apply Discount Code"}
                  </Button>
                </Box>

                <FormControl fullWidth>
                  <Typography variant="subtitle2" gutterBottom sx={getTypographyStyles(language, "body2")}>
                    {language === "fa" ? "روش پرداخت" : "Payment Method"}
                  </Typography>
                  <Select
                    value={paymentMethod}
                    onChange={(e: SelectChangeEvent) => setPaymentMethod(e.target.value)}
                    sx={{ fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)" }}
                  >
                    <MenuItem value="wallet">
                      {language === "fa" ? "کیف پول" : "Wallet"}
                    </MenuItem>
                    <MenuItem value="gateway">
                      {language === "fa" ? "درگاه پرداخت آنلاین" : "Online Payment Gateway"}
                    </MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setPaymentDialog(false)}
              sx={{ fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)" }}
            >
              {language === "fa" ? "انصراف" : "Cancel"}
            </Button>
            <Button 
              onClick={handlePayment} 
              variant="contained"
              sx={{ fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)" }}
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
                placeholder={language === "fa" ? "کد تخفیف را وارد کنید" : "Enter discount code"}
                sx={{
                  "& .MuiInputBase-input": {
                    fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                  },
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {language === "fa" ? "کدهای موجود: STUDENT10, WELCOME20, SAVE15, FIRST25" : "Available codes: STUDENT10, WELCOME20, SAVE15, FIRST25"}
              </Typography>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setDiscountDialog(false)}
              sx={{ fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)" }}
            >
              {language === "fa" ? "انصراف" : "Cancel"}
            </Button>
            <Button 
              onClick={applyDiscountCode} 
              variant="contained"
              disabled={!discountCode}
              sx={{ fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)" }}
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