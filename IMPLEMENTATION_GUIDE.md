# Courses System Implementation Guide

## Overview
This document outlines the implementation of the Courses Management System with multi-language support (Arabic & English), admin course management, and student course browsing features.

## Features Implemented

### 1. **Multi-Language Support (i18n)**
- **Location**: `src/locales/`
- **Files**:
  - `i18n.ts` - i18next configuration
  - `en.json` - English translations
  - `ar.json` - Arabic translations
- **Features**:
  - Automatic RTL support for Arabic
  - Language persistence in localStorage
  - Dynamic language switching
  - Comprehensive translation keys for all UI elements

### 2. **Sign-In/Login Interface with Language Toggle**
- **Location**: `src/sections/auth/sign-in-view.tsx`
- **Features**:
  - Language toggle button (English/Arabic)
  - Fully translated login form
  - Demo credentials display
  - Responsive design
  - Error handling with translations
  - Loading states

### 3. **Course Management System**

#### Types & Models
- **Location**: `src/types/course.ts`
- **Interfaces**:
  - `Course` - Main course entity
  - `CourseContent` - Course modules and lessons
  - `CourseEnrollment` - Student enrollment tracking
  - `CreateCourseInput` - Form input for creating courses
  - `UpdateCourseInput` - Form input for updating courses

#### Mock Data
- **Location**: `src/_mock/courses.ts`
- **Contains**: 6 sample courses with various levels and categories

#### State Management
- **Location**: `src/contexts/courses-context.tsx`
- **Features**:
  - Redux-like reducer pattern
  - CRUD operations (Create, Read, Update, Delete)
  - Loading and error states
  - Mock API simulation

### 4. **Admin Course Management Dashboard**
- **Location**: `src/sections/admin/view/admin-course-management-view.tsx`
- **Route**: `/admin/courses`
- **Features**:
  - **Add Course**: Dialog form to create new courses
  - **Edit Course**: Modify existing course details
  - **Delete Course**: Remove courses with confirmation
  - **Tabbed View**: Active and Inactive courses
  - **Form Fields**:
    - Course Name
    - Course Code
    - Description
    - Category
    - Level (Beginner, Intermediate, Advanced)
    - Price
    - Instructor ID
    - Duration (hours)
  - **Responsive Table**: Shows all course details
  - **Error Handling**: User-friendly error messages
  - **Success Notifications**: Confirmation of actions

### 5. **Student Course Browsing Interface**
- **Location**: `src/sections/courses/courses-list-view.tsx`
- **Route**: `/courses`
- **Features**:
  - **Course Grid**: Responsive card-based layout
  - **Search**: Real-time course search by name, code, or description
  - **Filters**:
    - Category filter
    - Level filter (Beginner, Intermediate, Advanced)
  - **Sorting Options**:
    - Most Popular (by student count)
    - Rating
    - Price (Low to High)
    - Price (High to Low)
    - Newest
  - **Course Cards Display**:
    - Course image placeholder
    - Level badge
    - Course name and description
    - Instructor name
    - Rating with star display
    - Student count
    - Duration
    - Price
    - Enroll button
  - **Empty State**: Helpful message when no courses match filters

## File Structure

```
src/
├── locales/
│   ├── i18n.ts                 # i18n configuration
│   ├── en.json                 # English translations
│   └── ar.json                 # Arabic translations
├── types/
│   └── course.ts               # Course type definitions
├── _mock/
│   └── courses.ts              # Mock course data
├── contexts/
│   ├── courses-context.tsx     # Course state management
│   └── simple-auth-context.tsx # (existing) Auth context
├── sections/
│   ├── auth/
│   │   └── sign-in-view.tsx    # Updated with i18n & language toggle
│   ├── admin/view/
│   │   └── admin-course-management-view.tsx  # Admin course management
│   └── courses/
│       └── courses-list-view.tsx  # Student course browsing
├── pages/
│   ├── courses.tsx             # Updated to use new view
│   └── admin/
│       └── courses.tsx         # New admin courses page
└── routes/
    └── sections.tsx            # Updated with new routes
```

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
# or
yarn install
```

This will install the new i18n packages:
- `i18next@^23.7.6`
- `react-i18next@^14.0.0`

### 2. Run Development Server
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3039`

## Usage

### Admin Course Management

1. **Login as Admin**:
   - Email: `admin@school.com`
   - Password: `admin123`

2. **Navigate to Course Management**:
   - Go to `/admin/courses` or use the navigation menu

3. **Add a Course**:
   - Click "Add Course" button
   - Fill in the form fields
   - Click "Save"

