// Data Service - Centralized data management for the University Nutrition System

export interface FoodItem {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  ingredients: string[];
  ingredientsEn: string[];
  calories: number;
  imageUrl: string;
  category: "breakfast" | "lunch" | "dinner";
  isVegetarian: boolean;
  isPopular: boolean;
  isAvailable: boolean;
  prepTime: number;
  tags: string[];
  isOnSale?: boolean;
  isLimitedTime?: boolean;
  availableQuantity?: number;
  emergencyFee?: number;
  endTime?: Date;
  nutritionalInfo: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}

export interface Restaurant {
  id: string;
  name: string;
  nameEn: string;
  location: string;
  locationEn: string;
  capacity: number;
  operatingHours: {
    breakfast: { start: string; end: string };
    lunch: { start: string; end: string };
    dinner: { start: string; end: string };
  };
  isActive: boolean;
}

export interface MealReservation {
  id: string;
  userId: string;
  date: string;
  meal: "breakfast" | "lunch" | "dinner";
  foodId: string;
  foodName: string;
  restaurantId: string;
  restaurantName: string;
  price: number;
  originalPrice: number;
  discountCode?: string;
  discountAmount?: number;
  faramushiCode: string;
  status: "pending" | "confirmed" | "paid" | "completed" | "cancelled";
  paymentMethod?: "wallet" | "gateway";
  paymentDate?: string;
  reservationDate: string;
  notes?: string;
  isEmergency?: boolean;
  emergencyFee?: number;
  quantity?: number;
  totalPrice?: number;
  createdAt?: string;
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface WeeklyMealPlan {
  userId: string;
  weekStart: string; // ISO date string
  meals: {
    [date: string]: {
      breakfast?: string; // foodId
      lunch?: string;
      dinner?: string;
    };
  };
  restaurants: {
    [date: string]: {
      breakfast?: string; // restaurantId
      lunch?: string;
      dinner?: string;
    };
  };
  lastUpdated: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: "credit" | "debit";
  amount: number;
  date: string;
  description: string;
  category: string;
  relatedReservationId?: string;
  paymentMethod?: string;
  status: "pending" | "completed" | "failed";
}

class DataService {
  private static instance: DataService;
  private foods: FoodItem[] = [];
  private restaurants: Restaurant[] = [];

