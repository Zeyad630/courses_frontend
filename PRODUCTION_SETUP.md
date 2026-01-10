# Production Setup Guide

## 🔧 Configuration for Production

### 1. Google OAuth Configuration

The error `"The given origin is not allowed for the given client ID"` means you need to add your production domain to Google Cloud Console.

#### Steps:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized JavaScript origins**, add:
   - `https://genzcoders.vercel.app`
   - `http://localhost:3039` (for local development)
   - `http://localhost:5173` (for Vite dev server)
5. Under **Authorized redirect URIs** (if needed), add your backend URL:
   - `https://your-backend-domain.com/api/auth/google-signin`
6. Save the changes

### 2. Environment Variables

#### Frontend (`.env` or Vercel Environment Variables):
```env
VITE_API_BASE_URL=https://your-backend-domain.com
VITE_GOOGLE_CLIENT_ID=657065188070-80edljn8ugu9uinsbp1sd6e93a55f5bg.apps.googleusercontent.com
```

#### Backend (`appsettings.json` or Azure App Settings):
```json
{
  "Frontend": {
    "BaseUrl": "https://genzcoders.vercel.app",
    "BaseUrlHttps": "https://genzcoders.vercel.app"
  },
  "Cors": {
    "AllowedOrigins": [
      "https://genzcoders.vercel.app",
      "http://localhost:3039",
      "http://localhost:5173"
    ]
  }
}
```

### 3. Password Reset Flow

✅ **Fixed!** The password reset link now points to the frontend:
- Frontend URL: `https://genzcoders.vercel.app/reset-password?token=XXX&email=XXX`
- The frontend page will extract the token and email from URL params
- User enters new password on the frontend
- Frontend calls backend API to reset the password

### 4. Backend CORS Configuration

Make sure your backend allows requests from the frontend origin:

```csharp
// In Program.cs
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(
            "https://genzcoders.vercel.app",
            "http://localhost:3039",
            "http://localhost:5173"
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});
```

### 5. API Base URL

Update your frontend API base URL in production:
- Development: `http://localhost:5166`
- Production: `https://your-backend-domain.com`

## 🐛 Fixed Issues

1. ✅ **Password Reset Links** - Now use frontend URL instead of backend URL
2. ✅ **Reset Password Page** - Created frontend page to handle password reset
3. ✅ **ESLint Errors** - Fixed all import ordering and regex escape issues
4. ⚠️ **Google OAuth** - Requires adding production domain to Google Cloud Console

## 📝 Testing Checklist

- [ ] Google OAuth works in production (after adding origin to Google Console)
- [ ] Password reset email contains frontend URL
- [ ] Reset password page loads with token from email
- [ ] Password reset completes successfully
- [ ] CORS allows requests from frontend
- [ ] API base URL is correct in production

## 🚀 Deployment Steps

1. **Backend:**
   - Update `appsettings.json` with production frontend URL
   - Update CORS settings
   - Deploy to your hosting (Azure, AWS, etc.)

2. **Frontend:**
   - Set environment variables in Vercel
   - Update Google OAuth Client ID in Google Console
   - Deploy to Vercel

3. **Verify:**
   - Test authentication flows
   - Test password reset flow
   - Test Google OAuth
   - Check CORS errors in browser console
