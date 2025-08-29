import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
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
  Paper,
  Rating,
  Button,
  Fade,
  IconButton,
  Drawer,
  Divider,
  Slider,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  Alert,
  Snackbar,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useMediaQuery, useTheme } from "@mui/material";
import {
  Search as SearchIcon,
  Restaurant as RestaurantIcon,
  Star as StarIcon,
  AccessTime as TimeIcon,
  LocalOffer as PriceIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ShoppingCart as ShoppingCartIcon,
  Close as CloseIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  TuneRounded as TuneIcon,
  Nature as EcoIcon,
  Whatshot as WhatshotIcon,
  Schedule as ScheduleIcon,
  MonetizationOn as MoneyIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useLanguage } from "../../contexts/LanguageContext";
import { formatCurrency } from "../../utils/languageUtils";
import { getCurrentUser } from "../../utils/userUtils";

interface FoodItem {
  id: string;
  name: string;
  nameEn: string;
  price: number;
  originalPrice?: number;
  discount?: number;
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
  isAvailable?: boolean;
  nutritionFacts?: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  allergens?: string[];
  allergensEn?: string[];
}

const Foods = () => {
  const { language, isRTL } = useLanguage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // State management
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [sortBy, setSortBy] = useState<string>("name");
  const [priceRange, setPriceRange] = useState<number[]>([0, 100000]);
  const [calorieRange, setCalorieRange] = useState<number[]>([0, 1000]);
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [showOnlyVegetarian, setShowOnlyVegetarian] = useState(false);
  const [showOnlyPopular, setShowOnlyPopular] = useState(false);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [foodDetailOpen, setFoodDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Load user and data on mount
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      loadUserPreferences(currentUser.id);
    } else {
      window.location.href = "/login";
    }

    // Simulate loading delay
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const loadUserPreferences = (userId: string) => {
    try {
      const savedFavorites = localStorage.getItem(`favorites_${userId}`);
      const savedCart = localStorage.getItem(`cart_${userId}`);

      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error("Error loading user preferences:", error);
    }
  };

  const saveUserPreferences = () => {
    if (!user) return;
    try {
      localStorage.setItem(`favorites_${user.id}`, JSON.stringify(favorites));
      localStorage.setItem(`cart_${user.id}`, JSON.stringify(cart));
    } catch (error) {
      console.error("Error saving user preferences:", error);
    }
  };

  useEffect(() => {
    saveUserPreferences();
  }, [favorites, cart, user]);

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
      isAvailable: true,
      nutritionFacts: { protein: 12, carbs: 45, fat: 8, fiber: 3 },
      allergens: ["لبنیات", "گلوتن"],
      allergensEn: ["Dairy", "Gluten"],
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
      isAvailable: true,
      nutritionFacts: { protein: 14, carbs: 25, fat: 12, fiber: 4 },
      allergens: ["تخم مرغ"],
      allergensEn: ["Eggs"],
    },
    {
      id: "lunch-1",
      name: "چلو کباب بختیاری",
      nameEn: "Chelo Kebab Bakhtiari",
      price: 55000,
      originalPrice: 62000,
      discount: 11,
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
      isAvailable: true,
      nutritionFacts: { protein: 45, carbs: 60, fat: 22, fiber: 2 },
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
      isAvailable: true,
      nutritionFacts: { protein: 40, carbs: 55, fat: 18, fiber: 2 },
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
      isAvailable: false,
      nutritionFacts: { protein: 42, carbs: 70, fat: 25, fiber: 3 },
    },
    {
      id: "lunch-4",
      name: "قورمه سبزی",
      nameEn: "Ghormeh Sabzi",
      price: 40000,
      originalPrice: 45000,
      discount: 11,
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
      isAvailable: true,
      nutritionFacts: { protein: 28, carbs: 45, fat: 15, fiber: 8 },
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
      isAvailable: true,
      nutritionFacts: { protein: 25, carbs: 40, fat: 16, fiber: 6 },
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
      isAvailable: true,
      nutritionFacts: { protein: 26, carbs: 38, fat: 18, fiber: 7 },
    },
    {
      id: "lunch-7",
      name: "زرشک پلو با مرغ",
      nameEn: "Zereshk Polo with Chicken",
      price: 48000,
      originalPrice: 54000,
      discount: 11,
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
      isAvailable: true,
      nutritionFacts: { protein: 38, carbs: 58, fat: 20, fiber: 4 },
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
      isAvailable: true,
      nutritionFacts: { protein: 44, carbs: 52, fat: 24, fiber: 2 },
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
      isAvailable: true,
      nutritionFacts: { protein: 36, carbs: 48, fat: 16, fiber: 2 },
    },
    {
      id: "lunch-10",
      name: "بیف استروگانوف",
      nameEn: "Beef Stroganoff",
      price: 58000,
      originalPrice: 65000,
      discount: 11,
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
      isAvailable: true,
      nutritionFacts: { protein: 48, carbs: 35, fat: 35, fiber: 3 },
      allergens: ["لبنیات"],
      allergensEn: ["Dairy"],
    },
    {
      id: "dinner-1",
      name: "ساندویچ رست بیف",
      nameEn: "Roast Beef Sandwich",
      price: 35000,
      originalPrice: 40000,
      discount: 12,
      ingredients: ["نان", "گوشت رست", "سبزیجات", "سس", "پنیر"],
      ingredientsEn: ["Bread", "Roast beef", "Vegetables", "Sauce", "Cheese"],
      description: "ساندویچ رست بیف با گوشت تازه و سبزیجات",
      descriptionEn: "Roast beef sandwich with fresh meat and vegetables",
      imageUrl: foodImages.sandwich,
      category: "dinner",
      rating: 4.3,
      prepTime: 10,
      calories: 420,
      isAvailable: true,
      nutritionFacts: { protein: 28, carbs: 32, fat: 18, fiber: 4 },
      allergens: ["گلوتن", "لبنیات"],
      allergensEn: ["Gluten", "Dairy"],
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
      isAvailable: true,
      nutritionFacts: { protein: 3, carbs: 12, fat: 8, fiber: 5 },
    },
  ];

  // Enhanced filtering logic
  const filteredAndSortedFoods = useMemo(() => {
    let filtered = allFoods.filter((food) => {
      // Text search
      const matchesSearch =
        searchTerm === "" ||
        food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        food.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        food.ingredients.some((ingredient) =>
          ingredient.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        food.ingredientsEn.some((ingredient) =>
          ingredient.toLowerCase().includes(searchTerm.toLowerCase())
        );

      // Category filter
      const matchesCategory =
        selectedCategory === "all" || food.category === selectedCategory;

      // Price range filter
      const matchesPrice =
        food.price >= priceRange[0] && food.price <= priceRange[1];

      // Calorie range filter
      const matchesCalories =
        food.calories >= calorieRange[0] && food.calories <= calorieRange[1];

      // Rating filter
      const matchesRating = food.rating >= ratingFilter;

      // Boolean filters
      const matchesVegetarian = !showOnlyVegetarian || food.isVegetarian;
      const matchesPopular = !showOnlyPopular || food.isPopular;
      const matchesAvailable = !showOnlyAvailable || food.isAvailable;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPrice &&
        matchesCalories &&
        matchesRating &&
        matchesVegetarian &&
        matchesPopular &&
        matchesAvailable
      );
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
      case "popularity":
        filtered.sort((a, b) => {
          if (a.isPopular && !b.isPopular) return -1;
          if (!a.isPopular && b.isPopular) return 1;
          return b.rating - a.rating;
        });
        break;
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [
    searchTerm,
    selectedCategory,
    sortBy,
    priceRange,
    calorieRange,
    ratingFilter,
    showOnlyVegetarian,
    showOnlyPopular,
    showOnlyAvailable,
  ]);

  // Event handlers
  const handleFavoriteToggle = (foodId: string) => {
    setFavorites((prev) =>
      prev.includes(foodId)
        ? prev.filter((id) => id !== foodId)
        : [...prev, foodId]
    );

    const message = favorites.includes(foodId)
      ? language === "fa"
        ? "از علاقه‌مندی‌ها حذف شد"
        : "Removed from favorites"
      : language === "fa"
      ? "به علاقه‌مندی‌ها اضافه شد"
      : "Added to favorites";

    showSuccessNotification(message);
  };

  const handleAddToCart = (foodId: string) => {
    setCart((prev) => ({
      ...prev,
      [foodId]: (prev[foodId] || 0) + 1,
    }));

    showSuccessNotification(
      language === "fa" ? "به سبد خرید اضافه شد" : "Added to cart"
    );
  };

  const handleRemoveFromCart = (foodId: string) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[foodId] > 1) {
        newCart[foodId]--;
      } else {
        delete newCart[foodId];
      }
      return newCart;
    });
  };

  const showSuccessNotification = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSortBy("name");
    setPriceRange([0, 100000]);
    setCalorieRange([0, 1000]);
    setRatingFilter(0);
    setShowOnlyVegetarian(false);
    setShowOnlyPopular(false);
    setShowOnlyAvailable(false);
  };

  const handleFoodClick = (food: FoodItem) => {
    setSelectedFood(food);
    setFoodDetailOpen(true);
  };

  // Helper functions
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
      case "popularity":
        return language === "fa" ? "محبوبیت" : "Popularity";
      default:
        return language === "fa" ? "نام" : "Name";
    }
  };

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [foodId, quantity]) => {
      const food = allFoods.find((f) => f.id === foodId);
      return total + (food?.price || 0) * quantity;
    }, 0);
  };

  const getTotalCartItems = () => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <Box sx={{ py: 4, width: "100%" }}>
        <Stack spacing={3}>
          <Skeleton
            variant="rectangular"
            height={200}
            sx={{ borderRadius: 3 }}
          />
          <Skeleton
            variant="rectangular"
            height={120}
            sx={{ borderRadius: 2 }}
          />
          <Stack 
            direction="row" 
            sx={{ 
              flexWrap: 'wrap', 
              gap: 3,
              justifyContent: 'flex-start'
            }}
          >
            {Array.from({ length: 12 }).map((_, index) => (
              <Box key={index} sx={{ flex: '1 1 300px', minWidth: '300px', maxWidth: '400px' }}>
                <Card sx={{ borderRadius: 3 }}>
                  <Skeleton variant="rectangular" height={200} />
                  <CardContent>
                    <Skeleton variant="text" height={30} />
                    <Skeleton variant="text" height={20} />
                    <Skeleton variant="text" height={20} width="60%" />
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Stack>
        </Stack>
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
            mb: 2,
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
            {language === "fa" ? "منوی غذاها" : "Food Menu"}
          </Typography>
        </Box>

        {/* Statistics Cards */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={3} sx={{ flexWrap: "wrap" }}>
          <Stack sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(25% - 18px)" } }}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "white",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <RestaurantIcon sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {allFoods.length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {language === "fa" ? "کل غذاها" : "Total Foods"}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Stack>
          
          <Stack sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(25% - 18px)" } }}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                color: "white",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <StarIcon sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {allFoods.filter((f) => f.isPopular).length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {language === "fa" ? "محبوب" : "Popular"}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Stack>
          
          <Stack sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(25% - 18px)" } }}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)",
                color: "white",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <EcoIcon sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {allFoods.filter((f) => f.isVegetarian).length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {language === "fa" ? "گیاهی" : "Vegetarian"}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Stack>
          
          <Stack sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(25% - 18px)" } }}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                color: "white",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <StarIcon sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      4.6
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {language === "fa" ? "امتیاز متوسط" : "Avg Rating"}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Stack>

        {/* Search and Controls */}
        <Paper elevation={3} sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={3}>
            {/* Main Search and View Controls */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {/* Search Bar */}
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexGrow: 1,
                  alignItems: "center",
                }}
              >
                <TextField
                  placeholder={
                    language === "fa" ? "جستجو در غذاها..." : "Search foods..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{
                    flexGrow: 1,
                    maxWidth: { xs: "100%", sm: 400 },
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

                {/* Mobile Filter Toggle */}
                <IconButton
                  onClick={() => setFilterDrawerOpen(true)}
                  sx={{ display: { xs: "flex", md: "none" } }}
                >
                  <TuneIcon />
                </IconButton>
              </Box>

              {/* View Mode Toggle */}
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, newMode) => newMode && setViewMode(newMode)}
                size="small"
              >
                <ToggleButton value="grid" aria-label="grid view">
                  <ViewModuleIcon />
                </ToggleButton>
                <ToggleButton value="list" aria-label="list view">
                  <ViewListIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Desktop Filters */}
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                gap: 2,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <FormControl sx={{ minWidth: 140 }}>
                <InputLabel>
                  {language === "fa" ? "دسته‌بندی" : "Category"}
                </InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  sx={{ borderRadius: 3 }}
                >
                  <MenuItem value="all">{getCategoryLabel("all")}</MenuItem>
                  <MenuItem value="breakfast">
                    {getCategoryLabel("breakfast")}
                  </MenuItem>
                  <MenuItem value="lunch">{getCategoryLabel("lunch")}</MenuItem>
                  <MenuItem value="dinner">
                    {getCategoryLabel("dinner")}
                  </MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 160 }}>
                <InputLabel>
                  {language === "fa" ? "مرتب‌سازی" : "Sort By"}
                </InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  sx={{ borderRadius: 3 }}
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
                  <MenuItem value="calories">
                    {getSortLabel("calories")}
                  </MenuItem>
                  <MenuItem value="popularity">
                    {getSortLabel("popularity")}
                  </MenuItem>
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={showOnlyVegetarian}
                    onChange={(e) => setShowOnlyVegetarian(e.target.checked)}
                    color="success"
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <EcoIcon fontSize="small" />
                    <Typography variant="body2">
                      {language === "fa" ? "گیاهی" : "Vegetarian"}
                    </Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={showOnlyPopular}
                    onChange={(e) => setShowOnlyPopular(e.target.checked)}
                    color="warning"
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <WhatshotIcon fontSize="small" />
                    <Typography variant="body2">
                      {language === "fa" ? "محبوب" : "Popular"}
                    </Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={showOnlyAvailable}
                    onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <ScheduleIcon fontSize="small" />
                    <Typography variant="body2">
                      {language === "fa" ? "موجود" : "Available"}
                    </Typography>
                  </Box>
                }
              />

              <Button
                variant="outlined"
                onClick={handleResetFilters}
                startIcon={<RefreshIcon />}
                sx={{ borderRadius: 2 }}
              >
                {language === "fa" ? "پاک کردن" : "Reset"}
              </Button>
            </Box>

            {/* Results Summary */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
                justifyContent: "space-between",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  flexWrap: "wrap",
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

                {filteredAndSortedFoods.filter((f) => f.isPopular).length >
                  0 && (
                  <Chip
                    icon={<StarIcon />}
                    label={`${
                      filteredAndSortedFoods.filter((f) => f.isPopular).length
                    } ${language === "fa" ? "محبوب" : "popular"}`}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                )}

                {filteredAndSortedFoods.filter((f) => f.isVegetarian).length >
                  0 && (
                  <Chip
                    icon={<EcoIcon />}
                    label={`${
                      filteredAndSortedFoods.filter((f) => f.isVegetarian)
                        .length
                    } ${language === "fa" ? "گیاهی" : "vegetarian"}`}
                    color="success"
                    variant="outlined"
                    size="small"
                  />
                )}

                {filteredAndSortedFoods.filter((f) => f.discount).length >
                  0 && (
                  <Chip
                    icon={<PriceIcon />}
                    label={`${
                      filteredAndSortedFoods.filter((f) => f.discount).length
                    } ${language === "fa" ? "تخفیف" : "discounted"}`}
                    color="error"
                    variant="outlined"
                    size="small"
                  />
                )}
              </Box>

              {/* Cart Summary */}
              {getTotalCartItems() > 0 && (
                <Chip
                  icon={<ShoppingCartIcon />}
                  label={`${getTotalCartItems()} ${
                    language === "fa" ? "آیتم" : "items"
                  } - ${formatCurrency(getCartTotal(), language)}`}
                  color="primary"
                  sx={{ fontWeight: 600 }}
                />
              )}
            </Box>
          </Stack>
        </Paper>

        {/* Food Cards */}
        <Stack
          direction="row"
          spacing={3}
          sx={{
            direction: isRTL ? "rtl" : "ltr",
            flexWrap: "wrap",
          }}
        >
          {filteredAndSortedFoods.map((food, index) => (
            <Stack
              key={food.id}
              sx={{
                flex:
                  viewMode === "list"
                    ? "1 1 100%"
                    : {
                        xs: "1 1 100%",
                        sm: "1 1 calc(50% - 12px)",
                        md: "1 1 calc(33.333% - 16px)",
                        lg: "1 1 calc(25% - 18px)",
                      },
              }}
            >
              <Fade in={true} timeout={300 + index * 50}>
                <Card
                  elevation={food.isPopular ? 6 : 2}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: viewMode === "list" ? "row" : "column",
                    position: "relative",
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      transform: food.isAvailable ? "translateY(-4px)" : "none",
                      boxShadow: food.isAvailable
                        ? "0 8px 24px rgba(0,0,0,0.12)"
                        : "none",
                    },
                    border: food.isPopular ? "2px solid #ff6b35" : "none",
                    filter: !food.isAvailable ? "grayscale(30%)" : "none",
                    opacity: !food.isAvailable ? 0.7 : 1,
                  }}
                  onClick={() => handleFoodClick(food)}
                >
                  {/* Badges */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 12,
                      right: isRTL ? "auto" : 12,
                      left: isRTL ? 12 : "auto",
                      zIndex: 2,
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.5,
                    }}
                  >
                    {food.discount && (
                      <Chip
                        icon={<PriceIcon />}
                        label={`${food.discount}%`}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          color: "white",
                          bgcolor: "#ef4444",
                          fontSize: "0.75rem",
                        }}
                      />
                    )}
                    {food.isPopular && (
                      <Chip
                        icon={<StarIcon />}
                        label={language === "fa" ? "محبوب" : "Popular"}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          color: "white",
                          bgcolor: "#ff6b35",
                          fontSize: "0.75rem",
                        }}
                      />
                    )}
                    {food.isVegetarian && (
                      <Chip
                        icon={<EcoIcon />}
                        label={language === "fa" ? "گیاهی" : "Vegetarian"}
                        size="small"
                        color="success"
                        sx={{
                          fontWeight: 600,
                          color: "white",
                          bgcolor: "#4caf50",
                          fontSize: "0.75rem",
                        }}
                      />
                    )}
                    {!food.isAvailable && (
                      <Chip
                        label={language === "fa" ? "ناموجود" : "Unavailable"}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          color: "white",
                          bgcolor: "#757575",
                          fontSize: "0.75rem",
                        }}
                      />
                    )}
                  </Box>

                  {/* Favorite Button */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 12,
                      left: isRTL ? "auto" : 12,
                      right: isRTL ? 12 : "auto",
                      zIndex: 2,
                    }}
                    onClick={(e) => e.stopPropagation()}
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
                    height={viewMode === "list" ? 200 : 240}
                    image={food.imageUrl}
                    alt={language === "fa" ? food.name : food.nameEn}
                    sx={{
                      width:
                        viewMode === "list" ? { xs: "100%", sm: 300 } : "100%",
                      objectFit: "cover",
                      transition: "transform 0.3s ease",
                      "&:hover": {
                        transform: food.isAvailable ? "scale(1.05)" : "none",
                      },
                    }}
                  />

                  <CardContent
                    sx={{
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Stack spacing={2.5} sx={{ height: "100%" }}>
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
                            fontSize: { xs: "1rem", md: "1.25rem" },
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
                      <Box>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography
                            variant="h6"
                            color="primary"
                            sx={{
                              fontWeight: 700,
                              direction: isRTL ? "rtl" : "ltr",
                              fontFamily: isRTL
                                ? "var(--font-persian)"
                                : "var(--font-english)",
                            }}
                          >
                            {formatCurrency(food.price, language)}
                          </Typography>
                          {food.originalPrice && (
                            <Typography
                              variant="body2"
                              sx={{
                                textDecoration: "line-through",
                                color: "text.secondary",
                                direction: isRTL ? "rtl" : "ltr",
                                fontFamily: isRTL
                                  ? "var(--font-persian)"
                                  : "var(--font-english)",
                              }}
                            >
                              {formatCurrency(food.originalPrice, language)}
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      {/* Meta Info */}
                      <Box
                        sx={{
                          display: "flex",
                          gap: 2,
                          justifyContent: isRTL ? "flex-end" : "flex-start",
                          direction: isRTL ? "rtl" : "ltr",
                          flexWrap: "wrap",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <TimeIcon
                            sx={{ fontSize: 16, color: "text.secondary" }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {food.prepTime}{" "}
                            {language === "fa" ? "دقیقه" : "min"}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <MoneyIcon
                            sx={{ fontSize: 16, color: "text.secondary" }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {food.calories}{" "}
                            {language === "fa" ? "کالری" : "cal"}
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
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {language === "fa"
                          ? food.description
                          : food.descriptionEn}
                      </Typography>

                      {/* Ingredients */}
                      <Box sx={{ flexGrow: 1 }}>
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
                              label={`+${food.ingredients.length - 3} ${
                                language === "fa" ? "بیشتر" : "more"
                              }`}
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

                      {/* Actions */}
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          pt: 1,
                          justifyContent: isRTL ? "flex-end" : "flex-start",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="contained"
                          size="small"
                          disabled={!food.isAvailable}
                          startIcon={<ShoppingCartIcon />}
                          onClick={() => handleAddToCart(food.id)}
                          sx={{
                            borderRadius: 2,
                            fontFamily: isRTL
                              ? "var(--font-persian)"
                              : "var(--font-english)",
                            minWidth: 120,
                          }}
                        >
                          {language === "fa" ? "افزودن به سبد" : "Add to Cart"}
                        </Button>
                        {cart[food.id] && (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveFromCart(food.id)}
                              sx={{ bgcolor: "rgba(0,0,0,0.04)" }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600 }}
                              >
                                -
                              </Typography>
                            </IconButton>
                            <Typography
                              variant="body2"
                              sx={{ minWidth: 20, textAlign: "center" }}
                            >
                              {cart[food.id]}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleAddToCart(food.id)}
                              sx={{ bgcolor: "rgba(0,0,0,0.04)" }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600 }}
                              >
                                +
                              </Typography>
                            </IconButton>
                          </Box>
                        )}
                      </Box>

                      {/* Category Badge */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: isRTL ? "flex-end" : "flex-start",
                        }}
                      >
                        <Chip
                          label={getCategoryLabel(food.category)}
                          size="small"
                          color="secondary"
                          sx={{
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
            </Stack>
          ))}
        </Stack>

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
                fontFamily: isRTL
                  ? "var(--font-persian)"
                  : "var(--font-english)",
              }}
            >
              {language === "fa" ? "هیچ غذایی یافت نشد" : "No foods found"}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontFamily: isRTL
                  ? "var(--font-persian)"
                  : "var(--font-english)",
                mb: 2,
              }}
            >
              {language === "fa"
                ? "لطفاً فیلترهای خود را تغییر دهید"
                : "Please adjust your filters"}
            </Typography>
            <Button
              variant="outlined"
              onClick={handleResetFilters}
              startIcon={<RefreshIcon />}
            >
              {language === "fa" ? "پاک کردن فیلترها" : "Reset Filters"}
            </Button>
          </Paper>
        )}
      </Stack>

      {/* Mobile Filter Drawer */}
      <Drawer
        anchor={isRTL ? "left" : "right"}
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "100%", sm: 400 },
            p: 3,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <Typography variant="h6">
            {language === "fa" ? "فیلترها" : "Filters"}
          </Typography>
          <IconButton onClick={() => setFilterDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Stack spacing={3}>
          <FormControl fullWidth>
            <InputLabel>
              {language === "fa" ? "دسته‌بندی" : "Category"}
            </InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <MenuItem value="all">{getCategoryLabel("all")}</MenuItem>
              <MenuItem value="breakfast">
                {getCategoryLabel("breakfast")}
              </MenuItem>
              <MenuItem value="lunch">{getCategoryLabel("lunch")}</MenuItem>
              <MenuItem value="dinner">{getCategoryLabel("dinner")}</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>
              {language === "fa" ? "مرتب‌سازی" : "Sort By"}
            </InputLabel>
            <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <MenuItem value="name">{getSortLabel("name")}</MenuItem>
              <MenuItem value="price-low">{getSortLabel("price-low")}</MenuItem>
              <MenuItem value="price-high">
                {getSortLabel("price-high")}
              </MenuItem>
              <MenuItem value="rating">{getSortLabel("rating")}</MenuItem>
              <MenuItem value="prep-time">{getSortLabel("prep-time")}</MenuItem>
              <MenuItem value="calories">{getSortLabel("calories")}</MenuItem>
              <MenuItem value="popularity">
                {getSortLabel("popularity")}
              </MenuItem>
            </Select>
          </FormControl>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {language === "fa" ? "محدوده قیمت" : "Price Range"}
            </Typography>
            <Slider
              value={priceRange}
              onChange={(_, newValue) => setPriceRange(newValue as number[])}
              valueLabelDisplay="auto"
              min={0}
              max={100000}
              step={5000}
              valueLabelFormat={(value) => formatCurrency(value, language)}
            />
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}
            >
              <Typography variant="caption">
                {formatCurrency(priceRange[0], language)}
              </Typography>
              <Typography variant="caption">
                {formatCurrency(priceRange[1], language)}
              </Typography>
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {language === "fa" ? "محدوده کالری" : "Calorie Range"}
            </Typography>
            <Slider
              value={calorieRange}
              onChange={(_, newValue) => setCalorieRange(newValue as number[])}
              valueLabelDisplay="auto"
              min={0}
              max={1000}
              step={50}
            />
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}
            >
              <Typography variant="caption">{calorieRange[0]} cal</Typography>
              <Typography variant="caption">{calorieRange[1]} cal</Typography>
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {language === "fa" ? "حداقل امتیاز" : "Minimum Rating"}
            </Typography>
            <Slider
              value={ratingFilter}
              onChange={(_, newValue) => setRatingFilter(newValue as number)}
              valueLabelDisplay="auto"
              min={0}
              max={5}
              step={0.5}
              marks={[
                { value: 0, label: "0" },
                { value: 2.5, label: "2.5" },
                { value: 5, label: "5" },
              ]}
            />
          </Box>

          <Divider />

          <FormControlLabel
            control={
              <Switch
                checked={showOnlyVegetarian}
                onChange={(e) => setShowOnlyVegetarian(e.target.checked)}
                color="success"
              />
            }
            label={language === "fa" ? "فقط گیاهی" : "Vegetarian Only"}
          />

          <FormControlLabel
            control={
              <Switch
                checked={showOnlyPopular}
                onChange={(e) => setShowOnlyPopular(e.target.checked)}
                color="warning"
              />
            }
            label={language === "fa" ? "فقط محبوب" : "Popular Only"}
          />

          <FormControlLabel
            control={
              <Switch
                checked={showOnlyAvailable}
                onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                color="primary"
              />
            }
            label={language === "fa" ? "فقط موجود" : "Available Only"}
          />

          <Button
            variant="outlined"
            fullWidth
            onClick={handleResetFilters}
            startIcon={<RefreshIcon />}
          >
            {language === "fa" ? "پاک کردن فیلترها" : "Reset Filters"}
          </Button>

          <Button
            variant="contained"
            fullWidth
            onClick={() => setFilterDrawerOpen(false)}
          >
            {language === "fa" ? "اعمال فیلترها" : "Apply Filters"}
          </Button>
        </Stack>
      </Drawer>

      {/* Food Detail Dialog */}
      <Dialog
        open={foodDetailOpen}
        onClose={() => setFoodDetailOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        {selectedFood && (
          <>
            <DialogTitle
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                pb: 1,
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  direction: isRTL ? "rtl" : "ltr",
                  fontFamily: isRTL
                    ? "var(--font-persian)"
                    : "var(--font-english)",
                }}
              >
                {language === "fa" ? selectedFood.name : selectedFood.nameEn}
              </Typography>
              <IconButton onClick={() => setFoodDetailOpen(false)}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3}>
                <Box sx={{ position: "relative" }}>
                  <CardMedia
                    component="img"
                    height={300}
                    image={selectedFood.imageUrl}
                    alt={
                      language === "fa"
                        ? selectedFood.name
                        : selectedFood.nameEn
                    }
                    sx={{ borderRadius: 2, objectFit: "cover" }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.5,
                    }}
                  >
                    {selectedFood.isPopular && (
                      <Chip
                        icon={<StarIcon />}
                        label={language === "fa" ? "محبوب" : "Popular"}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          color: "white",
                          bgcolor: "#ff6b35",
                        }}
                      />
                    )}
                    {selectedFood.isVegetarian && (
                      <Chip
                        icon={<EcoIcon />}
                        label={language === "fa" ? "گیاهی" : "Vegetarian"}
                        size="small"
                        color="success"
                      />
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Rating
                    value={selectedFood.rating}
                    precision={0.1}
                    size="large"
                    readOnly
                  />
                  <Typography variant="h6" color="text.secondary">
                    ({selectedFood.rating})
                  </Typography>
                </Box>

                <Typography
                  variant="h4"
                  color="primary"
                  sx={{
                    fontWeight: 700,
                    direction: isRTL ? "rtl" : "ltr",
                    fontFamily: isRTL
                      ? "var(--font-persian)"
                      : "var(--font-english)",
                  }}
                >
                  {formatCurrency(selectedFood.price, language)}
                  {selectedFood.originalPrice && (
                    <Typography
                      component="span"
                      variant="h6"
                      sx={{
                        textDecoration: "line-through",
                        color: "text.secondary",
                        ml: 2,
                      }}
                    >
                      {formatCurrency(selectedFood.originalPrice, language)}
                    </Typography>
                  )}
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    lineHeight: 1.7,
                    direction: isRTL ? "rtl" : "ltr",
                    textAlign: isRTL ? "right" : "left",
                    fontFamily: isRTL
                      ? "var(--font-persian)"
                      : "var(--font-english)",
                  }}
                >
                  {language === "fa"
                    ? selectedFood.description
                    : selectedFood.descriptionEn}
                </Typography>

                <Stack direction="row" spacing={2}>
                  <Stack sx={{ flex: "1 1 50%" }}>
                    <Box
                      sx={{
                        textAlign: "center",
                        p: 2,
                        bgcolor: "grey.50",
                        borderRadius: 2,
                      }}
                    >
                      <TimeIcon
                        sx={{ fontSize: 32, color: "primary.main", mb: 1 }}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {selectedFood.prepTime}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {language === "fa" ? "دقیقه" : "minutes"}
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack sx={{ flex: "1 1 50%" }}>
                    <Box
                      sx={{
                        textAlign: "center",
                        p: 2,
                        bgcolor: "grey.50",
                        borderRadius: 2,
                      }}
                    >
                      <MoneyIcon
                        sx={{ fontSize: 32, color: "primary.main", mb: 1 }}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {selectedFood.calories}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {language === "fa" ? "کالری" : "calories"}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>

                <Box>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      direction: isRTL ? "rtl" : "ltr",
                      textAlign: isRTL ? "right" : "left",
                      fontFamily: isRTL
                        ? "var(--font-persian)"
                        : "var(--font-english)",
                    }}
                  >
                    {language === "fa" ? "مواد تشکیل دهنده:" : "Ingredients:"}
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {(language === "fa"
                      ? selectedFood.ingredients
                      : selectedFood.ingredientsEn
                    ).map((ingredient, index) => (
                      <Chip
                        key={index}
                        label={ingredient}
                        variant="outlined"
                        sx={{
                          borderRadius: 2,
                          fontFamily: isRTL
                            ? "var(--font-persian)"
                            : "var(--font-english)",
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                {selectedFood.nutritionFacts && (
                  <Box>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        fontWeight: 600,
                        direction: isRTL ? "rtl" : "ltr",
                        textAlign: isRTL ? "right" : "left",
                        fontFamily: isRTL
                          ? "var(--font-persian)"
                          : "var(--font-english)",
                      }}
                    >
                      {language === "fa" ? "ارزش غذایی:" : "Nutrition Facts:"}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Stack sx={{ flex: "1 1 25%" }}>
                        <Box
                          sx={{
                            textAlign: "center",
                            p: 1,
                            bgcolor: "primary.50",
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="body2" color="primary">
                            {language === "fa" ? "پروتئین" : "Protein"}
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {selectedFood.nutritionFacts.protein}g
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack sx={{ flex: "1 1 25%" }}>
                        <Box
                          sx={{
                            textAlign: "center",
                            p: 1,
                            bgcolor: "secondary.50",
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="body2" color="secondary">
                            {language === "fa" ? "کربوهیدرات" : "Carbs"}
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {selectedFood.nutritionFacts.carbs}g
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack sx={{ flex: "1 1 25%" }}>
                        <Box
                          sx={{
                            textAlign: "center",
                            p: 1,
                            bgcolor: "warning.50",
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="body2" color="warning.main">
                            {language === "fa" ? "چربی" : "Fat"}
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {selectedFood.nutritionFacts.fat}g
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack sx={{ flex: "1 1 25%" }}>
                        <Box
                          sx={{
                            textAlign: "center",
                            p: 1,
                            bgcolor: "success.50",
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="body2" color="success.main">
                            {language === "fa" ? "فیبر" : "Fiber"}
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {selectedFood.nutritionFacts.fiber}g
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>
                  </Box>
                )}

                {selectedFood.allergens &&
                  selectedFood.allergens.length > 0 && (
                    <Alert
                      severity="warning"
                      sx={{ direction: isRTL ? "rtl" : "ltr" }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, mb: 0.5 }}
                      >
                        {language === "fa" ? "آلرژن‌ها:" : "Allergens:"}
                      </Typography>
                      <Typography variant="body2">
                        {(language === "fa"
                          ? selectedFood.allergens
                          : selectedFood.allergensEn
                        )?.join(", ")}
                      </Typography>
                    </Alert>
                  )}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
                <IconButton
                  onClick={() => handleFavoriteToggle(selectedFood.id)}
                  color={
                    favorites.includes(selectedFood.id) ? "error" : "default"
                  }
                >
                  {favorites.includes(selectedFood.id) ? (
                    <FavoriteIcon />
                  ) : (
                    <FavoriteBorderIcon />
                  )}
                </IconButton>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={!selectedFood.isAvailable}
                  startIcon={<ShoppingCartIcon />}
                  onClick={() => {
                    handleAddToCart(selectedFood.id);
                    setFoodDetailOpen(false);
                  }}
                  sx={{
                    borderRadius: 2,
                    fontFamily: isRTL
                      ? "var(--font-persian)"
                      : "var(--font-english)",
                  }}
                >
                  {selectedFood.isAvailable
                    ? language === "fa"
                      ? "افزودن به سبد خرید"
                      : "Add to Cart"
                    : language === "fa"
                    ? "ناموجود"
                    : "Unavailable"}
                </Button>
              </Box>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccessMessage}
        autoHideDuration={3000}
        onClose={() => setShowSuccessMessage(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowSuccessMessage(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Foods;