  private constructor() {
    this.initializeDefaultData();
  }

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  private initializeDefaultData(): void {
    // Initialize restaurants if not exists
    if (!localStorage.getItem("restaurants")) {
      const defaultRestaurants: Restaurant[] = [
        {
          id: "rest_001",
          name: "سلف دانشجویی مرکزی",
          nameEn: "Central Student Cafeteria",
          location: "ساختمان مرکزی، طبقه همکف",
          locationEn: "Main Building, Ground Floor",
          capacity: 200,
          operatingHours: {
            breakfast: { start: "07:00", end: "09:30" },
            lunch: { start: "12:00", end: "14:30" },
            dinner: { start: "18:00", end: "20:30" },
          },
          isActive: true,
        },
        {
          id: "rest_002",
          name: "سلف دانشجویی مهندسی",
          nameEn: "Engineering Cafeteria",
          location: "دانشکده مهندسی، طبقه اول",
          locationEn: "Engineering Faculty, First Floor",
          capacity: 150,
          operatingHours: {
            breakfast: { start: "07:30", end: "09:00" },
            lunch: { start: "12:30", end: "14:00" },
            dinner: { start: "18:30", end: "20:00" },
          },
          isActive: true,
        },
        {
          id: "rest_003",
          name: "سلف خوابگاه",
          nameEn: "Dormitory Cafeteria",
          location: "خوابگاه دانشجویی، طبقه همکف",
          locationEn: "Student Dormitory, Ground Floor",
          capacity: 100,
          operatingHours: {
            breakfast: { start: "07:00", end: "09:00" },
            lunch: { start: "12:00", end: "14:00" },
            dinner: { start: "18:00", end: "21:00" },
          },
          isActive: true,
        },
      ];
      localStorage.setItem("restaurants", JSON.stringify(defaultRestaurants));
    }

    // Initialize comprehensive food menu if not exists
    if (!localStorage.getItem("foods")) {
      const defaultFoods: FoodItem[] = [
        // Breakfast Options
        {
          id: "food_b001",
          name: "نان و پنیر و چای",
          nameEn: "Bread, Cheese & Tea",
          description: "صبحانه سنتی ایرانی با نان تازه و پنیر محلی",
          descriptionEn:
            "Traditional Iranian breakfast with fresh bread and local cheese",
          price: 15000,
          ingredients: ["نان تازه", "پنیر سفید", "چای سیاه", "عسل", "کره"],
          ingredientsEn: [
            "Fresh bread",
            "White cheese",
            "Black tea",
            "Honey",
            "Butter",
          ],
          calories: 320,
          imageUrl: "/api/placeholder/300/200",
          category: "breakfast",
          isVegetarian: true,
          isPopular: true,
          isAvailable: true,
          prepTime: 5,
          tags: ["سنتی", "سریع", "گیاهی"],
          nutritionalInfo: { protein: 12, carbs: 45, fat: 8, fiber: 3 },
        },
        {
          id: "food_b002",
          name: "تخم مرغ آب پز",
          nameEn: "Boiled Eggs",
          description: "تخم مرغ آب پز با نان و سبزیجات",
          descriptionEn: "Boiled eggs with bread and vegetables",
          price: 22000,
          originalPrice: 25000,
          discount: 12,
          ingredients: ["تخم مرغ", "نان", "گوجه", "خیار", "سبزی خوردن"],
          ingredientsEn: ["Eggs", "Bread", "Tomato", "Cucumber", "Fresh herbs"],
          calories: 280,
          imageUrl: "/api/placeholder/300/200",
          category: "breakfast",
          isVegetarian: true,
          isPopular: false,
          isAvailable: true,
          prepTime: 10,
          tags: ["پروتئین", "سالم"],
          isOnSale: true,
          isLimitedTime: true,
          availableQuantity: 85,
          emergencyFee: 5000,
          endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
          nutritionalInfo: { protein: 18, carbs: 25, fat: 12, fiber: 4 },
        },
        {
          id: "food_b003",
          name: "کشک و بادمجان",
          nameEn: "Kashk-e Bademjan",
          description: "کشک و بادمجان سنتی با نان",
          descriptionEn: "Traditional eggplant and whey dish with bread",
          price: 28000,
          ingredients: ["بادمجان", "کشک", "پیاز", "سیر", "نعنا", "نان"],
          ingredientsEn: [
            "Eggplant",
            "Whey",
            "Onion",
            "Garlic",
            "Mint",
            "Bread",
          ],
          calories: 250,
          imageUrl: "/api/placeholder/300/200",
          category: "breakfast",
          isVegetarian: true,
          isPopular: true,
          isAvailable: true,
          prepTime: 15,
          tags: ["سنتی", "گیاهی"],
          nutritionalInfo: { protein: 8, carbs: 30, fat: 10, fiber: 8 },
        },
        {
          id: "food_b004",
          name: "جام (املت)",
          nameEn: "Persian Omelet (Jam)",
          description: "املت ایرانی با سبزیجات",
          descriptionEn: "Persian omelet with herbs and vegetables",
          price: 26000,
          ingredients: ["تخم مرغ", "سبزی قورمه", "پیاز", "نمک", "فلفل", "نان"],
          ingredientsEn: [
            "Eggs",
            "Fresh herbs",
            "Onion",
            "Salt",
            "Pepper",
            "Bread",
          ],
          calories: 310,
          imageUrl: "/api/placeholder/300/200",
          category: "breakfast",
          isVegetarian: true,
          isPopular: false,
          isAvailable: true,
          prepTime: 12,
          tags: ["پروتئین", "سبزیجات"],
          nutritionalInfo: { protein: 16, carbs: 18, fat: 18, fiber: 5 },
        },
        {
          id: "food_b005",
          name: "کله پاچه",
          nameEn: "Kalle Pache",
          description: "غذای سنتی ایرانی برای صبحانه",
          descriptionEn: "Traditional Iranian breakfast soup",
          price: 45000,
          ingredients: ["کله و پاچه گوسفند", "سیر", "لیمو", "نان", "سبزی"],
          ingredientsEn: [
            "Sheep head & trotters",
            "Garlic",
            "Lemon",
            "Bread",
            "Herbs",
          ],
          calories: 420,
          imageUrl: "/api/placeholder/300/200",
          category: "breakfast",
          isVegetarian: false,
          isPopular: true,
          isAvailable: true,
          prepTime: 20,
          tags: ["سنتی", "پروتئین"],
          nutritionalInfo: { protein: 35, carbs: 15, fat: 25, fiber: 2 },
        },

        // Lunch Options
        {
          id: "food_l001",
          name: "چلو کباب کوبیده",
          nameEn: "Rice with Kobideh Kebab",
          description: "برنج زعفرانی با کباب کوبیده",
          descriptionEn: "Saffron rice with ground meat kebab",
          price: 48000,
          ingredients: ["برنج", "گوشت چرخ کرده", "زعفران", "پیاز", "ادویه"],
          ingredientsEn: ["Rice", "Ground meat", "Saffron", "Onion", "Spices"],
          calories: 650,
          imageUrl: "/api/placeholder/300/200",
          category: "lunch",
          isVegetarian: false,
          isPopular: true,
          isAvailable: true,
          prepTime: 25,
          tags: ["محبوب", "سنتی"],
          nutritionalInfo: { protein: 28, carbs: 65, fat: 22, fiber: 3 },
        },
        {
          id: "food_l002",
          name: "قورمه سبزی",
          nameEn: "Ghormeh Sabzi",
          description: "خورشت سبزی با گوشت و لوبیا",
          descriptionEn: "Herb stew with meat and beans",
          price: 42000,
          originalPrice: 45000,
          discount: 7,
          ingredients: [
            "سبزی قورمه",
            "گوشت",
            "لوبیا قرمز",
            "لیمو عمانی",
            "برنج",
          ],
          ingredientsEn: [
            "Mixed herbs",
            "Meat",
            "Red beans",
            "Dried lime",
            "Rice",
          ],
          calories: 520,
          imageUrl: "/api/placeholder/300/200",
          category: "lunch",
          isVegetarian: false,
          isPopular: true,
          isAvailable: true,
          prepTime: 30,
          tags: ["سنتی", "سبزیجات"],
          isOnSale: true,
          isLimitedTime: false,
          availableQuantity: 60,
          emergencyFee: 8000,
          nutritionalInfo: { protein: 25, carbs: 45, fat: 18, fiber: 12 },
        },
        {
          id: "food_l003",
          name: "زرشک پلو با مرغ",
          nameEn: "Barberry Rice with Chicken",
          description: "برنج زرشک با مرغ زعفرانی",
          descriptionEn: "Barberry rice with saffron chicken",
          price: 44000,
          ingredients: ["برنج", "مرغ", "زرشک", "زعفران", "پسته", "بادام"],
          ingredientsEn: [
            "Rice",
            "Chicken",
            "Barberries",
            "Saffron",
            "Pistachios",
            "Almonds",
          ],
          calories: 580,
          imageUrl: "/api/placeholder/300/200",
          category: "lunch",
          isVegetarian: false,
          isPopular: true,
          isAvailable: true,
          prepTime: 35,
          tags: ["مخصوص", "زعفرانی"],
          nutritionalInfo: { protein: 32, carbs: 58, fat: 15, fiber: 4 },
        },
        {
          id: "food_l004",
          name: "قیمه",
          nameEn: "Gheimeh",
          description: "خورشت قیمه با سیب زمینی",
          descriptionEn: "Split pea stew with potatoes",
          price: 38000,
          ingredients: ["لپه", "گوشت", "سیب زمینی", "پیاز", "زردچوبه", "برنج"],
          ingredientsEn: [
            "Split peas",
            "Meat",
            "Potato",
            "Onion",
            "Turmeric",
            "Rice",
          ],
          calories: 480,
          imageUrl: "/api/placeholder/300/200",
          category: "lunch",
          isVegetarian: false,
          isPopular: false,
          isAvailable: true,
          prepTime: 28,
          tags: ["سنتی", "مقوی"],
          nutritionalInfo: { protein: 22, carbs: 52, fat: 16, fiber: 8 },
        },
        {
          id: "food_l005",
          name: "فسنجان",
          nameEn: "Fesenjan",
          description: "خورشت فسنجان با مرغ",
          descriptionEn: "Pomegranate walnut stew with chicken",
          price: 50000,
          ingredients: ["مرغ", "گردو", "رب انار", "ادویه", "برنج"],
          ingredientsEn: [
            "Chicken",
            "Walnuts",
            "Pomegranate paste",
            "Spices",
            "Rice",
          ],
          calories: 620,
          imageUrl: "/api/placeholder/300/200",
          category: "lunch",
          isVegetarian: false,
          isPopular: true,
          isAvailable: true,
          prepTime: 40,
          tags: ["مخصوص", "شمالی"],
          nutritionalInfo: { protein: 28, carbs: 45, fat: 32, fiber: 6 },
        },
        {
          id: "food_l006",
          name: "کباب برگ",
          nameEn: "Barg Kebab",
          description: "کباب برگ با برنج زعفرانی",
          descriptionEn: "Lamb fillet kebab with saffron rice",
          price: 65000,
          ingredients: ["گوشت بره", "زعفران", "برنج", "پیاز", "گوجه"],
          ingredientsEn: ["Lamb fillet", "Saffron", "Rice", "Onion", "Tomato"],
          calories: 720,
          imageUrl: "/api/placeholder/300/200",
          category: "lunch",
          isVegetarian: false,
          isPopular: true,
          isAvailable: true,
          prepTime: 30,
          tags: ["لوکس", "کباب"],
          nutritionalInfo: { protein: 35, carbs: 55, fat: 28, fiber: 3 },
        },
        {
          id: "food_l007",
          name: "خوراک لوبیا",
          nameEn: "Bean Stew",
          description: "خوراک لوبیا چیتی با برنج",
          descriptionEn: "Pinto bean stew with rice",
          price: 35000,
          ingredients: [
            "لوبیا چیتی",
            "گوشت",
            "پیاز",
            "رب گوجه",
            "ادویه",
            "برنج",
          ],
          ingredientsEn: [
            "Pinto beans",
            "Meat",
            "Onion",
            "Tomato paste",
            "Spices",
            "Rice",
          ],
          calories: 450,
          imageUrl: "/api/placeholder/300/200",
          category: "lunch",
          isVegetarian: false,
          isPopular: false,
          isAvailable: true,
          prepTime: 25,
          tags: ["مقوی", "اقتصادی"],
          nutritionalInfo: { protein: 20, carbs: 55, fat: 12, fiber: 15 },
        },

        // Dinner Options
        {
          id: "food_d001",
          name: "سوپ جو",
          nameEn: "Barley Soup",
          description: "سوپ جو با سبزیجات",
          descriptionEn: "Barley soup with vegetables",
          price: 18000,
          ingredients: ["جو", "هویج", "سیب زمینی", "پیاز", "سبزی خوردن"],
          ingredientsEn: ["Barley", "Carrot", "Potato", "Onion", "Fresh herbs"],
          calories: 180,
          imageUrl: "/api/placeholder/300/200",
          category: "dinner",
          isVegetarian: true,
          isPopular: false,
          isAvailable: true,
          prepTime: 15,
          tags: ["سبک", "سالم"],
          nutritionalInfo: { protein: 6, carbs: 35, fat: 2, fiber: 8 },
        },
        {
          id: "food_d002",
          name: "کوکو سبزی",
          nameEn: "Herb Frittata (Kuku)",
          description: "کوکو سبزی با ماست",
          descriptionEn: "Persian herb frittata with yogurt",
          price: 25000,
          ingredients: ["تخم مرغ", "سبزی خوردن", "گردو", "نان", "ماست"],
          ingredientsEn: ["Eggs", "Fresh herbs", "Walnuts", "Bread", "Yogurt"],
          calories: 290,
          imageUrl: "/api/placeholder/300/200",
          category: "dinner",
          isVegetarian: true,
          isPopular: true,
          isAvailable: true,
          prepTime: 20,
          tags: ["گیاهی", "سنتی"],
          nutritionalInfo: { protein: 15, carbs: 18, fat: 18, fiber: 6 },
        },
        {
          id: "food_d003",
          name: "سالاد شیرازی",
          nameEn: "Shirazi Salad",
          description: "سالاد شیرازی با نان",
          descriptionEn: "Shirazi salad with bread",
          price: 15000,
          ingredients: ["گوجه", "خیار", "پیاز", "لیمو", "نعنا", "نان"],
          ingredientsEn: [
            "Tomato",
            "Cucumber",
            "Onion",
            "Lemon",
            "Mint",
            "Bread",
          ],
          calories: 120,
          imageUrl: "/api/placeholder/300/200",
          category: "dinner",
          isVegetarian: true,
          isPopular: true,
          isAvailable: true,
          prepTime: 10,
          tags: ["سبک", "تابستانی"],
          nutritionalInfo: { protein: 3, carbs: 22, fat: 1, fiber: 4 },
        },
        {
          id: "food_d004",
          name: "آش رشته",
          nameEn: "Ash Reshteh",
          description: "آش رشته با کشک",
          descriptionEn: "Persian noodle soup with whey",
          price: 28000,
          ingredients: ["رشته", "لوبیا", "نخود", "سبزی", "کشک"],
          ingredientsEn: ["Noodles", "Beans", "Chickpeas", "Herbs", "Whey"],
          calories: 320,
          imageUrl: "/api/placeholder/300/200",
          category: "dinner",
          isVegetarian: true,
          isPopular: true,
          isAvailable: true,
          prepTime: 25,
          tags: ["سنتی", "مقوی"],
          nutritionalInfo: { protein: 12, carbs: 45, fat: 8, fiber: 10 },
        },
        {
          id: "food_d005",
          name: "ماکارونی",
          nameEn: "Pasta",
          description: "ماکارونی با سس گوجه",
          descriptionEn: "Pasta with tomato sauce",
          price: 22000,
          ingredients: ["ماکارونی", "سس گوجه", "پنیر", "ریحان"],
          ingredientsEn: ["Pasta", "Tomato sauce", "Cheese", "Basil"],
          calories: 380,
          imageUrl: "/api/placeholder/300/200",
          category: "dinner",
          isVegetarian: true,
          isPopular: false,
          isAvailable: true,
          prepTime: 15,
          tags: ["سریع", "بین‌المللی"],
          nutritionalInfo: { protein: 14, carbs: 58, fat: 12, fiber: 5 },
        },
        {
          id: "food_d006",
          name: "سوپ مرغ",
          nameEn: "Chicken Soup",
          description: "سوپ مرغ با سبزیجات",
          descriptionEn: "Chicken soup with vegetables",
          price: 32000,
          ingredients: ["مرغ", "هویج", "سلری", "پیاز", "رشته"],
          ingredientsEn: ["Chicken", "Carrot", "Celery", "Onion", "Noodles"],
          calories: 250,
          imageUrl: "/api/placeholder/300/200",
          category: "dinner",
          isVegetarian: false,
          isPopular: false,
          isAvailable: true,
          prepTime: 20,
          tags: ["مقوی", "سالم"],
          nutritionalInfo: { protein: 18, carbs: 25, fat: 8, fiber: 3 },
        },
      ];

      localStorage.setItem("foods", JSON.stringify(defaultFoods));
    }

    this.foods = this.getAllFoods();
    this.restaurants = this.getAllRestaurants();
  }

