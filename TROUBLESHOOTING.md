# Troubleshooting Guide

## Common Issues and Solutions

### 1. **App Won't Start / Build Errors**

#### Error: `Cannot find module`
```
Error: Cannot find module '@mui/material/Grid2'
```

**Solution:**
- Use `Grid` instead of `Grid2`
- Update import: `import Grid from '@mui/material/Grid'`
- Use props: `xs={12} sm={6} md={4}` instead of `size={{ xs: 12, sm: 6, md: 4 }}`

#### Error: `i18n is not defined`
```
Error: i18n is not defined
```

**Solution:**
- Ensure `src/locales/i18n.ts` is imported in `src/main.tsx`
- Add: `import 'src/locales/i18n';` at the top of main.tsx

#### Error: `Module not found`
```
Error: Failed to resolve import
```

**Solution:**
```bash
# Clear cache and reinstall
npm run clean
npm install
npm run dev
```

---

### 2. **Translations Not Working**

#### Issue: Text shows translation keys instead of translated text
```
Example: "courses.courseName" instead of "Course Name"
```

**Solution:**
1. Check that `useTranslation()` hook is used in component
2. Verify translation files exist:
   - `src/locales/en.json`
   - `src/locales/ar.json`
3. Verify i18n is initialized in `main.tsx`
4. Check browser console for i18n errors

#### Issue: Language toggle not working
```
Language doesn't change when clicking toggle button
```

**Solution:**
1. Verify `handleLanguageChange` function is connected
2. Check that `i18n.changeLanguage()` is called
3. Verify localStorage is not blocked
4. Check browser console for errors

#### Issue: Arabic text not RTL
```
Arabic text displays but layout is not right-to-left
```

**Solution:**
1. Verify `document.documentElement.dir` is set to 'rtl'
2. Check i18n configuration in `src/locales/i18n.ts`
3. Verify language is set to 'ar' in localStorage
4. Clear browser cache and reload

---

### 3. **Courses Not Displaying**

#### Issue: No courses appear in student view
```
Courses page shows "No courses available"
```

**Solution:**
1. Verify `CoursesProvider` wraps the app in `src/app.tsx`
2. Check mock data in `src/_mock/courses.ts`
3. Verify courses context is imported: `useCoursesContext()`
4. Check browser console for errors
5. Verify you're on `/courses` route

#### Issue: Admin course management not loading
```
Admin courses page shows error or blank
```

**Solution:**
1. Verify you're logged in as admin
2. Check route: `/admin/courses`
3. Verify `AdminCourseManagementView` is imported
4. Check browser console for errors
5. Verify `CoursesProvider` is in app

#### Issue: Add/Edit/Delete not working
```
Buttons don't respond or show errors
```

**Solution:**
1. Check browser console for error messages
2. Verify form validation (all fields required)
3. Check that `createCourse`, `updateCourse`, `deleteCourse` are called
4. Verify mock API delay (800ms) is complete
5. Check network tab for any failed requests

---

### 4. **Styling Issues**

#### Issue: Layout looks broken on mobile
```
Components overlap or don't fit screen
```

**Solution:**
1. Check Grid breakpoints: `xs={12} sm={6} md={4}`
2. Verify Container maxWidth is set
3. Check responsive spacing with `sx={{ mb: { xs: 2, md: 4 } }}`
4. Use browser DevTools to test different screen sizes

#### Issue: Icons not displaying
```
Icon placeholders show instead of icons
```

**Solution:**
1. Verify icon name is available in Iconify
2. Check icon format: `"solar:pen-bold"`
3. Verify `Iconify` component is imported
4. Check width prop is set: `width={20}`
5. Use browser DevTools to inspect element

#### Issue: Colors not matching theme
```
Colors look different than expected
```

**Solution:**
1. Check theme configuration in `src/theme/`
2. Verify color names: `primary.main`, `error.main`, etc.
3. Check sx prop syntax: `sx={{ color: 'primary.main' }}`
4. Verify Material-UI version compatibility

---

### 5. **Authentication Issues**

#### Issue: Can't login
```
Login fails with "Invalid credentials"
```

**Solution:**
1. Use demo credentials:
   - Admin: `admin@school.com` / `admin123`
   - Student: `student@school.com` / `student123`
   - Instructor: `instructor@school.com` / `instructor123`
2. Check auth context in `src/contexts/simple-auth-context.tsx`
3. Verify credentials are in `validCredentials` array
4. Check browser console for errors

#### Issue: Session lost on page reload
```
User gets logged out after refresh
```

**Solution:**
1. Verify localStorage is working
2. Check auth context saves user to localStorage
3. Verify `getInitialState()` function in auth context
4. Check browser privacy settings not blocking localStorage

