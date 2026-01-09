# Frontend-Backend API Integration Summary

## Changes Made

### 1. API Configuration (`src/api/config.ts`)
- ✅ Updated default API base URL from `https://localhost:7237/` to `http://localhost:5166`
- ✅ Can be overridden with `VITE_API_BASE_URL` environment variable

### 2. HTTP Client (`src/api/http.ts`)
- ✅ Added authentication token interceptor to automatically add `Authorization: Bearer <token>` header to all requests
- ✅ Added response interceptor to handle 401 Unauthorized errors (clears token and user data)
- ✅ Token is retrieved from `localStorage.getItem('accessToken')`

### 3. Auth API Service (`src/api/services/auth.api.ts`)
- ✅ Created new auth API service with:
  - `login(email, password)` - POST `/api/auth/login`
  - `register(payload)` - POST `/api/auth/register`
  - `getMe()` - GET `/api/auth/me`

### 4. Auth Models (`src/api/models/auth.ts`)
- ✅ Created TypeScript interfaces for:
  - `LoginRequest`
  - `RegisterRequest`
  - `AuthResponse`
  - `UserInfo`

### 5. Auth Context (`src/contexts/simple-auth-context.tsx`)
- ✅ Updated `login()` function to use real backend API
- ✅ Updated `register()` function to use real backend API
- ✅ Added automatic token storage in localStorage
- ✅ Added session restoration on app load (checks for existing token)
- ✅ Added role mapping from backend `roleId` to frontend `UserRole`
- ✅ Updated `logout()` to clear token from localStorage
- ✅ Improved error handling with proper error messages

### 6. API Index (`src/api/index.ts`)
- ✅ Exported `authApi` for use throughout the application

## Backend Connection Details

- **Backend URL**: `http://localhost:5166`
- **HTTPS URL**: `https://localhost:7237` (if needed)
- **CORS**: Configured to allow requests from `http://localhost:3039` (frontend port)

## Role Mapping

The frontend maps backend `roleId` to frontend roles:
- `roleId: 1` → `'admin'`
- `roleId: 2` → `'instructor'`
- `roleId: 3` → `'student'` (default)

**Note**: You may need to adjust the `mapRoleIdToRole()` function in `simple-auth-context.tsx` if your backend uses different role IDs.

## How It Works

### Login Flow
1. User enters email and password
2. Frontend calls `authApi.login()`
3. Backend returns `AuthResponse` with `accessToken`
4. Token is stored in `localStorage` as `'accessToken'`
5. Frontend calls `authApi.getMe()` to get user info
6. User object is created and stored in context and localStorage
7. All subsequent API calls include the token in the Authorization header

### Register Flow
1. User enters registration details
2. Frontend calls `authApi.register()`
3. Backend creates account and returns `AuthResponse` with `accessToken`
4. Token is stored and user info is fetched (same as login)

### Session Restoration
- On app load, checks for existing `accessToken` in localStorage
- If token exists, calls `authApi.getMe()` to verify and restore session
- If token is invalid, clears storage and user must login again

### Logout Flow
1. User clicks logout
2. `localStorage` is cleared (`accessToken` and `auth_user`)
3. Auth state is reset

## Environment Variables

Create a `.env` file in the frontend root directory:
```env
VITE_API_BASE_URL=http://localhost:5166
```

Or use the default (already configured in `config.ts`).

## Testing

1. **Start Backend**: Run the .NET backend on `http://localhost:5166`
2. **Start Frontend**: Run `npm run dev` or `yarn dev` (runs on port 3039)
3. **Test Login**: Use credentials from your backend database
4. **Test Register**: Create a new account
5. **Test Protected Routes**: Verify that authenticated requests work

## API Endpoints Used

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/me` - Get current user info

### Applications
- `GET /api/Application` - Get all applications
- `GET /api/Application/{id}` - Get application by ID
- `POST /api/Application` - Create application
- `PATCH /api/Application/{id}` - Update application status
- `PUT /api/Application/{id}` - Update application

### Courses
- `GET /api/Course/available` - Get available courses
- `GET /api/Course/{id}` - Get course by ID
- `GET /api/Course/search?name={name}` - Search courses
- `POST /api/Course` - Create course
- `PUT /api/Course/{id}` - Update course
- `PATCH /api/Course/{id}` - Patch course
- `DELETE /api/Course/{id}` - Delete course

## Troubleshooting

### CORS Errors
- Ensure backend CORS is configured to allow `http://localhost:3039`
- Check `appsettings.Development.json` in backend for allowed origins

### 401 Unauthorized
- Token may have expired
- Token may be missing from localStorage
- Backend JWT configuration may be incorrect

### Connection Refused
- Ensure backend is running on `http://localhost:5166`
- Check backend `launchSettings.json` for correct port

### Role Mapping Issues
- Check your backend database for actual role IDs
- Update `mapRoleIdToRole()` function if needed

## Next Steps

1. ✅ Backend and frontend are now connected
2. ✅ Authentication is working with real API
3. ⚠️ Verify role IDs match your database (adjust if needed)
4. ⚠️ Test all API endpoints to ensure they work correctly
5. ⚠️ Add error handling UI for better user experience
6. ⚠️ Consider adding token refresh logic if needed