  // CRUD Operations for Foods
  getAllFoods(): FoodItem[] {
    try {
      const foods = localStorage.getItem("foods");
      return foods ? JSON.parse(foods) : [];
    } catch (error) {
      console.error("Error reading foods:", error);
      return [];
    }
  }

  getFoodById(id: string): FoodItem | null {
    const foods = this.getAllFoods();
    return foods.find((food) => food.id === id) || null;
  }

  getFoodsByCategory(category: "breakfast" | "lunch" | "dinner"): FoodItem[] {
    return this.getAllFoods().filter((food) => food.category === category);
  }

  getAvailableFoodsByCategory(
    category: "breakfast" | "lunch" | "dinner"
  ): FoodItem[] {
    return this.getFoodsByCategory(category).filter((food) => food.isAvailable);
  }

  saveFoods(foods: FoodItem[]): void {
    try {
      localStorage.setItem("foods", JSON.stringify(foods));
      this.foods = foods;
    } catch (error) {
      console.error("Error saving foods:", error);
    }
  }

  // CRUD Operations for Restaurants
  getAllRestaurants(): Restaurant[] {
    try {
      const restaurants = localStorage.getItem("restaurants");
      return restaurants ? JSON.parse(restaurants) : [];
    } catch (error) {
      console.error("Error reading restaurants:", error);
      return [];
    }
  }

