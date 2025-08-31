# Dual Language Implementation

This document describes the complete dual language (English/Persian) implementation across all pages of the University Nutrition System.

## 🌐 Supported Languages

- **Persian (فارسی)** - Default language
- **Persian (فارسی)** - Complete RTL support with Vazir font

## 📁 File Structure

```
locales/
├── en.ts              # English translations
├── fa.ts              # Persian translations
├── index.ts           # Main exports and types
└── README.md          # This documentation
```

## 🎯 Implementation Across Pages

### ✅ Register Page (`/register`)

- **Language Toggle**: EN/فارسی buttons in header
- **Form Fields**: All labels and placeholders translated
- **Validation Messages**: Complete error messages in both languages
- **Success/Error Messages**: All feedback translated
- **Navigation Links**: "Sign in here" link translated
- **RTL Support**: Full right-to-left layout for Persian

### ✅ Login Page (`/login`)

- **Language Toggle**: EN/فارسی buttons in header
- **Form Fields**: Username and password labels translated
- **Validation Messages**: Complete error messages in both languages
- **Success/Error Messages**: Login feedback translated
- **Navigation Links**: "Forgot Password?" and "Register here" translated
- **RTL Support**: Full right-to-left layout for Persian

### ✅ ForgotPassword Page (`/forgot-password`)

- **Language Toggle**: EN/فارسی buttons in header
- **Form Fields**: Email label and validation translated
- **Success/Error Messages**: Password reset feedback translated
- **Navigation**: "Back to Login" button translated
- **RTL Support**: Full right-to-left layout for Persian

### ✅ Dashboard Page (`/dashboard`)

- **Language Toggle**: EN/فارسی buttons in header
- **User Information**: All labels and content translated
- **Welcome Message**: Personalized greeting in both languages
- **Navigation**: Logout button translated
- **Content**: Dashboard content descriptions translated
- **RTL Support**: Full right-to-left layout for Persian

## 🔧 Technical Implementation

### Font Integration

- **Persian Font**: Vazir font family with multiple weights
- **CSS Variables**: `--font-persian` and `--font-english`
- **Automatic Switching**: Fonts change based on language selection

### RTL Support

- **Direction**: `direction: rtl` for Persian, `direction: ltr` for English
- **Layout**: All components automatically adjust for RTL
- **Text Alignment**: Proper alignment for both languages

### State Management

- **Language State**: Stored in component state
- **User Preference**: Language preference saved with user data
- **Persistence**: Language choice remembered across sessions

## 📝 Translation Keys

### Common Keys (All Pages)

- `title` - System title
- `email` - Email field label
- `username` - Username field label
- `password` - Password field label
- `emailRequired` - Email validation message
- `emailInvalid` - Email format validation
- `usernameRequired` - Username validation message
- `passwordRequired` - Password validation message

### Register Page Specific

- `subtitle` - "Create Your Account"
- `firstName`, `lastName` - Name field labels
- `confirmPassword` - Password confirmation label
- `createAccount` - Submit button text
- `alreadyHaveAccount`, `signInHere` - Navigation links
- `firstNameRequired`, `lastNameRequired` - Validation messages
- `usernameMinLength`, `passwordMinLength` - Length validation
- `confirmPasswordRequired`, `passwordsDoNotMatch` - Password validation
- `usernameTaken`, `emailRegistered` - Duplicate validation
- `accountCreated`, `creatingAccount` - Success messages
- `errorCreatingAccount` - Error messages

### Login Page Specific

- `loginTitle` - "Welcome Back"
- `loginSubtitle` - "Sign in to your account"
- `loginButton` - "Sign In" button
- `loggingIn` - Loading state text
- `forgotPassword` - "Forgot Password?" link
- `dontHaveAccount`, `registerHere` - Registration links
- `invalidCredentials` - Authentication error
- `loginSuccess`, `loginError` - Success/error messages

### ForgotPassword Page Specific

- `forgotPasswordTitle` - "Reset Your Password"
- `forgotPasswordSubtitle` - Instructions text
- `resetPasswordButton` - "Send Reset Link" button
- `sendingResetLink` - Loading state text
- `backToLogin` - Navigation button
- `emailSent` - Success message
- `emailNotFound` - Error for non-existent email
- `forgotPasswordError` - General error message

### Dashboard Page Specific

- `welcomeMessage` - "Welcome" greeting
- `userInformation` - "User Information" section title
- `memberSince` - "Member since" label
- `dashboardContent` - "Dashboard Content" title
- `dashboardDescription` - Dashboard description text
- `logout` - "Logout" button text

## 🎨 UI/UX Features

### Language Toggle

- **Position**: Top-right corner of all pages
- **Icons**: Language icon with EN/فارسی text
- **Style**: Material-UI ToggleButtonGroup
- **Functionality**: Instant language switching

### Typography

- **Font Family**: Automatic switching between Vazir and system fonts
- **Direction**: Automatic RTL/LTR switching
- **Size**: Consistent sizing across languages
- **Weight**: Proper font weights for both languages

### Form Elements

- **Labels**: All form labels translated
- **Placeholders**: Input placeholders translated
- **Validation**: Real-time validation messages
- **Error States**: Error styling with translated messages

### Navigation

- **Links**: All navigation links translated
- **Buttons**: All button text translated
- **Breadcrumbs**: Navigation breadcrumbs translated

## 🔄 Language Switching

### User Experience

1. **Instant Switch**: Language changes immediately
2. **State Preservation**: Form data preserved during switch
3. **Error Clearing**: Validation errors cleared on switch
4. **Layout Adjustment**: RTL/LTR layout adjusts automatically

### Technical Implementation

```typescript
const handleLanguageChange = (
  _event: React.MouseEvent<HTMLElement>,
  newLanguage: LanguageType | null
) => {
  if (newLanguage !== null) {
    setLanguage(newLanguage);
    setErrors({}); // Clear errors when language changes
  }
};
```

## 🚀 Adding New Languages

To add a new language:

1. **Create Translation File**: Add `newLang.ts` in locales directory
2. **Export Translations**: Export translation object
3. **Update Index**: Add to translations object in `index.ts`
4. **Update Types**: Add language type to `Language` union
5. **Add Font**: Include appropriate font for the language
6. **Test RTL**: If RTL language, test layout adjustments

## 📱 Responsive Design

- **Mobile**: Language toggle adapts to mobile screens
- **Tablet**: Proper spacing and sizing for tablets
- **Desktop**: Full desktop layout with language controls
- **Touch**: Touch-friendly language toggle buttons

## 🔒 Security Considerations

- **Input Validation**: All validation messages translated
- **Error Messages**: User-friendly error messages in both languages
- **Success Messages**: Clear success feedback in both languages
- **Accessibility**: Proper ARIA labels for screen readers

## 🎯 Best Practices

1. **Consistency**: Use same translation keys across pages
2. **Context**: Provide context for translators
3. **Length**: Consider text length differences between languages
4. **Testing**: Test with both languages thoroughly
5. **Maintenance**: Keep translations up to date with UI changes

## 📊 Current Status

✅ **Complete Implementation**

- All 4 pages fully translated
- RTL support implemented
- Font integration complete
- Language switching functional
- Responsive design working
- Error handling translated
- Navigation links translated