4. **Edit a Course**:
   - Click the edit icon (pencil) in the course table
   - Modify the fields
   - Click "Save"

5. **Delete a Course**:
   - Click the delete icon (trash) in the course table
   - Confirm the deletion

### Student Course Browsing

1. **Login as Student**:
   - Email: `student@school.com`
   - Password: `student123`

2. **Browse Courses**:
   - Navigate to `/courses`
   - Use search, filters, and sorting to find courses
   - Click "Enroll in Course" to enroll

### Language Switching

1. **On Login Page**:
   - Click the language toggle in the top-right corner
   - Select "English" or "العربية" (Arabic)

2. **Throughout the App**:
   - Language preference is saved in localStorage
   - RTL layout automatically applies for Arabic

## Translation Keys

### Common Keys
- `common.appName` - Application name
- `common.language` - Language label
- `common.english` - English label
- `common.arabic` - Arabic label
- `common.loading` - Loading text
- `common.save` - Save button
- `common.delete` - Delete button
- `common.cancel` - Cancel button

### Course Keys
- `courses.courses` - Courses label
- `courses.courseName` - Course name field
- `courses.courseCode` - Course code field
- `courses.courseDescription` - Course description field
- `courses.category` - Category field
- `courses.level` - Level field
- `courses.price` - Price field
- `courses.instructor` - Instructor field
- `courses.duration` - Duration field
- `courses.students` - Students count
- `courses.rating` - Rating label
- `courses.addCourse` - Add course button
- `courses.editCourse` - Edit course button
- `courses.deleteCourse` - Delete course button
- `courses.enrollCourse` - Enroll button
- `courses.availableCourses` - Available courses heading
- `courses.noCourses` - No courses message
- `courses.beginner` - Beginner level
- `courses.intermediate` - Intermediate level
- `courses.advanced` - Advanced level

### Admin Keys
- `admin.adminDashboard` - Admin dashboard label
- `admin.courseManagement` - Course management label
- `admin.activeCourses` - Active courses label
- `admin.management` - Management label

### Validation Keys
- `validation.required` - Required field message
- `validation.invalidEmail` - Invalid email message

### Message Keys
- `messages.savingError` - Saving error message
- `messages.noData` - No data message

## API Integration (Future)

To connect to a real backend API, update the `src/contexts/courses-context.tsx`:

```typescript
// Replace mock API calls with real API calls
const getCourses = useCallback(async () => {
  dispatch({ type: 'SET_LOADING', payload: true });
  try {
    const response = await fetch('/api/courses');
    const data = await response.json();
    dispatch({ type: 'SET_COURSES', payload: data });
  } catch (error) {
    dispatch({ type: 'SET_ERROR', payload: error.message });
  }
}, []);
```

## Styling & Customization

- **Theme**: Uses Material-UI theme system
- **Colors**: Primary color is red (`#DC2626`)
- **Responsive**: Mobile-first design with breakpoints
- **Icons**: Uses Iconify icons library

## Testing

To test the implementation:

1. **Admin Functionality**:
   - Add a new course
   - Edit the course details
   - Delete the course
   - Verify data persists in the table

2. **Student Functionality**:
   - Search for courses
   - Apply filters
   - Sort by different criteria
   - Verify course cards display correctly

3. **Language Support**:
   - Switch between English and Arabic
   - Verify all text translates
   - Check RTL layout for Arabic
   - Verify language persists on page reload

## Troubleshooting

### Translations Not Loading
- Ensure i18n is imported in `main.tsx`
- Check that translation JSON files are in `src/locales/`
- Verify i18n configuration in `src/locales/i18n.ts`

### Courses Not Displaying
- Check browser console for errors
- Verify `CoursesProvider` is wrapping the app in `src/app.tsx`
- Ensure mock data is imported in `courses-context.tsx`

### Language Toggle Not Working
- Check that `useTranslation()` hook is used
- Verify `handleLanguageChange` is properly connected
- Check localStorage for language key

## Future Enhancements

1. **Backend Integration**:
   - Connect to real API endpoints
   - Implement proper authentication
   - Add database persistence

2. **Features**:
   - Course enrollment tracking
   - Student progress tracking
   - Course ratings and reviews
   - Certificate generation
   - Payment integration

3. **Admin Features**:
   - Bulk course operations
   - Advanced analytics
   - Student management
   - Instructor management

4. **Student Features**:
   - Course completion tracking
   - Certificate download
   - Course reviews
   - Discussion forums

## Support

For issues or questions, refer to:
- Material-UI Documentation: https://mui.com/
- i18next Documentation: https://www.i18next.com/
- React Router Documentation: https://reactrouter.com/