  getRestaurantById(id: string): Restaurant | null {
    const restaurants = this.getAllRestaurants();
    return restaurants.find((restaurant) => restaurant.id === id) || null;
  }

  getActiveRestaurants(): Restaurant[] {
    return this.getAllRestaurants().filter((restaurant) => restaurant.isActive);
  }

  saveRestaurants(restaurants: Restaurant[]): void {
    try {
      localStorage.setItem("restaurants", JSON.stringify(restaurants));
      this.restaurants = restaurants;
    } catch (error) {
      console.error("Error saving restaurants:", error);
    }
  }

  // CRUD Operations for Reservations
  getAllReservations(userId: string): MealReservation[] {
    try {
      const reservations = localStorage.getItem(`reservations_${userId}`);
      return reservations ? JSON.parse(reservations) : [];
    } catch (error) {
      console.error("Error reading reservations:", error);
      return [];
    }
  }

  getReservationById(
    userId: string,
    reservationId: string
  ): MealReservation | null {
    const reservations = this.getAllReservations(userId);
    return (
      reservations.find((reservation) => reservation.id === reservationId) ||
      null
    );
  }

  saveReservation(reservation: MealReservation): void {
    try {
      const reservations = this.getAllReservations(reservation.userId);
      const existingIndex = reservations.findIndex(
        (r) => r.id === reservation.id
      );

      if (existingIndex >= 0) {
        reservations[existingIndex] = reservation;
      } else {
        reservations.push(reservation);
      }

      localStorage.setItem(
        `reservations_${reservation.userId}`,
        JSON.stringify(reservations)
      );
    } catch (error) {
      console.error("Error saving reservation:", error);
    }
  }

