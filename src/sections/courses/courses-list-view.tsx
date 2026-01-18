import type { Course } from 'src/types/course';
import type { WeekDto } from 'src/api/models/week';
import type { InstructorDto } from 'src/api/services/account.api';

import { useTranslation } from 'react-i18next';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import Tab from '@mui/material/Tab';
import ToggleButton from '@mui/material/ToggleButton';
import { alpha, useTheme } from '@mui/material/styles';
import Tabs from '@mui/material/Tabs';
import DialogActions from '@mui/material/DialogActions';
import Divider from '@mui/material/Divider';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { DashboardContent } from 'src/layouts/dashboard';
import { useAuth } from 'src/contexts/simple-auth-context';
import { useCoursesContext } from 'src/contexts/courses-context';
import { useApplicationsContext } from 'src/contexts/applications-context';
import { useCourseRoundsContext } from 'src/contexts/course-rounds-context';
import { weekApi, accountApi, courseRoundApi, applicationApi } from 'src/api';

import { Iconly } from 'src/components/iconly';
import { Iconify } from 'src/components/iconify';
import { SvgColor } from 'src/components/svg-color';

const STUDENT_VISIBLE_STATUS_ID = 18;
const INSTRUCTOR_VISIBLE_STATUS_IDS = new Set([19, 20, 21, 38]);

const normalizeStatusName = (value: string | undefined) => (value ?? '').trim().toLowerCase();

const isOpenForEnrollmentName = (value: string | undefined) => {
  const lower = normalizeStatusName(value);
  return lower.includes('open') && lower.includes('enroll');
};

const isInstructorVisibleStatusName = (value: string | undefined) => {
  const lower = normalizeStatusName(value);
  return (
    lower.includes('cancel') ||
    lower.includes('active') ||
    lower.includes('scheduled') ||
    lower.includes('complete') ||
    lower.includes('finish')
  );
};

const isAcceptedApplicationName = (value: string | undefined) => normalizeStatusName(value).includes('accept');

