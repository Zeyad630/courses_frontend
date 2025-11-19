import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Rating from '@mui/material/Rating';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';

import { DashboardContent } from 'src/layouts/dashboard';
import { useCoursesContext } from 'src/contexts/courses-context';
import { Iconify } from 'src/components/iconify';

import type { Course, CourseLevel } from 'src/types/course';

// ----------------------------------------------------------------------

export function CoursesListView() {
  const { t } = useTranslation();
  const { courses } = useCoursesContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  // Enrollment form state
  const [enrollmentDialogOpen, setEnrollmentDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [enrollmentForm, setEnrollmentForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    experience: '',
    motivation: '',
  });
  const [enrollmentErrors, setEnrollmentErrors] = useState<Record<string, string>>({});
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false);

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(courses.map((c) => c.category)));
    return uniqueCategories;
  }, [courses]);

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    let result = courses.filter((course) => course.status === 'active');

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (course) =>
          course.name.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query) ||
          course.code.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((course) => course.category === selectedCategory);
    }

    // Level filter
    if (selectedLevel !== 'all') {
      result = result.filter((course) => course.level === selectedLevel);
    }

    // Sorting
    if (sortBy === 'popular') {
      result.sort((a, b) => b.students - a.students);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [courses, searchQuery, selectedCategory, selectedLevel, sortBy]);

  // Enrollment handlers
  const handleEnrollClick = (course: Course) => {
    setSelectedCourse(course);
    setEnrollmentDialogOpen(true);
    setEnrollmentErrors({});
    setEnrollmentSuccess(false);
  };

  const handleEnrollmentFormChange = (field: string, value: string) => {
    setEnrollmentForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (enrollmentErrors[field]) {
      setEnrollmentErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateEnrollmentForm = () => {
    const errors: Record<string, string> = {};
    
    if (!enrollmentForm.fullName.trim()) {
      errors.fullName = t('validation.required');
    }
    if (!enrollmentForm.email.trim()) {
      errors.email = t('validation.required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enrollmentForm.email)) {
      errors.email = t('validation.invalidEmail');
    }
    if (!enrollmentForm.phone.trim()) {
      errors.phone = t('validation.required');
    }
    if (!enrollmentForm.experience) {
      errors.experience = t('validation.required');
    }
    if (!enrollmentForm.motivation.trim()) {
      errors.motivation = t('validation.required');
    }

    return errors;
  };

  const handleEnrollmentSubmit = async () => {
    const errors = validateEnrollmentForm();
    
    if (Object.keys(errors).length > 0) {
      setEnrollmentErrors(errors);
      return;
    }

    // Simulate API call
    setEnrollmentSuccess(true);
    
    // Reset form after 2 seconds
    setTimeout(() => {
      setEnrollmentDialogOpen(false);
      setEnrollmentForm({
        fullName: '',
        email: '',
        phone: '',
        experience: '',
        motivation: '',
      });
      setEnrollmentSuccess(false);
    }, 2000);
  };

  const handleEnrollmentDialogClose = () => {
    if (!enrollmentSuccess) {
      setEnrollmentDialogOpen(false);
      setEnrollmentForm({
        fullName: '',
        email: '',
        phone: '',
        experience: '',
        motivation: '',
      });
      setEnrollmentErrors({});
    }
  };

  const renderCourseGridCard = (course: Course) => (
    <Card
      key={course.id}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
        },
      }}
    >
      {/* Course Image Placeholder */}
      <Box
        sx={{
          height: 200,
          bgcolor: 'primary.lighter',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Iconify icon="solar:library-bold" width={60} sx={{ color: 'primary.main', opacity: 0.3 }} />
        <Chip
          label={t(`courses.${course.level}`)}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            bgcolor:
              course.level === 'beginner'
                ? 'success.main'
                : course.level === 'intermediate'
                  ? 'warning.main'
                  : 'error.main',
            color: 'white',
            fontWeight: 600,
          }}
        />
      </Box>

      <Card sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase' }}>
          {course.category}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, mt: 0.5 }}>
          {course.name}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, minHeight: 40, flexGrow: 1 }}>
          {course.description.substring(0, 80)}...
        </Typography>

        {/* Instructor */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Iconify icon="solar:pen-bold" width={16} sx={{ color: 'text.secondary' }} />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {course.instructor}
          </Typography>
        </Box>

        {/* Rating and Students */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Rating value={course.rating} readOnly size="small" />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              ({course.rating})
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {course.students} {t('courses.students')}
          </Typography>
        </Box>

        {/* Duration */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Iconify icon="solar:eye-bold" width={16} sx={{ color: 'text.secondary' }} />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {course.duration}h
          </Typography>
        </Box>

        {/* Price and Button */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
            ${course.price}
          </Typography>
          <Button
            variant="contained"
            size="small"
            endIcon={<Iconify icon="solar:share-bold" width={16} />}
            onClick={() => handleEnrollClick(course)}
          >
            {t('courses.enrollCourse')}
          </Button>
        </Box>
      </Card>
    </Card>
  );

  const renderCourseListCard = (course: Course) => (
    <Card
      key={course.id}
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        p: 2,
        mb: 2,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      {/* Course Image Placeholder */}
      <Box
        sx={{
          minWidth: { xs: '100%', sm: 150 },
          width: { xs: '100%', sm: 150 },
          height: 150,
          bgcolor: 'primary.lighter',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 1,
        }}
      >
        <Iconify icon="solar:library-bold" width={40} sx={{ color: 'primary.main', opacity: 0.3 }} />
        <Chip
          label={t(`courses.${course.level}`)}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor:
              course.level === 'beginner'
                ? 'success.main'
                : course.level === 'intermediate'
                  ? 'warning.main'
                  : 'error.main',
            color: 'white',
            fontWeight: 600,
          }}
        />
      </Box>

      {/* Course Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase' }}>
                {course.category}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                {course.name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                {course.code}
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', whiteSpace: 'nowrap', ml: 2 }}>
              ${course.price}
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
            {course.description.substring(0, 120)}...
          </Typography>

          {/* Course Details Row */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 1 }}>
            {/* Instructor */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Iconify icon="solar:pen-bold" width={14} sx={{ color: 'text.secondary' }} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {course.instructor}
              </Typography>
            </Box>

            {/* Students */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Iconify icon="solar:eye-bold" width={14} sx={{ color: 'text.secondary' }} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {course.students} {t('courses.students')}
              </Typography>
            </Box>

            {/* Duration */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Iconify icon="solar:eye-bold" width={14} sx={{ color: 'text.secondary' }} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {course.duration}h
              </Typography>
            </Box>

            {/* Rating */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Rating value={course.rating} readOnly size="small" />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                ({course.rating})
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Enroll Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          variant="contained"
          size="small"
          endIcon={<Iconify icon="solar:share-bold" width={16} />}
          sx={{ whiteSpace: 'nowrap' }}
          onClick={() => handleEnrollClick(course)}
        >
          {t('courses.enrollCourse')}
        </Button>
      </Box>
    </Card>
  );

  return (
    <DashboardContent>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            {t('courses.availableCourses')}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t('courses.searchCourses')}
          </Typography>
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 4, p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              placeholder={t('courses.searchCourses')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <Box sx={{ mr: 1 }}>
                      <Iconify icon="solar:eye-bold" width={20} sx={{ color: 'text.secondary' }} />
                    </Box>
                  ),
                },
              }}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>{t('courses.filterByCategory')}</InputLabel>
                <Select
                  value={selectedCategory}
                  label={t('courses.filterByCategory')}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <MenuItem value="all">{t('common.all')}</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>{t('courses.filterByLevel')}</InputLabel>
                <Select
                  value={selectedLevel}
                  label={t('courses.filterByLevel')}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                >
                  <MenuItem value="all">{t('common.all')}</MenuItem>
                  <MenuItem value="beginner">{t('courses.beginner')}</MenuItem>
                  <MenuItem value="intermediate">{t('courses.intermediate')}</MenuItem>
                  <MenuItem value="advanced">{t('courses.advanced')}</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>{t('courses.sortBy')}</InputLabel>
                <Select
                  value={sortBy}
                  label={t('courses.sortBy')}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="popular">{t('common.popular')}</MenuItem>
                  <MenuItem value="rating">{t('courses.rating')}</MenuItem>
                  <MenuItem value="price-low">{t('common.priceLow')}</MenuItem>
                  <MenuItem value="price-high">{t('common.priceHigh')}</MenuItem>
                  <MenuItem value="newest">{t('common.newest')}</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Card>

        {/* Results Info and View Toggle */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {filteredCourses.length} {t('courses.courses')}
          </Typography>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(event, newViewMode) => {
              if (newViewMode !== null) {
                setViewMode(newViewMode);
              }
            }}
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                px: 2,
                py: 1,
                border: '1px solid',
                borderColor: 'divider',
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  borderColor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                },
              },
            }}
          >
            <ToggleButton value="list" aria-label="list view">
              <Iconify icon="solar:list-bold" width={20} />
            </ToggleButton>
            <ToggleButton value="grid" aria-label="grid view">
              <Iconify icon="solar:eye-bold" width={20} />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Courses Display */}
        {filteredCourses.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <Iconify icon="solar:eye-closed-bold" width={60} sx={{ color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
              {t('courses.noCourses')}
            </Typography>
          </Card>
        ) : viewMode === 'list' ? (
          <Box>
            {filteredCourses.map((course) => renderCourseListCard(course))}
          </Box>
        ) : (
          <Grid container spacing={2}>
            {filteredCourses.map((course) => (
              <Grid key={course.id} xs={12} sm={6} md={4}>
                {renderCourseGridCard(course)}
              </Grid>
            ))}
          </Grid>
        )}

        {/* Enrollment Dialog */}
        <Dialog
          open={enrollmentDialogOpen}
          onClose={handleEnrollmentDialogClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 700 }}>
            {t('courses.enrollCourse')} - {selectedCourse?.name}
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {enrollmentSuccess ? (
              <Alert severity="success" sx={{ mb: 2 }}>
                {t('messages.enrollmentSuccess')}
              </Alert>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Full Name */}
                <TextField
                  fullWidth
                  label={t('courses.fullName')}
                  value={enrollmentForm.fullName}
                  onChange={(e) => handleEnrollmentFormChange('fullName', e.target.value)}
                  error={!!enrollmentErrors.fullName}
                  helperText={enrollmentErrors.fullName}
                  placeholder="John Doe"
                />

                {/* Email */}
                <TextField
                  fullWidth
                  label={t('auth.email')}
                  type="email"
                  value={enrollmentForm.email}
                  onChange={(e) => handleEnrollmentFormChange('email', e.target.value)}
                  error={!!enrollmentErrors.email}
                  helperText={enrollmentErrors.email}
                  placeholder="john@example.com"
                />

                {/* Phone */}
                <TextField
                  fullWidth
                  label={t('courses.phone')}
                  value={enrollmentForm.phone}
                  onChange={(e) => handleEnrollmentFormChange('phone', e.target.value)}
                  error={!!enrollmentErrors.phone}
                  helperText={enrollmentErrors.phone}
                  placeholder="+1 (555) 000-0000"
                />

                {/* Experience Level */}
                <FormControl fullWidth error={!!enrollmentErrors.experience}>
                  <InputLabel>{t('courses.experience')}</InputLabel>
                  <Select
                    value={enrollmentForm.experience}
                    label={t('courses.experience')}
                    onChange={(e) => handleEnrollmentFormChange('experience', e.target.value)}
                  >
                    <MenuItem value="">
                      <em>{t('common.all')}</em>
                    </MenuItem>
                    <MenuItem value="beginner">{t('courses.beginner')}</MenuItem>
                    <MenuItem value="intermediate">{t('courses.intermediate')}</MenuItem>
                    <MenuItem value="advanced">{t('courses.advanced')}</MenuItem>
                  </Select>
                  {enrollmentErrors.experience && (
                    <Typography variant="caption" sx={{ color: 'error.main', mt: 0.5 }}>
                      {enrollmentErrors.experience}
                    </Typography>
                  )}
                </FormControl>

                {/* Motivation */}
                <TextField
                  fullWidth
                  label={t('courses.motivation')}
                  multiline
                  rows={3}
                  value={enrollmentForm.motivation}
                  onChange={(e) => handleEnrollmentFormChange('motivation', e.target.value)}
                  error={!!enrollmentErrors.motivation}
                  helperText={enrollmentErrors.motivation}
                  placeholder="Why do you want to take this course?"
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={handleEnrollmentDialogClose}
              disabled={enrollmentSuccess}
            >
              {enrollmentSuccess ? t('common.close') : t('common.cancel')}
            </Button>
            {!enrollmentSuccess && (
              <Button
                variant="contained"
                onClick={handleEnrollmentSubmit}
              >
                {t('courses.enrollCourse')}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardContent>
  );
}
