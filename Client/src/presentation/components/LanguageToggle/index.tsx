import { useState } from "react";
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Tooltip,
} from "@mui/material";
import { Language } from "@mui/icons-material";
import { useLanguage } from "../Layout";
import { createFontStyles } from "../../utils/fontUtils";

interface LanguageToggleProps {
  variant?: "horizontal" | "vertical";
  size?: "small" | "medium" | "large";
  showLabels?: boolean;
}

const LanguageToggle = ({
  variant = "horizontal",
  size = "medium",
  showLabels = true,
}: LanguageToggleProps) => {
  const { language, setLanguage, isRTL } = useLanguage();
  const [hoveredLang, setHoveredLang] = useState<string | null>(null);

  const handleLanguageChange = (
    _event: React.MouseEvent<HTMLElement>,
    newLanguage: "en" | "fa" | null
  ) => {
    if (newLanguage !== null) {
      setLanguage(newLanguage);
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          fontSize: "0.75rem",
          padding: "4px 8px",
          minHeight: 32,
        };
      case "large":
        return {
          fontSize: "1.125rem",
          padding: "12px 16px",
          minHeight: 56,
        };
      default:
        return {
          fontSize: "0.875rem",
          padding: "8px 12px",
          minHeight: 40,
        };
    }
  };

  const buttonStyles = {
    ...getSizeStyles(),
    ...createFontStyles(language),
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    color: "rgba(255, 255, 255, 0.8)",
    "&.Mui-selected": {
      backgroundColor: "rgba(59, 130, 246, 0.3)",
      color: "#3b82f6",
      border: "1px solid rgba(59, 130, 246, 0.5)",
    },
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.15)",
    },
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: variant === "vertical" ? "column" : "row",
        gap: 1,
        alignItems: "center",
      }}
    >
      {showLabels && (
        <Typography
          variant="caption"
          sx={{
            color: "rgba(255, 255, 255, 0.7)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            ...createFontStyles(language),
          }}
        >
          {language === "fa" ? "زبان" : "Language"}
        </Typography>
      )}

      <ToggleButtonGroup
        value={language}
        exclusive
        onChange={handleLanguageChange}
        size={size}
        orientation={variant === "vertical" ? "vertical" : "horizontal"}
        sx={{
          "& .MuiToggleButton-root": {
            ...buttonStyles,
            flex: 1,
            minWidth: variant === "vertical" ? "100%" : "auto",
          },
        }}
      >
        <Tooltip
          title={language === "fa" ? "انگلیسی" : "English"}
          placement={variant === "vertical" ? "left" : "top"}
        >
          <ToggleButton
            value="en"
            onMouseEnter={() => setHoveredLang("en")}
            onMouseLeave={() => setHoveredLang(null)}
            sx={{
              ...buttonStyles,
              fontFamily: "var(--font-english)",
              direction: "ltr",
            }}
          >
            <Language sx={{ mr: showLabels ? 0.5 : 0, fontSize: "1rem" }} />
            {showLabels && "EN"}
          </ToggleButton>
        </Tooltip>

        <Tooltip
          title={language === "fa" ? "فارسی" : "Persian"}
          placement={variant === "vertical" ? "left" : "top"}
        >
          <ToggleButton
            value="fa"
            onMouseEnter={() => setHoveredLang("fa")}
            onMouseLeave={() => setHoveredLang(null)}
            sx={{
              ...buttonStyles,
              fontFamily: "var(--font-persian)",
              direction: "rtl",
            }}
          >
            <Language sx={{ mr: showLabels ? 0.5 : 0, fontSize: "1rem" }} />
            {showLabels && "فارسی"}
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>
    </Box>
  );
};

export default LanguageToggle;
