# Quick Start Guide - Courses System

## Getting Started

### 1. Install Dependencies
```bash
npm install
# or
yarn install
```

### 2. Start Development Server
```bash
npm run dev
# or
yarn dev
```

The app will be available at: `http://localhost:3039`

## Demo Credentials

### Admin Account
- **Email**: `admin@school.com`
- **Password**: `admin123`
- **Access**: Full course management capabilities

### Student Account
- **Email**: `student@school.com`
- **Password**: `student123`
- **Access**: Browse and enroll in courses

### Instructor Account
- **Email**: `instructor@school.com`
- **Password**: `instructor123`

## Key Features

### 1. Multi-Language Support
- **Toggle Language**: Click the language button on the login page
- **Supported Languages**: English & Arabic (العربية)
- **Auto RTL**: Arabic automatically switches to right-to-left layout

### 2. Admin Course Management (`/admin/courses`)
- **Add Course**: Create new courses with details
- **Edit Course**: Modify existing course information
- **Delete Course**: Remove courses from the system
- **View Courses**: See all active and inactive courses in tabs

### 3. Student Course Browsing (`/courses`)
- **Search Courses**: Find courses by name, code, or description
- **Filter by Category**: Filter courses by subject area
- **Filter by Level**: Filter by difficulty (Beginner, Intermediate, Advanced)
- **Sort Courses**: Sort by popularity, rating, price, or newest
- **Course Details**: View course information including instructor, rating, and price

## Navigation

### For Admins
1. Login with admin credentials
2. Go to **Admin Dashboard** → **Course Management**
3. Manage courses (Add, Edit, Delete)

### For Students
1. Login with student credentials
2. Go to **Courses**
3. Browse, search, filter, and sort available courses
4. Click "Enroll in Course" to join

## File Structure

```
src/
├── locales/              # Translation files (i18n)
│   ├── en.json          # English translations
│   ├── ar.json          # Arabic translations
│   └── i18n.ts          # i18n configuration
├── types/
│   └── course.ts        # Course type definitions
├── _mock/
│   └── courses.ts       # Sample course data
├── contexts/
│   └── courses-context.tsx  # Course state management
├── sections/
│   ├── auth/            # Authentication UI
│   ├── admin/           # Admin features
│   └── courses/         # Student course browsing
└── pages/
    ├── courses.tsx      # Student courses page
    └── admin/courses.tsx  # Admin courses page
```

## Common Tasks

### Add a New Course
1. Login as admin
2. Navigate to `/admin/courses`
3. Click "Add Course" button
4. Fill in the form:
   - Course Name
   - Course Code (e.g., WEB-101)
   - Description
   - Category
   - Level
   - Price
   - Instructor ID
   - Duration (hours)
5. Click "Save"

### Search for Courses (Student)
1. Login as student
2. Go to `/courses`
3. Type in the search box to find courses
4. Use filters and sorting to narrow results

### Change Language
1. On any page, look for the language toggle
2. Select "English" or "العربية"
3. The entire UI will translate and adjust layout

## Troubleshooting

### App Won't Start
```bash
# Clear node_modules and reinstall
npm run clean
npm install
npm run dev
```

### Translations Not Working
- Check that you're on a page that uses `useTranslation()`
- Verify language is set correctly in browser console: `localStorage.getItem('language')`

### Courses Not Showing
- Ensure you're logged in
- Check that you're on the correct page (`/courses` for students, `/admin/courses` for admins)
- Verify CoursesProvider is in the app

## Build for Production

```bash
npm run build
# or
yarn build
```

Output will be in the `dist/` folder.

## Next Steps

1. **Customize Courses**: Edit `src/_mock/courses.ts` to add more sample courses
2. **Add More Languages**: Add translation files in `src/locales/`
3. **Connect to Backend**: Replace mock API calls in `src/contexts/courses-context.tsx`
4. **Customize Styling**: Modify theme in `src/theme/`

## Support

For detailed documentation, see `IMPLEMENTATION_GUIDE.md`

## Key Technologies

- **React 19** - UI framework
- **Material-UI 7** - Component library
- **TypeScript** - Type safety
- **i18next** - Internationalization
- **React Router 7** - Routing
- **Vite** - Build tool
