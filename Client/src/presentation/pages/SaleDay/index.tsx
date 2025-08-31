import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Button,
  Container,
  Avatar,
  Alert,
  LinearProgress,
  Fade,
} from "@mui/material";
import {
  LocalOffer as SaleDayIcon,
  LocalOffer as LocalOfferIcon,
  Schedule as ScheduleIcon,
  FlashOn as FlashOnIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Timer as TimerIcon,
  Restaurant as RestaurantIcon,
  ShoppingCart as ShoppingCartIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import { useLanguage } from "../../contexts/LanguageContext";
import { formatCurrency, formatTime } from "../../utils/languageUtils";
import { getCurrentUser } from "../../utils/userUtils";
import DataService, {
  type FoodItem,
  type Restaurant,
  type MealReservation,
} from "../../services/dataService";

const SaleDay = () => {
  const { language, t, isRTL } = useLanguage();
  const dataService = DataService.getInstance();
  const [user, setUser] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [reservations, setReservations] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [saleDayFoods, setSaleDayFoods] = useState<FoodItem[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      loadEmergencyReservations(currentUser.id);
    } else {
      window.location.href = "/login";
    }

    // Load data from DataService
    const foods = dataService.getAllFoods();
    const emergencyFoods = foods.filter(
      (food) => food.isOnSale || (food.discount && food.discount > 0)
    );
    setSaleDayFoods(emergencyFoods);

    const restaurantData = dataService.getAllRestaurants();
    setRestaurants(restaurantData);

    setIsLoading(false);
  }, []);

  const loadEmergencyReservations = (userId: string) => {
    try {
      const savedReservations = localStorage.getItem(
        `emergency_reservations_${userId}`
      );
      if (savedReservations) {
        setReservations(JSON.parse(savedReservations));
      }
    } catch (error) {
      console.error("Error loading emergency reservations:", error);
    }
  };

  const saveEmergencyReservations = (
    newReservations: Record<string, boolean>
  ) => {
    if (!user) return;
    try {
      localStorage.setItem(
        `emergency_reservations_${user.id}`,
        JSON.stringify(newReservations)
      );
    } catch (error) {
      console.error("Error saving emergency reservations:", error);
    }
  };

  const availableFoods = useMemo(
    () =>
      saleDayFoods.filter(
        (food) => food.isAvailable && (food.availableQuantity ?? 0) > 0
      ),
    [saleDayFoods]
  );

  const handleEmergencyReservation = (foodId: string) => {
    if (!user) return;

    const food = saleDayFoods.find((f) => f.id === foodId);
    if (!food) return;

    // Create emergency reservation
    const reservation: MealReservation = {
      id: `emergency_${Date.now()}`,
      userId: user.id,
      foodId: foodId,
      restaurantId: restaurants[0]?.id || "default",
      date: new Date().toISOString().split("T")[0],
      meal: food.category as "breakfast" | "lunch" | "dinner",
      foodName: language === "fa" ? food.name : food.nameEn,
      restaurantName: restaurants[0]?.name || "Default",
      price: food.price,
      originalPrice: food.originalPrice || food.price,
      faramushiCode: dataService.generateFaramushiCode(),
      status: "pending",
      isEmergency: true,
      emergencyFee: food.emergencyFee || 0,
      quantity: 1,
      totalPrice: food.price,
      createdAt: new Date().toISOString(),
      reservationDate: new Date().toISOString(),
    };

    // Save to DataService
    dataService.saveReservation(reservation);

    const newReservations = {
      ...reservations,
      [foodId]: true,
    };
    setReservations(newReservations);
    saveEmergencyReservations(newReservations);

    // Show success message (in a real app, this would be a proper notification)
    alert(
      language === "fa"
        ? "رزرو اضطراری تأیید شد!"
        : "Emergency reservation confirmed!"
    );
  };

  const getStockPercentage = (food: FoodItem) => {
    return food.availableQuantity ? (food.availableQuantity / 100) * 100 : 50;
  };

  const getStockColor = (percentage: number) => {
    if (percentage > 50) return "success";
    if (percentage > 20) return "warning";
    return "error";
  };

  const getTimeRemaining = (endTime: Date) => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();

    if (diff <= 0) return null;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return language === "fa"
        ? `${hours} ساعت و ${minutes} دقیقه`
        : `${hours}h ${minutes}m`;
    }
    return language === "fa" ? `${minutes} دقیقه` : `${minutes}m`;
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Hero Section */}
        <Paper
          elevation={0}
          sx={{
            background: "linear-gradient(135deg, #ff6b35 0%, #f59e0b 100%)",
            color: "white",
            p: { xs: 3, md: 6 },
            borderRadius: 3,
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Animated background elements */}
          <Box
            sx={{
              position: "absolute",
              top: -20,
              left: -20,
              width: 80,
              height: 80,
              background: "rgba(255,255,255,0.1)",
              borderRadius: "50%",
              animation: "pulse 2s infinite",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: -30,
              right: -30,
              width: 120,
              height: 120,
              background: "rgba(255,255,255,0.05)",
              borderRadius: "50%",
              animation: "pulse 3s infinite",
            }}
          />

          <Avatar
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              width: 100,
              height: 100,
              margin: "0 auto 2rem",
              fontSize: "2.5rem",
            }}
          >
            <SaleDayIcon fontSize="large" />
          </Avatar>

          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              mb: 2,
              direction: isRTL ? "rtl" : "ltr",
              fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
            }}
          >
            {t.saleDayTitle}
          </Typography>

          <Typography
            variant="h6"
            sx={{
              opacity: 0.9,
              fontWeight: 400,
              direction: isRTL ? "rtl" : "ltr",
              fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
              mb: 3,
            }}
          >
            {t.saleDaySubtitle}
          </Typography>

          {/* Current Time Display */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              mt: 2,
            }}
          >
            <TimerIcon />
            <Typography
              variant="h6"
              sx={{
                direction: isRTL ? "rtl" : "ltr",
                fontFamily: isRTL
                  ? "var(--font-persian)"
                  : "var(--font-english)",
              }}
            >
              {formatTime(currentTime, language)}
            </Typography>
          </Box>
        </Paper>

        {/* Stats Overview */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={3}
          sx={{ flexWrap: "wrap" }}
        >
          <Stack
            sx={{
              flex: {
                xs: "1 1 100%",
                sm: "1 1 calc(50% - 12px)",
                md: "1 1 calc(25% - 18px)",
              },
            }}
          >
            <Card
              sx={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "white",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <RestaurantIcon sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {availableFoods.length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {t.availableToday}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Stack>

          <Stack
            sx={{
              flex: {
                xs: "1 1 100%",
                sm: "1 1 calc(50% - 12px)",
                md: "1 1 calc(25% - 18px)",
              },
            }}
          >
            <Card
              sx={{
                background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                color: "white",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <ShoppingCartIcon sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {Object.keys(reservations).length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {language === "fa" ? "رزروها" : "Reservations"}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Stack>

          <Stack
            sx={{
              flex: {
                xs: "1 1 100%",
                sm: "1 1 calc(50% - 12px)",
                md: "1 1 calc(25% - 18px)",
              },
            }}
          >
            <Card
              sx={{
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                color: "white",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <TrendingUpIcon sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      25%
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {language === "fa" ? "متوسط تخفیف" : "Avg Discount"}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Stack>

          <Stack
            sx={{
              flex: {
                xs: "1 1 100%",
                sm: "1 1 calc(50% - 12px)",
                md: "1 1 calc(25% - 18px)",
              },
            }}
          >
            <Card
              sx={{
                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                color: "white",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <FlashOnIcon sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      3
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {t.limitedAvailability}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Stack>

        {/* Emergency Alert */}
        <Alert
          severity="warning"
          icon={<WarningIcon fontSize="inherit" />}
          sx={{
            borderRadius: 3,
            direction: isRTL ? "rtl" : "ltr",
            fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {t.emergencyReservationNote}
          </Typography>
        </Alert>

        {/* Food Stack */}
        <Stack direction="row" spacing={3} sx={{ flexWrap: "wrap" }}>
          {saleDayFoods.map((food, index) => {
            const stockPercentage = getStockPercentage(food);
            const timeRemaining = food.endTime
              ? getTimeRemaining(food.endTime)
              : food.isOnSale
              ? getTimeRemaining(new Date(Date.now() + 2 * 60 * 60 * 1000))
              : null;
            const isReserved = reservations[food.id];

            return (
              <Stack
                key={food.id}
                sx={{
                  flex: {
                    xs: "1 1 100%",
                    sm: "1 1 calc(50% - 12px)",
                    md: "1 1 calc(33.333% - 16px)",
                  },
                }}
              >
                <Fade in={true} timeout={300 + index * 100}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      borderRadius: 3,
                      overflow: "hidden",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        transform: food.isAvailable
                          ? "translateY(-8px)"
                          : "none",
                        boxShadow: food.isAvailable
                          ? "0 20px 40px rgba(0,0,0,0.1)"
                          : "none",
                      },
                      filter: !food.isAvailable ? "grayscale(50%)" : "none",
                      opacity: !food.isAvailable ? 0.7 : 1,
                    }}
                  >
                    {/* Discount Badge */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 12,
                        right: isRTL ? "auto" : 12,
                        left: isRTL ? 12 : "auto",
                        zIndex: 1,
                      }}
                    >
                      <Chip
                        icon={<LocalOfferIcon />}
                        label={`${food.discount}%`}
                        sx={{
                          fontWeight: 600,
                          color: "white",
                          bgcolor: "#ef4444",
                          fontFamily: isRTL
                            ? "var(--font-persian)"
                            : "var(--font-english)",
                        }}
                      />
                    </Box>

                    {/* Limited Time Badge */}
                    {(food.isLimitedTime || food.isOnSale) && timeRemaining && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 50,
                          right: isRTL ? "auto" : 12,
                          left: isRTL ? 12 : "auto",
                          zIndex: 1,
                        }}
                      >
                        <Chip
                          icon={<TimerIcon />}
                          label={timeRemaining}
                          color="warning"
                          size="small"
                          sx={{
                            fontWeight: 600,
                            color: "white",
                            bgcolor: "#f59e0b",
                            fontFamily: isRTL
                              ? "var(--font-persian)"
                              : "var(--font-english)",
                          }}
                        />
                      </Box>
                    )}

                    {/* Sold Out/Reserved Badge */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 12,
                        left: isRTL ? "auto" : 12,
                        right: isRTL ? 12 : "auto",
                        zIndex: 1,
                      }}
                    >
                      {!food.isAvailable ? (
                        <Chip
                          label={t.soldOut}
                          color="error"
                          sx={{
                            fontWeight: 600,
                            color: "white",
                            bgcolor: "#ef4444",
                            fontFamily: isRTL
                              ? "var(--font-persian)"
                              : "var(--font-english)",
                          }}
                        />
                      ) : isReserved ? (
                        <Chip
                          icon={<CheckCircleIcon />}
                          label={language === "fa" ? "رزرو شده" : "Reserved"}
                          color="success"
                          sx={{
                            fontWeight: 600,
                            color: "white",
                            bgcolor: "#10b981",
                            fontFamily: isRTL
                              ? "var(--font-persian)"
                              : "var(--font-english)",
                          }}
                        />
                      ) : null}
                    </Box>

                    <CardMedia
                      component="img"
                      height="200"
                      image={
                        food.imageUrl ||
                        "/src/presentation/assets/images/default308785.jpg"
                      }
                      alt={language === "fa" ? food.name : food.nameEn}
                      sx={{
                        objectFit: "cover",
                        transition: "transform 0.3s ease",
                        "&:hover": {
                          transform: food.isAvailable ? "scale(1.05)" : "none",
                        },
                      }}
                    />

                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Stack spacing={2}>
                        {/* Title */}
                        <Typography
                          variant="h6"
                          component="h3"
                          sx={{
                            fontWeight: 700,
                            direction: isRTL ? "rtl" : "ltr",
                            textAlign: isRTL ? "right" : "left",
                            fontFamily: isRTL
                              ? "var(--font-persian)"
                              : "var(--font-english)",
                            lineHeight: 1.3,
                          }}
                        >
                          {language === "fa" ? food.name : food.nameEn}
                        </Typography>

                        {/* Price Section */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            justifyContent: isRTL ? "flex-end" : "flex-start",
                          }}
                        >
                          <Typography
                            variant="h6"
                            color="primary"
                            sx={{
                              fontWeight: 700,
                              direction: isRTL ? "rtl" : "ltr",
                              fontFamily: isRTL
                                ? "var(--font-persian)"
                                : "var(--font-english)",
                            }}
                          >
                            {formatCurrency(food.price, language)}
                          </Typography>
                          {food.originalPrice &&
                            food.originalPrice > food.price && (
                              <Typography
                                variant="body2"
                                sx={{
                                  textDecoration: "line-through",
                                  color: "text.secondary",
                                  direction: isRTL ? "rtl" : "ltr",
                                  fontFamily: isRTL
                                    ? "var(--font-persian)"
                                    : "var(--font-english)",
                                }}
                              >
                                {formatCurrency(food.originalPrice, language)}
                              </Typography>
                            )}
                        </Box>

                        {/* Emergency Fee */}
                        {(food.emergencyFee || 0) > 0 && (
                          <Alert severity="info">
                            <Typography
                              variant="caption"
                              sx={{
                                direction: isRTL ? "rtl" : "ltr",
                                fontFamily: isRTL
                                  ? "var(--font-persian)"
                                  : "var(--font-english)",
                              }}
                            >
                              {t.emergencyFee}:{" "}
                              {formatCurrency(food.emergencyFee || 0, language)}
                            </Typography>
                          </Alert>
                        )}

                        {/* Description */}
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            lineHeight: 1.6,
                            direction: isRTL ? "rtl" : "ltr",
                            textAlign: isRTL ? "right" : "left",
                            fontFamily: isRTL
                              ? "var(--font-persian)"
                              : "var(--font-english)",
                          }}
                        >
                          {language === "fa"
                            ? food.description
                            : food.descriptionEn}
                        </Typography>

                        {/* Stock Indicator */}
                        <Box>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                fontFamily: isRTL
                                  ? "var(--font-persian)"
                                  : "var(--font-english)",
                              }}
                            >
                              {t.remainingQuantity}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                fontFamily: isRTL
                                  ? "var(--font-persian)"
                                  : "var(--font-english)",
                              }}
                            >
                              {food.availableQuantity ?? 0}/100
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={stockPercentage}
                            color={getStockColor(stockPercentage)}
                            sx={{ borderRadius: 2, height: 6 }}
                          />
                        </Box>

                        {/* Prep Time */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            justifyContent: isRTL ? "flex-end" : "flex-start",
                          }}
                        >
                          <ScheduleIcon
                            sx={{ fontSize: 16, color: "text.secondary" }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {food.prepTime || 15}{" "}
                            {language === "fa" ? "دقیقه" : "min"}
                          </Typography>
                        </Box>

                        {/* Action Button */}
                        <Button
                          fullWidth
                          variant={isReserved ? "outlined" : "contained"}
                          color={isReserved ? "success" : "primary"}
                          disabled={!food.isAvailable || isReserved}
                          startIcon={
                            isReserved ? (
                              <CheckCircleIcon />
                            ) : (
                              <ShoppingCartIcon />
                            )
                          }
                          onClick={() => handleEmergencyReservation(food.id)}
                          sx={{
                            py: 1.5,
                            fontWeight: 600,
                            borderRadius: 2,
                            fontFamily: isRTL
                              ? "var(--font-persian)"
                              : "var(--font-english)",
                          }}
                        >
                          {!food.isAvailable
                            ? t.soldOut
                            : isReserved
                            ? language === "fa"
                              ? "رزرو شده"
                              : "Reserved"
                            : t.reserveNow}
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Fade>
              </Stack>
            );
          })}
        </Stack>

        {/* No Available Foods */}
        {availableFoods.length === 0 && (
          <Paper
            elevation={0}
            sx={{
              textAlign: "center",
              py: 8,
              bgcolor: "grey.50",
              borderRadius: 3,
              direction: isRTL ? "rtl" : "ltr",
            }}
          >
            <InventoryIcon
              sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
            />
            <Typography
              variant="h6"
              color="text.secondary"
              gutterBottom
              sx={{
                fontFamily: isRTL
                  ? "var(--font-persian)"
                  : "var(--font-english)",
              }}
            >
              {t.noReservationsNeeded}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontFamily: isRTL
                  ? "var(--font-persian)"
                  : "var(--font-english)",
              }}
            >
              {t.walkInAvailable}
            </Typography>
          </Paper>
        )}
      </Stack>
    </Container>
  );
};

export default SaleDay;
