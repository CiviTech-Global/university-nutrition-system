# Registration Page

This is a modern, bilingual registration form for the University Nutrition System.

## Features

### ✅ Form Validation

- **Required Fields**: All fields are mandatory
- **Email Validation**: Proper email format validation
- **Username Validation**: Minimum 3 characters
- **Password Validation**: Minimum 6 characters
- **Password Confirmation**: Must match the password
- **Duplicate Check**: Username and email uniqueness validation

### 🌐 Bilingual Support

- **Persian (فارسی)** - Default language
- **Persian (فارسی)** - Complete RTL support with Vazir font
- **Language Toggle**: Easy switching between languages
- **Translated Validation**: All error messages in both languages

### 💾 Data Storage

- **localStorage**: User data is stored in browser's localStorage
- **User Object Structure**:
  ```typescript
  {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
    createdAt: string;
    language: "en" | "fa";
  }
  ```

### 🎨 UI/UX Features

- **Modern Design**: Material-UI components with clean styling
- **Loading States**: Submit button shows loading spinner
- **Success/Error Messages**: Clear feedback for user actions
- **Password Visibility**: Toggle to show/hide passwords
- **Form Reset**: Automatically clears form after successful registration
- **Responsive Design**: Works on all screen sizes

## Usage

### Registration Process

1. Fill in all required fields
2. Validation happens in real-time
3. Submit button is disabled during processing
4. Success message appears on successful registration
5. Form resets automatically
6. User data is stored in localStorage

### Testing

You can test the registration by:

1. Creating multiple accounts
2. Trying to use duplicate usernames/emails
3. Switching languages during the process
4. Checking localStorage for stored data

### Utility Functions

The page uses utility functions from `../../utils/userUtils.ts`:

- `isUsernameTaken()` - Check for duplicate usernames
- `isEmailTaken()` - Check for duplicate emails
- `getAllUsers()` - Get all registered users
- `clearAllUsers()` - Clear all data (for testing)

## Security Notes

⚠️ **Important**: This is a frontend-only implementation for demonstration purposes. In a production environment:

- Passwords should be hashed before storage
- Data should be stored in a secure backend database
- API endpoints should be used instead of localStorage
- Proper authentication and authorization should be implemented
- HTTPS should be used for all communications

## File Structure

```
Register/
├── index.tsx          # Main registration component
└── README.md          # This documentation
```
