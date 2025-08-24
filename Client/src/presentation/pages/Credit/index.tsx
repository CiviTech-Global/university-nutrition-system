import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Card,
  CardContent,
  Grid,
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
} from "@mui/material";
import {
  Add as AddIcon,
  CreditCard as CreditCardIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
} from "@mui/icons-material";
import { getCurrentUser } from "../../utils/userUtils";
import { useLanguage } from "../../components/Layout";
import {
  formatCurrency,
  formatDate,
  toPersianNumber,
  createLanguageStyles,
} from "../../utils/languageUtils";

interface Transaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  date: string;
  description: string;
  category: string;
}

const Credit = () => {
  const { language, t, isRTL } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userBalance, setUserBalance] = useState(1250000);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      loadUserData(currentUser.id);
    } else {
      window.location.href = "/login";
    }
    setIsLoading(false);
  }, []);

  const loadUserData = (userId: string) => {
    try {
      const savedBalance = localStorage.getItem(`balance_${userId}`);
      if (savedBalance) {
        setUserBalance(parseFloat(savedBalance));
      }

      const savedTransactions = localStorage.getItem(`transactions_${userId}`);
      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions));
      } else {
        const sampleTransactions: Transaction[] = [
          {
            id: "1",
            type: "credit",
            amount: 500000,
            date: "2024-01-15",
            description: t.creditAdded,
            category: "deposit",
          },
          {
            id: "2",
            type: "debit",
            amount: 75000,
            date: "2024-01-14",
            description: t.mealPurchase,
            category: "food",
          },
          {
            id: "3",
            type: "credit",
            amount: 300000,
            date: "2024-01-10",
            description: t.creditAdded,
            category: "deposit",
          },
        ];
        setTransactions(sampleTransactions);
        localStorage.setItem(
          `transactions_${userId}`,
          JSON.stringify(sampleTransactions)
        );
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleAddCredit = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    const newAmount = parseFloat(amount);
    const newBalance = userBalance + newAmount;

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: "credit",
      amount: newAmount,
      date: new Date().toISOString().split("T")[0],
      description: t.creditAdded,
      category: "deposit",
    };

    try {
      setUserBalance(newBalance);
      localStorage.setItem(`balance_${user.id}`, newBalance.toString());

      const updatedTransactions = [newTransaction, ...transactions];
      setTransactions(updatedTransactions);
      localStorage.setItem(
        `transactions_${user.id}`,
        JSON.stringify(updatedTransactions)
      );

      setShowSuccess(true);
      setOpenAddDialog(false);
      setAmount("");
    } catch (error) {
      console.error("Error adding credit:", error);
      setShowError(true);
    }
  };

  const handleCloseDialog = () => {
    setOpenAddDialog(false);
    setAmount("");
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

    return {
      totalCredits,
      totalDebits,
      monthlyCredits,
      netBalance: totalCredits - totalDebits,
    };
  }, [transactions]);

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
    <Box sx={{ py: 4, width: "100%" }}>
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
            sx={{
              direction: isRTL ? "rtl" : "ltr",
              fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
              textAlign: isRTL ? "right" : "left",
            }}
          >
            {t.credit}
          </Typography>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Tooltip title={t.refreshData}>
              <IconButton onClick={() => loadUserData(user.id)} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenAddDialog(true)}
              sx={{
                fontFamily: isRTL
                  ? "var(--font-persian)"
                  : "var(--font-english)",
                direction: isRTL ? "rtl" : "ltr",
              }}
            >
              {t.addCredit}
            </Button>
          </Box>
        </Box>

        {/* Credit Statistics Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: "primary.50" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <AccountBalanceIcon color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography
                      variant="h4"
                      color="primary"
                      sx={{
                        direction: isRTL ? "rtl" : "ltr",
                        fontFamily: isRTL
                          ? "var(--font-persian)"
                          : "var(--font-english)",
                        textAlign: isRTL ? "right" : "left",
                      }}
                    >
                      {formatCurrency(userBalance, language)}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        direction: isRTL ? "rtl" : "ltr",
                        fontFamily: isRTL
                          ? "var(--font-persian)"
                          : "var(--font-english)",
                        textAlign: isRTL ? "right" : "left",
                      }}
                    >
                      {t.currentBalance}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: "success.50" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <TrendingUpIcon color="success" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography
                      variant="h4"
                      color="success.main"
                      sx={{
                        direction: isRTL ? "rtl" : "ltr",
                        fontFamily: isRTL
                          ? "var(--font-persian)"
                          : "var(--font-english)",
                        textAlign: isRTL ? "right" : "left",
                      }}
                    >
                      {formatCurrency(creditStats.totalCredits, language)}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        direction: isRTL ? "rtl" : "ltr",
                        fontFamily: isRTL
                          ? "var(--font-persian)"
                          : "var(--font-english)",
                        textAlign: isRTL ? "right" : "left",
                      }}
                    >
                      {t.totalCredits}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: "error.50" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <TrendingDownIcon color="error" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography
                      variant="h4"
                      color="error.main"
                      sx={{
                        direction: isRTL ? "rtl" : "ltr",
                        fontFamily: isRTL
                          ? "var(--font-persian)"
                          : "var(--font-english)",
                        textAlign: isRTL ? "right" : "left",
                      }}
                    >
                      {formatCurrency(creditStats.totalDebits, language)}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        direction: isRTL ? "rtl" : "ltr",
                        fontFamily: isRTL
                          ? "var(--font-persian)"
                          : "var(--font-english)",
                        textAlign: isRTL ? "right" : "left",
                      }}
                    >
                      {t.totalDebits}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: "info.50" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <CreditCardIcon color="info" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography
                      variant="h4"
                      color="info.main"
                      sx={{
                        direction: isRTL ? "rtl" : "ltr",
                        fontFamily: isRTL
                          ? "var(--font-persian)"
                          : "var(--font-english)",
                        textAlign: isRTL ? "right" : "left",
                      }}
                    >
                      {formatCurrency(creditStats.monthlyCredits, language)}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        direction: isRTL ? "rtl" : "ltr",
                        fontFamily: isRTL
                          ? "var(--font-persian)"
                          : "var(--font-english)",
                        textAlign: isRTL ? "right" : "left",
                      }}
                    >
                      {t.thisMonth}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Transactions */}
        <Paper elevation={3} sx={{ p: 4, borderRadius: 0 }}>
          <Stack spacing={3}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexDirection: isRTL ? "row-reverse" : "row",
              }}
            >
              <HistoryIcon color="action" />
              <Typography
                variant="h5"
                sx={{
                  direction: isRTL ? "rtl" : "ltr",
                  fontFamily: isRTL
                    ? "var(--font-persian)"
                    : "var(--font-english)",
                  textAlign: isRTL ? "right" : "left",
                }}
              >
                {t.recentTransactions}
              </Typography>
            </Box>

            <Divider />

            <Grid container spacing={2}>
              {transactions.slice(0, 10).map((transaction) => (
                <Grid item xs={12} key={transaction.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexDirection: isRTL ? "row-reverse" : "row",
                        }}
                      >
                        <Box>
                          <Typography
                            variant="body1"
                            sx={{
                              direction: isRTL ? "rtl" : "ltr",
                              fontFamily: isRTL
                                ? "var(--font-persian)"
                                : "var(--font-english)",
                              textAlign: isRTL ? "right" : "left",
                            }}
                          >
                            {transaction.description}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              direction: isRTL ? "rtl" : "ltr",
                              fontFamily: isRTL
                                ? "var(--font-persian)"
                                : "var(--font-english)",
                              textAlign: isRTL ? "right" : "left",
                            }}
                          >
                            {formatDate(new Date(transaction.date), language, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: isRTL ? "left" : "right" }}>
                          <Typography
                            variant="h6"
                            color={
                              transaction.type === "credit"
                                ? "success.main"
                                : "error.main"
                            }
                            sx={{
                              direction: isRTL ? "rtl" : "ltr",
                              fontFamily: isRTL
                                ? "var(--font-persian)"
                                : "var(--font-english)",
                            }}
                          >
                            {transaction.type === "credit" ? "+" : "-"}
                            {formatCurrency(transaction.amount, language)}
                          </Typography>
                          <Chip
                            label={
                              transaction.type === "credit" ? t.credit : t.debit
                            }
                            color={
                              transaction.type === "credit"
                                ? "success"
                                : "error"
                            }
                            size="small"
                            sx={{
                              fontFamily: isRTL
                                ? "var(--font-persian)"
                                : "var(--font-english)",
                              direction: isRTL ? "rtl" : "ltr",
                            }}
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Paper>
      </Stack>

      {/* Add Credit Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            direction: isRTL ? "rtl" : "ltr",
            fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
            textAlign: isRTL ? "right" : "left",
          }}
        >
          {t.addCredit}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t.amount}
            type="number"
            fullWidth
            variant="outlined"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            sx={{
              mt: 2,
              "& .MuiInputLabel-root": {
                direction: isRTL ? "rtl" : "ltr",
                fontFamily: isRTL
                  ? "var(--font-persian)"
                  : "var(--font-english)",
              },
              "& .MuiInputBase-input": {
                direction: isRTL ? "rtl" : "ltr",
                fontFamily: isRTL
                  ? "var(--font-persian)"
                  : "var(--font-english)",
                textAlign: isRTL ? "right" : "left",
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            sx={{
              fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
              direction: isRTL ? "rtl" : "ltr",
            }}
          >
            {t.cancel}
          </Button>
          <Button
            onClick={handleAddCredit}
            variant="contained"
            disabled={!amount || parseFloat(amount) <= 0}
            sx={{
              fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
              direction: isRTL ? "rtl" : "ltr",
            }}
          >
            {t.add}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        message={t.creditAddedSuccess}
      />

      {/* Error Snackbar */}
      <Snackbar
        open={showError}
        autoHideDuration={3000}
        onClose={() => setShowError(false)}
      >
        <Alert onClose={() => setShowError(false)} severity="error">
          {t.errorAddingCredit}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Credit;
