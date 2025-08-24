import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Container,
  Paper,
  Avatar,
  Rating,
  Button,
  Fade,
} from "@mui/material";
import {
  Search as SearchIcon,
  Restaurant as RestaurantIcon,
  Star as StarIcon,
  AccessTime as TimeIcon,
  LocalOffer as PriceIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
} from "@mui/icons-material";
import { useLanguage } from "../../components/Layout";
import { formatCurrency } from "../../utils/languageUtils";

interface FoodItem {
  id: string;
  name: string;
  nameEn: string;
  price: number;
  ingredients: string[];
  ingredientsEn: string[];
  description: string;
  descriptionEn: string;
  imageUrl: string;
  category: "breakfast" | "lunch" | "dinner";
  rating: number;
  prepTime: number;
  calories: number;
  isPopular?: boolean;
}

const Foods = () => {
  const { language, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [favorites, setFavorites] = useState<string[]>([]);

  const allFoods: FoodItem[] = [
    {
      id: "breakfast-1",
      name: "نان و پنیر و چای",
      nameEn: "Bread, Cheese & Tea",
      price: 15000,
      ingredients: ["نان تازه", "پنیر سفید", "چای سیاه", "عسل", "کره"],
      ingredientsEn: [
        "Fresh bread",
        "White cheese",
        "Black tea",
        "Honey",
        "Butter",
      ],
      description:
        "صبحانه سنتی ایرانی با نان تازه، پنیر سفید، چای سیاه و عسل طبیعی",
      descriptionEn:
        "Traditional Iranian breakfast with fresh bread, white cheese, black tea, and natural honey",
      imageUrl:
        "https://images.unsplash.com/photo-1494859802809-d069c3b71a8a?w=400&h=300&fit=crop",
      category: "breakfast",
      rating: 4.5,
      prepTime: 10,
      calories: 320,
      isPopular: true,
    },
    {
      id: "lunch-1",
      name: "چلو کباب",
      nameEn: "Rice & Kebab",
      price: 45000,
      ingredients: ["برنج", "گوشت کباب", "زعفران", "کره", "پیاز"],
      ingredientsEn: ["Rice", "Kebab meat", "Saffron", "Butter", "Onion"],
      description: "برنج زعفرانی با کباب گوشت و پیاز تازه",
      descriptionEn: "Saffron rice with grilled meat kebab and fresh onion",
      imageUrl:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
      category: "lunch",
      rating: 4.8,
      prepTime: 25,
      calories: 680,
      isPopular: true,
    },
    {
      id: "dinner-1",
      name: "کباب برگ",
      nameEn: "Barg Kebab",
      price: 50000,
      ingredients: ["گوشت برگ", "ادویه", "برنج", "کره", "زعفران"],
      ingredientsEn: ["Sliced meat", "Spices", "Rice", "Butter", "Saffron"],
      description: "کباب برگ با گوشت نازک و ادویه مخصوص",
      descriptionEn: "Barg kebab with thin sliced meat and special spices",
      imageUrl:
        "https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&h=300&fit=crop",
      category: "dinner",
      rating: 4.7,
      prepTime: 20,
      calories: 580,
    },
    {
      id: "breakfast-2",
      name: "شیر و عسل",
      nameEn: "Milk & Honey",
      price: 20000,
      ingredients: ["شیر گرم", "عسل طبیعی", "زعفران", "هل"],
      ingredientsEn: ["Warm milk", "Natural honey", "Saffron", "Cardamom"],
      description: "شیر گرم با عسل طبیعی و زعفران، مناسب برای شروع روز",
      descriptionEn:
        "Warm milk with natural honey and saffron, perfect for starting the day",
      imageUrl:
        "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop",
      category: "breakfast",
      rating: 4.2,
      prepTime: 5,
      calories: 180,
    },
    {
      id: "lunch-2",
      name: "قورمه سبزی",
      nameEn: "Ghormeh Sabzi",
      price: 40000,
      ingredients: ["سبزی قورمه", "لوبیا", "گوشت", "لیمو عمانی", "برنج"],
      ingredientsEn: ["Herbs", "Beans", "Meat", "Dried lime", "Rice"],
      description: "خورشت سبزی با لوبیا، گوشت و لیمو عمانی",
      descriptionEn: "Herb stew with beans, meat, and dried lime",
      imageUrl:
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
      category: "lunch",
      rating: 4.6,
      prepTime: 30,
      calories: 520,
      isPopular: true,
    },
    {
      id: "dinner-2",
      name: "سالاد",
      nameEn: "Fresh Salad",
      price: 18000,
      ingredients: ["کاهو", "گوجه", "خیار", "پیاز", "روغن زیتون"],
      ingredientsEn: ["Lettuce", "Tomato", "Cucumber", "Onion", "Olive oil"],
      description: "سالاد تازه با سبزیجات و روغن زیتون",
      descriptionEn: "Fresh salad with vegetables and olive oil",
      imageUrl:
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
      category: "dinner",
      rating: 4.1,
      prepTime: 8,
      calories: 120,
    },
  ];

  const filteredFoods = useMemo(() => {
    return allFoods.filter((food) => {
      const matchesSearch =
        food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        food.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        food.ingredients.some((ingredient) =>
          ingredient.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesCategory =
        selectedCategory === "all" || food.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [allFoods, searchTerm, selectedCategory]);

  const handleFavoriteToggle = (foodId: string) => {
    setFavorites((prev) =>
      prev.includes(foodId)
        ? prev.filter((id) => id !== foodId)
        : [...prev, foodId]
    );
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "breakfast":
        return language === "fa" ? "صبحانه" : "Breakfast";
      case "lunch":
        return language === "fa" ? "ناهار" : "Lunch";
      case "dinner":
        return language === "fa" ? "شام" : "Dinner";
      default:
        return language === "fa" ? "همه" : "All";
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Paper
        elevation={0}
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          p: { xs: 3, md: 6 },
          mb: 4,
          borderRadius: 3,
          textAlign: "center",
        }}
      >
        <Avatar
          sx={{
            bgcolor: "rgba(255,255,255,0.2)",
            width: 80,
            height: 80,
            margin: "0 auto 2rem",
            fontSize: "2rem",
          }}
        >
          <RestaurantIcon fontSize="large" />
        </Avatar>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            mb: 2,
            direction: isRTL ? "rtl" : "ltr",
            fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
          }}
        >
          {language === "fa" ? "منوی غذاهای ما" : "Our Food Menu"}
        </Typography>
        <Typography
          variant="h6"
          sx={{
            opacity: 0.9,
            fontWeight: 400,
            direction: isRTL ? "rtl" : "ltr",
            fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
          }}
        >
          {language === "fa"
            ? "طعم‌های اصیل ایرانی با بهترین مواد اولیه"
            : "Authentic Iranian flavors with the finest ingredients"}
        </Typography>
      </Paper>

      {/* Search and Filter Section */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Stack spacing={3}>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: isRTL ? "flex-end" : "flex-start",
              direction: isRTL ? "rtl" : "ltr",
            }}
          >
            <TextField
              placeholder={
                language === "fa" ? "جستجو در غذاها..." : "Search foods..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                minWidth: 280,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                },
                "& .MuiInputBase-input": {
                  direction: isRTL ? "rtl" : "ltr",
                  fontFamily: isRTL
                    ? "var(--font-persian)"
                    : "var(--font-english)",
                },
              }}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
                ),
              }}
            />

            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel
                sx={{
                  direction: isRTL ? "rtl" : "ltr",
                  fontFamily: isRTL
                    ? "var(--font-persian)"
                    : "var(--font-english)",
                }}
              >
                {language === "fa" ? "دسته‌بندی" : "Category"}
              </InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                sx={{
                  borderRadius: 3,
                  direction: isRTL ? "rtl" : "ltr",
                  fontFamily: isRTL
                    ? "var(--font-persian)"
                    : "var(--font-english)",
                }}
              >
                <MenuItem value="all">{getCategoryLabel("all")}</MenuItem>
                <MenuItem value="breakfast">
                  {getCategoryLabel("breakfast")}
                </MenuItem>
                <MenuItem value="lunch">{getCategoryLabel("lunch")}</MenuItem>
                <MenuItem value="dinner">{getCategoryLabel("dinner")}</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Results Summary */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              direction: isRTL ? "rtl" : "ltr",
            }}
          >
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                fontFamily: isRTL
                  ? "var(--font-persian)"
                  : "var(--font-english)",
              }}
            >
              {language === "fa"
                ? `${filteredFoods.length} غذا یافت شد`
                : `${filteredFoods.length} foods found`}
            </Typography>
            {filteredFoods.filter((f) => f.isPopular).length > 0 && (
              <Chip
                icon={<StarIcon />}
                label={
                  language === "fa"
                    ? `${filteredFoods.filter((f) => f.isPopular).length} محبوب`
                    : `${
                        filteredFoods.filter((f) => f.isPopular).length
                      } popular`
                }
                color="primary"
                variant="outlined"
                size="small"
              />
            )}
          </Box>
        </Stack>
      </Paper>

      {/* Food Grid */}
      <Grid container spacing={3}>
        {filteredFoods.map((food, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={food.id}>
            <Fade in={true} timeout={300 + index * 100}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  borderRadius: 3,
                  overflow: "hidden",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                  },
                  border: food.isPopular ? "2px solid #ff6b35" : "none",
                }}
              >
                {/* Popular Badge */}
                {food.isPopular && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 12,
                      right: isRTL ? "auto" : 12,
                      left: isRTL ? 12 : "auto",
                      zIndex: 1,
                    }}
                  >
                    <Chip
                      icon={<StarIcon />}
                      label={language === "fa" ? "محبوب" : "Popular"}
                      color="warning"
                      size="small"
                      sx={{
                        fontWeight: 600,
                        color: "white",
                        bgcolor: "#ff6b35",
                        fontFamily: isRTL
                          ? "var(--font-persian)"
                          : "var(--font-english)",
                      }}
                    />
                  </Box>
                )}

                {/* Favorite Button */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 12,
                    left: isRTL ? "auto" : 12,
                    right: isRTL ? 12 : "auto",
                    zIndex: 1,
                  }}
                >
                  <Button
                    onClick={() => handleFavoriteToggle(food.id)}
                    sx={{
                      minWidth: 40,
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: "rgba(255,255,255,0.9)",
                      color: favorites.includes(food.id) ? "#e91e63" : "#666",
                      "&:hover": {
                        bgcolor: "rgba(255,255,255,1)",
                        transform: "scale(1.1)",
                      },
                    }}
                  >
                    {favorites.includes(food.id) ? (
                      <FavoriteIcon />
                    ) : (
                      <FavoriteBorderIcon />
                    )}
                  </Button>
                </Box>

                <CardMedia
                  component="img"
                  height="240"
                  image={food.imageUrl}
                  alt={language === "fa" ? food.name : food.nameEn}
                  sx={{
                    objectFit: "cover",
                    transition: "transform 0.3s ease",
                    "&:hover": {
                      transform: "scale(1.05)",
                    },
                  }}
                />

                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Stack spacing={2}>
                    {/* Title and Rating */}
                    <Box>
                      <Typography
                        variant="h6"
                        component="h3"
                        sx={{
                          fontWeight: 700,
                          mb: 1,
                          direction: isRTL ? "rtl" : "ltr",
                          textAlign: isRTL ? "right" : "left",
                          fontFamily: isRTL
                            ? "var(--font-persian)"
                            : "var(--font-english)",
                          lineHeight: 1.3,
                        }}
                      >
                        {language === "fa" ? food.name : food.nameEn}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          justifyContent: isRTL ? "flex-end" : "flex-start",
                        }}
                      >
                        <Rating
                          value={food.rating}
                          precision={0.1}
                          size="small"
                          readOnly
                        />
                        <Typography variant="body2" color="text.secondary">
                          ({food.rating})
                        </Typography>
                      </Box>
                    </Box>

                    {/* Price */}
                    <Typography
                      variant="h6"
                      color="primary"
                      sx={{
                        fontWeight: 700,
                        direction: isRTL ? "rtl" : "ltr",
                        textAlign: isRTL ? "right" : "left",
                        fontFamily: isRTL
                          ? "var(--font-persian)"
                          : "var(--font-english)",
                      }}
                    >
                      {formatCurrency(food.price, language)}
                    </Typography>

                    {/* Meta Info */}
                    <Box
                      sx={{
                        display: "flex",
                        gap: 2,
                        justifyContent: isRTL ? "flex-end" : "flex-start",
                        direction: isRTL ? "rtl" : "ltr",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <TimeIcon
                          sx={{ fontSize: 16, color: "text.secondary" }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {food.prepTime} {language === "fa" ? "دقیقه" : "min"}
                        </Typography>
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <PriceIcon
                          sx={{ fontSize: 16, color: "text.secondary" }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {food.calories} {language === "fa" ? "کالری" : "cal"}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Description */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        lineHeight: 1.6,
                        direction: isRTL ? "rtl" : "ltr",
                        textAlign: isRTL ? "right" : "left",
                        fontFamily: isRTL
                          ? "var(--font-persian)"
                          : "var(--font-english)",
                      }}
                    >
                      {language === "fa"
                        ? food.description
                        : food.descriptionEn}
                    </Typography>

                    {/* Ingredients */}
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          mb: 1,
                          direction: isRTL ? "rtl" : "ltr",
                          textAlign: isRTL ? "right" : "left",
                          fontFamily: isRTL
                            ? "var(--font-persian)"
                            : "var(--font-english)",
                        }}
                      >
                        {language === "fa"
                          ? "مواد تشکیل دهنده:"
                          : "Ingredients:"}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 0.5,
                          justifyContent: isRTL ? "flex-end" : "flex-start",
                        }}
                      >
                        {(language === "fa"
                          ? food.ingredients
                          : food.ingredientsEn
                        )
                          .slice(0, 3)
                          .map((ingredient, index) => (
                            <Chip
                              key={index}
                              label={ingredient}
                              size="small"
                              variant="outlined"
                              sx={{
                                borderRadius: 2,
                                fontSize: "0.7rem",
                                fontFamily: isRTL
                                  ? "var(--font-persian)"
                                  : "var(--font-english)",
                                bgcolor: "rgba(0,0,0,0.02)",
                              }}
                            />
                          ))}
                        {food.ingredients.length > 3 && (
                          <Chip
                            label={
                              language === "fa"
                                ? `+${food.ingredients.length - 3} بیشتر`
                                : `+${food.ingredients.length - 3} more`
                            }
                            size="small"
                            variant="outlined"
                            sx={{
                              borderRadius: 2,
                              fontSize: "0.7rem",
                              fontFamily: isRTL
                                ? "var(--font-persian)"
                                : "var(--font-english)",
                              bgcolor: "rgba(0,0,0,0.02)",
                            }}
                          />
                        )}
                      </Box>
                    </Box>

                    {/* Category Badge */}
                    <Box sx={{ pt: 1 }}>
                      <Chip
                        label={getCategoryLabel(food.category)}
                        size="small"
                        color="secondary"
                        sx={{
                          alignSelf: isRTL ? "flex-end" : "flex-start",
                          fontFamily: isRTL
                            ? "var(--font-persian)"
                            : "var(--font-english)",
                          fontWeight: 500,
                        }}
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>

      {/* No Results */}
      {filteredFoods.length === 0 && (
        <Paper
          elevation={0}
          sx={{
            textAlign: "center",
            py: 8,
            bgcolor: "grey.50",
            borderRadius: 3,
            direction: isRTL ? "rtl" : "ltr",
          }}
        >
          <RestaurantIcon
            sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
          />
          <Typography
            variant="h6"
            color="text.secondary"
            gutterBottom
            sx={{
              fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
            }}
          >
            {language === "fa" ? "هیچ غذایی یافت نشد" : "No foods found"}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontFamily: isRTL ? "var(--font-persian)" : "var(--font-english)",
            }}
          >
            {language === "fa"
              ? "لطفاً جستجوی خود را تغییر دهید"
              : "Please try different search terms"}
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default Foods;
