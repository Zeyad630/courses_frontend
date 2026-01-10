import type { Course } from 'src/types/course';

import { useTranslation } from 'react-i18next';
import { useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Rating from '@mui/material/Rating';
import Select from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import ToggleButton from '@mui/material/ToggleButton';
import { alpha, useTheme } from '@mui/material/styles';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { DashboardContent } from 'src/layouts/dashboard';
import { useAuth } from 'src/contexts/simple-auth-context';
import { useCoursesContext } from 'src/contexts/courses-context';
import { useApplicationsContext } from 'src/contexts/applications-context';
import { useCourseRoundsContext } from 'src/contexts/course-rounds-context';

import { Iconly } from 'src/components/iconly';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

export function CoursesListView() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { courses } = useCoursesContext();
  const { user, hasRole } = useAuth();
  const { createApplication } = useApplicationsContext();
  const { getRoundForStudent } = useCourseRoundsContext();

  const isBlockedFromApplying = useMemo(() => {
    if (!hasRole('student')) return () => false;
    if (!user?.id) return () => false;

    return (courseId: string) => {
      const round = getRoundForStudent(courseId, user.id);
      return Boolean(round && (round.status === 'active' || round.status === 'scheduled'));
    };
  }, [getRoundForStudent, hasRole, user?.id]);

  const [minPrice, maxPrice] = useMemo(() => {
    if (!courses.length) return [0, 1000];
    const prices = courses.map((c) => c.price);
    return [Math.min(...prices), Math.max(...prices)];
  }, [courses]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid'); // Default to grid for better aesthetics
  const [priceRange, setPriceRange] = useState<[number, number]>([minPrice, maxPrice]);
  const [ratingMin, setRatingMin] = useState<number>(0);

  useEffect(() => {
    const saved = localStorage.getItem('courses_view_mode');
    if (saved === 'list' || saved === 'grid') setViewMode(saved as 'list' | 'grid');
  }, []);

  useEffect(() => {
    localStorage.setItem('courses_view_mode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    setPriceRange([minPrice, maxPrice]);
  }, [minPrice, maxPrice]);
  
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
  // Details dialog state
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [detailsCourse, setDetailsCourse] = useState<Course | null>(null);

  const sampleSyllabus = [
    'Introduction to Programming Concepts',
    'Variables and Data Types',
    'Control Structures (if/else, loops)',
    'Functions and Methods',
    'Object-Oriented Programming',
    'File Handling and I/O',
    'Error Handling and Debugging',
    'Final Project Development',
  ];

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

    // Price range filter
    result = result.filter((course) => course.price >= priceRange[0] && course.price <= priceRange[1]);

    // Rating filter
    if (ratingMin > 0) {
      result = result.filter((course) => course.rating >= ratingMin);
    }

    // Sorting
    if (sortBy === 'popular') {
      result.sort((a, b) => b.students - a.students);
    } else if (sortBy === 'trending') {
      result.sort((a, b) => b.students * b.rating - a.students * a.rating);
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
  }, [courses, searchQuery, selectedCategory, selectedLevel, sortBy, priceRange, ratingMin]);

  // Enrollment handlers
  const handleEnrollClick = (course: Course) => {
    if (isBlockedFromApplying(course.id)) return;
    setSelectedCourse(course);
    setEnrollmentDialogOpen(true);
    setEnrollmentErrors({});
    setEnrollmentSuccess(false);
  };

  const handleOpenDetails = (course: Course) => {
    setDetailsCourse(course);
    setDetailsDialogOpen(true);
  };
  const handleCloseDetails = () => {
    setDetailsDialogOpen(false);
    setDetailsCourse(null);
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

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedLevel('all');
    setSortBy('popular');
    setPriceRange([minPrice, maxPrice]);
    setRatingMin(0);
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

    if (!selectedCourse || !user) {
      setEnrollmentErrors({ general: t('messages.savingError') as string });
      return;
    }

    if (isBlockedFromApplying(selectedCourse.id)) {
      setEnrollmentErrors({ general: 'You are already enrolled in this course for the current round.' });
      return;
    }

    await createApplication({
      studentId: user.id,
      courseId: selectedCourse.id,
      metadata: {
        fullName: enrollmentForm.fullName,
        email: enrollmentForm.email,
        phone: enrollmentForm.phone,
        experience: enrollmentForm.experience,
        motivation: enrollmentForm.motivation,
        courseName: selectedCourse.name,
        coursePrice: selectedCourse.price,
      },
    });

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

  const getLevelColor = (level: string) => {
    switch(level) {
      case 'beginner': return { bg: theme.palette.success.light, color: theme.palette.success.darker };
      case 'intermediate': return { bg: theme.palette.warning.light, color: theme.palette.warning.darker };
      case 'advanced': return { bg: theme.palette.error.light, color: theme.palette.error.darker };
      default: return { bg: theme.palette.primary.light, color: theme.palette.primary.darker };
    }
  };

  const renderCourseGridCard = (course: Course) => {
    const levelColors = getLevelColor(course.level);
    const blocked = isBlockedFromApplying(course.id);
    
    return (
      <Card
        key={course.id}
        onClick={() => handleOpenDetails(course)}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'visible',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: theme.shadows[15],
            '& .course-image': {
               transform: 'scale(1.05)',
            }
          },
          '&:hover .details-overlay': {
            opacity: 1,
          },
        }}
      >
            {/* Course Image Placeholder */}
            <Box
              sx={{
                height: 220,
                borderRadius: 2,
                mx: 2,
                mt: 2,
                overflow: 'hidden',
                position: 'relative',
                boxShadow: theme.shadows[4],
              }}
            >
              <Box
                className="course-image"
                sx={{
                  height: '100%',
                  width: '100%',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.2)} 0%, ${alpha(theme.palette.secondary.light, 0.2)} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.5s ease',
                }}
              >
                <SvgColor src="/assets/icons/Iconly/Iconly/Curved/Outline/Category.svg" sx={{ width: 60, height: 60, color: theme.palette.primary.main, opacity: 0.8 }} />
              </Box>

          {/* Hover Details Overlay */}
          <Box
            className="details-overlay"
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.common.black, 0.3),
              color: 'common.white',
              letterSpacing: 1,
              fontWeight: 800,
              textTransform: 'uppercase',
              opacity: 0,
              transition: 'opacity 0.3s ease',
            }}
          >
            Details
          </Box>

          <Chip
            label={t(`courses.${course.level}`)}
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              color: levelColors.color,
              fontWeight: 700,
              backdropFilter: 'blur(6px)',
              border: '1px solid',
              borderColor: alpha(levelColors.bg, 0.3),
            }}
          />
        </Box>

        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', pt: 3, pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
             <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
               {course.category}
             </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <SvgColor src="/assets/icons/Iconly/Iconly/Curved/Outline/Star.svg" sx={{ width: 14, height: 14, color: 'warning.main' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {course.rating}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                   ({course.students})
                </Typography>
              </Box>
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, mt: 0.5 }}>
            {course.name}
          </Typography>
          
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, flexGrow: 1, lineHeight: 1.6 }}>
            {course.description.substring(0, 80)}...
          </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ p: 0.5, borderRadius: '50%', bgcolor: alpha(theme.palette.grey[500], 0.08) }}>
                    <SvgColor src="/assets/icons/Iconly/Iconly/Curved/Outline/Profile.svg" sx={{ width: 14, height: 14, color: 'text.secondary' }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    {course.instructor}
                  </Typography>
                </Box>
                <Box sx={{ height: 4, width: 4, borderRadius: '50%', bgcolor: 'text.disabled' }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ p: 0.5, borderRadius: '50%', bgcolor: alpha(theme.palette.grey[500], 0.08) }}>
                    <SvgColor src="/assets/icons/Iconly/Iconly/Curved/Outline/Time Circle.svg" sx={{ width: 14, height: 14, color: 'text.secondary' }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    {course.duration}h
                  </Typography>
                </Box>
              </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto', pt: 2, borderTop: `1px dashed ${theme.palette.divider}` }}>
            <Box>
               <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>
                 ${course.price}
               </Typography>
            </Box>
              <Button
                variant="contained"
                size="small"
                endIcon={<SvgColor src="/assets/icons/Iconly/Iconly/Curved/Outline/Arrow - Right.svg" sx={{ width: 16, height: 16 }} />}
              onClick={(e) => { e.stopPropagation(); handleEnrollClick(course); }}
              disabled={blocked}
              sx={{ 
                borderRadius: 30,
                px: 2,
                boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.24)}`
              }}
            >
              {blocked ? 'Enrolled' : t('courses.enrollCourse')}
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderCourseListCard = (course: Course) => {
    const levelColors = getLevelColor(course.level);
    const blocked = isBlockedFromApplying(course.id);

    return (
    <Card
      key={course.id}
      onClick={() => handleOpenDetails(course)}
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        p: 2,
        mb: 2,
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateX(4px)',
          boxShadow: theme.shadows[10],
          borderColor: 'primary.lighter',
        },
        '&:hover .details-overlay': {
          opacity: 1,
        },
      }}
    >
      {/* Course Image Placeholder */}
      <Box
        sx={{
          minWidth: { xs: '100%', sm: 200 },
          width: { xs: '100%', sm: 200 },
          height: 180,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.secondary.light, 0.1)} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <SvgColor src="/assets/icons/Iconly/Iconly/Curved/Outline/Category.svg" sx={{ width: 40, height: 40, color: 'primary.main', opacity: 0.5 }} />
        {/* Hover Details Overlay */}
        <Box
          className="details-overlay"
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(theme.palette.common.black, 0.35),
            color: 'common.white',
            letterSpacing: 1,
            fontWeight: 800,
            textTransform: 'uppercase',
            opacity: 0,
            transition: 'opacity 0.3s ease',
          }}
        >
          Details
        </Box>
        <Chip
          label={t(`courses.${course.level}`)}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            color: levelColors.color,
            fontWeight: 700,
          }}
        />
      </Box>

      {/* Course Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', py: 1 }}>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, textTransform: 'uppercase', mb: 1, display: 'block' }}>
                {course.category}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                {course.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                 <Chip 
                   label={course.code}
                   size="small" 
                   variant="outlined" 
                   sx={{ borderRadius: 1, height: 24, fontSize: '0.75rem', color: 'text.secondary' }} 
                 />
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Iconly name="Star" size={16} sx={{ color: 'warning.main' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{course.rating}</Typography>
                 </Box>
              </Box>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', ml: 2 }}>
              ${course.price}
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, maxWidth: 800 }}>
            {course.description.substring(0, 150)}...
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SvgColor src="/assets/icons/Iconly/Iconly/Curved/Outline/Profile.svg" sx={{ width: 18, height: 18, color: 'text.secondary' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                {course.instructor}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SvgColor src="/assets/icons/Iconly/Iconly/Curved/Outline/3 User.svg" sx={{ width: 18, height: 18, color: 'text.secondary' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                {course.students} {t('courses.students')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SvgColor src="/assets/icons/Iconly/Iconly/Curved/Outline/Time Circle.svg" sx={{ width: 18, height: 18, color: 'text.secondary' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                {course.duration} hours
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
          <Button
            variant="contained"
            endIcon={<SvgColor src="/assets/icons/Iconly/Iconly/Curved/Outline/Arrow - Right.svg" sx={{ width: 16, height: 16 }} />}
            onClick={(e) => { e.stopPropagation(); handleEnrollClick(course); }}
            disabled={blocked}
            sx={{ borderRadius: 30, px: 3 }}
          >
            {blocked ? 'Enrolled' : t('courses.enrollCourse')}
          </Button>
        </Box>
      </Box>
    </Card>
    );
  };

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        {/* Glassmorphism Header */}
        <Box
          sx={{
            mb: 5,
            p: 4,
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
            background: `linear-gradient(135deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            color: 'white',
            boxShadow: theme.shadows[8],
          }}
        >
           <Box sx={{ position: 'relative', zIndex: 1 }}>
             <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                {t('courses.availableCourses')}
             </Typography>
             <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
               Explore our comprehensive catalog of courses designed to help you master new skills and advance your career.
             </Typography>
           </Box>
           {/* Decorative Elements */}
           <Box
             sx={{
               position: 'absolute',
               top: -60,
               right: -60,
               width: 300,
               height: 300,
               borderRadius: '50%',
               background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
             }}
           />
           <Box
             sx={{
               position: 'absolute',
               bottom: -40,
               left: -40,
               width: 200,
               height: 200,
               borderRadius: '50%',
               background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
             }}
           />
        </Box>

        {/* Filters and Controls */}
        <Stack spacing={3} sx={{ mb: 4 }}>
          {/* Row 1: Search and Main Filters */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              flexWrap: 'nowrap',
              overflowX: 'auto',
              p: 2,
              borderRadius: 2,
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            {/* Search Input */}
            <TextField
              fullWidth
              size="medium"
              placeholder={t('courses.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SvgColor src="/assets/icons/Iconly/Iconly/Curved/Outline/Search.svg" sx={{ color: 'text.secondary', width: 20, height: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                      <SvgColor src="/assets/icons/Iconly/Iconly/Curved/Outline/Close Square.svg" sx={{ width: 18, height: 18 }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                flexGrow: 1,
                minWidth: 200,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.grey[500], 0.05),
                },
              }}
            />

            {/* Category Filter */}
            <FormControl size="medium" sx={{ minWidth: 160 }}>
              <InputLabel>{t('courses.category')}</InputLabel>
              <Select
                value={selectedCategory}
                label={t('courses.category')}
                onChange={(e) => setSelectedCategory(e.target.value)}
                sx={{ borderRadius: 1.5 }}
              >
                <MenuItem value="all">{t('courses.allCategories')}</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Level Filter */}
            <FormControl size="medium" sx={{ minWidth: 140 }}>
              <InputLabel>{t('courses.level')}</InputLabel>
              <Select
                value={selectedLevel}
                label={t('courses.level')}
                onChange={(e) => setSelectedLevel(e.target.value)}
                sx={{ borderRadius: 1.5 }}
              >
                <MenuItem value="all">{t('courses.allLevels')}</MenuItem>
                <MenuItem value="Beginner">{t('courses.beginner')}</MenuItem>
                <MenuItem value="Intermediate">{t('courses.intermediate')}</MenuItem>
                <MenuItem value="Advanced">{t('courses.advanced')}</MenuItem>
              </Select>
            </FormControl>

            {/* Sort Dropdown */}
            <FormControl size="medium" sx={{ minWidth: 160 }}>
              <InputLabel>{t('courses.sortBy')}</InputLabel>
              <Select
                value={sortBy}
                label={t('courses.sortBy')}
                onChange={(e) => setSortBy(e.target.value)}
                sx={{ borderRadius: 1.5 }}
              >
                <MenuItem value="popular">{t('courses.popular') || 'Popular'}</MenuItem>
                <MenuItem value="trending">{t('common.trending') || 'Trending'}</MenuItem>
                <MenuItem value="rating">{t('courses.rating')}</MenuItem>
                <MenuItem value="price-low">{t('courses.priceLow') || 'Price: Low to High'}</MenuItem>
                <MenuItem value="price-high">{t('courses.priceHigh') || 'Price: High to Low'}</MenuItem>
                <MenuItem value="newest">{t('courses.newest') || 'Newest'}</MenuItem>
              </Select>
            </FormControl>

            <ToggleButtonGroup
              size="medium"
              value={viewMode}
              exclusive
              onChange={(e, nextView) => nextView && setViewMode(nextView)}
              sx={{ ml: 'auto', border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, borderRadius: 1.5, p: 0.5 }}
            >
              <ToggleButton value="grid" sx={{ px: 2, borderRadius: 1 }}>
                <SvgColor src="/assets/icons/Iconly/Iconly/Curved/Outline/Category.svg" sx={{ width: 22, height: 22 }} />
              </ToggleButton>
              <ToggleButton value="list" sx={{ px: 2, borderRadius: 1 }}>
                <SvgColor src="/assets/icons/Iconly/Iconly/Curved/Outline/Filter.svg" sx={{ width: 22, height: 22 }} />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Row 2: Price Range and Rating */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              p: 2.5,
              borderRadius: 2,
              background: alpha(theme.palette.background.paper, 0.4),
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            {/* Price Range Slider */}
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 3 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                {t('courses.priceRange')}: <strong>${priceRange[0]} - ${priceRange[1]}</strong>
              </Typography>
              <Slider
                value={priceRange}
                onChange={(event, newValue) => setPriceRange(newValue as [number, number])}
                valueLabelDisplay="auto"
                min={0}
                max={500}
                step={10}
                sx={{
                  flexGrow: 1,
                  '& .MuiSlider-thumb': {
                    width: 18,
                    height: 18,
                    bgcolor: 'primary.main',
                  },
                }}
              />
            </Box>

            {/* Minimum Rating Filter */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                {t('courses.minRating')}:
              </Typography>
              <Rating
                value={ratingMin}
                onChange={(event, newValue) => setRatingMin(newValue || 0)}
                precision={0.5}
                sx={{ color: 'warning.main' }}
              />
              {ratingMin > 0 && (
                <IconButton size="small" onClick={() => setRatingMin(0)}>
                  <SvgColor src="/assets/icons/Iconly/Iconly/Curved/Outline/Close Square.svg" sx={{ width: 16, height: 16 }} />
                </IconButton>
              )}
            </Box>

            <Button
              variant="contained"
              color="primary"
              onClick={clearFilters}
              startIcon={<SvgColor src="/assets/icons/Iconly/Iconly/Curved/Outline/Delete.svg" sx={{ width: 18, height: 18 }} />}
              sx={{ ml: 'auto', borderRadius: 2, px: 2.5, boxShadow: theme.shadows[2] }}
            >
              {t('courses.clearFilters') || t('common.clear') || 'Clear Filters'}
            </Button>
          </Box>
        </Stack>
        {/* Results Info */}
        <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 600, color: 'text.secondary' }}>
           Found {filteredCourses.length} courses
        </Typography>

        {/* Active Filters Chips */}
        {(searchQuery || selectedCategory !== 'all' || selectedLevel !== 'all' || ratingMin > 0 || priceRange[0] !== minPrice || priceRange[1] !== maxPrice || sortBy !== 'popular') && (
          <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            {searchQuery && (
              <Chip label={`Search: ${searchQuery}`} onDelete={() => setSearchQuery('')} />
            )}
            {selectedCategory !== 'all' && (
              <Chip label={`Category: ${selectedCategory}`} onDelete={() => setSelectedCategory('all')} />
            )}
            {selectedLevel !== 'all' && (
              <Chip label={`Level: ${selectedLevel}`} onDelete={() => setSelectedLevel('all')} />
            )}
            {ratingMin > 0 && (
              <Chip label={`Rating ≥ ${ratingMin}`} onDelete={() => setRatingMin(0)} />
            )}
            {(priceRange[0] !== minPrice || priceRange[1] !== maxPrice) && (
              <Chip label={`Price: $${priceRange[0]} - $${priceRange[1]}`} onDelete={() => setPriceRange([minPrice, maxPrice])} />
            )}
            {sortBy !== 'popular' && (
              <Chip label={`Sort: ${sortBy}`} onDelete={() => setSortBy('popular')} />
            )}
          </Box>
        )}

        {/* Quick Filter Chips */}
        <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
          {/* Levels */}
          {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
            <Chip
              key={level}
              label={t(`courses.${level}`)}
              variant={selectedLevel === level ? 'filled' : 'outlined'}
              color={selectedLevel === level ? 'primary' : 'default'}
              onClick={() => setSelectedLevel(level)}
            />
          ))}
          <Chip
            label={t('common.all')}
            variant={selectedLevel === 'all' ? 'filled' : 'outlined'}
            onClick={() => setSelectedLevel('all')}
          />

          {/* Categories */}
          {categories.map((category) => (
            <Chip
              key={category}
              label={category}
              variant={selectedCategory === category ? 'filled' : 'outlined'}
              color={selectedCategory === category ? 'primary' : 'default'}
              onClick={() => setSelectedCategory(category)}
            />
          ))}
        </Box>

        {/* Courses Display */}
        {filteredCourses.length === 0 ? (
          <Card sx={{ p: 8, textAlign: 'center', bgcolor: 'transparent', boxShadow: 'none' }}>
            <Box sx={{ mb: 3, p: 3, borderRadius: '50%', bgcolor: alpha(theme.palette.grey[500], 0.08), display: 'inline-flex' }}>
               <Iconly name="Search" size={64} sx={{ color: 'text.secondary' }} />
            </Box>
            <Typography variant="h5" sx={{ color: 'text.primary', mb: 1, fontWeight: 700 }}>
              {t('courses.noCourses')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Try adjusting your filters or search query to find what you&apos;re looking for.
            </Typography>
          </Card>
        ) : viewMode === 'list' ? (
          <Box>
            {filteredCourses.map((course) => renderCourseListCard(course))}
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)', xl: 'repeat(4, 1fr)' }, gap: 3 }}>
            {filteredCourses.map((course) => (
              <Box key={course.id}>
                {renderCourseGridCard(course)}
              </Box>
            ))}
          </Box>
        )}

        {/* Enrollment Dialog */}
        <Dialog
          open={enrollmentDialogOpen}
          onClose={handleEnrollmentDialogClose}
          maxWidth="sm"
          fullWidth
          PaperProps={{
             sx: { borderRadius: 2, boxShadow: theme.shadows[24] }
          }}
        >
          <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
            {t('courses.enrollCourse')} 
            <Typography variant="subtitle2" color="primary.main" sx={{ mt: 0.5 }}>
               {selectedCourse?.name}
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {enrollmentSuccess ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                 <Box sx={{ mb: 2, color: 'success.main' }}>
                   <Iconly name="Tick Square" size={64} />
                 </Box>
                 <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                   Successful!
                 </Typography>
                 <Typography variant="body2" color="text.secondary">
                    {t('messages.enrollmentSuccess')}
                 </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                <TextField
                  fullWidth
                  label={t('courses.fullName')}
                  value={enrollmentForm.fullName}
                  onChange={(e) => handleEnrollmentFormChange('fullName', e.target.value)}
                  error={!!enrollmentErrors.fullName}
                  helperText={enrollmentErrors.fullName}
                  placeholder="John Doe"
                  InputProps={{
                     startAdornment: <Iconly name="Profile" size={20} sx={{ mr: 1, color: 'text.disabled' }} />
                  }}
                />

                <TextField
                  fullWidth
                  label={t('auth.email')}
                  type="email"
                  value={enrollmentForm.email}
                  onChange={(e) => handleEnrollmentFormChange('email', e.target.value)}
                  error={!!enrollmentErrors.email}
                  helperText={enrollmentErrors.email}
                  placeholder="john@example.com"
                  InputProps={{
                     startAdornment: <Iconly name="Message" size={20} sx={{ mr: 1, color: 'text.disabled' }} />
                  }}
                />

                <TextField
                  fullWidth
                  label={t('courses.phone')}
                  value={enrollmentForm.phone}
                  onChange={(e) => handleEnrollmentFormChange('phone', e.target.value)}
                  error={!!enrollmentErrors.phone}
                  helperText={enrollmentErrors.phone}
                  placeholder="+1 (555) 000-0000"
                  InputProps={{
                     startAdornment: <Iconly name="Call" size={20} sx={{ mr: 1, color: 'text.disabled' }} />
                  }}
                />

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

                <TextField
                  fullWidth
                  label={t('courses.motivation')}
                  multiline
                  rows={4}
                  value={enrollmentForm.motivation}
                  onChange={(e) => handleEnrollmentFormChange('motivation', e.target.value)}
                  error={!!enrollmentErrors.motivation}
                  helperText={enrollmentErrors.motivation}
                  placeholder="Why do you want to take this course?"
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={handleEnrollmentDialogClose}
              disabled={enrollmentSuccess}
              variant="outlined"
            >
              {enrollmentSuccess ? t('common.close') : t('common.cancel')}
            </Button>
            {!enrollmentSuccess && (
              <Button
                variant="contained"
                onClick={handleEnrollmentSubmit}
                startIcon={<SvgColor src="/assets/icons/Iconly/Iconly/Curved/Outline/Tick Square.svg" />}
              >
                {t('courses.enrollCourse')}
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Course Details Dialog */}
        <Dialog
          open={detailsDialogOpen}
          onClose={handleCloseDetails}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 2 } }}
        >
          <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
            {detailsCourse?.name}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Chip size="small" label={t(`courses.${detailsCourse?.level || 'beginner'}`)} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>{detailsCourse?.code}</Typography>
            </Box>
          </DialogTitle>
          <DialogContent dividers sx={{ pt: 2 }}>
            {/* Hero header */}
            <Box
              sx={{
                mb: 3,
                p: 3,
                borderRadius: 2,
                position: 'relative',
                overflow: 'hidden',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.16)} 0%, ${alpha(theme.palette.background.paper, 0.6)} 100%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 0.6 }}>
                  {detailsCourse?.category}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
                  {detailsCourse?.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Iconly name="Profile" size={16} /> {detailsCourse?.instructor}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Chip size="small" label={t(`courses.${detailsCourse?.level || 'beginner'}`)} />
                  <Chip size="small" variant="outlined" label={detailsCourse?.code} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Iconly name="Star" size={16} sx={{ color: 'warning.main' }} />
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>{detailsCourse?.rating}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Iconly name="3 User" size={16} />
                    <Typography variant="caption">{detailsCourse?.students}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Iconly name="Time Circle" size={16} />
                    <Typography variant="caption">{detailsCourse?.duration}h</Typography>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ textAlign: 'right', minWidth: 200 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
                  ${detailsCourse?.price}
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => { if (detailsCourse) handleEnrollClick(detailsCourse); handleCloseDetails(); }}
                  sx={{ mt: 1, borderRadius: 30 }}
                >
                  {t('courses.enrollCourse')}
                </Button>
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                About this Course
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                {detailsCourse?.description}
              </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                    What you&apos;ll learn
                  </Typography>
                  <Box component="ul" sx={{ pl: 2.5, m: 0, typography: 'body2', color: 'text.secondary', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {sampleSyllabus.map((topic, i) => (
                      <li key={i}>{topic}</li>
                    ))}
                  </Box>
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Course details</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2"><strong>Category:</strong> {detailsCourse?.category}</Typography>
                    <Typography variant="body2"><strong>Instructor:</strong> {detailsCourse?.instructor}</Typography>
                    <Typography variant="body2"><strong>Duration:</strong> {detailsCourse?.duration}h</Typography>
                    <Typography variant="body2"><strong>Students:</strong> {detailsCourse?.students}</Typography>
                    <Typography variant="body2"><strong>Rating:</strong> {detailsCourse?.rating}</Typography>
                    <Typography variant="body2"><strong>Price:</strong> ${detailsCourse?.price}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDetails}>Close</Button>
            <Button variant="contained" onClick={() => { if (detailsCourse) handleEnrollClick(detailsCourse); handleCloseDetails(); }}>
              {t('courses.enrollCourse')}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardContent>
  );
}
