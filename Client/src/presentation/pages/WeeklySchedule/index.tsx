import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  Chip,
  Avatar,
  Tooltip,
} from "@mui/material";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  Restaurant as RestaurantIcon,
  Fastfood as FastfoodIcon,
  LocalDining as LocalDiningIcon,
  Coffee as CoffeeIcon,
} from "@mui/icons-material";
import { getCurrentUser } from "../../utils/userUtils";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  formatDate,
  getTypographyStyles,
} from "../../utils/languageUtils";
import DataService, {
  type FoodItem,
} from "../../services/dataService";

interface WeeklyMealPlan {
  [day: string]: {
    breakfast: FoodItem[];
    lunch: FoodItem[];
    dinner: FoodItem[];
  };
}

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
}

const WeeklySchedule = () => {
  const { language, t, isRTL } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyMealPlan>({});
  const [dataService] = useState(DataService.getInstance());
  const [isLoading, setIsLoading] = useState(true);

  const loadWeeklyPlan = React.useCallback(() => {
    try {
      const weekStart = getWeekStart(currentWeek);
      const plan: WeeklyMealPlan = {};

      // Get all available foods for each meal type
      const breakfastFoods = dataService.getAvailableFoodsByCategory("breakfast") || [];
      const lunchFoods = dataService.getAvailableFoodsByCategory("lunch") || [];
      const dinnerFoods = dataService.getAvailableFoodsByCategory("dinner") || [];

      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        const dateString = date.toISOString().split("T")[0];

        plan[dateString] = {
          breakfast: breakfastFoods.slice(0, 3), // Show top 3 options for each meal
          lunch: lunchFoods.slice(0, 3),
          dinner: dinnerFoods.slice(0, 3),
        };
      }

      setWeeklyPlan(plan);
    } catch (error) {
      console.error("Error loading weekly plan:", error);
    }
  }, [currentWeek, dataService]);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      loadWeeklyPlan();
    } else {
      window.location.href = "/login";
    }
    setIsLoading(false);
  }, [loadWeeklyPlan]);

  useEffect(() => {
    if (user) {
      loadWeeklyPlan();
    }
  }, [currentWeek, user, loadWeeklyPlan]);

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

  const getMealIcon = (meal: string) => {
    switch (meal) {
      case "breakfast":
        return <CoffeeIcon sx={{ fontSize: 18, color: "#7BA7D1" }} />;
      case "lunch":
        return <FastfoodIcon sx={{ fontSize: 18, color: "#7BA7D1" }} />;
      case "dinner":
        return <LocalDiningIcon sx={{ fontSize: 18, color: "#7BA7D1" }} />;
      default:
        return <RestaurantIcon sx={{ fontSize: 18, color: "#7BA7D1" }} />;
    }
  };

  const getMealLabel = (meal: string) => {
    switch (meal) {
      case "breakfast":
        return language === "fa" ? "صبحانه" : "Breakfast";
      case "lunch":
        return language === "fa" ? "ناهار" : "Lunch";
      case "dinner":
        return language === "fa" ? "شام" : "Dinner";
      default:
        return meal;
    }
  };

  const weekDays = getWeekDays();
  const today = new Date().toISOString().split("T")[0];

  if (isLoading) {
    return (
      <Box sx={{ py: 4, width: "100%", display: "flex", justifyContent: "center" }}>
        <Alert severity="info">{t.loading || (language === "fa" ? "در حال بارگذاری..." : "Loading...")}</Alert>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ py: 4, width: "100%", display: "flex", justifyContent: "center" }}>
        <Alert severity="error">{t.userNotFound || (language === "fa" ? "کاربر یافت نشد" : "User not found")}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      py: 4, 
      px: 3, 
      minHeight: "100vh",
      backgroundColor: "#f8f9fa",
      direction: isRTL ? "rtl" : "ltr"
    }}>
      <Stack spacing={4}>
        {/* Header with blue gradient background */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #A8C5E3 0%, #7BA7D1 100%)",
            borderRadius: "12px",
            p: 3,
            color: "white",
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(123, 167, 209, 0.3)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, mb: 1 }}>
            <RestaurantIcon sx={{ fontSize: 32, color: "white" }} />
            <Typography
              variant="h4"
              component="h1"
              sx={{
                ...getTypographyStyles(language, "h4"),
                color: "white",
                fontWeight: 600,
              }}
            >
              {language === "fa" ? "برنامه غذایی هفتگی" : "Weekly Meal Schedule"}
            </Typography>
          </Box>
          <Typography
            variant="body1"
            sx={{
              ...getTypographyStyles(language, "body1"),
              color: "rgba(255, 255, 255, 0.9)",
            }}
          >
            {language === "fa" 
              ? "مشاهده برنامه غذایی کامل هفته" 
              : "View complete weekly meal plan"
            }
          </Typography>
        </Box>

        {/* Week Navigation */}
        <Box sx={{ 
          display: "flex", 
          gap: 2, 
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap" 
        }}>
          <IconButton 
            onClick={handlePreviousWeek}
            sx={{
              borderRadius: "12px",
              border: "2px solid #A8C5E3",
              color: "#7BA7D1",
              "&:hover": {
                backgroundColor: "rgba(123, 167, 209, 0.1)",
                borderColor: "#7BA7D1",
              },
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
          
          <Box sx={{ textAlign: "center", minWidth: "200px" }}>
            <Typography
              variant="h6"
              sx={{
                ...getTypographyStyles(language, "h6"),
                color: "#7BA7D1",
                fontWeight: 600,
              }}
            >
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
          </Box>

          <IconButton 
            onClick={handleCurrentWeek}
            sx={{
              borderRadius: "12px",
              background: "linear-gradient(135deg, #A8C5E3 0%, #7BA7D1 100%)",
              color: "white",
              "&:hover": {
                background: "linear-gradient(135deg, #7BA7D1 0%, #6B95C4 100%)",
              },
            }}
          >
            <TodayIcon />
          </IconButton>

          <IconButton 
            onClick={handleNextWeek}
            sx={{
              borderRadius: "12px",
              border: "2px solid #A8C5E3",
              color: "#7BA7D1",
              "&:hover": {
                backgroundColor: "rgba(123, 167, 209, 0.1)",
                borderColor: "#7BA7D1",
              },
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>

        {/* Weekly Schedule Table */}
        <Paper 
          sx={{ 
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(123, 167, 209, 0.1)",
            border: "1px solid rgba(168, 197, 227, 0.2)",
            overflow: "hidden",
          }}
        >
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow
                  sx={{
                    background: "linear-gradient(135deg, #A8C5E3 0%, #7BA7D1 100%)",
                    "& .MuiTableCell-head": {
                      color: "white",
                      fontWeight: 600,
                      fontSize: "1rem",
                      fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                    },
                  }}
                >
                  <TableCell>
                    {language === "fa" ? "روز هفته" : "Day of Week"}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                      {getMealIcon("breakfast")}
                      {getMealLabel("breakfast")}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                      {getMealIcon("lunch")}
                      {getMealLabel("lunch")}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                      {getMealIcon("dinner")}
                      {getMealLabel("dinner")}
                    </Box>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {weekDays.map((day) => {
                  const dateString = day.toISOString().split("T")[0];
                  const dayPlan = weeklyPlan[dateString];
                  const isToday = dateString === today;
                  
                  return (
                    <TableRow
                      key={dateString}
                      sx={{
                        backgroundColor: isToday 
                          ? "rgba(168, 197, 227, 0.1)" 
                          : "transparent",
                        "&:hover": {
                          backgroundColor: "rgba(168, 197, 227, 0.05)",
                        },
                        "& .MuiTableCell-root": {
                          borderColor: "rgba(168, 197, 227, 0.2)",
                          fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                        },
                      }}
                    >
                      {/* Day Column */}
                      <TableCell
                        sx={{
                          fontWeight: isToday ? 600 : 400,
                          color: isToday ? "#7BA7D1" : "text.primary",
                          minWidth: 120,
                        }}
                      >
                        <Box>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              ...getTypographyStyles(language, "subtitle1"),
                              fontWeight: isToday ? 600 : 500,
                              color: isToday ? "#7BA7D1" : "text.primary",
                            }}
                          >
                            {formatDate(day, language, { weekday: "long" })}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              ...getTypographyStyles(language, "body2"),
                              color: "text.secondary",
                              fontSize: "0.875rem",
                            }}
                          >
                            {formatDate(day, language, {
                              day: "numeric",
                              month: "short",
                            })}
                          </Typography>
                          {isToday && (
                            <Chip
                              label={language === "fa" ? "امروز" : "Today"}
                              size="small"
                              sx={{
                                mt: 0.5,
                                background: "linear-gradient(135deg, #A8C5E3 0%, #7BA7D1 100%)",
                                color: "white",
                                fontSize: "0.7rem",
                                height: 20,
                                "& .MuiChip-label": {
                                  fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                                },
                              }}
                            />
                          )}
                        </Box>
                      </TableCell>

                      {/* Breakfast Column */}
                      <TableCell align="center" sx={{ minWidth: 200 }}>
                        <Stack spacing={1} alignItems="center">
                          {dayPlan?.breakfast.map((food) => (
                            <Tooltip
                              key={food.id}
                              title={
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {language === "fa" ? food.name : food.nameEn}
                                  </Typography>
                                  <Typography variant="caption" color="inherit">
                                    {food.calories} cal • ${food.price}
                                  </Typography>
                                  {food.description && (
                                    <Typography variant="caption" color="inherit" sx={{ display: "block", mt: 0.5 }}>
                                      {language === "fa" ? food.description : food.descriptionEn}
                                    </Typography>
                                  )}
                                </Box>
                              }
                            >
                              <Chip
                                avatar={food.imageUrl ? (
                                  <Avatar 
                                    src={food.imageUrl} 
                                    sx={{ width: 24, height: 24 }}
                                  />
                                ) : (
                                  <Avatar sx={{ 
                                    width: 24, 
                                    height: 24, 
                                    background: "linear-gradient(135deg, #A8C5E3 0%, #7BA7D1 100%)" 
                                  }}>
                                    <CoffeeIcon sx={{ fontSize: 12 }} />
                                  </Avatar>
                                )}
                                label={language === "fa" ? food.name : food.nameEn}
                                variant="outlined"
                                sx={{
                                  borderColor: "rgba(168, 197, 227, 0.5)",
                                  "&:hover": {
                                    borderColor: "#7BA7D1",
                                    backgroundColor: "rgba(123, 167, 209, 0.1)",
                                  },
                                  "& .MuiChip-label": {
                                    fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                                    fontSize: "0.75rem",
                                  },
                                }}
                              />
                            </Tooltip>
                          )) || (
                            <Typography variant="body2" color="text.secondary">
                              {language === "fa" ? "موجود نیست" : "Not available"}
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>

                      {/* Lunch Column */}
                      <TableCell align="center" sx={{ minWidth: 200 }}>
                        <Stack spacing={1} alignItems="center">
                          {dayPlan?.lunch.map((food) => (
                            <Tooltip
                              key={food.id}
                              title={
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {language === "fa" ? food.name : food.nameEn}
                                  </Typography>
                                  <Typography variant="caption" color="inherit">
                                    {food.calories} cal • ${food.price}
                                  </Typography>
                                  {food.description && (
                                    <Typography variant="caption" color="inherit" sx={{ display: "block", mt: 0.5 }}>
                                      {language === "fa" ? food.description : food.descriptionEn}
                                    </Typography>
                                  )}
                                </Box>
                              }
                            >
                              <Chip
                                avatar={food.imageUrl ? (
                                  <Avatar 
                                    src={food.imageUrl} 
                                    sx={{ width: 24, height: 24 }}
                                  />
                                ) : (
                                  <Avatar sx={{ 
                                    width: 24, 
                                    height: 24, 
                                    background: "linear-gradient(135deg, #A8C5E3 0%, #7BA7D1 100%)" 
                                  }}>
                                    <FastfoodIcon sx={{ fontSize: 12 }} />
                                  </Avatar>
                                )}
                                label={language === "fa" ? food.name : food.nameEn}
                                variant="outlined"
                                sx={{
                                  borderColor: "rgba(168, 197, 227, 0.5)",
                                  "&:hover": {
                                    borderColor: "#7BA7D1",
                                    backgroundColor: "rgba(123, 167, 209, 0.1)",
                                  },
                                  "& .MuiChip-label": {
                                    fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                                    fontSize: "0.75rem",
                                  },
                                }}
                              />
                            </Tooltip>
                          )) || (
                            <Typography variant="body2" color="text.secondary">
                              {language === "fa" ? "موجود نیست" : "Not available"}
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>

                      {/* Dinner Column */}
                      <TableCell align="center" sx={{ minWidth: 200 }}>
                        <Stack spacing={1} alignItems="center">
                          {dayPlan?.dinner.map((food) => (
                            <Tooltip
                              key={food.id}
                              title={
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {language === "fa" ? food.name : food.nameEn}
                                  </Typography>
                                  <Typography variant="caption" color="inherit">
                                    {food.calories} cal • ${food.price}
                                  </Typography>
                                  {food.description && (
                                    <Typography variant="caption" color="inherit" sx={{ display: "block", mt: 0.5 }}>
                                      {language === "fa" ? food.description : food.descriptionEn}
                                    </Typography>
                                  )}
                                </Box>
                              }
                            >
                              <Chip
                                avatar={food.imageUrl ? (
                                  <Avatar 
                                    src={food.imageUrl} 
                                    sx={{ width: 24, height: 24 }}
                                  />
                                ) : (
                                  <Avatar sx={{ 
                                    width: 24, 
                                    height: 24, 
                                    background: "linear-gradient(135deg, #A8C5E3 0%, #7BA7D1 100%)" 
                                  }}>
                                    <LocalDiningIcon sx={{ fontSize: 12 }} />
                                  </Avatar>
                                )}
                                label={language === "fa" ? food.name : food.nameEn}
                                variant="outlined"
                                sx={{
                                  borderColor: "rgba(168, 197, 227, 0.5)",
                                  "&:hover": {
                                    borderColor: "#7BA7D1",
                                    backgroundColor: "rgba(123, 167, 209, 0.1)",
                                  },
                                  "& .MuiChip-label": {
                                    fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                                    fontSize: "0.75rem",
                                  },
                                }}
                              />
                            </Tooltip>
                          )) || (
                            <Typography variant="body2" color="text.secondary">
                              {language === "fa" ? "موجود نیست" : "Not available"}
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Footer Info */}
        <Box
          sx={{
            textAlign: "center",
            p: 2,
            borderRadius: "12px",
            backgroundColor: "rgba(168, 197, 227, 0.1)",
            border: "1px solid rgba(168, 197, 227, 0.2)",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              ...getTypographyStyles(language, "body2"),
              color: "text.secondary",
            }}
          >
            {language === "fa" 
              ? "برای مشاهده جزئیات بیشتر روی هر غذا کلیک کنید" 
              : "Click on any food item to see more details"
            }
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};

export default WeeklySchedule;