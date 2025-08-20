export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  createdAt: string;
  language: "en" | "fa";
}

// Get all users from localStorage
export const getAllUsers = (): User[] => {
  try {
    const users = localStorage.getItem("users");
    return users ? JSON.parse(users) : [];
  } catch (error) {
    console.error("Error reading users from localStorage:", error);
    return [];
  }
};

// Get user by username
export const getUserByUsername = (username: string): User | null => {
  const users = getAllUsers();
  return users.find((user) => user.username === username) || null;
};

// Get user by email
export const getUserByEmail = (email: string): User | null => {
  const users = getAllUsers();
  return users.find((user) => user.email === email) || null;
};

// Check if username exists
export const isUsernameTaken = (username: string): boolean => {
  return getUserByUsername(username) !== null;
};

// Check if email exists
export const isEmailTaken = (email: string): boolean => {
  return getUserByEmail(email) !== null;
};

// Clear all users (for testing)
export const clearAllUsers = (): void => {
  localStorage.removeItem("users");
};

// Get users count
export const getUsersCount = (): number => {
  return getAllUsers().length;
};

// Authentication functions
export const authenticateUser = (
  username: string,
  password: string
): User | null => {
  const users = getAllUsers();
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  return user || null;
};

// Set current user in localStorage
export const setCurrentUser = (user: User): void => {
  localStorage.setItem("currentUser", JSON.stringify(user));
};

// Get current user from localStorage
export const getCurrentUser = (): User | null => {
  try {
    const user = localStorage.getItem("currentUser");
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Error reading current user from localStorage:", error);
    return null;
  }
};

// Logout user
export const logoutUser = (): void => {
  localStorage.removeItem("currentUser");
};

// Check if user is logged in
export const isUserLoggedIn = (): boolean => {
  return getCurrentUser() !== null;
};
