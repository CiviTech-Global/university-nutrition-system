import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Stack,
  TextField,
  Button,
  Avatar,
  Card,
  CardContent,
  Alert,
  Chip,
  LinearProgress,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Snackbar,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  Badge as BadgeIcon,
  CakeOutlined as BirthdayIcon,
  LocationOn as LocationIcon,
  Restaurant as RestaurantIcon,
  Payment as PaymentIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  Favorite as FavoriteIcon,
  PhotoCamera as PhotoCameraIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { getCurrentUser } from "../../utils/userUtils";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  formatDate,
  formatCurrency,
  createComponentStyles,
  getTypographyStyles,
} from "../../utils/languageUtils";

interface ProfileStats {
  totalReservations: number;
  totalSpent: number;
  favoriteFood: string;
  attendanceRate: number;
  membershipDays: number;
}

interface UserActivity {
  date: Date;
  type: "reservation" | "payment" | "profile_update";
  description: string;
  descriptionEn: string;
  amount?: number;
}

const Profile = () => {
  const { language, t, isRTL } = useLanguage();
  const componentStyles = createComponentStyles(language);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    phone: "",
    studentId: "",
    faculty: "",
    dateOfBirth: "",
    address: "",
    bio: "",
  });

  // Mock activity data
  const [activities, setActivities] = useState<UserActivity[]>([
    {
      date: new Date(Date.now() - 2 * 60 * 60 * 1000),
      type: "reservation",
      description: "رزرو وعده ناهار",
      descriptionEn: "Lunch meal reservation",
      amount: 45000,
    },
    {
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      type: "payment",
      description: "شارژ حساب کاربری",
      descriptionEn: "Account recharge",
      amount: 150000,
    },
    {
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      type: "profile_update",
      description: "به‌روزرسانی اطلاعات پروفایل",
      descriptionEn: "Profile information updated",
    },
  ]);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setFormData({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        email: currentUser.email || "",
        username: currentUser.username || "",
        phone: currentUser.phone || "",
        studentId: currentUser.studentId || "12345678",
        faculty: currentUser.faculty || "",
        dateOfBirth: currentUser.dateOfBirth || "",
        address: currentUser.address || "",
        bio: currentUser.bio || "",
      });
    } else {
      window.location.href = "/login";
    }
    setIsLoading(false);
  }, []);

  // Calculate profile statistics
  const profileStats: ProfileStats = useMemo(() => {
    if (!user) return {
      totalReservations: 0,
      totalSpent: 0,
      favoriteFood: "",
      attendanceRate: 0,
      membershipDays: 0,
    };

    const membershipDays = Math.floor(
      (new Date().getTime() - new Date(user.createdAt).getTime()) / 
      (1000 * 60 * 60 * 24)
    );

    // Mock data - in real app, these would come from user's reservation/payment history
    return {
      totalReservations: 127,
      totalSpent: 2850000,
      favoriteFood: language === "fa" ? "چلو کباب" : "Rice & Kebab",
      attendanceRate: 87,
      membershipDays: membershipDays || 45,
    };
  }, [user, language]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      username: user.username || "",
      phone: user.phone || "",
      studentId: user.studentId || "",
      faculty: user.faculty || "",
      dateOfBirth: user.dateOfBirth || "",
      address: user.address || "",
      bio: user.bio || "",
    });
  };

  const handleSave = () => {
    try {
      const updatedUser = {
        ...user,
        ...formData,
      };

      setUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));

      const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
      const updatedUsers = allUsers.map((u: any) =>
        u.id === user.id ? updatedUser : u
      );
      localStorage.setItem("users", JSON.stringify(updatedUsers));

      // Add activity record
      const newActivity: UserActivity = {
        date: new Date(),
        type: "profile_update",
        description: "به‌روزرسانی اطلاعات پروفایل",
        descriptionEn: "Profile information updated",
      };
      setActivities(prev => [newActivity, ...prev]);

      setIsEditing(false);
      setShowSuccess(true);
    } catch (error) {
      console.error("Error saving profile:", error);
      setShowError(true);
    }
  };

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleExportProfile = () => {
    try {
      const profileData = {
        user,
        stats: profileStats,
        activities,
        exportDate: new Date().toISOString(),
      };
      
      const dataBlob = new Blob([JSON.stringify(profileData, null, 2)], {
        type: "application/json",
      });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `profile_${user.username}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setShowSuccess(true);
    } catch (error) {
      console.error("Error exporting profile:", error);
      setShowError(true);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ py: 4, width: "100%", display: "flex", justifyContent: "center" }}>
        <Alert severity="info">{t.loading}</Alert>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ py: 4, width: "100%", display: "flex", justifyContent: "center" }}>
        <Alert severity="error">{t.userNotFound}</Alert>
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
            ...componentStyles.dashboard.header,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              component="h1"
              color="primary"
              sx={getTypographyStyles(language, "h4")}
            >
              {t.profile}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ ...getTypographyStyles(language, "body2"), mt: 1 }}
            >
              {language === "fa" 
                ? "مدیریت اطلاعات شخصی و نمایش آمار کاربری"
                : "Manage personal information and view user statistics"
              }
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Tooltip title={language === "fa" ? "مشاهده فعالیت‌ها" : "View Activities"}>
              <Button
                variant="outlined"
                startIcon={<TimelineIcon />}
                onClick={() => setShowActivityDialog(true)}
                sx={{
                  fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                }}
              >
                {language === "fa" ? "فعالیت‌ها" : "Activities"}
              </Button>
            </Tooltip>

            <Tooltip title={t.exportUserData}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExportProfile}
                sx={{
                  fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                }}
              >
                {language === "fa" ? "خروجی" : "Export"}
              </Button>
            </Tooltip>

            {!isEditing ? (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={handleEdit}
                sx={{
                  fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                }}
              >
                {t.edit}
              </Button>
            ) : (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  sx={{
                    fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                  }}
                >
                  {t.cancel}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  sx={{
                    fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                  }}
                >
                  {t.save}
                </Button>
              </Box>
            )}
          </Box>
        </Box>

        {/* Profile Statistics Cards */}
        <Box sx={componentStyles.dashboard.statsGrid}>
          <Card sx={{ ...componentStyles.dashboard.statCard, backgroundColor: "primary.50" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <RestaurantIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography
                    variant="h4"
                    color="primary"
                    sx={getTypographyStyles(language, "h4")}
                  >
                    {profileStats.totalReservations}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={getTypographyStyles(language, "body2")}
                  >
                    {language === "fa" ? "کل رزروها" : "Total Reservations"}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ ...componentStyles.dashboard.statCard, backgroundColor: "success.50" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <PaymentIcon color="success" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography
                    variant="h4"
                    color="success.main"
                    sx={getTypographyStyles(language, "h4")}
                  >
                    {formatCurrency(profileStats.totalSpent, language)}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={getTypographyStyles(language, "body2")}
                  >
                    {t.totalSpent}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ ...componentStyles.dashboard.statCard, backgroundColor: "warning.50" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <FavoriteIcon color="warning" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography
                    variant="h6"
                    color="warning.main"
                    sx={getTypographyStyles(language, "h6")}
                  >
                    {profileStats.favoriteFood}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={getTypographyStyles(language, "body2")}
                  >
                    {t.mostPopularMeal}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ ...componentStyles.dashboard.statCard, backgroundColor: "info.50" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <TrendingUpIcon color="info" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography
                    variant="h4"
                    color="info.main"
                    sx={getTypographyStyles(language, "h4")}
                  >
                    {profileStats.attendanceRate}%
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={getTypographyStyles(language, "body2")}
                  >
                    {t.attendanceRate}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Main Profile Content */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1fr 2fr" },
            gap: 3,
          }}
        >
          {/* Profile Picture and Basic Info */}
          <Card sx={componentStyles.card}>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={3} alignItems="center">
                {/* Profile Picture */}
                <Box sx={{ position: "relative" }}>
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      fontSize: "3rem",
                      backgroundColor: "primary.main",
                      border: "4px solid",
                      borderColor: "primary.light",
                    }}
                  >
                    {user.firstName?.charAt(0)?.toUpperCase() || "U"}
                  </Avatar>
                  {isEditing && (
                    <IconButton
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        backgroundColor: "primary.main",
                        color: "white",
                        "&:hover": { backgroundColor: "primary.dark" },
                      }}
                    >
                      <PhotoCameraIcon />
                    </IconButton>
                  )}
                </Box>

                {/* Basic Info */}
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h5"
                    sx={getTypographyStyles(language, "h5")}
                  >
                    {user.firstName} {user.lastName}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={getTypographyStyles(language, "body2")}
                  >
                    {user.email}
                  </Typography>
                  {formData.studentId && (
                    <Chip
                      icon={<SchoolIcon />}
                      label={formData.studentId}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ mt: 1 }}
                    />
                  )}
                </Box>

                {/* Membership Info */}
                <Card sx={{ width: "100%", backgroundColor: "grey.50" }}>
                  <CardContent sx={{ p: 2 }}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={getTypographyStyles(language, "caption")}
                        >
                          {t.memberSince}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={getTypographyStyles(language, "body1")}
                        >
                          {formatDate(new Date(user.createdAt), language, {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={getTypographyStyles(language, "caption")}
                        >
                          {language === "fa" ? "روزهای عضویت" : "Membership Days"}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={getTypographyStyles(language, "body1")}
                        >
                          {profileStats.membershipDays} {language === "fa" ? "روز" : "days"}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Account Progress */}
                <Box sx={{ width: "100%" }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={getTypographyStyles(language, "caption")}
                  >
                    {language === "fa" ? "کامل بودن پروفایل" : "Profile Completion"}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={85}
                      sx={{
                        flex: 1,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "grey.200",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 4,
                        },
                      }}
                    />
                    <Typography variant="caption">85%</Typography>
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Profile Details */}
          <Card sx={componentStyles.card}>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Typography
                  variant="h6"
                  sx={getTypographyStyles(language, "h6")}
                >
                  {t.personalInformation}
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 2,
                  }}
                >
                  <TextField
                    fullWidth
                    label={t.firstName}
                    value={formData.firstName}
                    onChange={handleChange("firstName")}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <PersonIcon color="action" sx={{ mr: 1 }} />,
                    }}
                    sx={componentStyles.form.field}
                  />
                  
                  <TextField
                    fullWidth
                    label={t.lastName}
                    value={formData.lastName}
                    onChange={handleChange("lastName")}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <PersonIcon color="action" sx={{ mr: 1 }} />,
                    }}
                    sx={componentStyles.form.field}
                  />

                  <TextField
                    fullWidth
                    label={t.email}
                    type="email"
                    value={formData.email}
                    onChange={handleChange("email")}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} />,
                    }}
                    sx={componentStyles.form.field}
                  />

                  <TextField
                    fullWidth
                    label={t.username}
                    value={formData.username}
                    onChange={handleChange("username")}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <PersonIcon color="action" sx={{ mr: 1 }} />,
                    }}
                    sx={componentStyles.form.field}
                  />

                  <TextField
                    fullWidth
                    label={language === "fa" ? "شماره تلفن" : "Phone Number"}
                    value={formData.phone}
                    onChange={handleChange("phone")}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <PhoneIcon color="action" sx={{ mr: 1 }} />,
                    }}
                    sx={componentStyles.form.field}
                  />

                  <TextField
                    fullWidth
                    label={language === "fa" ? "شماره دانشجویی" : "Student ID"}
                    value={formData.studentId}
                    onChange={handleChange("studentId")}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <BadgeIcon color="action" sx={{ mr: 1 }} />,
                    }}
                    sx={componentStyles.form.field}
                  />

                  <TextField
                    fullWidth
                    label={language === "fa" ? "دانشکده" : "Faculty"}
                    value={formData.faculty}
                    onChange={handleChange("faculty")}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <SchoolIcon color="action" sx={{ mr: 1 }} />,
                    }}
                    sx={componentStyles.form.field}
                  />

                  <TextField
                    fullWidth
                    label={language === "fa" ? "تاریخ تولد" : "Date of Birth"}
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange("dateOfBirth")}
                    disabled={!isEditing}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: <BirthdayIcon color="action" sx={{ mr: 1 }} />,
                    }}
                    sx={componentStyles.form.field}
                  />
                </Box>

                <TextField
                  fullWidth
                  label={language === "fa" ? "آدرس" : "Address"}
                  value={formData.address}
                  onChange={handleChange("address")}
                  disabled={!isEditing}
                  multiline
                  rows={2}
                  InputProps={{
                    startAdornment: <LocationIcon color="action" sx={{ mr: 1 }} />,
                  }}
                  sx={componentStyles.form.field}
                />

                <TextField
                  fullWidth
                  label={language === "fa" ? "درباره من" : "Bio"}
                  value={formData.bio}
                  onChange={handleChange("bio")}
                  disabled={!isEditing}
                  multiline
                  rows={3}
                  placeholder={
                    language === "fa"
                      ? "چند کلمه درباره خودتان بنویسید..."
                      : "Tell us about yourself..."
                  }
                  sx={componentStyles.form.field}
                />
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Recent Activity Preview */}
        <Card sx={componentStyles.card}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography
                variant="h6"
                sx={getTypographyStyles(language, "h6")}
              >
                {language === "fa" ? "فعالیت‌های اخیر" : "Recent Activities"}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<VisibilityIcon />}
                onClick={() => setShowActivityDialog(true)}
                sx={{
                  fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
                }}
              >
                {language === "fa" ? "مشاهده همه" : "View All"}
              </Button>
            </Box>

            <List>
              {activities.slice(0, 3).map((activity, index) => (
                <ListItem key={index} divider={index < 2}>
                  <ListItemIcon>
                    {activity.type === "reservation" ? (
                      <RestaurantIcon color="primary" />
                    ) : activity.type === "payment" ? (
                      <PaymentIcon color="success" />
                    ) : (
                      <PersonIcon color="info" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography sx={getTypographyStyles(language, "body1")}>
                        {language === "fa" ? activity.description : activity.descriptionEn}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography sx={getTypographyStyles(language, "caption")}>
                          {formatDate(activity.date, language, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Typography>
                        {activity.amount && (
                          <Chip
                            label={formatCurrency(activity.amount, language)}
                            size="small"
                            color={activity.type === "payment" ? "success" : "primary"}
                            variant="outlined"
                          />
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Stack>

      {/* Activity Details Dialog */}
      <Dialog
        open={showActivityDialog}
        onClose={() => setShowActivityDialog(false)}
        maxWidth="md"
        fullWidth
        sx={componentStyles.dialog}
      >
        <DialogTitle sx={getTypographyStyles(language, "h6")}>
          {language === "fa" ? "فعالیت‌های کاربری" : "User Activities"}
        </DialogTitle>
        <DialogContent>
          <List sx={{ maxHeight: 400, overflow: "auto" }}>
            {activities.map((activity, index) => (
              <ListItem key={index} divider={index < activities.length - 1}>
                <ListItemIcon>
                  {activity.type === "reservation" ? (
                    <RestaurantIcon color="primary" />
                  ) : activity.type === "payment" ? (
                    <PaymentIcon color="success" />
                  ) : (
                    <PersonIcon color="info" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography sx={getTypographyStyles(language, "body1")}>
                      {language === "fa" ? activity.description : activity.descriptionEn}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography sx={getTypographyStyles(language, "caption")}>
                        {formatDate(activity.date, language, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
                      {activity.amount && (
                        <Chip
                          label={formatCurrency(activity.amount, language)}
                          size="small"
                          color={activity.type === "payment" ? "success" : "primary"}
                          variant="outlined"
                        />
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowActivityDialog(false)}
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
        message={language === "fa" ? "پروفایل با موفقیت به‌روزرسانی شد" : "Profile updated successfully"}
      />

      {/* Error Snackbar */}
      <Snackbar
        open={showError}
        autoHideDuration={3000}
        onClose={() => setShowError(false)}
      >
        <Alert onClose={() => setShowError(false)} severity="error">
          {language === "fa" ? "خطا در به‌روزرسانی پروفایل" : "Error updating profile"}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;
