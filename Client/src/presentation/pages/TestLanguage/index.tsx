import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Divider,
} from "@mui/material";
import {
  Language,
  Translate,
  FormatSize,
  TextFields,
  Palette,
} from "@mui/icons-material";
import { useLanguage } from "../../components/Layout";
import LanguageToggle from "../../components/LanguageToggle";
import {
  formatCurrency,
  formatDate,
  formatTime,
  toPersianNumber,
  createComponentStyles,
  getTypographyStyles,
} from "../../utils/languageUtils";
import { createFontStyles } from "../../utils/fontUtils";

const TestLanguage = () => {
  const { language, t, isRTL } = useLanguage();
  const componentStyles = createComponentStyles(language);
  const typographyStyles = getTypographyStyles(language);
  const fontStyles = createFontStyles(language);

  const [testText, setTestText] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [currentDate] = useState(new Date());

  const sampleData = {
    currency: 1250000,
    date: currentDate,
    time: currentDate,
    number: 1234567,
    text:
      language === "fa"
        ? "این یک متن نمونه فارسی است که برای تست زبان استفاده می‌شود"
        : "This is a sample English text used for language testing",
  };

  const testComponents = [
    {
      title: t.language || "Language",
      icon: <Language />,
      content: (
        <Stack spacing={2}>
          <LanguageToggle variant="horizontal" size="medium" />
          <LanguageToggle variant="vertical" size="small" />
          <Box>
            <Typography variant="body2" color="text.secondary">
              Current Language: {language === "fa" ? "فارسی" : "English"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Direction: {isRTL ? "RTL" : "LTR"}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      title: t.typography || "Typography",
      icon: <TextFields />,
      content: (
        <Stack spacing={2}>
          <Typography variant="h1" sx={typographyStyles.h1}>
            {language === "fa" ? "عنوان اصلی" : "Main Title"}
          </Typography>
          <Typography variant="h2" sx={typographyStyles.h2}>
            {language === "fa" ? "عنوان فرعی" : "Subtitle"}
          </Typography>
          <Typography variant="h3" sx={typographyStyles.h3}>
            {language === "fa" ? "عنوان کوچک" : "Small Title"}
          </Typography>
          <Typography variant="body1" sx={typographyStyles.body1}>
            {sampleData.text}
          </Typography>
          <Typography variant="body2" sx={typographyStyles.body2}>
            {language === "fa"
              ? "این یک متن کوچک‌تر است"
              : "This is a smaller text"}
          </Typography>
        </Stack>
      ),
    },
    {
      title: t.formatting || "Formatting",
      icon: <FormatSize />,
      content: (
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {language === "fa" ? "فرمت ارز" : "Currency Format"}
            </Typography>
            <Typography variant="h6" color="primary">
              {formatCurrency(sampleData.currency, language)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {language === "fa" ? "فرمت تاریخ" : "Date Format"}
            </Typography>
            <Typography variant="h6" color="primary">
              {formatDate(sampleData.date, language, {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "long",
              })}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {language === "fa" ? "فرمت زمان" : "Time Format"}
            </Typography>
            <Typography variant="h6" color="primary">
              {formatTime(sampleData.time, language)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {language === "fa" ? "اعداد فارسی" : "Persian Numbers"}
            </Typography>
            <Typography variant="h6" color="primary">
              {toPersianNumber(sampleData.number.toString(), language)}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      title: t.components || "Components",
      icon: <Palette />,
      content: (
        <Stack spacing={2}>
          <TextField
            label={language === "fa" ? "متن ورودی" : "Input Text"}
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            fullWidth
            sx={componentStyles.form.field}
          />
          <FormControl fullWidth>
            <InputLabel sx={componentStyles.form.label}>
              {language === "fa" ? "انتخاب گزینه" : "Select Option"}
            </InputLabel>
            <Select
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
              sx={componentStyles.form.field}
            >
              <MenuItem value="option1">
                {language === "fa" ? "گزینه اول" : "Option 1"}
              </MenuItem>
              <MenuItem value="option2">
                {language === "fa" ? "گزینه دوم" : "Option 2"}
              </MenuItem>
              <MenuItem value="option3">
                {language === "fa" ? "گزینه سوم" : "Option 3"}
              </MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip
              label={language === "fa" ? "برچسب اول" : "First Tag"}
              color="primary"
              sx={componentStyles.chip}
            />
            <Chip
              label={language === "fa" ? "برچسب دوم" : "Second Tag"}
              color="secondary"
              sx={componentStyles.chip}
            />
            <Chip
              label={language === "fa" ? "برچسب سوم" : "Third Tag"}
              variant="outlined"
              sx={componentStyles.chip}
            />
          </Box>
          <Button variant="contained" sx={componentStyles.button.primary}>
            {language === "fa" ? "دکمه اصلی" : "Primary Button"}
          </Button>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={componentStyles.dashboard.container}>
      <Stack spacing={4}>
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            ...componentStyles.card,
            p: 4,
            textAlign: "center",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <Translate sx={{ fontSize: 48, opacity: 0.9 }} />
          </Box>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              ...typographyStyles.h3,
              color: "white",
              fontWeight: 700,
            }}
          >
            {language === "fa"
              ? "تست زبان و قالب‌بندی"
              : "Language & Formatting Test"}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              ...typographyStyles.h6,
              color: "rgba(255, 255, 255, 0.9)",
              fontWeight: 400,
            }}
          >
            {language === "fa"
              ? "این صفحه برای تست عملکرد زبان‌ها و قالب‌بندی‌ها طراحی شده است"
              : "This page is designed to test language and formatting functionality"}
          </Typography>
        </Paper>

        {/* Language Information */}
        <Alert severity="info" sx={componentStyles.alert}>
          <Typography variant="body2" sx={fontStyles}>
            {language === "fa"
              ? `زبان فعلی: فارسی | جهت: راست به چپ | فونت: ${fontStyles.fontFamily}`
              : `Current Language: English | Direction: Left to Right | Font: ${fontStyles.fontFamily}`}
          </Typography>
        </Alert>

        {/* Test Components Stack */}
        <Stack spacing={3} sx={{ display: 'flex', flexWrap: 'wrap', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          {testComponents.map((component, index) => (
            <Stack key={index} sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }}>
              <Card sx={componentStyles.card}>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 3,
                    }}
                  >
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 1,
                        backgroundColor: "primary.50",
                        color: "primary.main",
                      }}
                    >
                      {component.icon}
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{
                        ...typographyStyles.h5,
                        fontWeight: 600,
                      }}
                    >
                      {component.title}
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />
                  {component.content}
                </CardContent>
              </Card>
            </Stack>
          ))}
        </Stack>

        {/* Additional Testing Section */}
        <Paper sx={componentStyles.card}>
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              ...typographyStyles.h5,
              fontWeight: 600,
            }}
          >
            {language === "fa" ? "تست اضافی" : "Additional Testing"}
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                {language === "fa" ? "متن طولانی" : "Long Text"}
              </Typography>
              <Typography variant="body1" sx={typographyStyles.body1}>
                {language === "fa"
                  ? "این یک متن طولانی فارسی است که برای تست عملکرد فونت و قالب‌بندی استفاده می‌شود. متن شامل حروف مختلف فارسی و اعداد است که باید به درستی نمایش داده شوند."
                  : "This is a long English text used to test font and formatting functionality. The text includes various English characters and numbers that should be displayed correctly."}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                {language === "fa" ? "اعداد و ارقام" : "Numbers and Figures"}
              </Typography>
              <Typography variant="body1" sx={typographyStyles.body1}>
                {language === "fa"
                  ? `تعداد کاربران: ${toPersianNumber(
                      "1234",
                      language
                    )} | قیمت: ${formatCurrency(
                      500000,
                      language
                    )} | تاریخ: ${formatDate(currentDate, language, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}`
                  : `Number of users: ${toPersianNumber(
                      "1234",
                      language
                    )} | Price: ${formatCurrency(
                      500000,
                      language
                    )} | Date: ${formatDate(currentDate, language, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}`}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
};

export default TestLanguage;