  deleteReservation(userId: string, reservationId: string): void {
    try {
      const reservations = this.getAllReservations(userId);
      const filteredReservations = reservations.filter(
        (r) => r.id !== reservationId
      );
      localStorage.setItem(
        `reservations_${userId}`,
        JSON.stringify(filteredReservations)
      );
    } catch (error) {
      console.error("Error deleting reservation:", error);
    }
  }

  // Weekly Plan Operations
  getWeeklyPlan(userId: string, weekStart: string): WeeklyMealPlan | null {
    try {
      const plan = localStorage.getItem(`weekly_plan_${userId}_${weekStart}`);
      return plan ? JSON.parse(plan) : null;
    } catch (error) {
      console.error("Error reading weekly plan:", error);
      return null;
    }
  }

  saveWeeklyPlan(plan: WeeklyMealPlan): void {
    try {
      localStorage.setItem(
        `weekly_plan_${plan.userId}_${plan.weekStart}`,
        JSON.stringify(plan)
      );
    } catch (error) {
      console.error("Error saving weekly plan:", error);
    }
  }

  // Transaction Operations
  getAllTransactions(userId: string): Transaction[] {
    try {
      const transactions = localStorage.getItem(`transactions_${userId}`);
      return transactions ? JSON.parse(transactions) : [];
    } catch (error) {
      console.error("Error reading transactions:", error);
      return [];
    }
  }

