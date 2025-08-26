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
  IconButton,
  Tooltip,
  Badge,
} from "@mui/material";
import {
  Search as SearchIcon,
  Restaurant as RestaurantIcon,
  Star as StarIcon,
  AccessTime as TimeIcon,
  LocalOffer as PriceIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
} from "@mui/icons-material";
import { useLanguage } from "../../components/Layout";
import {
  formatCurrency,
  createComponentStyles,
  getTypographyStyles,
} from "../../utils/languageUtils";

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
  isSpicy?: boolean;
  isVegetarian?: boolean;
}

const Foods = () => {
  const { language, isRTL } = useLanguage();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("name");

  // Import local images using relative paths
  const foodImages = {
    cheloKebab: "/src/presentation/assets/images/چلو-کباب-بختیاری-scaled.jpg",
    cheloJooje: "/src/presentation/assets/images/چلو جوجه کباب.jpeg",
    cheloJoojeTahchin:
      "/src/presentation/assets/images/چلو جوجه کباب و ته چین.jpg",
    ghormehSabzi: "/src/presentation/assets/images/قورمه سبزی.jpg",
    gheimeh: "/src/presentation/assets/images/قیمه.jpg",
    gheimehBademjan:
      "/src/presentation/assets/images/قیمه_بادمجان_غذای_روز_تمامی_گروه_های_سنی_1024x1005.jpg",
    kookooSibZamini: "/src/presentation/assets/images/کوکو سیب زمینی.jpg",
    zereshkPolo: "/src/presentation/assets/images/زرشک پلو با مرغ.jpeg",
    khorakKoobideh: "/src/presentation/assets/images/خوراک کوبیده.jpg",
    khorakJooje: "/src/presentation/assets/images/خوراک جوجه.jpg",
    beefStroganoff: "/src/presentation/assets/images/بیف استروگانوف.jpg",
    sandwich: "/src/presentation/assets/images/sandevich-rost-biff.jpg",
    defaultFood: "/src/presentation/assets/images/default308785.jpg",
  };

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
      imageUrl: foodImages.defaultFood,
      category: "breakfast",
      rating: 4.5,
      prepTime: 10,
      calories: 320,
      isPopular: true,
      isVegetarian: true,
    },
    {
      id: "breakfast-2",
      name: "کوکو سیب زمینی",
      nameEn: "Potato Kookoo",
      price: 25000,
      ingredients: ["سیب زمینی", "تخم مرغ", "پیاز", "ادویه", "روغن"],
      ingredientsEn: ["Potato", "Eggs", "Onion", "Spices", "Oil"],
      description: "کوکو سیب زمینی خانگی با تخم مرغ تازه و ادویه مخصوص",
      descriptionEn:
        "Homemade potato kookoo with fresh eggs and special spices",
      imageUrl: foodImages.kookooSibZamini,
      category: "breakfast",
      rating: 4.3,
      prepTime: 15,
      calories: 280,
      isVegetarian: true,
    },
    {
      id: "lunch-1",
      name: "چلو کباب بختیاری",
      nameEn: "Chelo Kebab Bakhtiari",
      price: 55000,
      ingredients: ["برنج زعفرانی", "کباب بختیاری", "کره", "پیاز", "زعفران"],
      ingredientsEn: [
        "Saffron rice",
        "Bakhtiari kebab",
        "Butter",
        "Onion",
        "Saffron",
      ],
      description:
        "چلو کباب بختیاری با گوشت مرغ و گوشت قرمز، سرو شده با برنج زعفرانی",
      descriptionEn:
        "Bakhtiari kebab with chicken and red meat, served with saffron rice",
      imageUrl: foodImages.cheloKebab,
      category: "lunch",
      rating: 4.9,
      prepTime: 30,
      calories: 750,
      isPopular: true,
    },
    {
      id: "lunch-2",
      name: "چلو جوجه کباب",
      nameEn: "Chelo Jooje Kebab",
      price: 45000,
      ingredients: ["برنج", "جوجه کباب", "کره", "زعفران", "ادویه"],
      ingredientsEn: ["Rice", "Chicken kebab", "Butter", "Saffron", "Spices"],
      description: "چلو جوجه کباب با گوشت مرغ تازه و برنج زعفرانی",
      descriptionEn: "Chicken kebab with fresh chicken meat and saffron rice",
      imageUrl: foodImages.cheloJooje,
      category: "lunch",
      rating: 4.7,
      prepTime: 25,
      calories: 650,
      isPopular: true,
    },
    {
      id: "lunch-3",
      name: "چلو جوجه کباب و ته چین",
      nameEn: "Chelo Jooje Kebab with Tahchin",
      price: 60000,
      ingredients: ["برنج", "جوجه کباب", "ته چین", "زعفران", "کره"],
      ingredientsEn: ["Rice", "Chicken kebab", "Tahchin", "Saffron", "Butter"],
      description: "چلو جوجه کباب همراه با ته چین زعفرانی و کره",
      descriptionEn: "Chicken kebab with saffron tahchin and butter",
      imageUrl: foodImages.cheloJoojeTahchin,
      category: "lunch",
      rating: 4.8,
      prepTime: 35,
      calories: 800,
      isPopular: true,
    },
    {
      id: "lunch-4",
      name: "قورمه سبزی",
      nameEn: "Ghormeh Sabzi",
      price: 40000,
      ingredients: ["سبزی قورمه", "لوبیا", "گوشت", "لیمو عمانی", "برنج"],
      ingredientsEn: ["Herbs", "Beans", "Meat", "Dried lime", "Rice"],
      description: "خورشت سبزی با لوبیا، گوشت و لیمو عمانی، غذای سنتی ایرانی",
      descriptionEn:
        "Traditional Iranian herb stew with beans, meat, and dried lime",
      imageUrl: foodImages.ghormehSabzi,
      category: "lunch",
      rating: 4.6,
      prepTime: 45,
      calories: 520,
      isPopular: true,
    },
    {
      id: "lunch-5",
      name: "قیمه",
      nameEn: "Gheimeh",
      price: 38000,
      ingredients: ["لپه", "گوشت", "سیب زمینی", "گوجه", "ادویه"],
      ingredientsEn: ["Split peas", "Meat", "Potato", "Tomato", "Spices"],
      description: "خورشت قیمه با لپه، گوشت و سیب زمینی سرخ شده",
      descriptionEn: "Gheimeh stew with split peas, meat, and fried potato",
      imageUrl: foodImages.gheimeh,
      category: "lunch",
      rating: 4.4,
      prepTime: 40,
      calories: 480,
    },
    {
      id: "lunch-6",
      name: "قیمه بادمجان",
      nameEn: "Gheimeh Bademjan",
      price: 42000,
      ingredients: ["لپه", "گوشت", "بادمجان", "گوجه", "ادویه"],
      ingredientsEn: ["Split peas", "Meat", "Eggplant", "Tomato", "Spices"],
      description: "خورشت قیمه بادمجان با بادمجان سرخ شده و گوشت تازه",
      descriptionEn: "Gheimeh bademjan with fried eggplant and fresh meat",
      imageUrl: foodImages.gheimehBademjan,
      category: "lunch",
      rating: 4.5,
      prepTime: 50,
      calories: 520,
    },
    {
      id: "lunch-7",
      name: "زرشک پلو با مرغ",
      nameEn: "Zereshk Polo with Chicken",
      price: 48000,
      ingredients: ["برنج", "مرغ", "زرشک", "زعفران", "کره"],
      ingredientsEn: ["Rice", "Chicken", "Barberries", "Saffron", "Butter"],
      description: "زرشک پلو با مرغ و زعفران، طعمی منحصر به فرد و دلپذیر",
      descriptionEn:
        "Barberry rice with chicken and saffron, unique and delightful taste",
      imageUrl: foodImages.zereshkPolo,
      category: "lunch",
      rating: 4.7,
      prepTime: 30,
      calories: 680,
      isPopular: true,
    },
    {
      id: "lunch-8",
      name: "خوراک کوبیده",
      nameEn: "Koobideh Kebab",
      price: 52000,
      ingredients: ["گوشت چرخ شده", "پیاز", "ادویه", "برنج", "کره"],
      ingredientsEn: ["Ground meat", "Onion", "Spices", "Rice", "Butter"],
      description: "خوراک کوبیده با گوشت چرخ شده و ادویه مخصوص",
      descriptionEn: "Koobideh kebab with ground meat and special spices",
      imageUrl: foodImages.khorakKoobideh,
      category: "lunch",
      rating: 4.6,
      prepTime: 25,
      calories: 720,
    },
    {
      id: "lunch-9",
      name: "خوراک جوجه",
      nameEn: "Chicken Kebab",
      price: 45000,
      ingredients: ["مرغ", "ادویه", "برنج", "کره", "زعفران"],
      ingredientsEn: ["Chicken", "Spices", "Rice", "Butter", "Saffron"],
      description: "خوراک جوجه با گوشت مرغ تازه و برنج زعفرانی",
      descriptionEn: "Chicken kebab with fresh chicken meat and saffron rice",
      imageUrl: foodImages.khorakJooje,
      category: "lunch",
      rating: 4.5,
      prepTime: 20,
      calories: 580,
    },
    {
      id: "lunch-10",
      name: "بیف استروگانوف",
      nameEn: "Beef Stroganoff",
      price: 58000,
      ingredients: ["گوشت گاو", "قارچ", "خامه", "پیاز", "ادویه"],
      ingredientsEn: ["Beef", "Mushrooms", "Cream", "Onion", "Spices"],
      description: "بیف استروگانوف با گوشت گاو، قارچ و سس خامه",
      descriptionEn: "Beef stroganoff with beef, mushrooms, and cream sauce",
      imageUrl: foodImages.beefStroganoff,
      category: "lunch",
      rating: 4.8,
      prepTime: 35,
      calories: 850,
      isPopular: true,
    },
    {
      id: "dinner-1",
      name: "ساندویچ رست بیف",
      nameEn: "Roast Beef Sandwich",
      price: 35000,
      ingredients: ["نان", "گوشت رست", "سبزیجات", "سس", "پنیر"],
      ingredientsEn: ["Bread", "Roast beef", "Vegetables", "Sauce", "Cheese"],
      description: "ساندویچ رست بیف با گوشت تازه و سبزیجات",
      descriptionEn: "Roast beef sandwich with fresh meat and vegetables",
      imageUrl: foodImages.sandwich,
      category: "dinner",
      rating: 4.3,
      prepTime: 10,
      calories: 420,
    },
    {
      id: "dinner-2",
      name: "سالاد تازه",
      nameEn: "Fresh Salad",
      price: 18000,
      ingredients: ["کاهو", "گوجه", "خیار", "پیاز", "روغن زیتون"],
      ingredientsEn: ["Lettuce", "Tomato", "Cucumber", "Onion", "Olive oil"],
      description: "سالاد تازه با سبزیجات و روغن زیتون طبیعی",
      descriptionEn: "Fresh salad with vegetables and natural olive oil",
      imageUrl: foodImages.defaultFood,
      category: "dinner",
      rating: 4.1,
      prepTime: 8,
      calories: 120,
      isVegetarian: true,
    },
  ];

  const filteredAndSortedFoods = useMemo(() => {
    let filtered = allFoods.filter((food) => {
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

    // Sort foods
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "prep-time":
        filtered.sort((a, b) => a.prepTime - b.prepTime);
        break;
      case "calories":
        filtered.sort((a, b) => a.calories - b.calories);
        break;
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [allFoods, searchTerm, selectedCategory, sortBy]);

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

  const getSortLabel = (sort: string) => {
    switch (sort) {
      case "name":
        return language === "fa" ? "نام" : "Name";
      case "price-low":
        return language === "fa" ? "قیمت (کم به زیاد)" : "Price (Low to High)";
      case "price-high":
        return language === "fa" ? "قیمت (زیاد به کم)" : "Price (High to Low)";
      case "rating":
        return language === "fa" ? "امتیاز" : "Rating";
      case "prep-time":
        return language === "fa" ? "زمان آماده‌سازی" : "Prep Time";
      case "calories":
        return language === "fa" ? "کالری" : "Calories";
      default:
        return language === "fa" ? "نام" : "Name";
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
          {language === "fa" ? "منوی غذاهای ایرانی" : "Iranian Food Menu"}
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
            ? "طعم‌های اصیل ایرانی با بهترین مواد اولیه و دستور پخت سنتی"
            : "Authentic Iranian flavors with the finest ingredients and traditional recipes"}
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

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel
                sx={{
                  direction: isRTL ? "rtl" : "ltr",
                  fontFamily: isRTL
                    ? "var(--font-persian)"
                    : "var(--font-english)",
                }}
              >
                {language === "fa" ? "مرتب‌سازی" : "Sort By"}
              </InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                sx={{
                  borderRadius: 3,
                  direction: isRTL ? "rtl" : "ltr",
                  fontFamily: isRTL
                    ? "var(--font-persian)"
                    : "var(--font-english)",
                }}
              >
                <MenuItem value="name">{getSortLabel("name")}</MenuItem>
                <MenuItem value="price-low">
                  {getSortLabel("price-low")}
                </MenuItem>
                <MenuItem value="price-high">
                  {getSortLabel("price-high")}
                </MenuItem>
                <MenuItem value="rating">{getSortLabel("rating")}</MenuItem>
                <MenuItem value="prep-time">
                  {getSortLabel("prep-time")}
                </MenuItem>
                <MenuItem value="calories">{getSortLabel("calories")}</MenuItem>
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
                ? `${filteredAndSortedFoods.length} غذا یافت شد`
                : `${filteredAndSortedFoods.length} foods found`}
            </Typography>
            {filteredAndSortedFoods.filter((f) => f.isPopular).length > 0 && (
              <Chip
                icon={<StarIcon />}
                label={
                  language === "fa"
                    ? `${
                        filteredAndSortedFoods.filter((f) => f.isPopular).length
                      } محبوب`
                    : `${
                        filteredAndSortedFoods.filter((f) => f.isPopular).length
                      } popular`
                }
                color="primary"
                variant="outlined"
                size="small"
              />
            )}
            {filteredAndSortedFoods.filter((f) => f.isVegetarian).length >
              0 && (
              <Chip
                label={
                  language === "fa"
                    ? `${
                        filteredAndSortedFoods.filter((f) => f.isVegetarian)
                          .length
                      } گیاهی`
                    : `${
                        filteredAndSortedFoods.filter((f) => f.isVegetarian)
                          .length
                      } vegetarian`
                }
                color="success"
                variant="outlined"
                size="small"
              />
            )}
          </Box>
        </Stack>
      </Paper>

      {/* Food Grid */}
      <Grid container spacing={3}>
        {filteredAndSortedFoods.map((food, index) => (
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

                {/* Vegetarian Badge */}
                {food.isVegetarian && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: food.isPopular ? 50 : 12,
                      right: isRTL ? "auto" : 12,
                      left: isRTL ? 12 : "auto",
                      zIndex: 1,
                    }}
                  >
                    <Chip
                      label={language === "fa" ? "گیاهی" : "Vegetarian"}
                      color="success"
                      size="small"
                      sx={{
                        fontWeight: 600,
                        color: "white",
                        bgcolor: "#4caf50",
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
                  <IconButton
                    onClick={() => handleFavoriteToggle(food.id)}
                    sx={{
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
                  </IconButton>
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
      {filteredAndSortedFoods.length === 0 && (
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
