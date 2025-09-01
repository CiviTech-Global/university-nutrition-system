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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Tooltip,
  IconButton,
  Divider,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  LinearProgress,
  Fade,
  Collapse,
  Menu,
} from "@mui/material";
import {
  Add as AddIcon,
  CreditCard as CreditCardIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  GetApp as ExportIcon,
  Receipt as ReceiptIcon,
  Analytics as AnalyticsIcon,
  Payment as PaymentIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../utils/userUtils";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  formatCurrency,
  formatDate,
  createComponentStyles,
  getTypographyStyles,
} from "../../utils/languageUtils";
import DataService, { type Transaction } from "../../services/dataService";

const Credit = () => {
  const { language, isRTL } = useLanguage();
  const componentStyles = createComponentStyles(language);
  const navigate = useNavigate();
  const [dataService] = useState(DataService.getInstance());
  const [user, setUser] = useState<any>(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userBalance, setUserBalance] = useState(0);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "credit" | "debit">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  // Validation states
  const [validationErrors, setValidationErrors] = useState<{
    amount?: string;
    description?: string;
  }>({});

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      loadUserData(currentUser.id);
    } else {
      navigate("/login");
    }
    setIsLoading(false);
  }, [navigate]);
  
  // Filter transactions when search term or filter type changes
  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, filterType]);

  const loadUserData = (userId: string) => {
    try {
      // Load balance from DataService
      const balance = dataService.getUserBalance(userId);
      setUserBalance(balance);
      
      // Load transactions from DataService
      const userTransactions = dataService.getAllTransactions(userId);
      setTransactions(userTransactions);
      
    } catch (error) {
      console.error("Error loading user data:", error);
      setErrorMessage(language === "fa" ? "خطا در بارگذاری داده‌ها" : "Error loading data");
      setShowError(true);
    }
  };
  
  const filterTransactions = () => {
    let filtered = [...transactions];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter(transaction => transaction.type === filterType);
    }
    
    setFilteredTransactions(filtered);
  };

  // Form validation
  const validateForm = (): boolean => {
    const errors: { amount?: string; description?: string } = {};
    
    // Amount validation
    if (!amount || parseFloat(amount) <= 0) {
      errors.amount = language === "fa" ? "مبلغ الزامی است" : "Amount is required";
    } else if (parseFloat(amount) < 1000) {
      errors.amount = language === "fa" ? "حداقل مبلغ ۱٬۰۰۰ تومان است" : "Minimum amount is 1,000 Tomans";
    } else if (parseFloat(amount) > 1000000) {
      errors.amount = language === "fa" ? "حداکثر مبلغ ۱٬۰۰۰٬۰۰۰ تومان است" : "Maximum amount is 1,000,000 Tomans";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleAddCredit = async () => {
    if (!validateForm() || !user) return;
    
    setIsSaving(true);
    const newAmount = parseFloat(amount);
    
    try {
      // Create transaction
      const newTransaction: Transaction = {
        id: dataService.generateId("txn"),
        userId: user.id,
        type: "credit",
        amount: newAmount,
        date: new Date().toISOString().split("T")[0],
        description: description || (language === "fa" ? "افزایش اعتبار دستی" : "Manual credit addition"),
        category: "manual_credit",
        paymentMethod: "manual",
        status: "completed",
      };
      
      // Save transaction
      dataService.saveTransaction(newTransaction);
      
      // Update balance
      const newBalance = userBalance + newAmount;
      dataService.updateUserBalance(user.id, newBalance);
      setUserBalance(newBalance);
      
      // Reload transactions
      const updatedTransactions = dataService.getAllTransactions(user.id);
      setTransactions(updatedTransactions);
      
      // Reset form and show success
      setOpenAddDialog(false);
      setAmount("");
      setDescription("");
      setValidationErrors({});
      setShowSuccess(true);
      
    } catch (error: any) {
      console.error("Error adding credit:", error);
      setErrorMessage(error.message || (language === "fa" ? "خطا در افزودن اعتبار" : "Error adding credit"));
      setShowError(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenAddDialog(false);
    setAmount("");
    setDescription("");
    setValidationErrors({});
  };
  
  const handleExportTransactions = () => {
    // Create CSV data
    const csvData = filteredTransactions.map(transaction => ({
      id: transaction.id,
      type: transaction.type === "credit" ? (language === "fa" ? "بستانکار" : "Credit") : (language === "fa" ? "بدهکار" : "Debit"),
      amount: transaction.amount,
      date: transaction.date,
      description: transaction.description,
      category: transaction.category,
      status: transaction.status
    }));
    
    // Convert to CSV string
    const headers = Object.keys(csvData[0] || {});
    const csvString = [headers.join(','), ...csvData.map(row => headers.map(header => (row as any)[header]).join(','))].join('\n');
    
    // Download file
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const creditStats = useMemo(() => {
    const totalCredits = transactions
      .filter((t) => t.type === "credit")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalDebits = transactions
      .filter((t) => t.type === "debit")
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyCredits = transactions
      .filter((t) => {
        const transactionDate = new Date(t.date);
        const currentDate = new Date();
        return (
          t.type === "credit" &&
          transactionDate.getMonth() === currentDate.getMonth() &&
          transactionDate.getFullYear() === currentDate.getFullYear()
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);
      
    const monthlyDebits = transactions
      .filter((t) => {
        const transactionDate = new Date(t.date);
        const currentDate = new Date();
        return (
          t.type === "debit" &&
          transactionDate.getMonth() === currentDate.getMonth() &&
          transactionDate.getFullYear() === currentDate.getFullYear()
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);
      
    const pendingTransactions = transactions.filter(t => t.status === "pending").length;
    const successfulTransactions = transactions.filter(t => t.status === "completed").length;
    const totalTransactions = transactions.length;
    const successRate = totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0;

    return {
      totalCredits,
      totalDebits,
      monthlyCredits,
      monthlyDebits,
      netBalance: totalCredits - totalDebits,
      pendingTransactions,
      successfulTransactions,
      totalTransactions,
      successRate,
      monthlyNet: monthlyCredits - monthlyDebits
    };
  }, [transactions]);

  if (isLoading) {
    return (
      <Box sx={componentStyles.dashboard.container}>
        <Stack spacing={3}>
          <LinearProgress />
          <Alert severity="info">{language === "fa" ? "در حال بارگذاری..." : "Loading..."}</Alert>
        </Stack>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={componentStyles.dashboard.container}>
        <Alert severity="error">{language === "fa" ? "کاربر یافت نشد" : "User not found"}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={componentStyles.dashboard.container}>
      <Stack spacing={4}>
        {/* Header */}
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
          <Typography
            variant="h4"
            component="h1"
            color="primary"
            sx={getTypographyStyles(language, "h4")}
          >
            {language === "fa" ? "مدیریت اعتبار" : "Credit Management"}
          </Typography>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Tooltip title={language === "fa" ? "بروزرسانی" : "Refresh"}>
              <IconButton 
                onClick={() => loadUserData(user.id)} 
                color="primary"
                sx={{ borderRadius: 2 }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            
            <Button
              variant="outlined"
              startIcon={<PaymentIcon />}
              onClick={() => navigate('/account-recharge')}
              sx={componentStyles.form.button}
            >
              {language === "fa" ? "شارژ آنلاین" : "Online Recharge"}
            </Button>
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenAddDialog(true)}
              sx={componentStyles.form.button}
            >
              {language === "fa" ? "افزودن اعتبار" : "Add Credit"}
            </Button>
          </Box>
        </Box>

        {/* Enhanced Credit Statistics */}
        <Box sx={componentStyles.dashboard.statsGrid}>
          {/* Current Balance Card */}
          <Card sx={{ 
            ...componentStyles.dashboard.statCard,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white"
          }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <AccountBalanceIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      ...getTypographyStyles(language, "h4"),
                      color: "white",
                      fontWeight: 700,
                    }}
                  >
                    {formatCurrency(userBalance, language)}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      ...getTypographyStyles(language, "body2"),
                      color: "rgba(255,255,255,0.9)",
                    }}
                  >
                    {language === "fa" ? "موجودی فعلی" : "Current Balance"}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Total Credits */}
          <Card sx={{ ...componentStyles.dashboard.statCard, backgroundColor: "success.50" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <TrendingUpIcon color="success" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography
                    variant="h4"
                    color="success.main"
                    sx={getTypographyStyles(language, "h4")}
                  >
                    {formatCurrency(creditStats.totalCredits, language)}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={getTypographyStyles(language, "body2")}
                  >
                    {language === "fa" ? "کل دریافتی" : "Total Credits"}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Total Debits */}
          <Card sx={{ ...componentStyles.dashboard.statCard, backgroundColor: "error.50" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <TrendingDownIcon color="error" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography
                    variant="h4"
                    color="error.main"
                    sx={getTypographyStyles(language, "h4")}
                  >
                    {formatCurrency(creditStats.totalDebits, language)}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={getTypographyStyles(language, "body2")}
                  >
                    {language === "fa" ? "کل پرداختی" : "Total Debits"}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Monthly Net */}
          <Card sx={{ ...componentStyles.dashboard.statCard, backgroundColor: "info.50" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <AnalyticsIcon color="info" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography
                    variant="h4"
                    color="info.main"
                    sx={getTypographyStyles(language, "h4")}
                  >
                    {formatCurrency(creditStats.monthlyNet, language)}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={getTypographyStyles(language, "body2")}
                  >
                    {language === "fa" ? "خالص ماه جاری" : "This Month Net"}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Enhanced Transaction Management */}
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
                <HistoryIcon color="primary" />
                <Typography variant="h5" sx={getTypographyStyles(language, "h5")}>
                  {language === "fa" ? "مدیریت تراکنش‌ها" : "Transaction Management"}
                </Typography>
                <Chip 
                  label={filteredTransactions.length} 
                  color="primary" 
                  size="small" 
                />
              </Box>

              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <TextField
                  placeholder={language === "fa" ? "جستجو در تراکنش‌ها..." : "Search transactions..."}
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
                
                <Tooltip title={language === "fa" ? "خروجی اکسل" : "Export Excel"}>
                  <IconButton onClick={handleExportTransactions} color="primary">
                    <ExportIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Collapsible Filters */}
            <Collapse in={showFilters}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <Select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as "all" | "credit" | "debit")}
                      displayEmpty
                    >
                      <MenuItem value="all">{language === "fa" ? "همه تراکنش‌ها" : "All Transactions"}</MenuItem>
                      <MenuItem value="credit">{language === "fa" ? "دریافتی" : "Credits"}</MenuItem>
                      <MenuItem value="debit">{language === "fa" ? "پرداختی" : "Debits"}</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Paper>
            </Collapse>

            <Divider />

            {/* Enhanced Transaction List */}
            <Stack spacing={2}>
              {filteredTransactions.length === 0 ? (
                <Alert severity="info" sx={{ textAlign: "center" }}>
                  {language === "fa" ? "تراکنشی یافت نشد" : "No transactions found"}
                </Alert>
              ) : (
                filteredTransactions.slice(0, 20).map((transaction, index) => (
                  <Fade in={true} timeout={300 + index * 50} key={transaction.id}>
                    <Card 
                      variant="outlined" 
                      sx={{
                        transition: "all 0.3s ease",
                        "&:hover": {
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      <CardContent>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexDirection: isRTL ? "row-reverse" : "row",
                            gap: 2,
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                              {transaction.type === "credit" ? (
                                <TrendingUpIcon color="success" fontSize="small" />
                              ) : (
                                <TrendingDownIcon color="error" fontSize="small" />
                              )}
                              <Typography
                                variant="body1"
                                sx={{
                                  ...getTypographyStyles(language, "body1"),
                                  fontWeight: 500,
                                }}
                              >
                                {transaction.description}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={getTypographyStyles(language, "body2")}
                              >
                                {formatDate(new Date(transaction.date), language, {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </Typography>
                              
                              <Chip
                                label={transaction.category}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: "0.7rem" }}
                              />
                              
                              <Chip
                                label={
                                  transaction.status === "completed" ? 
                                    (language === "fa" ? "تکمیل شده" : "Completed") :
                                  transaction.status === "pending" ?
                                    (language === "fa" ? "در انتظار" : "Pending") :
                                    (language === "fa" ? "ناموفق" : "Failed")
                                }
                                size="small"
                                color={
                                  transaction.status === "completed" ? "success" :
                                  transaction.status === "pending" ? "warning" : "error"
                                }
                              />
                            </Box>
                          </Box>
                          
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box sx={{ textAlign: isRTL ? "left" : "right" }}>
                              <Typography
                                variant="h6"
                                color={
                                  transaction.type === "credit"
                                    ? "success.main"
                                    : "error.main"
                                }
                                sx={{
                                  ...getTypographyStyles(language, "h6"),
                                  fontWeight: 600,
                                }}
                              >
                                {transaction.type === "credit" ? "+" : "-"}
                                {formatCurrency(transaction.amount, language)}
                              </Typography>
                              
                              <Typography variant="caption" color="text.secondary">
                                ID: {transaction.id.split('_').pop()}
                              </Typography>
                            </Box>
                            
                            <IconButton
                              size="small"
                              onClick={(e) => setAnchorEl(e.currentTarget)}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Fade>
                ))
              )}
            </Stack>
            
            {/* Show More Button */}
            {filteredTransactions.length > 20 && (
              <Box sx={{ textAlign: "center" }}>
                <Button variant="outlined" size="large">
                  {language === "fa" ? "نمایش بیشتر" : "Show More"} 
                  ({filteredTransactions.length - 20} {language === "fa" ? "مورد" : "more"})
                </Button>
              </Box>
            )}
          </Stack>
        </Paper>

        {/* Enhanced Add Credit Dialog */}
        <Dialog
          open={openAddDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
          sx={componentStyles.dialog}
        >
          <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CreditCardIcon color="primary" />
            <Typography sx={getTypographyStyles(language, "h6")}>
              {language === "fa" ? "افزودن اعتبار دستی" : "Manual Credit Addition"}
            </Typography>
          </DialogTitle>
          
          <DialogContent>
            <Stack spacing={3} sx={{ pt: 1 }}>
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                {language === "fa"
                  ? "این عملیات برای اضافه کردن دستی اعتبار به حساب شما است. برای شارژ آنلاین از گزینه 'شارژ آنلاین' استفاده کنید."
                  : "This operation is for manually adding credit to your account. For online recharge, use the 'Online Recharge' option."
                }
              </Alert>
              
              <TextField
                autoFocus
                label={language === "fa" ? "مبلغ (تومان)" : "Amount (Tomans)"}
                type="number"
                fullWidth
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                error={!!validationErrors.amount}
                helperText={validationErrors.amount || 
                  (language === "fa" 
                    ? "حداقل ۱٬۰۰۰ و حداکثر ۱٬۰۰۰٬۰۰۰ تومان" 
                    : "Minimum 1,000 and maximum 1,000,000 Tomans"
                  )
                }
                InputProps={{
                  inputProps: { min: 1000, max: 1000000 },
                  startAdornment: (
                    <InputAdornment position="start">
                      <CreditCardIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={componentStyles.form.field}
              />
              
              <TextField
                label={language === "fa" ? "توضیحات (اختیاری)" : "Description (Optional)"}
                fullWidth
                multiline
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={language === "fa" 
                  ? "دلیل افزودن اعتبار را بنویسید..."
                  : "Write the reason for adding credit..."
                }
                sx={componentStyles.form.field}
              />
              
              {amount && parseFloat(amount) > 0 && (
                <Paper variant="outlined" sx={{ p: 2, backgroundColor: "success.50" }}>
                  <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                    {language === "fa" ? "موجودی جدید: " : "New Balance: "}
                    {formatCurrency(userBalance + parseFloat(amount), language)}
                  </Typography>
                </Paper>
              )}
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
              onClick={handleAddCredit}
              variant="contained"
              disabled={!amount || parseFloat(amount) <= 0 || isSaving}
              startIcon={isSaving ? <RefreshIcon /> : <AddIcon />}
              sx={componentStyles.form.button}
            >
              {isSaving 
                ? (language === "fa" ? "در حال افزودن..." : "Adding...")
                : (language === "fa" ? "افزودن اعتبار" : "Add Credit")
              }
            </Button>
          </DialogActions>
        </Dialog>

        {/* Transaction Actions Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => setAnchorEl(null)}>
            <VisibilityIcon sx={{ mr: 1 }} />
            {language === "fa" ? "مشاهده جزئیات" : "View Details"}
          </MenuItem>
          <MenuItem onClick={() => setAnchorEl(null)}>
            <ReceiptIcon sx={{ mr: 1 }} />
            {language === "fa" ? "دانلود رسید" : "Download Receipt"}
          </MenuItem>
        </Menu>

        {/* Success Snackbar */}
        <Snackbar
          open={showSuccess}
          autoHideDuration={4000}
          onClose={() => setShowSuccess(false)}
        >
          <Alert onClose={() => setShowSuccess(false)} severity="success" sx={{ borderRadius: 2 }}>
            {language === "fa" ? "اعتبار با موفقیت اضافه شد" : "Credit added successfully"}
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

export default Credit;