  saveTransaction(transaction: Transaction): void {
    try {
      const transactions = this.getAllTransactions(transaction.userId);
      transactions.unshift(transaction); // Add to beginning for latest first
      localStorage.setItem(
        `transactions_${transaction.userId}`,
        JSON.stringify(transactions)
      );
    } catch (error) {
      console.error("Error saving transaction:", error);
    }
  }

  // User Balance Operations
  getUserBalance(userId: string): number {
    try {
      const balance = localStorage.getItem(`balance_${userId}`);
      return balance ? parseFloat(balance) : 0;
    } catch (error) {
      console.error("Error reading user balance:", error);
      return 0;
    }
  }

  updateUserBalance(userId: string, newBalance: number): void {
    try {
      localStorage.setItem(`balance_${userId}`, newBalance.toString());
    } catch (error) {
      console.error("Error updating user balance:", error);
    }
  }

  // Utility Functions
  generateFaramushiCode(): string {
    return Math.floor(10000 + Math.random() * 90000).toString();
  }

  generateId(prefix: string = "id"): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Start from Monday
    return new Date(d.setDate(diff));
  }

  // Discount Code Validation
  validateDiscountCode(code: string): number {
    const discountCodes: Record<string, number> = {
      STUDENT10: 10,
      WELCOME20: 20,
      SAVE15: 15,
      FIRST25: 25,
      EMERGENCY10: 10,
      TODAY15: 15,
      QUICK20: 20,
      STUDENT25: 25,
    };

    return discountCodes[code] || 0;
  }

