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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  TextField,
  Divider,
  Grid,
  Tooltip,
  Badge,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import {
  Receipt as ReceiptIcon,
  QrCode as QrCodeIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Restaurant as RestaurantIcon,
  LocalOffer as DiscountIcon,
  Print as PrintIcon,
  FilterList as FilterIcon,
  DateRange as DateRangeIcon,
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
import DataService, { type MealReservation } from "../../services/dataService";

type ReservedItem = MealReservation & {
  restaurantName: string;
  ingredients: string[];
  calories: number;
  imageUrl: string;
  isVegetarian?: boolean;
  isPopular?: boolean;
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reservation-tabpanel-${index}`}
      aria-labelledby={`reservation-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const MyReservations = () => {
  const { language, isRTL } = useLanguage();
  const componentStyles = createComponentStyles(language);
  const [user, setUser] = useState<any>(null);
  const [reservations, setReservations] = useState<ReservedItem[]>([]);
  const [selectedReservation, setSelectedReservation] = useState<ReservedItem | null>(null);
  const [detailDialog, setDetailDialog] = useState(false);
  const [qrDialog, setQrDialog] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dataService] = useState(DataService.getInstance());


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

  const loadReservations = (userId: string) => {
    try {
      // Load all reservations from data service
      const allReservations = dataService.getAllReservations(userId);
      
      // Transform reservations to include additional UI data
      const enrichedReservations: ReservedItem[] = allReservations.map(reservation => {
        const food = dataService.getFoodById(reservation.foodId);
        const restaurant = dataService.getRestaurantById(reservation.restaurantId);
        
        return {
          ...reservation,
          restaurantName: restaurant ? (language === "fa" ? restaurant.name : restaurant.nameEn) : reservation.restaurantName,
          ingredients: food ? (language === "fa" ? food.ingredients : food.ingredientsEn) : [],
          calories: food?.calories || reservation.nutritionalInfo?.calories || 0,
          imageUrl: food?.imageUrl || "/api/placeholder/300/200",
          isVegetarian: food?.isVegetarian || false,
          isPopular: food?.isPopular || false,
        };
      });

      // Sort by reservation date (newest first)
      enrichedReservations.sort((a, b) => new Date(b.reservationDate).getTime() - new Date(a.reservationDate).getTime());
      
      setReservations(enrichedReservations);
    } catch (error) {
      console.error("Error loading reservations:", error);
      setErrorMessage(language === "fa" ? "خطا در بارگذاری رزروها" : "Error loading reservations");
      setShowError(true);
    }
  };


  const filteredReservations = useMemo(() => {
    return reservations.filter(reservation => {
      // Status filter
      if (filterStatus !== "all" && reservation.status !== filterStatus) {
        return false;
      }

      // Date range filter
      if (dateRange !== "all") {
        const reservationDate = new Date(reservation.date);
        const now = new Date();
        
        switch (dateRange) {
          case "today":
            if (reservationDate.toDateString() !== now.toDateString()) return false;
            break;
          case "week":
            const weekAgo = new Date();
            weekAgo.setDate(now.getDate() - 7);
            if (reservationDate < weekAgo) return false;
            break;
          case "month":
            const monthAgo = new Date();
            monthAgo.setMonth(now.getMonth() - 1);
            if (reservationDate < monthAgo) return false;
            break;
        }
      }

      // Search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          reservation.foodName.toLowerCase().includes(searchLower) ||
          reservation.restaurantName.toLowerCase().includes(searchLower) ||
          reservation.faramushiCode.includes(searchTerm)
        );
      }

      return true;
    });
  }, [reservations, filterStatus, dateRange, searchTerm]);

  const groupedReservations = useMemo(() => {
    const today = new Date().toDateString();
    const upcoming = filteredReservations.filter(r => new Date(r.date).toDateString() >= today);
    const past = filteredReservations.filter(r => new Date(r.date).toDateString() < today);
    const all = filteredReservations;
    
    return { all, upcoming, past };
  }, [filteredReservations]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setSuccessMessage(language === "fa" ? "کد کپی شد" : "Code copied");
    setShowSuccess(true);
  };

  const handleDownloadReceipt = (reservation: ReservedItem) => {
    // In a real app, this would generate and download a PDF receipt
    const receipt = {
      id: reservation.id,
      date: reservation.date,
      meal: reservation.meal,
      food: reservation.foodName,
      restaurant: reservation.restaurantName,
      price: reservation.price,
      faramushiCode: reservation.faramushiCode,
    };
    
    const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt_${reservation.faramushiCode}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    setSuccessMessage(language === "fa" ? "رسید دانلود شد" : "Receipt downloaded");
    setShowSuccess(true);
  };

  const generateQRCode = (reservation: ReservedItem) => {
    // In a real app, this would generate a proper QR code
    const qrData = `RESERVATION:${reservation.faramushiCode}:${reservation.date}:${reservation.meal}`;
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white" stroke="black"/>
        <text x="100" y="100" text-anchor="middle" font-family="Arial" font-size="14" fill="black">
          QR Code
        </text>
        <text x="100" y="120" text-anchor="middle" font-family="Arial" font-size="12" fill="black">
          ${reservation.faramushiCode}
        </text>
      </svg>
    `)}`;
  };

  const getMealLabel = (meal: string) => {
    return meal === "breakfast" 
      ? (language === "fa" ? "صبحانه" : "Breakfast")
      : meal === "lunch"
      ? (language === "fa" ? "ناهار" : "Lunch")
      : (language === "fa" ? "شام" : "Dinner");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "warning";
      case "confirmed": return "info";
      case "paid": return "primary";
      case "completed": return "success";
      case "cancelled": return "error";
      default: return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending": return language === "fa" ? "در انتظار" : "Pending";
      case "confirmed": return language === "fa" ? "تأیید شده" : "Confirmed";
      case "paid": return language === "fa" ? "پرداخت شده" : "Paid";
      case "completed": return language === "fa" ? "تکمیل شده" : "Completed";
      case "cancelled": return language === "fa" ? "لغو شده" : "Cancelled";
      default: return status;
    }
  };

  const ReservationCard = ({ reservation }: { reservation: ReservedItem }) => (
    <Card 
      sx={{
        mb: 2,
        border: "1px solid",
        borderColor: "grey.200",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          transform: "translateY(-2px)",
        },
        transition: "all 0.3s ease",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={8}>
            <Stack spacing={2}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                <Typography variant="h6" sx={getTypographyStyles(language, "h6")}>
                  {reservation.foodName}
                </Typography>
                <Chip
                  label={getMealLabel(reservation.meal)}
                  color="primary"
                  size="small"
                  sx={{ fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)" }}
                />
                <Chip
                  label={getStatusLabel(reservation.status)}
                  color={getStatusColor(reservation.status) as any}
                  size="small"
                  sx={{ fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)" }}
                />
                {reservation.isPopular && (
                  <Chip
                    label={language === "fa" ? "محبوب" : "Popular"}
                    color="warning"
                    size="small"
                    sx={{ fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)" }}
                  />
                )}
                {reservation.isVegetarian && (
                  <Chip
                    label={language === "fa" ? "گیاهی" : "Vegetarian"}
                    color="success"
                    size="small"
                    sx={{ fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)" }}
                  />
                )}
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <DateRangeIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(new Date(reservation.date), language)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <RestaurantIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {reservation.restaurantName}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <ScheduleIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {reservation.calories} {language === "fa" ? "کالری" : "cal"}
                  </Typography>
                </Box>
              </Box>

              {reservation.discountCode && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <DiscountIcon fontSize="small" color="success" />
                  <Typography variant="body2" color="success.main">
                    {language === "fa" ? "تخفیف" : "Discount"} {reservation.discountAmount}% ({reservation.discountCode})
                  </Typography>
                </Box>
              )}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Stack spacing={2} alignItems="flex-end">
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="h6" color="primary" sx={getTypographyStyles(language, "h6")}>
                  {formatCurrency(reservation.price, language)}
                </Typography>
                {reservation.originalPrice && reservation.originalPrice > reservation.price && (
                  <Typography variant="body2" sx={{ textDecoration: "line-through", color: "text.secondary" }}>
                    {formatCurrency(reservation.originalPrice, language)}
                  </Typography>
                )}
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Badge badgeContent={reservation.faramushiCode} color="primary">
                  <Tooltip title={language === "fa" ? "کد فرموشی" : "Faramushi Code"}>
                    <IconButton size="small" onClick={() => handleCopyCode(reservation.faramushiCode)}>
                      <CopyIcon />
                    </IconButton>
                  </Tooltip>
                </Badge>
                <Tooltip title={language === "fa" ? "QR کد" : "QR Code"}>
                  <IconButton 
                    size="small" 
                    onClick={() => {
                      setSelectedReservation(reservation);
                      setQrDialog(true);
                    }}
                  >
                    <QrCodeIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={language === "fa" ? "دانلود رسید" : "Download Receipt"}>
                  <IconButton size="small" onClick={() => handleDownloadReceipt(reservation)}>
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setSelectedReservation(reservation);
                    setDetailDialog(true);
                  }}
                  sx={{ fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)" }}
                >
                  {language === "fa" ? "جزئیات" : "Details"}
                </Button>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <Box sx={{ py: 4, width: "100%", display: "flex", justifyContent: "center" }}>
        <Alert severity="info">{language === "fa" ? "در حال بارگذاری..." : "Loading..."}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4, width: "100%" }}>
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
            {language === "fa" ? "رزروهای من" : "My Reservations"}
          </Typography>
          
          <Box sx={{ display: "flex", gap: 2 }}>
            <Tooltip title={language === "fa" ? "بروزرسانی" : "Refresh"}>
              <IconButton 
                onClick={() => user && loadReservations(user.id)} 
                color="primary"
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={() => window.print()}
              sx={{ fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)" }}
            >
              {language === "fa" ? "چاپ" : "Print"}
            </Button>
          </Box>
        </Box>

        {/* Filters */}
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Stack spacing={3}>
            <Typography variant="h6" sx={getTypographyStyles(language, "h6")}>
              <FilterIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              {language === "fa" ? "فیلترها" : "Filters"}
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label={language === "fa" ? "جستجو" : "Search"}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={language === "fa" ? "نام غذا، رستوران یا کد فرموشی" : "Food, restaurant, or Faramushi code"}
                  size="small"
                  sx={{
                    "& .MuiInputBase-input": {
                      fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>{language === "fa" ? "وضعیت" : "Status"}</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e: SelectChangeEvent) => setFilterStatus(e.target.value)}
                    sx={{ fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)" }}
                  >
                    <MenuItem value="all">{language === "fa" ? "همه" : "All"}</MenuItem>
                    <MenuItem value="confirmed">{language === "fa" ? "تأیید شده" : "Confirmed"}</MenuItem>
                    <MenuItem value="paid">{language === "fa" ? "پرداخت شده" : "Paid"}</MenuItem>
                    <MenuItem value="completed">{language === "fa" ? "تکمیل شده" : "Completed"}</MenuItem>
                    <MenuItem value="cancelled">{language === "fa" ? "لغو شده" : "Cancelled"}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>{language === "fa" ? "بازه زمانی" : "Date Range"}</InputLabel>
                  <Select
                    value={dateRange}
                    onChange={(e: SelectChangeEvent) => setDateRange(e.target.value)}
                    sx={{ fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)" }}
                  >
                    <MenuItem value="all">{language === "fa" ? "همه" : "All"}</MenuItem>
                    <MenuItem value="today">{language === "fa" ? "امروز" : "Today"}</MenuItem>
                    <MenuItem value="week">{language === "fa" ? "این هفته" : "This Week"}</MenuItem>
                    <MenuItem value="month">{language === "fa" ? "این ماه" : "This Month"}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body1" sx={getTypographyStyles(language, "body1")}>
                  {language === "fa" ? "تعداد: " : "Total: "}{filteredReservations.length}
                </Typography>
                <Typography variant="body2" color="primary">
                  {language === "fa" ? "هزینه کل: " : "Total Cost: "}
                  {formatCurrency(
                    filteredReservations.reduce((sum, r) => sum + r.price, 0),
                    language
                  )}
                </Typography>
              </Grid>
            </Grid>
          </Stack>
        </Paper>

        {/* Tabs */}
        <Paper elevation={3} sx={{ borderRadius: 2 }}>
          <Tabs
            value={currentTab}
            onChange={(_, newValue) => setCurrentTab(newValue)}
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              "& .MuiTab-root": {
                fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
              },
            }}
          >
            <Tab 
              label={`${language === "fa" ? "همه" : "All"} (${groupedReservations.all.length})`}
              icon={<ReceiptIcon />}
            />
            <Tab 
              label={`${language === "fa" ? "آینده" : "Upcoming"} (${groupedReservations.upcoming.length})`}
              icon={<ScheduleIcon />}
            />
            <Tab 
              label={`${language === "fa" ? "گذشته" : "Past"} (${groupedReservations.past.length})`}
              icon={<CheckCircleIcon />}
            />
          </Tabs>

          <TabPanel value={currentTab} index={0}>
            {groupedReservations.all.length > 0 ? (
              groupedReservations.all.map(reservation => (
                <ReservationCard key={reservation.id} reservation={reservation} />
              ))
            ) : (
              <Alert severity="info">
                {language === "fa" ? "هیچ رزروی یافت نشد" : "No reservations found"}
              </Alert>
            )}
          </TabPanel>

          <TabPanel value={currentTab} index={1}>
            {groupedReservations.upcoming.length > 0 ? (
              groupedReservations.upcoming.map(reservation => (
                <ReservationCard key={reservation.id} reservation={reservation} />
              ))
            ) : (
              <Alert severity="info">
                {language === "fa" ? "هیچ رزرو آینده‌ای یافت نشد" : "No upcoming reservations found"}
              </Alert>
            )}
          </TabPanel>

          <TabPanel value={currentTab} index={2}>
            {groupedReservations.past.length > 0 ? (
              groupedReservations.past.map(reservation => (
                <ReservationCard key={reservation.id} reservation={reservation} />
              ))
            ) : (
              <Alert severity="info">
                {language === "fa" ? "هیچ رزرو گذشته‌ای یافت نشد" : "No past reservations found"}
              </Alert>
            )}
          </TabPanel>
        </Paper>

        {/* Detail Dialog */}
        <Dialog 
          open={detailDialog} 
          onClose={() => setDetailDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={getTypographyStyles(language, "h6")}>
            {language === "fa" ? "جزئیات رزرو" : "Reservation Details"}
          </DialogTitle>
          <DialogContent>
            {selectedReservation && (
              <Stack spacing={3}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <CardMedia
                      component="img"
                      height={200}
                      image={selectedReservation.imageUrl}
                      alt={selectedReservation.foodName}
                      sx={{ borderRadius: 2, objectFit: "cover" }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={2}>
                      <Typography variant="h5" sx={getTypographyStyles(language, "h5")}>
                        {selectedReservation.foodName}
                      </Typography>
                      
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <Chip label={getMealLabel(selectedReservation.meal)} color="primary" size="small" />
                        <Chip label={getStatusLabel(selectedReservation.status)} color={getStatusColor(selectedReservation.status) as any} size="small" />
                        {selectedReservation.isPopular && <Chip label={language === "fa" ? "محبوب" : "Popular"} color="warning" size="small" />}
                        {selectedReservation.isVegetarian && <Chip label={language === "fa" ? "گیاهی" : "Vegetarian"} color="success" size="small" />}
                      </Box>

                      <Typography variant="h6" color="primary">
                        {formatCurrency(selectedReservation.price, language)}
                        {selectedReservation.originalPrice && selectedReservation.originalPrice > selectedReservation.price && (
                          <Typography 
                            component="span" 
                            variant="body2" 
                            sx={{ textDecoration: "line-through", color: "text.secondary", ml: 1 }}
                          >
                            {formatCurrency(selectedReservation.originalPrice, language)}
                          </Typography>
                        )}
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>

                <Divider />

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={2}>
                      <Typography variant="h6" sx={getTypographyStyles(language, "h6")}>
                        {language === "fa" ? "اطلاعات رزرو" : "Reservation Info"}
                      </Typography>
                      
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {language === "fa" ? "تاریخ:" : "Date:"}
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(new Date(selectedReservation.date), language)}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {language === "fa" ? "رستوران:" : "Restaurant:"}
                        </Typography>
                        <Typography variant="body1">
                          {selectedReservation.restaurantName}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {language === "fa" ? "روش پرداخت:" : "Payment Method:"}
                        </Typography>
                        <Typography variant="body1">
                          {selectedReservation.paymentMethod === "wallet" 
                            ? (language === "fa" ? "کیف پول" : "Wallet")
                            : (language === "fa" ? "درگاه آنلاین" : "Online Gateway")
                          }
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {language === "fa" ? "کد فرموشی:" : "Faramushi Code:"}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography variant="h6" color="primary">
                            {selectedReservation.faramushiCode}
                          </Typography>
                          <IconButton size="small" onClick={() => handleCopyCode(selectedReservation.faramushiCode)}>
                            <CopyIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </Stack>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Stack spacing={2}>
                      <Typography variant="h6" sx={getTypographyStyles(language, "h6")}>
                        {language === "fa" ? "اطلاعات تغذیه‌ای" : "Nutritional Info"}
                      </Typography>
                      
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {language === "fa" ? "کالری:" : "Calories:"}
                        </Typography>
                        <Typography variant="body1">
                          {selectedReservation.calories} {language === "fa" ? "کالری" : "cal"}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {language === "fa" ? "مواد تشکیل دهنده:" : "Ingredients:"}
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}>
                          {selectedReservation.ingredients.map((ingredient, index) => (
                            <Chip key={index} label={ingredient} variant="outlined" size="small" />
                          ))}
                        </Box>
                      </Box>

                      {selectedReservation.discountCode && (
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {language === "fa" ? "تخفیف:" : "Discount:"}
                          </Typography>
                          <Typography variant="body1" color="success.main">
                            {selectedReservation.discountAmount}% ({selectedReservation.discountCode})
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Grid>
                </Grid>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => selectedReservation && handleDownloadReceipt(selectedReservation)}
              startIcon={<DownloadIcon />}
              sx={{ fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)" }}
            >
              {language === "fa" ? "دانلود رسید" : "Download Receipt"}
            </Button>
            <Button 
              onClick={() => {
                setDetailDialog(false);
                if (selectedReservation) {
                  setQrDialog(true);
                }
              }}
              startIcon={<QrCodeIcon />}
              sx={{ fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)" }}
            >
              {language === "fa" ? "QR کد" : "QR Code"}
            </Button>
            <Button 
              onClick={() => setDetailDialog(false)}
              sx={{ fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)" }}
            >
              {language === "fa" ? "بستن" : "Close"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* QR Code Dialog */}
        <Dialog 
          open={qrDialog} 
          onClose={() => setQrDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={getTypographyStyles(language, "h6")}>
            {language === "fa" ? "QR کد رزرو" : "Reservation QR Code"}
          </DialogTitle>
          <DialogContent sx={{ textAlign: "center" }}>
            {selectedReservation && (
              <Stack spacing={3} alignItems="center">
                <img
                  src={generateQRCode(selectedReservation)}
                  alt="QR Code"
                  style={{ width: 200, height: 200, border: "1px solid #ddd" }}
                />
                <Typography variant="h6" sx={getTypographyStyles(language, "h6")}>
                  {language === "fa" ? "کد فرموشی:" : "Faramushi Code:"} {selectedReservation.faramushiCode}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
                  {language === "fa" 
                    ? "این QR کد را هنگام دریافت غذا نشان دهید"
                    : "Show this QR code when collecting your meal"
                  }
                </Typography>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => selectedReservation && handleCopyCode(selectedReservation.faramushiCode)}
              startIcon={<CopyIcon />}
              sx={{ fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)" }}
            >
              {language === "fa" ? "کپی کد" : "Copy Code"}
            </Button>
            <Button 
              onClick={() => setQrDialog(false)}
              sx={{ fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)" }}
            >
              {language === "fa" ? "بستن" : "Close"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success Snackbar */}
        <Snackbar
          open={showSuccess}
          autoHideDuration={3000}
          onClose={() => setShowSuccess(false)}
          message={successMessage}
        />

        {/* Error Snackbar */}
        <Snackbar
          open={showError}
          autoHideDuration={3000}
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

export default MyReservations;