---

### 6. **Performance Issues**

#### Issue: App loads slowly
```
Page takes long time to load
```

**Solution:**
1. Check network tab for slow requests
2. Verify lazy loading is working
3. Check bundle size: `npm run build`
4. Look for console errors or warnings
5. Check mock API delays (800ms)

#### Issue: Filtering/Sorting is slow
```
Course list takes time to filter or sort
```

**Solution:**
1. Verify `useMemo` is used for filtering
2. Check that dependencies are correct
3. Look for unnecessary re-renders
4. Use React DevTools Profiler
5. Check browser console for errors

---

### 7. **Type Errors**

#### Error: `Type 'X' is not assignable to type 'Y'`
```
TypeScript compilation error
```

**Solution:**
1. Check type definitions in `src/types/course.ts`
2. Verify all required fields are provided
3. Check interface matches implementation
4. Use `as` for type casting if needed
5. Run `npm run tsc:dev` to check types

#### Error: `Cannot find module 'X'`
```
Module import error
```

**Solution:**
1. Verify file path is correct
2. Check file extension (.ts, .tsx, .json)
3. Verify file exists in project
4. Check import statement syntax
5. Restart dev server

---

### 8. **Browser Console Errors**

#### Error: `Cannot read property 'X' of undefined`
```
Runtime error accessing undefined property
```

**Solution:**
1. Add null/undefined checks
2. Use optional chaining: `obj?.property`
3. Use nullish coalescing: `value ?? default`
4. Check data before rendering
5. Add error boundaries

#### Error: `Uncaught Error: X is not a function`
```
Function call on non-function
```

**Solution:**
1. Verify function is imported correctly
2. Check function is defined
3. Verify function is called with correct arguments
4. Check for typos in function name
5. Use browser DevTools debugger

---

### 9. **Deployment Issues**

#### Error: Build fails
```
npm run build fails with errors
```

**Solution:**
1. Run `npm run lint` to check for lint errors
2. Run `npm run tsc:dev` to check types
3. Fix all errors before building
4. Clear cache: `npm run clean`
5. Reinstall dependencies: `npm install`

#### Error: App doesn't work in production
```
App works locally but fails in production
```

**Solution:**
1. Check environment variables
2. Verify API endpoints are correct
3. Check CORS settings
4. Verify asset paths are correct
5. Check browser console for errors

---

### 10. **Getting Help**

#### Steps to debug:
1. **Check browser console** for errors
2. **Check Network tab** for failed requests
3. **Use React DevTools** to inspect components
4. **Check TypeScript errors** with `npm run tsc:dev`
5. **Review component code** for logic errors

#### Useful commands:
```bash
# Check TypeScript
npm run tsc:dev

# Lint code
npm run lint

# Fix lint errors
npm run lint:fix

# Format code
npm run fm:fix

# Build for production
npm run build

# Preview production build
npm run start
```

#### Debugging tips:
1. Add `console.log()` statements
2. Use browser DevTools debugger
3. Use React DevTools extension
4. Check Redux DevTools for state
5. Use Network tab to inspect API calls

---

## Quick Reference

### File Locations
- Translations: `src/locales/`
- Types: `src/types/`
- Mock Data: `src/_mock/`
- Components: `src/sections/`
- Pages: `src/pages/`
- Routes: `src/routes/`
- Contexts: `src/contexts/`

### Key Files
- `src/main.tsx` - App entry point
- `src/app.tsx` - App wrapper with providers
- `src/routes/sections.tsx` - Route definitions
- `src/locales/i18n.ts` - i18n configuration

### Demo Credentials
- Admin: `admin@school.com` / `admin123`
- Student: `student@school.com` / `student123`
- Instructor: `instructor@school.com` / `instructor123`

### Important URLs
- App: `http://localhost:3039`
- Admin Courses: `http://localhost:3039/admin/courses`
- Student Courses: `http://localhost:3039/courses`
- Login: `http://localhost:3039/sign-in`

---

## Still Having Issues?

1. Check the documentation files:
   - `QUICK_START.md` - Quick start guide
   - `IMPLEMENTATION_GUIDE.md` - Detailed guide
   - `IMPLEMENTATION_SUMMARY.md` - Feature summary

2. Review the code:
   - Check component implementations
   - Review error handling
   - Check type definitions

3. Search for similar issues:
   - React documentation
   - Material-UI documentation
   - i18next documentation
   - Stack Overflow

4. Enable debug mode:
   - Add `console.log()` statements
   - Use browser DevTools
   - Check network requests
   - Review error messages
