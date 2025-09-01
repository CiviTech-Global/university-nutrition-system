import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Card,
  CardContent,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  LinearProgress,
  CircularProgress,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  AccountBalance as AccountBalanceIcon,
  CreditCard as CreditCardIcon,
  Payment as PaymentIcon,
  Security as SecurityIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../utils/userUtils";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  formatCurrency,
  createComponentStyles,
  getTypographyStyles,
} from "../../utils/languageUtils";
import DataService, { type Transaction } from "../../services/dataService";
import PaymentGatewayService, { 
  type PaymentGateway, 
  type PaymentRequest,
  type PaymentResponse 
} from "../../services/paymentGatewayService";

interface RechargeFormData {
  amount: number;
  gateway: string;
  description: string;
}

const AccountRecharge = () => {
  const { language, isRTL } = useLanguage();
  const componentStyles = createComponentStyles(language);
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [userBalance, setUserBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [dataService] = useState(DataService.getInstance());
  const [paymentGatewayService] = useState(PaymentGatewayService.getInstance());
  const [paymentGateways, setPaymentGateways] = useState<PaymentGateway[]>([]);

  const [formData, setFormData] = useState<RechargeFormData>({
    amount: 0,
    gateway: "",
    description: "",
  });

  const [validationErrors, setValidationErrors] = useState<{
    amount?: string;
    gateway?: string;
  }>({});

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      loadUserData(currentUser.id);
    } else {
      navigate("/login");
    }
    
    // Load available payment gateways
    const gateways = paymentGatewayService.getAvailableGateways();
    setPaymentGateways(gateways);
    
    setIsLoading(false);
  }, [navigate, paymentGatewayService]);

  const loadUserData = (userId: string) => {
    try {
      const balance = dataService.getUserBalance(userId);
      setUserBalance(balance);
    } catch (error) {
      console.error("Error loading user data:", error);
      setErrorMessage(language === "fa" ? "خطا در بارگذاری داده‌ها" : "Error loading data");
      setShowError(true);
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const errors: { amount?: string; gateway?: string } = {};

    // Amount validation
    if (!formData.amount || formData.amount <= 0) {
      errors.amount = language === "fa" ? "مبلغ الزامی است" : "Amount is required";
    } else if (formData.amount < 10000) {
      errors.amount = language === "fa" ? "حداقل مبلغ ۱۰٬۰۰۰ تومان است" : "Minimum amount is 10,000 Tomans";
    } else if (formData.amount > 200000) {
      errors.amount = language === "fa" ? "حداکثر مبلغ ۲۰۰٬۰۰۰ تومان است" : "Maximum amount is 200,000 Tomans";
    }

    // Gateway validation
    if (!formData.gateway) {
      errors.gateway = language === "fa" ? "درگاه پرداخت الزامی است" : "Payment gateway is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAmountChange = (value: string) => {
    const numericValue = parseInt(value) || 0;
    setFormData(prev => ({ ...prev, amount: numericValue }));
    
    // Clear amount validation error when user types
    if (validationErrors.amount) {
      setValidationErrors(prev => ({ ...prev, amount: undefined }));
    }
  };

  const handleGatewayChange = (gatewayId: string) => {
    setFormData(prev => ({ ...prev, gateway: gatewayId }));
    
    // Clear gateway validation error when user selects
    if (validationErrors.gateway) {
      setValidationErrors(prev => ({ ...prev, gateway: undefined }));
    }
  };

  const handleProceedToPayment = () => {
    if (validateForm()) {
      setShowPaymentDialog(true);
    }
  };

  const handleConfirmPayment = async () => {
    if (!user) return;

    setIsProcessing(true);
    setShowPaymentDialog(false);

    try {
      // Create payment request
      const paymentRequest: PaymentRequest = {
        gatewayId: formData.gateway,
        amount: formData.amount,
        userId: user.id,
        description: formData.description || (language === "fa" ? "شارژ حساب کاربری" : "Account recharge"),
      };

      // Validate payment request
      const validation = paymentGatewayService.validatePaymentRequest(paymentRequest);
      if (!validation.valid) {
        throw new Error(validation.errors[0]);
      }

      // Process payment through gateway
      const paymentResponse: PaymentResponse = await paymentGatewayService.processPayment(paymentRequest);
      
      if (paymentResponse.success) {
        // Update user balance (only the requested amount, not including fees)
        const newBalance = userBalance + formData.amount;
        dataService.updateUserBalance(user.id, newBalance);
        
        // Create transaction record
        const selectedGateway = paymentGateways.find(g => g.id === formData.gateway);
        const transaction: Transaction = {
          id: paymentResponse.transactionId,
          userId: user.id,
          type: "credit",
          amount: formData.amount,
          date: new Date().toISOString().split('T')[0],
          description: language === "fa" 
            ? `شارژ حساب از طریق ${selectedGateway?.name || "درگاه"}`
            : `Account recharge via ${selectedGateway?.nameEn || "gateway"}`,
          category: "recharge",
          paymentMethod: "gateway",
          status: "completed",
        };
        
        dataService.saveTransaction(transaction);
        
        // Update local state
        setUserBalance(newBalance);
        
        // Reset form
        setFormData({ amount: 0, gateway: "", description: "" });
        
        // Show success
        setShowSuccessDialog(true);
        
      } else {
        throw new Error(paymentResponse.message);
      }
      
    } catch (error: any) {
      console.error("Payment processing error:", error);
      setErrorMessage(error.message || (language === "fa" 
        ? "خطا در پردازش پرداخت. لطفاً دوباره تلاش کنید."
        : "Payment processing error. Please try again."
      ));
      setShowError(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    // Redirect to reservations page after 1 second
    setTimeout(() => {
      navigate("/my-reservations");
    }, 1000);
  };

  // Calculate totals
  const selectedGateway = paymentGateways.find(g => g.id === formData.gateway);
  const gatewayFee = selectedGateway?.fee || 0;
  const totalAmount = formData.amount + gatewayFee;

  // Predefined amount options
  const quickAmounts = [10000, 25000, 50000, 100000, 150000, 200000];

  if (isLoading) {
    return (
      <Box sx={{ py: 4, width: "100%", display: "flex", justifyContent: "center" }}>
        <Alert severity="info">{language === "fa" ? "در حال بارگذاری..." : "Loading..."}</Alert>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ py: 4, width: "100%", display: "flex", justifyContent: "center" }}>
        <Alert severity="error">{language === "fa" ? "کاربر یافت نشد" : "User not found"}</Alert>
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Tooltip title={language === "fa" ? "بازگشت" : "Go Back"}>
              <IconButton onClick={() => navigate("/credit")} color="primary">
                <ArrowBackIcon sx={{ transform: isRTL ? "rotate(180deg)" : "none" }} />
              </IconButton>
            </Tooltip>
            <Typography
              variant="h4"
              component="h1"
              color="primary"
              sx={getTypographyStyles(language, "h4")}
            >
              {language === "fa" ? "شارژ حساب" : "Account Recharge"}
            </Typography>
          </Box>

          <Tooltip title={language === "fa" ? "بروزرسانی موجودی" : "Refresh Balance"}>
            <IconButton onClick={() => loadUserData(user.id)} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Current Balance Card */}
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
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
                variant="body1"
                sx={{
                  ...getTypographyStyles(language, "body1"),
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                {language === "fa" ? "موجودی فعلی حساب شما" : "Your Current Account Balance"}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Recharge Form */}
        <Paper elevation={3} sx={componentStyles.card}>
          <Stack spacing={4}>
            <Typography variant="h5" sx={getTypographyStyles(language, "h5")}>
              {language === "fa" ? "شارژ حساب کاربری" : "Account Recharge"}
            </Typography>

            <Divider />

            {/* Amount Selection */}
            <Box>
              <Typography variant="h6" sx={{ ...getTypographyStyles(language, "h6"), mb: 2 }}>
                {language === "fa" ? "انتخاب مبلغ (تومان)" : "Select Amount (Tomans)"}
              </Typography>

              {/* Quick Amount Buttons */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                {quickAmounts.map((amount) => (
                  <Chip
                    key={amount}
                    label={formatCurrency(amount, language)}
                    onClick={() => handleAmountChange(amount.toString())}
                    color={formData.amount === amount ? "primary" : "default"}
                    variant={formData.amount === amount ? "filled" : "outlined"}
                    sx={{
                      cursor: "pointer",
                      fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                    }}
                  />
                ))}
              </Box>

              {/* Custom Amount Input */}
              <TextField
                fullWidth
                label={language === "fa" ? "مبلغ دلخواه" : "Custom Amount"}
                type="number"
                value={formData.amount || ""}
                onChange={(e) => handleAmountChange(e.target.value)}
                error={!!validationErrors.amount}
                helperText={validationErrors.amount || 
                  (language === "fa" 
                    ? "حداقل ۱۰٬۰۰۰ و حداکثر ۲۰۰٬۰۰۰ تومان" 
                    : "Minimum 10,000 and maximum 200,000 Tomans"
                  )
                }
                InputProps={{
                  inputProps: { min: 10000, max: 200000 },
                }}
                sx={componentStyles.form.field}
              />
            </Box>

            {/* Payment Gateway Selection */}
            <Box>
              <Typography variant="h6" sx={{ ...getTypographyStyles(language, "h6"), mb: 2 }}>
                {language === "fa" ? "انتخاب درگاه پرداخت" : "Select Payment Gateway"}
              </Typography>

              <FormControl fullWidth error={!!validationErrors.gateway}>
                <InputLabel>{language === "fa" ? "درگاه پرداخت" : "Payment Gateway"}</InputLabel>
                <Select
                  value={formData.gateway}
                  onChange={(e) => handleGatewayChange(e.target.value)}
                  sx={componentStyles.form.field}
                >
                  {paymentGateways.filter(g => g.isActive).map((gateway) => (
                    <MenuItem key={gateway.id} value={gateway.id}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
                        <img
                          src={gateway.logo}
                          alt={language === "fa" ? gateway.name : gateway.nameEn}
                          style={{ width: 32, height: 32, borderRadius: 4 }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" sx={getTypographyStyles(language, "body1")}>
                            {language === "fa" ? gateway.name : gateway.nameEn}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {language === "fa" ? gateway.description : gateway.descriptionEn}
                          </Typography>
                        </Box>
                        {gateway.fee > 0 && (
                          <Chip
                            label={`${language === "fa" ? "کارمزد" : "Fee"}: ${formatCurrency(gateway.fee, language)}`}
                            size="small"
                            color="warning"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {validationErrors.gateway && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    {validationErrors.gateway}
                  </Typography>
                )}
              </FormControl>
            </Box>

            {/* Payment Summary */}
            {formData.amount > 0 && selectedGateway && (
              <Card sx={{ backgroundColor: "primary.50", border: "1px solid", borderColor: "primary.200" }}>
                <CardContent>
                  <Typography variant="h6" sx={{ ...getTypographyStyles(language, "h6"), mb: 2 }}>
                    {language === "fa" ? "خلاصه پرداخت" : "Payment Summary"}
                  </Typography>
                  
                  <Stack spacing={1}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography>{language === "fa" ? "مبلغ شارژ:" : "Recharge Amount:"}</Typography>
                      <Typography sx={{ fontWeight: 600 }}>
                        {formatCurrency(formData.amount, language)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography>{language === "fa" ? "کارمزد درگاه:" : "Gateway Fee:"}</Typography>
                      <Typography sx={{ fontWeight: 600 }}>
                        {formatCurrency(gatewayFee, language)}
                      </Typography>
                    </Box>
                    
                    <Divider />
                    
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="h6" sx={getTypographyStyles(language, "h6")}>
                        {language === "fa" ? "مبلغ کل:" : "Total Amount:"}
                      </Typography>
                      <Typography variant="h6" sx={{ ...getTypographyStyles(language, "h6"), color: "primary.main" }}>
                        {formatCurrency(totalAmount, language)}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* Proceed to Payment Button */}
            <Button
              variant="contained"
              size="large"
              startIcon={<PaymentIcon />}
              onClick={handleProceedToPayment}
              disabled={!formData.amount || !formData.gateway}
              sx={{
                ...componentStyles.form.button,
                py: 2,
                fontSize: "1.1rem",
              }}
            >
              {language === "fa" ? "ادامه پرداخت" : "Proceed to Payment"}
            </Button>
          </Stack>
        </Paper>

        {/* Processing Dialog */}
        <Dialog
          open={isProcessing}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 2 }
          }}
        >
          <DialogContent sx={{ textAlign: "center", py: 4 }}>
            <CircularProgress color="primary" size={60} sx={{ mb: 3 }} />
            <Typography variant="h6" sx={{ ...getTypographyStyles(language, "h6"), mb: 1 }}>
              {language === "fa" ? "در حال پردازش پرداخت..." : "Processing Payment..."}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {language === "fa" 
                ? "لطفاً منتظر بمانید. این فرآیند ممکن است چند ثانیه طول بکشد."
                : "Please wait. This process may take a few seconds."
              }
            </Typography>
            <LinearProgress sx={{ mt: 3, borderRadius: 1 }} />
          </DialogContent>
        </Dialog>

        {/* Payment Confirmation Dialog */}
        <Dialog
          open={showPaymentDialog}
          onClose={() => setShowPaymentDialog(false)}
          maxWidth="sm"
          fullWidth
          sx={componentStyles.dialog}
        >
          <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <SecurityIcon color="primary" />
            <Typography sx={getTypographyStyles(language, "h6")}>
              {language === "fa" ? "تأیید پرداخت" : "Confirm Payment"}
            </Typography>
          </DialogTitle>
          
          <DialogContent>
            <Stack spacing={3}>
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                {language === "fa"
                  ? "شما در حال انتقال به درگاه پرداخت امن هستید."
                  : "You will be redirected to the secure payment gateway."
                }
              </Alert>

              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" sx={{ ...getTypographyStyles(language, "h6"), mb: 2 }}>
                    {language === "fa" ? "جزئیات تراکنش" : "Transaction Details"}
                  </Typography>
                  
                  <Stack spacing={1}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography>{language === "fa" ? "مبلغ:" : "Amount:"}</Typography>
                      <Typography sx={{ fontWeight: 600 }}>
                        {formatCurrency(formData.amount, language)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography>{language === "fa" ? "درگاه:" : "Gateway:"}</Typography>
                      <Typography sx={{ fontWeight: 600 }}>
                        {language === "fa" ? selectedGateway?.name : selectedGateway?.nameEn}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography>{language === "fa" ? "کارمزد:" : "Fee:"}</Typography>
                      <Typography sx={{ fontWeight: 600 }}>
                        {formatCurrency(gatewayFee, language)}
                      </Typography>
                    </Box>
                    
                    <Divider />
                    
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="h6" sx={getTypographyStyles(language, "h6")}>
                        {language === "fa" ? "مجموع:" : "Total:"}
                      </Typography>
                      <Typography variant="h6" sx={{ ...getTypographyStyles(language, "h6"), color: "primary.main" }}>
                        {formatCurrency(totalAmount, language)}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </DialogContent>
          
          <DialogActions>
            <Button
              onClick={() => setShowPaymentDialog(false)}
              sx={componentStyles.form.button}
            >
              {language === "fa" ? "لغو" : "Cancel"}
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirmPayment}
              startIcon={<CreditCardIcon />}
              sx={componentStyles.form.button}
            >
              {language === "fa" ? "پرداخت" : "Pay Now"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success Dialog */}
        <Dialog
          open={showSuccessDialog}
          onClose={handleSuccessDialogClose}
          maxWidth="sm"
          fullWidth
          sx={componentStyles.dialog}
        >
          <DialogContent sx={{ textAlign: "center", py: 4 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="h5" sx={{ ...getTypographyStyles(language, "h5"), mb: 2, color: "success.main" }}>
              {language === "fa" ? "پرداخت موفق!" : "Payment Successful!"}
            </Typography>
            <Typography variant="body1" sx={{ ...getTypographyStyles(language, "body1"), mb: 1 }}>
              {language === "fa" 
                ? `مبلغ ${formatCurrency(formData.amount, language)} به حساب شما اضافه شد.`
                : `${formatCurrency(formData.amount, language)} has been added to your account.`
              }
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {language === "fa"
                ? "اکنون می‌توانید برای رزرو غذا اقدام کنید."
                : "You can now proceed to make food reservations."
              }
            </Typography>
          </DialogContent>
          
          <DialogActions sx={{ justifyContent: "center" }}>
            <Button
              variant="contained"
              onClick={handleSuccessDialogClose}
              sx={componentStyles.form.button}
            >
              {language === "fa" ? "ادامه" : "Continue"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Error Snackbar */}
        <Snackbar
          open={showError}
          autoHideDuration={6000}
          onClose={() => setShowError(false)}
        >
          <Alert onClose={() => setShowError(false)} severity="error" sx={{ borderRadius: 2 }}>
            {errorMessage}
          </Alert>
        </Snackbar>
      </Stack>
    </Box>
  );
};

export default AccountRecharge;