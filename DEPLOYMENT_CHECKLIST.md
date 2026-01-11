# Production Deployment Checklist

## ✅ Fixed Issues

### 1. Password Reset Redirect Fixed ✅
- **File:** `src/api/http.ts`
- **Fix:** Added `/reset-password` to paths that don't trigger 401 redirect
- **Status:** Ready for deployment

## 🔧 Required Configuration

### Frontend (Vercel)

1. **Environment Variables**
   Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   
   Add/Verify these variables:
   ```
   VITE_API_BASE_URL=https://your-backend-domain.com
   VITE_GOOGLE_CLIENT_ID=657065188070-80edljn8ugu9uinsbp1sd6e93a55f5bg.apps.googleusercontent.com
   ```
   
   ⚠️ **Important:** After adding/updating environment variables, you MUST redeploy!

2. **Redeploy After Environment Variable Changes**
   - Go to Deployments tab
   - Click "Redeploy" on the latest deployment
   - Or push a new commit to trigger deployment

### Backend

1. **appsettings.json Configuration**
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

2. **CORS Configuration in Program.cs**
   Ensure backend allows requests from frontend origin

### Google Cloud Console

1. **Add Authorized Origins**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - APIs & Services → Credentials
   - Click on your OAuth 2.0 Client ID
   - Under **Authorized JavaScript origins**, click "+ ADD URI"
   - Add: `https://genzcoders.vercel.app`
   - Add: `http://localhost:3039` (for local dev)
   - Add: `http://localhost:5173` (for Vite dev)
   - Click **SAVE**
   - ⚠️ **Wait 5-10 minutes** for changes to propagate

2. **Verify Client ID**
   - Ensure Client ID matches: `657065188070-80edljn8ugu9uinsbp1sd6e93a55f5bg.apps.googleusercontent.com`
   - This must match the `VITE_GOOGLE_CLIENT_ID` in Vercel

## 🧪 Testing After Deployment

### 1. Test Password Reset
1. Go to `/forgot-password`
2. Enter your email
3. Check email for reset link
4. Click link - should go to `/reset-password?token=XXX&email=XXX`
5. Enter new password
6. Should successfully reset and redirect to sign-in

### 2. Test Google OAuth
1. Go to `/sign-in`
2. Click "Continue with Google"
3. Should open Google sign-in popup
4. Select account
5. Should redirect to dashboard

**If Google OAuth fails:**
- Check browser console for errors
- Verify `VITE_GOOGLE_CLIENT_ID` is set in Vercel
- Verify origin is added in Google Cloud Console
- Wait 10 minutes after adding origin (propagation delay)
- Redeploy frontend after adding environment variable

### 3. Test Admin Dashboard
1. Log in as admin user
2. Navigate to `/dashboard` or `/admin/dashboard`
3. Should load admin dashboard
4. Test admin endpoints:
   - `/admin/users`
   - `/admin/courses`
   - `/admin/applications`

**If admin pages fail:**
- Check if user has Admin role in database
- Check browser console for 401/403 errors
- Verify backend `AdminController` has `[Authorize]` attribute
- Check backend logs for authorization errors

### 4. Test Profile Page
1. Log in as any user
2. Navigate to `/profile`
3. Should load profile page
4. Test updating profile

**If profile page fails:**
- Check if user is authenticated (check localStorage for token)
- Verify `/api/profile` endpoint exists in backend
- Check browser console for errors

## 🐛 Troubleshooting

### Issue: Password Reset Redirects to Sign-In
**Status:** ✅ Fixed in code
**Action:** Deploy latest code changes

### Issue: Google OAuth Not Working
**Possible Causes:**
1. Environment variable not set in Vercel
   - **Fix:** Add `VITE_GOOGLE_CLIENT_ID` to Vercel environment variables
   - **Action:** Redeploy after adding

2. Origin not added to Google Cloud Console
   - **Fix:** Add `https://genzcoders.vercel.app` to authorized origins
   - **Action:** Wait 10 minutes, then test again

3. Client ID mismatch
   - **Fix:** Verify Client ID in Vercel matches Google Cloud Console
   - **Action:** Update if different, then redeploy

### Issue: Admin/Profile Pages Not Working
**Possible Causes:**
1. User not authenticated
   - **Fix:** Ensure user is logged in
   - **Action:** Check localStorage for `accessToken`

2. Backend API URL incorrect
   - **Fix:** Verify `VITE_API_BASE_URL` in Vercel
   - **Action:** Update if wrong, then redeploy

3. CORS not configured
   - **Fix:** Add frontend domain to backend CORS
   - **Action:** Update backend `Program.cs` and redeploy

4. Authorization issues
   - **Fix:** Check user role in database
   - **Action:** Verify user has correct role (Admin for admin pages)

## 📝 Deployment Steps

1. **Update Backend Configuration**
   - Update `appsettings.json` with frontend URL
   - Configure CORS
   - Deploy backend

2. **Update Frontend Environment Variables in Vercel**
   - Add/update `VITE_API_BASE_URL`
   - Add/update `VITE_GOOGLE_CLIENT_ID`
   - Save and redeploy

3. **Update Google Cloud Console**
   - Add production domain to authorized origins
   - Wait 10 minutes for propagation

4. **Deploy Frontend**
   - Push code changes (if any)
   - Or manually redeploy in Vercel

5. **Test All Features**
   - Test password reset
   - Test Google OAuth
   - Test admin dashboard
   - Test profile page

## ⚠️ Important Notes

1. **Environment Variables:** Must be set in Vercel, not just in `.env` file
2. **Redeploy Required:** After adding/changing environment variables, you MUST redeploy
3. **Google Console:** Changes take 5-10 minutes to propagate
4. **Backend URL:** Must use HTTPS in production (not `http://localhost:5166`)
5. **CORS:** Backend must allow requests from frontend domain

## 🆘 Need Help?

If issues persist:
1. Check browser console for errors
2. Check Vercel deployment logs
3. Check backend logs
4. Verify all environment variables are set
5. Verify Google Cloud Console configuration
6. Test API endpoints directly (using Postman/curl)
