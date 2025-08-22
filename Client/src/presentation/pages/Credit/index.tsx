import { useState, useEffect } from "react";
import {
  Box,
  Container,
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
} from "@mui/material";
import {
  Add as AddIcon,
  CreditCard as CreditCardIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import { translations } from "../../locales";
import type { Language as LanguageType } from "../../locales";
import { getCurrentUser } from "../../utils/userUtils";

const Credit = () => {
  const [language, setLanguage] = useState<LanguageType>("en");
  const [user, setUser] = useState<any>(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [amount, setAmount] = useState("");

  const t = translations[language];

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setLanguage(currentUser.language);
    } else {
      // Redirect to login if no user is logged in
      window.location.href = "/login";
    }
  }, []);

  const handleAddCredit = () => {
    // TODO: Implement credit addition logic
    setOpenAddDialog(false);
    setAmount("");
  };

  const handleCloseDialog = () => {
    setOpenAddDialog(false);
    setAmount("");
  };

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="info">Loading...</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            color="primary"
            sx={{
              direction: language === "fa" ? "rtl" : "ltr",
              fontFamily:
                language === "fa"
                  ? "var(--font-persian)"
                  : "var(--font-english)",
            }}
          >
            {t.credit}
          </Typography>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenAddDialog(true)}
            sx={{
              fontFamily:
                language === "fa"
                  ? "var(--font-persian)"
                  : "var(--font-english)",
            }}
          >
            {t.addCredit}
          </Button>
        </Box>

        {/* Current Balance */}
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Stack spacing={3}>
            <Typography
              variant="h5"
              sx={{
                direction: language === "fa" ? "rtl" : "ltr",
                fontFamily:
                  language === "fa"
                    ? "var(--font-persian)"
                    : "var(--font-english)",
              }}
            >
              {t.currentBalance}
            </Typography>

            <Card sx={{ backgroundColor: "primary.50" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <CreditCardIcon color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography
                      variant="h3"
                      color="primary"
                      sx={{
                        direction: language === "fa" ? "rtl" : "ltr",
                        fontFamily:
                          language === "fa"
                            ? "var(--font-persian)"
                            : "var(--font-english)",
                      }}
                    >
                      $1,250.00
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        direction: language === "fa" ? "rtl" : "ltr",
                        fontFamily:
                          language === "fa"
                            ? "var(--font-persian)"
                            : "var(--font-english)",
                      }}
                    >
                      {t.availableCredit}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Paper>

        {/* Recent Transactions */}
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Stack spacing={3}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <HistoryIcon color="action" />
              <Typography
                variant="h5"
                sx={{
                  direction: language === "fa" ? "rtl" : "ltr",
                  fontFamily:
                    language === "fa"
                      ? "var(--font-persian)"
                      : "var(--font-english)",
                }}
              >
                {t.recentTransactions}
              </Typography>
            </Box>

            <Grid container spacing={2}>
              {[
                {
                  id: 1,
                  type: "credit",
                  amount: 500,
                  date: "2024-01-15",
                  description: t.creditAdded,
                },
                {
                  id: 2,
                  type: "debit",
                  amount: -75,
                  date: "2024-01-14",
                  description: t.mealPurchase,
                },
                {
                  id: 3,
                  type: "credit",
                  amount: 300,
                  date: "2024-01-10",
                  description: t.creditAdded,
                },
              ].map((transaction) => (
                <Grid item xs={12} key={transaction.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box>
                          <Typography
                            variant="body1"
                            sx={{
                              direction: language === "fa" ? "rtl" : "ltr",
                              fontFamily:
                                language === "fa"
                                  ? "var(--font-persian)"
                                  : "var(--font-english)",
                            }}
                          >
                            {transaction.description}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              direction: language === "fa" ? "rtl" : "ltr",
                              fontFamily:
                                language === "fa"
                                  ? "var(--font-persian)"
                                  : "var(--font-english)",
                            }}
                          >
                            {new Date(transaction.date).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: "right" }}>
                          <Typography
                            variant="h6"
                            color={
                              transaction.type === "credit"
                                ? "success.main"
                                : "error.main"
                            }
                            sx={{
                              direction: language === "fa" ? "rtl" : "ltr",
                              fontFamily:
                                language === "fa"
                                  ? "var(--font-persian)"
                                  : "var(--font-english)",
                            }}
                          >
                            {transaction.type === "credit" ? "+" : ""}$
                            {Math.abs(transaction.amount).toFixed(2)}
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
                              fontFamily:
                                language === "fa"
                                  ? "var(--font-persian)"
                                  : "var(--font-english)",
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
            direction: language === "fa" ? "rtl" : "ltr",
            fontFamily:
              language === "fa" ? "var(--font-persian)" : "var(--font-english)",
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
                direction: language === "fa" ? "rtl" : "ltr",
                fontFamily:
                  language === "fa"
                    ? "var(--font-persian)"
                    : "var(--font-english)",
              },
              "& .MuiInputBase-input": {
                direction: language === "fa" ? "rtl" : "ltr",
                fontFamily:
                  language === "fa"
                    ? "var(--font-persian)"
                    : "var(--font-english)",
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            sx={{
              fontFamily:
                language === "fa"
                  ? "var(--font-persian)"
                  : "var(--font-english)",
            }}
          >
            {t.cancel}
          </Button>
          <Button
            onClick={handleAddCredit}
            variant="contained"
            sx={{
              fontFamily:
                language === "fa"
                  ? "var(--font-persian)"
                  : "var(--font-english)",
            }}
          >
            {t.add}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Credit;