const premiumGlass = (theme: any) => ({
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
  boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.05)}`,
  borderRadius: 3,
});

// ----------------------------------------------------------------------

export function CoursesListView() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { courses } = useCoursesContext();
  const { user, hasRole } = useAuth();
  const { applications, createApplication } = useApplicationsContext();
  const { rounds, getRoundsByCourse } = useCourseRoundsContext();

  const [roundCountApplications, setRoundCountApplications] = useState<
    Array<{ courseRoundId: number; statusId?: number; status?: string }>
  >([]);

  useEffect(() => {
    let cancelled = false;

    const loadCounts = async () => {
      try {
        const items = await applicationApi.getApplications();
        if (cancelled) return;
        setRoundCountApplications(
          items.map((a) => ({ courseRoundId: a.courseRoundId, statusId: a.statusId, status: a.status }))
        );
      } catch {
        if (cancelled) return;
        setRoundCountApplications([]);
      }
    };

    loadCounts();

    return () => {
      cancelled = true;
    };
  }, []);

  const acceptedCountByRoundId = useMemo(() => {
    const map: Record<string, number> = {};
    roundCountApplications.forEach((a) => {
      if (typeof a.status === 'string' && a.status.trim() !== '') {
        if (!isAcceptedApplicationName(a.status)) return;
      } else if (a.statusId != null) {
        if (a.statusId !== 3) return;
      } else {
        return;
      }
      const key = String(a.courseRoundId);
      map[key] = (map[key] ?? 0) + 1;
    });
    return map;
  }, [roundCountApplications]);

  const isBlockedFromApplying = useMemo(() => {
    if (!hasRole('student')) return () => false;
    if (!user?.id) return () => false;

    return (roundId: number) =>
      applications.some((a) => 
        a.studentId === user.id && 
        String(a.courseRoundId) === String(roundId) && 
        (a.status === 'pending' || a.status === 'accepted' || a.status === 'payed')
      );
  }, [applications, hasRole, user?.id]);

  const allRoundCards = useMemo(() => {
    const items = rounds
      .map((round) => {
        const course = courses.find((c) => c.id === round.courseId);
        if (!course) return null;
        const price = round.price ?? course.price;
        return { round, course, price };
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x));

    return items;
  }, [courses, rounds]);

  const [minPrice, maxPrice] = useMemo(() => {
    if (!allRoundCards.length) return [0, 1000];
    const prices = allRoundCards.map((x) => x.price);
    return [Math.min(...prices), Math.max(...prices)];
  }, [allRoundCards]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid'); // Default to grid for better aesthetics
  const [priceRange, setPriceRange] = useState<[number, number]>([minPrice, maxPrice]);

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
  const [selectedRoundId, setSelectedRoundId] = useState<string>('');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [enrollmentErrors, setEnrollmentErrors] = useState<Record<string, string>>({});
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false);
  const [applicationStep, setApplicationStep] = useState(0);
  const [currentApplicationId, setCurrentApplicationId] = useState<string>('');

  const isRoundOpenToEnrollment = useCallback(
    (round: (typeof rounds)[number]) =>
      (typeof round.statusName === 'string' && round.statusName.trim() !== ''
        ? isOpenForEnrollmentName(round.statusName)
        : round.statusId != null
          ? round.statusId === STUDENT_VISIBLE_STATUS_ID
          : false),
    []
  );

  const isRoundVisibleForRole = useCallback(
    (round: (typeof rounds)[number]) => {
      if (hasRole('student')) {
        if (typeof round.statusName === 'string' && round.statusName.trim() !== '') {
          return isOpenForEnrollmentName(round.statusName);
        }
        return round.statusId != null ? round.statusId === STUDENT_VISIBLE_STATUS_ID : false;
      }

      if (hasRole('instructor')) {
        if (typeof round.statusName === 'string' && round.statusName.trim() !== '') {
          return isInstructorVisibleStatusName(round.statusName);
        }
        return round.statusId != null ? INSTRUCTOR_VISIBLE_STATUS_IDS.has(round.statusId) : false;
      }

      if (typeof round.statusName === 'string' && round.statusName.trim() !== '') {
        return isOpenForEnrollmentName(round.statusName);
      }
      return round.statusId != null ? round.statusId === STUDENT_VISIBLE_STATUS_ID : false;
    },
    [hasRole]
  );

  const selectedRound = useMemo(() => rounds.find((r) => String(r.id) === String(selectedRoundId)), [rounds, selectedRoundId]);

  const selectedRoundQuestions = useMemo(() => {
    if (!selectedRound) return [] as Array<{ index: number; text: string }>;
    const raw: Array<{ index: number; text: string | null | undefined }> = [
      { index: 1, text: selectedRound.question1 },
      { index: 2, text: selectedRound.question2 },
      { index: 3, text: selectedRound.question3 },
      { index: 4, text: selectedRound.question4 },
      { index: 5, text: selectedRound.question5 },
      { index: 6, text: selectedRound.question6 },
      { index: 7, text: selectedRound.question7 },
      { index: 8, text: selectedRound.question8 },
      { index: 9, text: selectedRound.question9 },
      { index: 10, text: selectedRound.question10 },
    ];
    return raw
      .filter((q) => typeof q.text === 'string' && q.text.trim() !== '')
      .map((q) => ({ index: q.index, text: q.text as string }));
  }, [selectedRound]);

  // Details dialog state
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [detailsCourse, setDetailsCourse] = useState<Course | null>(null);
  const [detailsWeeks, setDetailsWeeks] = useState<WeekDto[]>([]);
  const [detailsWeekTitles, setDetailsWeekTitles] = useState<string[]>([]);
  const [detailsRoundInstructorName, setDetailsRoundInstructorName] = useState<string>('');
  const [detailsSelectedRoundId, setDetailsSelectedRoundId] = useState<string>('');
  const [instructors, setInstructors] = useState<InstructorDto[]>([]);

  const isEnrolledInDetailsCourse = useMemo(() => {
    if (!hasRole('student')) return false;
    if (!user?.id) return false;
    if (!detailsSelectedRoundId) return false;
    return applications.some(
      (a) =>
        a.studentId === user.id &&
        String(a.courseRoundId) === String(detailsSelectedRoundId) &&
        (a.status === 'pending' || a.status === 'accepted')
    );
  }, [applications, detailsSelectedRoundId, hasRole, user?.id]);

  const detailsRoundId = useMemo(() => {
    if (!hasRole('student')) return undefined;
    if (!user?.id) return undefined;
    if (!detailsCourse?.id) return undefined;
    const accepted = applications.find((a) => a.studentId === user.id && a.courseId === detailsCourse.id && a.status === 'accepted');
    if (!accepted?.courseRoundId) return undefined;
    return String(accepted.courseRoundId);
  }, [applications, detailsCourse?.id, hasRole, user?.id]);

  const detailsAllRounds = useMemo(() => {
    if (!detailsCourse?.id) return [];
    return getRoundsByCourse(detailsCourse.id).filter((r) => isRoundVisibleForRole(r));
  }, [detailsCourse?.id, getRoundsByCourse, isRoundVisibleForRole]);

  const detailsSelectedRound = useMemo(
    () => detailsAllRounds.find((r) => String(r.id) === String(detailsSelectedRoundId)),
    [detailsAllRounds, detailsSelectedRoundId]
  );

  useEffect(() => {
    let cancelled = false;

    const loadRoundDetails = async () => {
      if (!detailsSelectedRoundId) {
        setDetailsWeekTitles([]);
        setDetailsRoundInstructorName('');
        return;
      }

      try {
        const dto = await courseRoundApi.getById(Number(detailsSelectedRoundId));
        if (cancelled) return;
        setDetailsWeekTitles(Array.isArray(dto.weekTitles) ? dto.weekTitles : []);
        setDetailsRoundInstructorName(typeof dto.instructorName === 'string' ? dto.instructorName : '');
      } catch {
        if (cancelled) return;
        setDetailsWeekTitles([]);
        setDetailsRoundInstructorName('');
      }
    };

    loadRoundDetails();
    return () => {
      cancelled = true;
    };
  }, [detailsSelectedRoundId]);

  useEffect(() => {
    if (detailsSelectedRoundId) return;
    const preferred = detailsRoundId || detailsAllRounds[0]?.id || '';
    setDetailsSelectedRoundId(preferred);
  }, [detailsAllRounds, detailsRoundId, detailsSelectedRoundId]);

  const detailsInstructorName = useMemo(() => {
    const fallback = detailsCourse?.instructor ?? '';
    if (fallback.trim()) return fallback;
    const id = detailsCourse?.instructorId;
    if (!id) return '';
    const inst = instructors.find((i) => String(i.id) === String(id));
    return inst?.fullNameEn ?? '';
  }, [detailsCourse?.instructor, detailsCourse?.instructorId, instructors]);

  useEffect(() => {
    let cancelled = false;

    const loadInstructors = async () => {
      try {
        const data = await accountApi.getInstructors();
        if (cancelled) return;
        setInstructors(data);
      } catch {
        if (cancelled) return;
        setInstructors([]);
      }
    };

    loadInstructors();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadWeeks = async () => {
      if (!detailsSelectedRoundId) {
        setDetailsWeeks([]);
        return;
      }

      if (detailsWeekTitles.length > 0) {
        setDetailsWeeks([]);
        return;
      }

      try {
        const ws = await weekApi.getByCourseRoundId(Number(detailsSelectedRoundId));
        if (cancelled) return;
        setDetailsWeeks(ws);
      } catch {
        if (cancelled) return;
        setDetailsWeeks([]);
      }
    };

    loadWeeks();
    return () => {
      cancelled = true;
    };
  }, [detailsSelectedRoundId, detailsWeekTitles.length]);

  const sampleSyllabus = [
    'Introduction to Programming Concepts',
    'Variables and Data Types',
    'Control Structures (if/else, loops)',
    'Functions and Methods',
    'Object-Oriented Programming',
    'File Handling and I/O',
    'Data Structures and Algorithms',
    'Database Fundamentals',
    'Web Development Basics',
    'Final Project and Assessment',
  ];

  const filteredRounds = useMemo(() => {
    let result = allRoundCards.filter((x) => isRoundVisibleForRole(x.round));

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        ({ course }) =>
          course.name.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query) ||
          course.category.toLowerCase().includes(query)
      );
    }

    if (selectedLevel !== 'all') {
      result = result.filter(({ course }) => course.level.toLowerCase() === selectedLevel.toLowerCase());
    }

    result = result.filter(({ price }) => price >= priceRange[0] && price <= priceRange[1]);

    if (sortBy === 'popular') {
      result.sort(
        (a, b) =>
          (acceptedCountByRoundId[String(b.round.id)] ?? 0) -
          (acceptedCountByRoundId[String(a.round.id)] ?? 0)
      );
    } else if (sortBy === 'trending') {
      result.sort(
        (a, b) =>
          new Date(b.round.startDate).getTime() - new Date(a.round.startDate).getTime()
      );
    } else if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.course.createdAt).getTime() - new Date(a.course.createdAt).getTime());
    }

    return result;
  }, [acceptedCountByRoundId, allRoundCards, isRoundVisibleForRole, priceRange, searchQuery, selectedLevel, sortBy]);

  const handleEnrollClick = (course: Course, roundId: string) => {
    if (!hasRole('student')) return;
    if (isBlockedFromApplying(Number(roundId))) return;
    setSelectedCourse(course);
    setSelectedRoundId(roundId);
    setEnrollmentDialogOpen(true);
    setEnrollmentErrors({});
    setEnrollmentSuccess(false);
    setApplicationStep(0);
    setCurrentApplicationId('');
    setAnswers({});
  };

  const existingAcceptedApplicationForSelectedRound = useMemo(() => {
    if (!hasRole('student')) return undefined;
    if (!user?.id) return undefined;
    if (!selectedRoundId) return undefined;
    return applications.find(
      (a) =>
        a.studentId === user.id &&
        String(a.courseRoundId) === String(selectedRoundId) &&
        (a.status === 'accepted' || a.status === 'payed')
    );
  }, [applications, hasRole, selectedRoundId, user?.id]);

  useEffect(() => {
    if (!enrollmentDialogOpen) return;
    if (!existingAcceptedApplicationForSelectedRound) return;

    setCurrentApplicationId(String(existingAcceptedApplicationForSelectedRound.id));
    setApplicationStep(existingAcceptedApplicationForSelectedRound.status === 'payed' ? 2 : 1);
  }, [enrollmentDialogOpen, existingAcceptedApplicationForSelectedRound]);

  const handleOpenDetails = (course: Course, roundId: string) => {
    setDetailsCourse(course);
    setDetailsSelectedRoundId(roundId);
    setDetailsDialogOpen(true);
  };
  const handleCloseDetails = () => {
    setDetailsDialogOpen(false);
    setDetailsCourse(null);
  };

  const handleAnswerChange = (index: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [index]: value }));
    const key = `answer${index}`;
    if (enrollmentErrors[key]) {
      setEnrollmentErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedLevel('all');
    setSortBy('popular');
    setPriceRange([minPrice, maxPrice]);
  };

  const validateEnrollmentForm = () => {
    const errors: Record<string, string> = {};

    if (!selectedRoundId) {
      errors.general = 'Invalid course round selected';
    }

    selectedRoundQuestions.forEach((q) => {
      const value = answers[q.index] ?? '';
      if (!value.trim()) {
        errors[`answer${q.index}`] = t('validation.required');
      }
    });

    return errors;
  };

  const handleEnrollmentSubmit = async () => {
    const errors = validateEnrollmentForm();

    if (Object.keys(errors).length > 0) {
      setEnrollmentErrors(errors);
      return;
    }

    if (!selectedCourse || !user || !selectedRoundId || !selectedRound) {
      setEnrollmentErrors({ general: t('messages.savingError') as string });
      return;
    }

    if (isBlockedFromApplying(Number(selectedRoundId))) {
      setEnrollmentErrors({ general: 'You are already enrolled in this course for the current round.' });
      return;
    }

    if (!isRoundOpenToEnrollment(selectedRound)) {
      setEnrollmentErrors({ general: 'This course round is not open for enrollment.' });
      return;
    }

    const roundId = Number(selectedRoundId);
    if (isNaN(roundId)) {
      setEnrollmentErrors({ general: 'Invalid round selected' });
      return;
    }

    const created = await createApplication({
      courseRoundId: roundId,
      studentId: user.id,
      courseId: selectedCourse.id,
      answer1: answers[1] ?? null,
      answer2: answers[2] ?? null,
      answer3: answers[3] ?? null,
      answer4: answers[4] ?? null,
      answer5: answers[5] ?? null,
      answer6: answers[6] ?? null,
      answer7: answers[7] ?? null,
      answer8: answers[8] ?? null,
      answer9: answers[9] ?? null,
      answer10: answers[10] ?? null,
      metadata: {
        courseName: selectedCourse.name,
        coursePrice: selectedRound.price ?? selectedCourse.price,
      },
    });

    handleEnrollmentDialogClose();
    window.location.href = `/payment/${created.id}`;
  };

  const handleEnrollmentDialogClose = () => {
    setEnrollmentDialogOpen(false);
    setSelectedRoundId('');
    setAnswers({});
    setEnrollmentErrors({});
    setEnrollmentSuccess(false);
    setApplicationStep(0);
    setCurrentApplicationId('');
  };

  // Removed unused openPayment callback
  const getInstructorNameById = useCallback(
    (id: string | undefined) => {
      if (!id) return '';
      const inst = instructors.find((i) => String(i.id) === String(id));
      if (inst?.fullNameEn) return inst.fullNameEn;
      return id;
    },
    [instructors]
  );

  const getInstructorNameByRoundId = useCallback(
    (roundId: string | undefined) => {
      if (!roundId) return '';
      const round = rounds.find((r) => String(r.id) === String(roundId));
      if (round?.createdByName) return round.createdByName;
      return getInstructorNameById(round?.createdBy);
    },
    [getInstructorNameById, rounds]
  );

  const getLevelColor = (level: string) => {
    switch(level) {
      case 'beginner': return { bg: theme.palette.success.light, color: theme.palette.success.darker };
      case 'intermediate': return { bg: theme.palette.warning.light, color: theme.palette.warning.darker };
      case 'advanced': return { bg: theme.palette.error.light, color: theme.palette.error.darker };
      default: return { bg: theme.palette.primary.light, color: theme.palette.primary.darker };
    }
  };

  const getEnrollmentButtonState = useCallback((roundId: number | string) => {
     const defaultState = {
         label: t('courses.enrollCourse'),
         disabled: false,
         action: 'enroll',
         url: '',
         icon: 'solar:cart-large-2-bold'
     };

     if (!hasRole('student')) return defaultState;
     if (!user?.id) return defaultState;

     const app = applications.find(a => 
         a.studentId === user.id && 
         String(a.courseRoundId) === String(roundId)
     );

     if (!app) return defaultState;

     if (app.status === 'payed') {
         return {
             label: 'Go to Course',
             disabled: false,
             action: 'goto-course',
             url: '/my-courses',
             icon: 'solar:play-circle-bold'
         };
     }

     if (app.status === 'accepted') {
         return {
             label: 'Complete Payment',
             disabled: false,
             action: 'payment',
             url: `/payment/${app.id}`,
             icon: 'solar:wallet-bold'
         };
     }

     if (app.status === 'pending') {
          return {
             label: 'Application Pending',
             disabled: true,
             action: 'none',
             url: '',
             icon: 'solar:clock-circle-bold'
          };
     }
     
     return { label: 'Enrolled', disabled: true, action: 'none', url: '', icon: 'solar:check-circle-bold' };
  }, [applications, hasRole, user?.id, t]);

  const handleEnrollmentAction = (e: any, state: any, course: any, roundId: any) => {
      e.stopPropagation();
      if (state.action === 'enroll') {
          handleEnrollClick(course, roundId);
      } else if (state.action === 'goto-course' || state.action === 'payment') {
          if (state.url) window.location.href = state.url;
      }
  };

  const renderCourseGridCard = (params: (typeof filteredRounds)[number]) => {
    const { course, round, price } = params;
    const levelColors = getLevelColor(course.level);
    const roundInstructorName = getInstructorNameById(round.createdBy) || course.instructor;
    const roundStudentsCount = acceptedCountByRoundId[String(round.id)] ?? 0;
    const canApply = hasRole('student') && isRoundOpenToEnrollment(round);
    
    const buttonState = getEnrollmentButtonState(round.id);

    return (
      <Card
        key={`${course.id}_${round.id}`}
        onClick={() => handleOpenDetails(course, round.id)}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'visible',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          ...premiumGlass(theme),
          '&:hover': {
            transform: 'translateY(-12px)',
            boxShadow: theme.shadows[20],
            '& .course-image': {
               transform: 'scale(1.08)',
            },
            '& .details-overlay': {
              opacity: 1,
            },
          },
        }}
      >
            {/* Course Image Placeholder */}
            <Box
              sx={{
                height: 240,
                borderRadius: 3,
                mx: 2,
                mt: 2,
                overflow: 'hidden',
                position: 'relative',
                boxShadow: theme.shadows[6],
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
                  transition: 'transform 0.6s ease',
                }}
              >
                <SvgColor src="/assets/icons/Iconly/Iconly/Curved/Outline/Category.svg" sx={{ width: 80, height: 80, color: theme.palette.primary.main, opacity: 0.8 }} />
                <Box sx={{ height: 4, width: 4, borderRadius: '50%', bgcolor: 'text.disabled', opacity: 0.5 }} />
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
              background: `linear-gradient(to top, ${alpha(theme.palette.common.black, 0.8)} 0%, ${alpha(theme.palette.common.black, 0.3)} 100%)`,
              opacity: 0,
              transition: 'opacity 0.4s ease',
            }}
          >
             <Button 
               variant="outlined" 
               color="inherit" 
               sx={{ 
                 color: 'white', 
                 borderColor: 'white', 
                 borderWidth: 2,
                 borderRadius: 30,
                 px: 3,
                 fontWeight: 800,
                 '&:hover': { bg: 'white', color: 'black', borderColor: 'white' }
               }}
             >
                VIEW DETAILS
             </Button>
          </Box>

          <Chip
            label={t(`courses.${course.level}`)}
            size="small"
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: alpha(levelColors.bg, 0.9),
              color: levelColors.color,
              fontWeight: 800,
              backdropFilter: 'blur(8px)',
              boxShadow: theme.shadows[2],
              borderRadius: 1
            }}
          />

          <Chip
            label={round.name}
            size="small"
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              bgcolor: alpha(theme.palette.info.main, 0.12),
              color: theme.palette.info.darker,
              fontWeight: 800,
              backdropFilter: 'blur(8px)',
              boxShadow: theme.shadows[2],
              borderRadius: 1,
            }}
          />
        </Box>

        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', pt: 3, pb: 3, px: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: alpha(theme.palette.info.main, 0.08), px: 1.25, py: 0.5, borderRadius: 1 }}>
              <Iconify icon="solar:users-group-rounded-bold" width={16} sx={{ color: 'info.main' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                {roundStudentsCount}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', ml: 0.5, fontWeight: 600 }}>
                {t('courses.students')}
              </Typography>
            </Box>
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, mt: 0.5, lineHeight: 1.3 }}>
            {course.name}
          </Typography>
          
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, flexGrow: 1, lineHeight: 1.6 }}>
            {course.description.substring(0, 90)}...
          </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ p: 0.8, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                    <Iconify icon="solar:user-bold" width={16} sx={{ color: 'primary.main' }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    {roundInstructorName}
                  </Typography>
                </Box>
                <Box sx={{ height: 4, width: 4, borderRadius: '50%', bgcolor: 'text.disabled', opacity: 0.5 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ p: 0.8, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                     <Iconify icon="solar:clock-circle-bold" width={16} sx={{ color: 'primary.main' }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    {course.duration}h
                  </Typography>
                </Box>
              </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto', pt: 2.5, borderTop: `1px dashed ${theme.palette.divider}` }}>
            <Box>
               <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>
                 {price} EGP
               </Typography>
            </Box>
              {hasRole('student') ? (
                <Button
                  variant="contained"
                  size="small"
                  endIcon={<Iconify icon={buttonState.icon} />}
                  onClick={(e) => handleEnrollmentAction(e, buttonState, course, round.id)}
                  disabled={buttonState.disabled || !canApply}
                  sx={{
                    borderRadius: 30,
                    px: 2.5,
                    py: 1,
                    boxShadow: buttonState.disabled ? 'none' : `0 8px 16px ${alpha(theme.palette.primary.main, 0.24)}`,
                    fontWeight: 700,
                  }}
                >
                  {buttonState.label}
                </Button>
              ) : null}
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderCourseListCard = (params: (typeof filteredRounds)[number]) => {
    const { course, round, price } = params;
    const levelColors = getLevelColor(course.level);
    const roundInstructorName = getInstructorNameById(round.createdBy) || course.instructor;
    const roundStudentsCount = acceptedCountByRoundId[String(round.id)] ?? 0;
    const canApply = hasRole('student') && isRoundOpenToEnrollment(round);
    
    const buttonState = getEnrollmentButtonState(round.id);

    return (
    <Card
      key={`${course.id}_${round.id}`}
      onClick={() => handleOpenDetails(course, round.id)}
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 3,
        p: 2.5,
        mb: 2,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        ...premiumGlass(theme),
        '&:hover': {
          transform: 'translateX(8px)',
          boxShadow: theme.shadows[14],
          borderColor: 'primary.main',
        },
      }}
    >
      {/* Course Image Placeholder */}
      <Box
        sx={{
          minWidth: { xs: '100%', sm: 240 },
          width: { xs: '100%', sm: 240 },
          height: 200,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.secondary.light, 0.1)} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <SvgColor src="/assets/icons/Iconly/Iconly/Curved/Outline/Category.svg" sx={{ width: 64, height: 64, color: 'primary.main', opacity: 0.5 }} />
        
        <Chip
          label={t(`courses.${course.level}`)}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            bgcolor: alpha(levelColors.bg, 0.9),
            color: levelColors.color,
            fontWeight: 800,
            backdropFilter: 'blur(8px)',
          }}
        />
      </Box>

      {/* Course Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', py: 1 }}>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Chip 
                  label={course.category} 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                  sx={{ mb: 1, fontWeight: 700, borderRadius: 1 }} 
              />
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                {course.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                 <Chip 
                   label={course.code}
                   size="small" 
                   sx={{ borderRadius: 1, height: 24, fontSize: '0.75rem', color: 'text.secondary', bgcolor: alpha(theme.palette.grey[500], 0.1) }} 
                 />
              </Box>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main', ml: 2 }}>
              {price} EGP
            </Typography>
          </Box>

          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, flexGrow: 1, lineHeight: 1.6 }}>
            {course.description.substring(0, 150)}...
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Iconify icon="solar:user-bold-duotone" width={20} sx={{ color: 'primary.main' }} />
              <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                {roundInstructorName}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Iconify icon="solar:users-group-rounded-bold-duotone" width={20} sx={{ color: 'info.main' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {roundStudentsCount} {t('courses.students')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Iconify icon="solar:clock-circle-bold-duotone" width={20} sx={{ color: 'warning.main' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {course.duration} hours
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
          {hasRole('student') ? (
            <Button
              variant="contained"
              size="small"
              endIcon={<Iconify icon={buttonState.icon} />}
              onClick={(e) => handleEnrollmentAction(e, buttonState, course, round.id)}
              disabled={buttonState.disabled || !canApply}
              sx={{ borderRadius: 30, px: 4, py: 1, fontWeight: 700, boxShadow: theme.shadows[4] }}
            >
              {buttonState.label}
            </Button>
          ) : null}
        </Box>
      </Box>
    </Card>
    );
  };

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        {/* Glassmorphism Header */}
        {/* Premium Header */}
        <Box
          sx={{
            mb: 5,
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.8s ease-out',
          }}
        >
           {/* Background Mesh Gradient */}
           <Box sx={{
              position: 'absolute',
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0,
              background: `radial-gradient(at 0% 0%, ${alpha(theme.palette.secondary.dark, 0.8)} 0px, transparent 50%),
                           radial-gradient(at 100% 0%, ${alpha(theme.palette.primary.main, 0.9)} 0px, transparent 50%),
                           radial-gradient(at 100% 100%, ${alpha(theme.palette.info.main, 0.8)} 0px, transparent 50%),
                           radial-gradient(at 0% 100%, ${alpha(theme.palette.success.dark, 0.5)} 0px, transparent 50%),
                           linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)`, 
              zIndex: 0
           }} />

           <Box sx={{ position: 'relative', zIndex: 1, textAlign: { xs: 'center', md: 'left' } }}>
             <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, color: 'white', textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                {t('courses.availableCourses')}
             </Typography>
             <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 600, color: 'white', fontWeight: 500, mx: { xs: 'auto', md: 0 } }}>
               Explore our comprehensive catalog of courses designed to help you master new skills and advance your career.
             </Typography>
           </Box>
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
              ...premiumGlass(theme),
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

            {/* Level Filter */}
            <FormControl size="medium" sx={{ minWidth: 140 }}>
              <Select
                value={selectedLevel}
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
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                sx={{ borderRadius: 1.5 }}
              >
                <MenuItem value="popular">{t('courses.popular') || 'Popular'}</MenuItem>
                <MenuItem value="trending">{t('common.trending') || 'Trending'}</MenuItem>
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

          {/* Row 2: Price Range */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              p: 2.5,
              ...premiumGlass(theme),
            }}
          >
            {/* Price Range Slider */}
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 3 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                {t('courses.priceRange')}: <strong>0 EGP - {priceRange[1]} EGP</strong>
              </Typography>
              <Slider
                value={priceRange}
                onChange={(event, newValue) => setPriceRange(newValue as [number, number])}
                valueLabelDisplay="auto"
                min={0}
                max={maxPrice}
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
           Found {filteredRounds.length} rounds
        </Typography>

        {/* Active Filters Chips */}
        {(searchQuery || selectedLevel !== 'all' || priceRange[0] !== minPrice || priceRange[1] !== maxPrice || sortBy !== 'popular') && (
          <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            {searchQuery && (
              <Chip label={`Search: ${searchQuery}`} onDelete={() => setSearchQuery('')} />
            )}
            {selectedLevel !== 'all' && (
              <Chip label={`Level: ${selectedLevel}`} onDelete={() => setSelectedLevel('all')} />
            )}
            {(priceRange[0] !== minPrice || priceRange[1] !== maxPrice) && (
              <Chip label={`Price: ${priceRange[0]} EGP - ${priceRange[1]} EGP`} onDelete={() => setPriceRange([minPrice, maxPrice])} />
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

        </Box>

        {/* Courses Display */}
        {filteredRounds.length === 0 ? (
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
            {filteredRounds.map((row) => renderCourseListCard(row))}
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)', xl: 'repeat(4, 1fr)' }, gap: 3 }}>
            {filteredRounds.map((row) => (
              <Box key={`${row.course.id}_${row.round.id}`}>
                {renderCourseGridCard(row)}
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
            Advanced Application
            <Typography variant="subtitle2" color="primary.main" sx={{ mt: 0.5 }}>
              {selectedCourse?.name}
            </Typography>
          </DialogTitle>

          <DialogContent sx={{ pt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField label="Student name" value={user?.name ?? ''} disabled fullWidth />
                <TextField label="Student email" value={user?.email ?? ''} disabled fullWidth />
                <TextField label="Student phone" value={user?.phone ?? ''} disabled fullWidth />
                <TextField label="Course round" value={selectedRound?.name ?? ''} disabled fullWidth />
              </Box>

              {!selectedRound || !isRoundOpenToEnrollment(selectedRound) ? (
                <Alert severity="info">This course round is not open for enrollment.</Alert>
              ) : null}

              {selectedRoundQuestions.map((q) => {
                const key = `answer${q.index}`;
                return (
                  <TextField
                    key={key}
                    fullWidth
                    label={q.text}
                    value={answers[q.index] ?? ''}
                    onChange={(e) => handleAnswerChange(q.index, e.target.value)}
                    error={!!enrollmentErrors[key]}
                    helperText={enrollmentErrors[key]}
                    disabled={!selectedRound || !isRoundOpenToEnrollment(selectedRound)}
                    multiline
                    minRows={2}
                  />
                );
              })}

              {enrollmentErrors.general && <Alert severity="error">{enrollmentErrors.general}</Alert>}
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleEnrollmentDialogClose} variant="outlined">
              {t('common.cancel')}
            </Button>

            <Button
              variant="contained"
              onClick={handleEnrollmentSubmit}
              disabled={!selectedRound || !isRoundOpenToEnrollment(selectedRound)}
              startIcon={<SvgColor src="/assets/icons/Iconly/Iconly/Curved/Outline/Tick Square.svg" />}
            >
              {t('courses.enrollCourse')}
            </Button>
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
                p: { xs: 3, md: 4 },
                position: 'relative',
                overflow: 'hidden',
                ...premiumGlass(theme),
                border: 'none',
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { md: 'center' },
                justifyContent: 'space-between',
                gap: 3,
              }}
            >
               {/* Background Gradient */}
               <Box sx={{
                  position: 'absolute',
                  top: 0, 
                  left: 0, 
                  right: 0, 
                  bottom: 0,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.secondary.light, 0.1)} 100%)`, 
                  zIndex: -1
               }} />

              <Box>
                <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: 1 }}>
                  INSTRUCTOR: {detailsRoundInstructorName || getInstructorNameByRoundId(detailsSelectedRoundId) || detailsInstructorName || '—'}
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, mb: 1.5, mt: 0.5 }}>
                  {detailsCourse?.name}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    size="small" 
                    label={t(`courses.${detailsCourse?.level || 'beginner'}`)} 
                    color="primary"
                    variant="filled"
                    sx={{ fontWeight: 700, borderRadius: 1 }}
                  />
                  <Chip 
                    size="small" 
                    variant="outlined" 
                    label={detailsCourse?.code} 
                    sx={{ fontWeight: 600, borderColor: 'text.secondary', color: 'text.secondary', borderRadius: 1 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Iconify icon="solar:users-group-rounded-bold" width={20} sx={{ color: 'info.main' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {acceptedCountByRoundId[String(detailsSelectedRoundId)] ?? 0} students
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Iconify icon="solar:clock-circle-bold" width={20} sx={{ color: 'success.main' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{detailsCourse?.duration}h</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ textAlign: { xs: 'left', md: 'right' }, minWidth: 200 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, color: 'primary.main', mb: 2 }}>
                  {(detailsSelectedRound?.price ?? detailsCourse?.price) ?? 0} EGP
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={(e) => {
                     const btnState = getEnrollmentButtonState(detailsSelectedRoundId);
                     if (detailsCourse) handleEnrollmentAction(e, btnState, detailsCourse, detailsSelectedRoundId);
                     if (btnState.action === 'enroll') handleCloseDetails();
                  }}
                  disabled={getEnrollmentButtonState(detailsSelectedRoundId).disabled}
                  startIcon={<Iconify icon={getEnrollmentButtonState(detailsSelectedRoundId).icon} />}
                  sx={{ 
                      borderRadius: 30, 
                      px: 4, 
                      py: 1.5, 
                      fontWeight: 800,
                      boxShadow: theme.shadows[8]
                  }}
                >
                  {getEnrollmentButtonState(detailsSelectedRoundId).label}
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

            <Box sx={{ mb: 3 }}>
              {detailsSelectedRound ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    {detailsSelectedRound.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {detailsSelectedRound.startDate} — {detailsSelectedRound.endDate}
                  </Typography>
                </Box>
              ) : null}
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                    What you&apos;ll learn
                  </Typography>
                  <Box component="ul" sx={{ pl: 2.5, m: 0, typography: 'body2', color: 'text.secondary', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {(
                      detailsWeekTitles.length > 0
                        ? detailsWeekTitles
                        : detailsWeeks.length > 0
                          ? detailsWeeks.map((w) => w.weekTitle ?? w.title ?? '').filter((x) => x.trim() !== '')
                          : sampleSyllabus
                    ).map((topic, i) => (
                      <li key={i}>{topic}</li>
                    ))}
                  </Box>
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Course details</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2"><strong>Instructor:</strong> {detailsRoundInstructorName || getInstructorNameByRoundId(detailsSelectedRoundId) || detailsInstructorName || '—'}</Typography>
                    <Typography variant="body2"><strong>Duration:</strong> {detailsCourse?.duration}h</Typography>
                    <Typography variant="body2"><strong>Students:</strong> {acceptedCountByRoundId[String(detailsSelectedRoundId)] ?? 0}</Typography>
                    <Typography variant="body2"><strong>Price:</strong> {(detailsSelectedRound?.price ?? detailsCourse?.price) ?? 0} EGP</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDetails}>Close</Button>
            <Button
              variant="contained"
              disabled={getEnrollmentButtonState(detailsSelectedRoundId).disabled}
              onClick={(e) => {
                const btnState = getEnrollmentButtonState(detailsSelectedRoundId);
                if (detailsCourse) handleEnrollmentAction(e, btnState, detailsCourse, detailsSelectedRoundId);
                if (btnState.action === 'enroll') handleCloseDetails();
              }}
            >
              {getEnrollmentButtonState(detailsSelectedRoundId).label}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardContent>
  );
}
