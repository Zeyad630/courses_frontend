# Authentication Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd "D:\cap project\All\courses_frontend"
npm install
# or
yarn install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:5166

# Google OAuth Client ID (required for Google sign-in)
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
```

### 3. Get Google OAuth Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project or select existing
3. Enable **Google Identity Services API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen:
   - Application type: Web application
   - Authorized JavaScript origins:
     - `http://localhost:5173` (Vite default)
     - `http://localhost:3000` (if using different port)
     - Your production domain
   - Authorized redirect URIs:
     - `http://localhost:5173` (for development)
     - Your production URL
6. Copy the **Client ID** and paste it in your `.env` file

### 4. Start Development Server
```bash
npm run dev
# or
yarn dev
```

The app will be available at `http://localhost:5173` (or the port shown in terminal)

## ✅ Features Implemented

### Authentication
- ✅ Email/Password Login
- ✅ Google OAuth Sign-In
- ✅ Email/OTP Registration (Students Only)
- ✅ Forgot Password
- ✅ Password Reset
- ✅ Password Strength Indicator
- ✅ Profile Management

### Security
- ✅ Secure token storage
- ✅ Automatic token injection
- ✅ CSRF protection support
- ✅ Rate limiting awareness
- ✅ Account lockout handling
- ✅ Auto-redirect on unauthorized

### UI/UX
- ✅ Modern Material-UI design
- ✅ Smooth animations
- ✅ Responsive layout
- ✅ Loading states
- ✅ Error handling
- ✅ Real-time validation

## 📝 User Flows

### Student Registration (Frontend Only)
1. Go to `/sign-up`
2. Fill registration form:
   - Full Name (English)
   - Full Name (Arabic)
   - National ID
   - Phone
   - Email
   - Password (with strength indicator)
   - Confirm Password
3. Click "Send OTP"
4. Enter 6-digit OTP received via email
5. Click "Verify & Create Account"
6. Automatically logged in and redirected to dashboard

### Google Sign-In
1. Go to `/sign-in`
2. Click "Continue with Google"
3. Select Google account
4. Automatically logged in and redirected to dashboard

### Email/Password Login
1. Go to `/sign-in`
2. Enter email and password
3. Optionally check "Remember me"
4. Click "Sign In"
5. Redirected to dashboard

### Forgot Password
1. Go to `/sign-in`
2. Click "Forgot Password"
3. Enter email
4. Click "Send Reset Link"
5. Check email for reset link
6. Click link and set new password

## 🔧 Configuration

### Backend Connection
Ensure your backend is running and accessible at the URL specified in `VITE_API_BASE_URL`.

### CORS Setup
Make sure your backend allows requests from your frontend origin:
- Development: `http://localhost:5173`
- Update `appsettings.json` in backend if needed

### Google OAuth
- Requires `VITE_GOOGLE_CLIENT_ID` in `.env`
- Backend must have Google OAuth configured
- See backend `AUTHENTICATION_SETUP.md` for backend configuration

## 🐛 Troubleshooting

### Google Sign-In Not Working
- Check that `VITE_GOOGLE_CLIENT_ID` is set in `.env`
- Verify Google Client ID is correct
- Ensure Google Identity Services script loads (check browser console)
- Check that backend has Google OAuth configured

### API Errors
- Verify backend is running
- Check `VITE_API_BASE_URL` is correct
- Ensure CORS is configured correctly
- Check browser console for detailed errors

### OTP Not Received
- Check spam folder
- Verify email address is correct
- Check backend email configuration
- In development, check backend logs for OTP code

### Token Issues
- Clear localStorage and try again
- Check token expiration
- Verify backend JWT configuration
- Check browser console for errors

## 📚 Documentation

For more details, see:
- `FRONTEND_IMPLEMENTATION.md` - Detailed implementation guide
- Backend `API_ENDPOINTS.md` - Complete API documentation
- Backend `AUTHENTICATION_SETUP.md` - Backend auth setup

## 🎯 Next Steps

1. Configure Google OAuth Client ID
2. Test all authentication flows
3. Verify backend connectivity
4. Test on mobile devices
5. Add Arabic translations if needed
