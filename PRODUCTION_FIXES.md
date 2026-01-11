# Production Fixes Guide

## 🔧 Issues Fixed

### 1. Password Reset Redirect Issue ✅

**Problem:** Reset password link redirected to sign-in page immediately.

**Fix:** Updated HTTP interceptor to exclude `/reset-password` from 401 redirects.

**File:** `src/api/http.ts`
- Added `/reset-password` to the list of paths that shouldn't trigger redirect on 401
- Now allows reset password page to work without authentication

### 2. Google OAuth Not Working ⚠️

**Problem:** Google OAuth button not working in production.

**Possible Causes:**
1. **Missing Environment Variable in Vercel**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `VITE_GOOGLE_CLIENT_ID` = `657065188070-80edljn8ugu9uinsbp1sd6e93a55f5bg.apps.googleusercontent.com`

2. **Google Cloud Console Configuration**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - APIs & Services → Credentials
   - Edit your OAuth 2.0 Client ID
   - Under **Authorized JavaScript origins**, add:
     - `https://genzcoders.vercel.app`
     - `http://localhost:3039` (for local dev)
     - `http://localhost:5173` (for Vite dev)
   - Save changes (takes a few minutes to propagate)

3. **Client ID Mismatch**
   - Verify the Client ID in Vercel matches the one in Google Cloud Console
   - The Client ID must be the same in both places

### 3. Admin Endpoints Not Working

**Problem:** Admin dashboard and endpoints not accessible.

**Check:**
1. **Authentication Token**
   - Ensure you're logged in as an admin user
   - Check browser console for 401/403 errors
   - Verify token is stored in localStorage

2. **Backend Authorization**
   - Verify backend `AdminController` endpoints have `[Authorize]` attribute
   - Check if role-based policies are configured correctly
   - Verify user has Admin role in database

3. **API Base URL**
   - Check `VITE_API_BASE_URL` in Vercel environment variables
   - Should point to your backend URL (e.g., `https://your-backend.azurewebsites.net`)
   - Not `http://localhost:5166` (that's for local dev only)

4. **CORS Configuration**
   - Backend must allow requests from `https://genzcoders.vercel.app`
   - Check backend `Program.cs` CORS configuration

### 4. Profile Pages Not Working

**Problem:** Profile page not loading or showing errors.

**Check:**
1. **Authentication**
   - User must be logged in
   - Token must be valid
   - Check browser console for errors

2. **API Endpoints**
   - Verify `/api/profile` endpoint exists in backend
   - Check if endpoint requires authentication
   - Verify CORS allows the request

3. **Route Configuration**
   - Profile route is configured at `/profile` in `routes/sections.tsx`
   - Should be protected by `AuthGuard`

## 📋 Deployment Checklist

### Frontend (Vercel)

- [ ] `VITE_API_BASE_URL` set to production backend URL
- [ ] `VITE_GOOGLE_CLIENT_ID` set to Google Client ID
- [ ] Google Client ID added to Google Cloud Console authorized origins
- [ ] Environment variables saved and deployment triggered

### Backend

- [ ] `Frontend:BaseUrl` in `appsettings.json` set to `https://genzcoders.vercel.app`
- [ ] CORS configured to allow `https://genzcoders.vercel.app`
- [ ] Admin endpoints protected with `[Authorize]` attribute
- [ ] Profile endpoints protected with `[Authorize]` attribute
- [ ] Database connection string configured for production
- [ ] Email SMTP configured for production

## 🔍 Debugging Steps

### 1. Check Browser Console
- Open browser DevTools (F12)
- Check Console tab for errors
- Check Network tab for failed API requests
- Look for 401 (Unauthorized) or 403 (Forbidden) errors

### 2. Check Environment Variables
```bash
# In browser console:
console.log(import.meta.env.VITE_API_BASE_URL);
console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID);
```

### 3. Check Authentication Token
```javascript
// In browser console:
console.log(localStorage.getItem('accessToken'));
console.log(localStorage.getItem('user'));
```

### 4. Test API Endpoints
- Use browser DevTools Network tab
- Check if API requests are going to correct URL
- Verify Authorization header is being sent
- Check response status codes

## 🚨 Common Errors

### "The given origin is not allowed for the given client ID"
- **Fix:** Add production domain to Google Cloud Console authorized origins
- Wait 5-10 minutes for changes to propagate

### 401 Unauthorized on API calls
- **Fix:** Check if user is logged in
- Verify token is stored in localStorage
- Check if token has expired
- Verify backend is running and accessible

### CORS errors
- **Fix:** Add frontend domain to backend CORS configuration
- Verify backend `Program.cs` allows the origin
- Check if credentials are allowed

### Profile/Admin pages redirect to sign-in
- **Fix:** Check if user is authenticated
- Verify token is valid
- Check AuthGuard configuration
- Verify routes are protected correctly

## 📝 Next Steps

1. **Verify Environment Variables in Vercel**
   - Settings → Environment Variables
   - Add/update required variables
   - Redeploy after changes

2. **Update Google Cloud Console**
   - Add production domain to authorized origins
   - Wait for propagation

3. **Test All Features**
   - Sign in/up
   - Password reset
   - Google OAuth
   - Profile page
   - Admin dashboard (if admin user)

4. **Check Backend Logs**
   - Monitor backend logs for errors
   - Check database connection
   - Verify email service configuration
