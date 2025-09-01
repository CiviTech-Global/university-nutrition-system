import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  IconButton,
  Divider,
  Alert,
  Snackbar,
  LinearProgress,
  Fade,
  Collapse,
  Switch,
  FormControlLabel,
  InputAdornment,
  Menu,
  Grid,
} from "@mui/material";
import {
  LocalOffer as LocalOfferIcon,
  Schedule as ScheduleIcon,
  Timer as TimerIcon,
  ShoppingCart as ShoppingCartIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Analytics as AnalyticsIcon,
  Campaign as CampaignIcon,
  Event as EventIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  DateRange as DateRangeIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { 
  formatCurrency, 
  formatTime, 
  formatDate,
  createComponentStyles,
  getTypographyStyles 
} from "../../utils/languageUtils";
import { getCurrentUser } from "../../utils/userUtils";
import DataService, {
  type FoodItem,
  type Restaurant,
} from "../../services/dataService";

// Sale management interfaces
interface Sale {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  foodIds: string[];
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  targetAudience: 'all' | 'students' | 'faculty' | 'staff';
  maxRedemptions?: number;
  currentRedemptions: number;
  restaurantIds: string[];
  priority: number;
  bannerImage?: string;
  createdAt: string;
  updatedAt: string;
}

interface SaleFormData {
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  foodIds: string[];
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  targetAudience: 'all' | 'students' | 'faculty' | 'staff';
  maxRedemptions?: number;
  restaurantIds: string[];
  priority: number;
}

const SaleDay = () => {
  const { language, t, isRTL } = useLanguage();
  const componentStyles = createComponentStyles(language);
  const navigate = useNavigate();
  const dataService = DataService.getInstance();
  const [user, setUser] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Data states
  const [sales, setSales] = useState<Sale[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  
  // UI states
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "upcoming" | "expired">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  
  // Dialog states
  const [openSaleDialog, setOpenSaleDialog] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Form states
  const [formData, setFormData] = useState<SaleFormData>({
    name: "",
    nameEn: "",
    description: "",
    descriptionEn: "",
    foodIds: [],
    discountType: "percentage",
    discountValue: 0,
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    targetAudience: "all",
    maxRedemptions: undefined,
    restaurantIds: [],
    priority: 1
  });
  
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    discountValue?: string;
    startDate?: string;
    endDate?: string;
    foodIds?: string;
  }>({});

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
      loadSaleData();
    } else {
      navigate("/login");
    }
    setIsLoading(false);
  }, [navigate]);
  
  // Filter sales when search term or filter changes
  useEffect(() => {
    filterSales();
  }, [sales, searchTerm, filterStatus]);

  const loadSaleData = () => {
    try {
      // Load foods and restaurants
      const allFoods = dataService.getAllFoods();
      const allRestaurants = dataService.getAllRestaurants();
      setFoods(allFoods);
      setRestaurants(allRestaurants);
      
      // Load sales from localStorage (in a real app, this would be from an API)
      const savedSales = localStorage.getItem('sales_data');
      if (savedSales) {
        setSales(JSON.parse(savedSales));
      } else {
        // Initialize with sample sales data
        const sampleSales: Sale[] = [
          {
            id: 'sale_001',
            name: 'تخفیف ویژه صبحانه',
            nameEn: 'Special Breakfast Discount',
            description: 'تخفیف ۲۰٪ برای تمام صبحانه‌ها',
            descriptionEn: '20% discount on all breakfast items',
            foodIds: allFoods.filter(f => f.category === 'breakfast').slice(0, 3).map(f => f.id),
            discountType: 'percentage',
            discountValue: 20,
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            startTime: '07:00',
            endTime: '10:00',
            isActive: true,
            targetAudience: 'all',
            maxRedemptions: 100,
            currentRedemptions: 23,
            restaurantIds: allRestaurants.slice(0, 2).map(r => r.id),
            priority: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'sale_002',
            name: 'پیشنهاد ناهار دانشجویی',
            nameEn: 'Student Lunch Deal',
            description: 'تخفیف ۱۵٪ برای دانشجویان',
            descriptionEn: '15% discount for students',
            foodIds: allFoods.filter(f => f.category === 'lunch').slice(0, 4).map(f => f.id),
            discountType: 'percentage',
            discountValue: 15,
            startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            startTime: '12:00',
            endTime: '14:30',
            isActive: false,
            targetAudience: 'students',
            currentRedemptions: 0,
            restaurantIds: allRestaurants.map(r => r.id),
            priority: 2,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        setSales(sampleSales);
        localStorage.setItem('sales_data', JSON.stringify(sampleSales));
      }
    } catch (error) {
      console.error('Error loading sale data:', error);
      setErrorMessage(language === 'fa' ? 'خطا در بارگذاری داده‌ها' : 'Error loading data');
      setShowError(true);
    }
  };
  
  const filterSales = () => {
    let filtered = [...sales];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(sale =>
        sale.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(sale => {
        const isCurrentlyActive = sale.isActive && 
                                 sale.startDate <= currentDate && 
                                 sale.endDate >= currentDate &&
                                 sale.startTime <= currentTime &&
                                 sale.endTime >= currentTime;
        const isUpcoming = sale.startDate > currentDate || 
                          (sale.startDate === currentDate && sale.startTime > currentTime);
        const isExpired = sale.endDate < currentDate ||
                         (sale.endDate === currentDate && sale.endTime < currentTime);
        
        switch (filterStatus) {
          case 'active': return isCurrentlyActive;
          case 'upcoming': return isUpcoming;
          case 'expired': return isExpired;
          default: return true;
        }
      });
    }
    
    // Sort by priority and date
    filtered.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    
    setFilteredSales(filtered);
  };

  // Form validation
  const validateSaleForm = (): boolean => {
    const errors: any = {};
    
    if (!formData.name.trim()) {
      errors.name = language === 'fa' ? 'نام فروش الزامی است' : 'Sale name is required';
    }
    
    if (formData.discountValue <= 0) {
      errors.discountValue = language === 'fa' ? 'مقدار تخفیف باید بزرگتر از صفر باشد' : 'Discount value must be greater than 0';
    }
    
    if (formData.discountType === 'percentage' && formData.discountValue > 100) {
      errors.discountValue = language === 'fa' ? 'درصد تخفیف نمی‌تواند بیشتر از ۱۰۰ باشد' : 'Percentage discount cannot exceed 100%';
    }
    
    if (!formData.startDate) {
      errors.startDate = language === 'fa' ? 'تاریخ شروع الزامی است' : 'Start date is required';
    }
    
    if (!formData.endDate) {
      errors.endDate = language === 'fa' ? 'تاریخ پایان الزامی است' : 'End date is required';
    }
    
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      errors.endDate = language === 'fa' ? 'تاریخ پایان باید بعد از تاریخ شروع باشد' : 'End date must be after start date';
    }
    
    if (formData.foodIds.length === 0) {
      errors.foodIds = language === 'fa' ? 'حداقل یک غذا انتخاب کنید' : 'Select at least one food item';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSaveSale = async () => {
    if (!validateSaleForm()) return;
    
    setIsSaving(true);
    try {
      const saleData: Sale = {
        id: editingSale ? editingSale.id : `sale_${Date.now()}`,
        ...formData,
        isActive: formData.startDate <= new Date().toISOString().split('T')[0],
        currentRedemptions: editingSale ? editingSale.currentRedemptions : 0,
        createdAt: editingSale ? editingSale.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      let updatedSales;
      if (editingSale) {
        updatedSales = sales.map(s => s.id === editingSale.id ? saleData : s);
      } else {
        updatedSales = [saleData, ...sales];
      }
      
      setSales(updatedSales);
      localStorage.setItem('sales_data', JSON.stringify(updatedSales));
      
      setOpenSaleDialog(false);
      setEditingSale(null);
      resetForm();
      setShowSuccess(true);
      
    } catch (error: any) {
      setErrorMessage(error.message || (language === 'fa' ? 'خطا در ذخیره فروش' : 'Error saving sale'));
      setShowError(true);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleEditSale = (sale: Sale) => {
    setEditingSale(sale);
    setFormData({
      name: sale.name,
      nameEn: sale.nameEn,
      description: sale.description,
      descriptionEn: sale.descriptionEn,
      foodIds: sale.foodIds,
      discountType: sale.discountType,
      discountValue: sale.discountValue,
      startDate: sale.startDate,
      endDate: sale.endDate,
      startTime: sale.startTime,
      endTime: sale.endTime,
      targetAudience: sale.targetAudience,
      maxRedemptions: sale.maxRedemptions,
      restaurantIds: sale.restaurantIds,
      priority: sale.priority
    });
    setOpenSaleDialog(true);
  };
  
  const handleDeleteSale = (saleId: string) => {
    const updatedSales = sales.filter(s => s.id !== saleId);
    setSales(updatedSales);
    localStorage.setItem('sales_data', JSON.stringify(updatedSales));
  };
  
  const handleToggleSaleStatus = (saleId: string) => {
    const updatedSales = sales.map(sale => 
      sale.id === saleId ? { ...sale, isActive: !sale.isActive, updatedAt: new Date().toISOString() } : sale
    );
    setSales(updatedSales);
    localStorage.setItem('sales_data', JSON.stringify(updatedSales));
  };
  
  const resetForm = () => {
    setFormData({
      name: "",
      nameEn: "",
      description: "",
      descriptionEn: "",
      foodIds: [],
      discountType: "percentage",
      discountValue: 0,
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      targetAudience: "all",
      maxRedemptions: undefined,
      restaurantIds: [],
      priority: 1
    });
    setValidationErrors({});
  };
  
  const handleCloseDialog = () => {
    setOpenSaleDialog(false);
    setEditingSale(null);
    resetForm();
  };

  const getSaleStatus = (sale: Sale) => {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);
    
    if (!sale.isActive) {
      return { status: 'disabled', label: language === 'fa' ? 'غیرفعال' : 'Disabled', color: 'default' as const };
    }
    
    if (sale.startDate > currentDate || (sale.startDate === currentDate && sale.startTime > currentTime)) {
      return { status: 'upcoming', label: language === 'fa' ? 'آینده' : 'Upcoming', color: 'info' as const };
    }
    
    if (sale.endDate < currentDate || (sale.endDate === currentDate && sale.endTime < currentTime)) {
      return { status: 'expired', label: language === 'fa' ? 'منقضی' : 'Expired', color: 'error' as const };
    }
    
    return { status: 'active', label: language === 'fa' ? 'فعال' : 'Active', color: 'success' as const };
  };
  
  const getTimeRemaining = (endDate: string, endTime: string) => {
    const now = new Date();
    const end = new Date(`${endDate}T${endTime}`);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return null;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return language === 'fa' ? `${days} روز باقی مانده` : `${days} days left`;
    }
    if (hours > 0) {
      return language === 'fa' ? `${hours} ساعت باقی مانده` : `${hours} hours left`;
    }
    return language === 'fa' ? `${minutes} دقیقه باقی مانده` : `${minutes} minutes left`;
  };

  const saleStats = useMemo(() => {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);
    
    const activeSales = sales.filter(sale => 
      sale.isActive && 
      sale.startDate <= currentDate && 
      sale.endDate >= currentDate &&
      sale.startTime <= currentTime &&
      sale.endTime >= currentTime
    );
    
    const upcomingSales = sales.filter(sale => 
      sale.startDate > currentDate || 
      (sale.startDate === currentDate && sale.startTime > currentTime)
    );
    
    const totalRedemptions = sales.reduce((sum, sale) => sum + sale.currentRedemptions, 0);
    const avgDiscountPercentage = sales.length > 0 ? 
      sales.reduce((sum, sale) => sum + (sale.discountType === 'percentage' ? sale.discountValue : 10), 0) / sales.length : 0;
    
    return {
      totalSales: sales.length,
      activeSales: activeSales.length,
      upcomingSales: upcomingSales.length,
      totalRedemptions,
      avgDiscountPercentage: Math.round(avgDiscountPercentage)
    };
  }, [sales]);

  if (isLoading) {
    return (
      <Box sx={componentStyles.dashboard.container}>
        <Stack spacing={3}>
          <LinearProgress />
          <Alert severity="info">{language === 'fa' ? 'در حال بارگذاری...' : 'Loading...'}</Alert>
        </Stack>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={componentStyles.dashboard.container}>
        <Alert severity="error">{language === 'fa' ? 'کاربر یافت نشد' : 'User not found'}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={componentStyles.dashboard.container}>
      <Stack spacing={4}>
        {/* Modern Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: isRTL ? "row-reverse" : "row",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <CampaignIcon color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography
                variant="h4"
                component="h1"
                color="primary"
                sx={getTypographyStyles(language, "h4")}
              >
                {language === "fa" ? "مدیریت فروش‌ها و تخفیف‌ها" : "Sales & Promotions Management"}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={getTypographyStyles(language, "body2")}
              >
                {formatTime(currentTime, language)} • 
                {language === "fa" ? `${saleStats.activeSales} فروش فعال` : `${saleStats.activeSales} active sales`}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Tooltip title={language === "fa" ? "بروزرسانی" : "Refresh"}>
              <IconButton 
                onClick={loadSaleData} 
                color="primary"
                sx={{ borderRadius: 2 }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                resetForm();
                setOpenSaleDialog(true);
              }}
              sx={componentStyles.form.button}
            >
              {language === "fa" ? "ایجاد فروش جدید" : "Create New Sale"}
            </Button>
          </Box>
        </Box>

        {/* Enhanced Statistics Dashboard */}
        <Box sx={componentStyles.dashboard.statsGrid}>
          {/* Total Sales */}
          <Card sx={{ 
            ...componentStyles.dashboard.statCard,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white"
          }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <CampaignIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      ...getTypographyStyles(language, "h4"),
                      color: "white",
                      fontWeight: 700,
                    }}
                  >
                    {saleStats.totalSales}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      ...getTypographyStyles(language, "body2"),
                      color: "rgba(255,255,255,0.9)",
                    }}
                  >
                    {language === "fa" ? "کل فروش‌ها" : "Total Sales"}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Active Sales */}
          <Card sx={{ ...componentStyles.dashboard.statCard, backgroundColor: "success.50" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <PlayArrowIcon color="success" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography
                    variant="h4"
                    color="success.main"
                    sx={getTypographyStyles(language, "h4")}
                  >
                    {saleStats.activeSales}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={getTypographyStyles(language, "body2")}
                  >
                    {language === "fa" ? "فروش‌های فعال" : "Active Sales"}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Total Redemptions */}
          <Card sx={{ ...componentStyles.dashboard.statCard, backgroundColor: "primary.50" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <ShoppingCartIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography
                    variant="h4"
                    color="primary.main"
                    sx={getTypographyStyles(language, "h4")}
                  >
                    {saleStats.totalRedemptions}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={getTypographyStyles(language, "body2")}
                  >
                    {language === "fa" ? "کل استفاده‌ها" : "Total Redemptions"}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Average Discount */}
          <Card sx={{ ...componentStyles.dashboard.statCard, backgroundColor: "warning.50" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <LocalOfferIcon color="warning" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography
                    variant="h4"
                    color="warning.main"
                    sx={getTypographyStyles(language, "h4")}
                  >
                    {saleStats.avgDiscountPercentage}%
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={getTypographyStyles(language, "body2")}
                  >
                    {language === "fa" ? "متوسط تخفیف" : "Avg Discount"}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Sales Management Interface */}
        <Paper elevation={3} sx={componentStyles.card}>
          <Stack spacing={3}>
            {/* Header with Search and Filters */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexDirection: isRTL ? "row-reverse" : "row",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <AnalyticsIcon color="primary" />
                <Typography variant="h5" sx={getTypographyStyles(language, "h5")}>
                  {language === "fa" ? "مدیریت فروش‌ها" : "Sales Management"}
                </Typography>
                <Chip 
                  label={filteredSales.length} 
                  color="primary" 
                  size="small" 
                />
              </Box>

              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <TextField
                  placeholder={language === "fa" ? "جستجو در فروش‌ها..." : "Search sales..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="small"
                  sx={{ minWidth: 200 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <Tooltip title={language === "fa" ? "فیلترها" : "Filters"}>
                  <IconButton 
                    onClick={() => setShowFilters(!showFilters)}
                    color={showFilters ? "primary" : "default"}
                  >
                    <FilterListIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Collapsible Filters */}
            <Collapse in={showFilters}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>{language === "fa" ? "وضعیت" : "Status"}</InputLabel>
                    <Select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                      label={language === "fa" ? "وضعیت" : "Status"}
                    >
                      <MenuItem value="all">{language === "fa" ? "همه" : "All"}</MenuItem>
                      <MenuItem value="active">{language === "fa" ? "فعال" : "Active"}</MenuItem>
                      <MenuItem value="upcoming">{language === "fa" ? "آینده" : "Upcoming"}</MenuItem>
                      <MenuItem value="expired">{language === "fa" ? "منقضی" : "Expired"}</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Paper>
            </Collapse>

            <Divider />

            {/* Sales List */}
            <Stack spacing={2}>
              {filteredSales.length === 0 ? (
                <Alert severity="info" sx={{ textAlign: "center" }}>
                  {language === "fa" ? "فروشی یافت نشد" : "No sales found"}
                </Alert>
              ) : (
                filteredSales.map((sale, index) => {
                  const status = getSaleStatus(sale);
                  const timeRemaining = getTimeRemaining(sale.endDate, sale.endTime);
                  
                  return (
                    <Fade in={true} timeout={300 + index * 50} key={sale.id}>
                      <Card 
                        variant="outlined" 
                        sx={{
                          transition: "all 0.3s ease",
                          "&:hover": {
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            transform: "translateY(-2px)",
                          },
                          opacity: status.status === 'expired' ? 0.7 : 1,
                        }}
                      >
                        <CardContent>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              gap: 2,
                            }}
                          >
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                                <LocalOfferIcon color={status.color} />
                                <Typography
                                  variant="h6"
                                  sx={{
                                    ...getTypographyStyles(language, "h6"),
                                    fontWeight: 600,
                                  }}
                                >
                                  {language === "fa" ? sale.name : sale.nameEn}
                                </Typography>
                                
                                <Chip
                                  label={status.label}
                                  color={status.color}
                                  size="small"
                                />
                                
                                <Chip
                                  label={`${sale.discountValue}${sale.discountType === 'percentage' ? '%' : ' تومان'}`}
                                  color="secondary"
                                  size="small"
                                  variant="outlined"
                                />
                              </Box>
                              
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ ...getTypographyStyles(language, "body2"), mb: 2 }}
                              >
                                {language === "fa" ? sale.description : sale.descriptionEn}
                              </Typography>
                              
                              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", alignItems: "center" }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                  <DateRangeIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                                  <Typography variant="caption" color="text.secondary">
                                    {formatDate(new Date(sale.startDate), language)} - {formatDate(new Date(sale.endDate), language)}
                                  </Typography>
                                </Box>
                                
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                  <ScheduleIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                                  <Typography variant="caption" color="text.secondary">
                                    {sale.startTime} - {sale.endTime}
                                  </Typography>
                                </Box>
                                
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                  <ShoppingCartIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                                  <Typography variant="caption" color="text.secondary">
                                    {sale.currentRedemptions}{sale.maxRedemptions ? `/${sale.maxRedemptions}` : ''} {language === "fa" ? "استفاده" : "uses"}
                                  </Typography>
                                </Box>
                                
                                {timeRemaining && (
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <TimerIcon sx={{ fontSize: 16, color: "warning.main" }} />
                                    <Typography variant="caption" color="warning.main">
                                      {timeRemaining}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                              
                              <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
                                <Chip
                                  label={`${sale.foodIds.length} ${language === "fa" ? "غذا" : "foods"}`}
                                  size="small"
                                  variant="outlined"
                                />
                                <Chip
                                  label={sale.targetAudience === 'all' ? 
                                    (language === "fa" ? "همه" : "All") :
                                    sale.targetAudience === 'students' ?
                                    (language === "fa" ? "دانشجویان" : "Students") :
                                    sale.targetAudience
                                  }
                                  size="small"
                                  variant="outlined"
                                  color="info"
                                />
                              </Box>
                            </Box>
                            
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                              <IconButton
                                onClick={(e) => {
                                  setSelectedSaleId(sale.id);
                                  setAnchorEl(e.currentTarget);
                                }}
                              >
                                <MoreVertIcon />
                              </IconButton>
                              
                              <Switch
                                checked={sale.isActive}
                                onChange={() => handleToggleSaleStatus(sale.id)}
                                color="success"
                                size="small"
                              />
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Fade>
                  );
                })
              )}
            </Stack>
          </Stack>
        </Paper>

        {/* Sales Management Dialog */}
        <Dialog
          open={openSaleDialog}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
          sx={componentStyles.dialog}
        >
          <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CampaignIcon color="primary" />
            <Typography sx={getTypographyStyles(language, "h6")}>
              {editingSale 
                ? (language === "fa" ? "ویرایش فروش" : "Edit Sale")
                : (language === "fa" ? "ایجاد فروش جدید" : "Create New Sale")
              }
            </Typography>
          </DialogTitle>
          
          <DialogContent>
            <Stack spacing={3} sx={{ pt: 2 }}>
              {/* Basic Information */}
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={language === "fa" ? "نام فروش (فارسی)" : "Sale Name (Persian)"}
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    error={!!validationErrors.name}
                    helperText={validationErrors.name}
                    sx={componentStyles.form.field}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={language === "fa" ? "نام فروش (انگلیسی)" : "Sale Name (English)"}
                    value={formData.nameEn}
                    onChange={(e) => setFormData(prev => ({ ...prev, nameEn: e.target.value }))}
                    sx={componentStyles.form.field}
                  />
                </Grid>
              </Grid>
              
              {/* Description */}
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label={language === "fa" ? "توضیحات (فارسی)" : "Description (Persian)"}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    sx={componentStyles.form.field}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label={language === "fa" ? "توضیحات (انگلیسی)" : "Description (English)"}
                    value={formData.descriptionEn}
                    onChange={(e) => setFormData(prev => ({ ...prev, descriptionEn: e.target.value }))}
                    sx={componentStyles.form.field}
                  />
                </Grid>
              </Grid>
              
              {/* Discount Settings */}
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth sx={componentStyles.form.field}>
                    <InputLabel>{language === "fa" ? "نوع تخفیف" : "Discount Type"}</InputLabel>
                    <Select
                      value={formData.discountType}
                      onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value as any }))}
                      label={language === "fa" ? "نوع تخفیف" : "Discount Type"}
                    >
                      <MenuItem value="percentage">{language === "fa" ? "درصدی" : "Percentage"}</MenuItem>
                      <MenuItem value="fixed">{language === "fa" ? "مقدار ثابت" : "Fixed Amount"}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label={formData.discountType === 'percentage' 
                      ? (language === "fa" ? "درصد تخفیف" : "Discount Percentage")
                      : (language === "fa" ? "مقدار تخفیف (تومان)" : "Discount Amount (Tomans)")
                    }
                    value={formData.discountValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountValue: parseFloat(e.target.value) || 0 }))}
                    error={!!validationErrors.discountValue}
                    helperText={validationErrors.discountValue}
                    InputProps={{
                      inputProps: { 
                        min: 0, 
                        max: formData.discountType === 'percentage' ? 100 : 1000000 
                      },
                      endAdornment: (
                        <InputAdornment position="end">
                          {formData.discountType === 'percentage' ? '%' : language === "fa" ? 'تومان' : 'Tomans'}
                        </InputAdornment>
                      )
                    }}
                    sx={componentStyles.form.field}
                  />
                </Grid>
              </Grid>
              
              {/* Date and Time */}
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label={language === "fa" ? "تاریخ شروع" : "Start Date"}
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    error={!!validationErrors.startDate}
                    helperText={validationErrors.startDate}
                    InputLabelProps={{ shrink: true }}
                    sx={componentStyles.form.field}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label={language === "fa" ? "تاریخ پایان" : "End Date"}
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    error={!!validationErrors.endDate}
                    helperText={validationErrors.endDate}
                    InputLabelProps={{ shrink: true }}
                    sx={componentStyles.form.field}
                  />
                </Grid>
              </Grid>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="time"
                    label={language === "fa" ? "زمان شروع" : "Start Time"}
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    sx={componentStyles.form.field}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="time"
                    label={language === "fa" ? "زمان پایان" : "End Time"}
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    sx={componentStyles.form.field}
                  />
                </Grid>
              </Grid>
              
              {/* Target Audience and Max Redemptions */}
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth sx={componentStyles.form.field}>
                    <InputLabel>{language === "fa" ? "مخاطب هدف" : "Target Audience"}</InputLabel>
                    <Select
                      value={formData.targetAudience}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value as any }))}
                      label={language === "fa" ? "مخاطب هدف" : "Target Audience"}
                    >
                      <MenuItem value="all">{language === "fa" ? "همه" : "All"}</MenuItem>
                      <MenuItem value="students">{language === "fa" ? "دانشجویان" : "Students"}</MenuItem>
                      <MenuItem value="faculty">{language === "fa" ? "اساتید" : "Faculty"}</MenuItem>
                      <MenuItem value="staff">{language === "fa" ? "کارکنان" : "Staff"}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label={language === "fa" ? "حداکثر استفاده (اختیاری)" : "Max Redemptions (Optional)"}
                    value={formData.maxRedemptions || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxRedemptions: parseInt(e.target.value) || undefined }))}
                    InputProps={{
                      inputProps: { min: 1 }
                    }}
                    sx={componentStyles.form.field}
                  />
                </Grid>
              </Grid>
              
              {/* Food Selection */}
              <FormControl fullWidth error={!!validationErrors.foodIds}>
                <InputLabel>{language === "fa" ? "انتخاب غذاها" : "Select Foods"}</InputLabel>
                <Select
                  multiple
                  value={formData.foodIds}
                  onChange={(e) => setFormData(prev => ({ ...prev, foodIds: e.target.value as string[] }))}
                  label={language === "fa" ? "انتخاب غذاها" : "Select Foods"}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const food = foods.find(f => f.id === value);
                        return (
                          <Chip 
                            key={value} 
                            label={language === "fa" ? food?.name : food?.nameEn} 
                            size="small" 
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {foods.map((food) => (
                    <MenuItem key={food.id} value={food.id}>
                      <Box>
                        <Typography>{language === "fa" ? food.name : food.nameEn}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {food.category} • {formatCurrency(food.price, language)}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {validationErrors.foodIds && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    {validationErrors.foodIds}
                  </Typography>
                )}
              </FormControl>
            </Stack>
          </DialogContent>
          
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={handleCloseDialog}
              disabled={isSaving}
              sx={componentStyles.form.button}
            >
              {language === "fa" ? "لغو" : "Cancel"}
            </Button>
            <Button
              onClick={handleSaveSale}
              variant="contained"
              disabled={isSaving}
              startIcon={isSaving ? <RefreshIcon /> : <AddIcon />}
              sx={componentStyles.form.button}
            >
              {isSaving 
                ? (language === "fa" ? "در حال ذخیره..." : "Saving...")
                : (editingSale 
                  ? (language === "fa" ? "بروزرسانی" : "Update")
                  : (language === "fa" ? "ایجاد فروش" : "Create Sale")
                )
              }
            </Button>
          </DialogActions>
        </Dialog>

        {/* Sales Actions Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => {
            const sale = sales.find(s => s.id === selectedSaleId);
            if (sale) handleEditSale(sale);
            setAnchorEl(null);
          }}>
            <EditIcon sx={{ mr: 1 }} />
            {language === "fa" ? "ویرایش" : "Edit"}
          </MenuItem>
          <MenuItem onClick={() => {
            if (selectedSaleId) handleDeleteSale(selectedSaleId);
            setAnchorEl(null);
          }}>
            <DeleteIcon sx={{ mr: 1 }} />
            {language === "fa" ? "حذف" : "Delete"}
          </MenuItem>
          <MenuItem onClick={() => setAnchorEl(null)}>
            <VisibilityIcon sx={{ mr: 1 }} />
            {language === "fa" ? "مشاهده گزارش" : "View Report"}
          </MenuItem>
        </Menu>

        {/* Success Snackbar */}
        <Snackbar
          open={showSuccess}
          autoHideDuration={4000}
          onClose={() => setShowSuccess(false)}
        >
          <Alert onClose={() => setShowSuccess(false)} severity="success" sx={{ borderRadius: 2 }}>
            {language === "fa" ? "عملیات با موفقیت انجام شد" : "Operation completed successfully"}
          </Alert>
        </Snackbar>

        {/* Error Snackbar */}
        <Snackbar
          open={showError}
          autoHideDuration={6000}
          onClose={() => setShowError(false)}
        >
          <Alert onClose={() => setShowError(false)} severity="error" sx={{ borderRadius: 2 }}>
            {errorMessage || (language === "fa" ? "خطا در عملیات" : "Operation failed")}
          </Alert>
        </Snackbar>
      </Stack>
    </Box>
  );
};

export default SaleDay;