  // Data synchronization and cleanup
  cleanupOldData(): void {
    try {
      // Remove old weekly plans (older than 4 weeks)
      const fourWeeksAgo = new Date();
      fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("weekly_plan_")) {
          const parts = key.split("_");
          if (parts.length >= 4) {
            const weekStart = new Date(parts[3]);
            if (weekStart < fourWeeksAgo) {
              localStorage.removeItem(key);
            }
          }
        }
      });
    } catch (error) {
      console.error("Error cleaning up old data:", error);
    }
  }

  // Get comprehensive meal data for a specific day and meal type
  getMealOptions(
    date: string,
    mealType: "breakfast" | "lunch" | "dinner"
  ): {
    foods: FoodItem[];
    restaurants: Restaurant[];
  } {
    const availableFoods = this.getAvailableFoodsByCategory(mealType);
    const activeRestaurants = this.getActiveRestaurants();

    return {
      foods: availableFoods,
      restaurants: activeRestaurants,
    };
  }

  // Check if a restaurant is open for a specific meal
  isRestaurantOpen(
    restaurantId: string,
    mealType: "breakfast" | "lunch" | "dinner",
    currentTime?: string
  ): boolean {
    const restaurant = this.getRestaurantById(restaurantId);
    if (!restaurant || !restaurant.isActive) return false;

    // If no current time provided, assume it's open
    if (!currentTime) return true;

    const hours = restaurant.operatingHours[mealType];
    return currentTime >= hours.start && currentTime <= hours.end;
  }
}

export default DataService;
