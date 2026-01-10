import type { Lesson, CourseModule } from 'src/types/course';
import type { Assignment, CourseMaterial } from 'src/types/user';
import type { MaterialDto } from 'src/api/models/material';
import type { ZoomMeetingDto } from 'src/api/models/zoom-meeting';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { alpha, useTheme } from '@mui/material/styles';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import LinearProgress from '@mui/material/LinearProgress';

import { courseApi, materialApi, zoomMeetingApi } from 'src/api';
import { DashboardContent } from 'src/layouts/dashboard';
import { useAuth } from 'src/contexts/simple-auth-context';
import { useCoursesContext } from 'src/contexts/courses-context';
import { mapCourseDtoToCourse } from 'src/api/mappers/course.mapper';
import { useApplicationsContext } from 'src/contexts/applications-context';
import { useCourseRoundsContext } from 'src/contexts/course-rounds-context';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
type CourseRoomViewProps = {
  courseId: string;
};

const courseContentStorageKey = (courseId: string) => `course_content_modules_v1_${courseId}`;

const safeParseModules = (raw: string | null): CourseModule[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as CourseModule[]) : [];
  } catch {
    return [];
  }
};

// Enhanced mock course data
const mockCourse = {
  id: '1',
  title: 'Introduction to Programming',
  description: 'Learn the fundamentals of programming with Python. This comprehensive course covers variables, functions, loops, and object-oriented programming concepts.',
  instructor: 'Dr. Smith',
  instructorId: 'inst_1',
  duration: '12 weeks',
  level: 'Beginner',
  language: 'English',
  price: 299,
  students: 25,
  rating: 4.8,
  totalLessons: 24,
  completedLessons: 8,
  nextClass: new Date('2024-01-25T14:00:00'),
  zoomLink: 'https://zoom.us/j/123456789?pwd=abcd1234',
  syllabus: [
    'Introduction to Programming Concepts',
    'Variables and Data Types',
    'Control Structures (if/else, loops)',
    'Functions and Methods',
    'Object-Oriented Programming',
    'File Handling and I/O',
    'Error Handling and Debugging',
    'Final Project Development'
  ],
};

// Mock materials
const mockMaterials: CourseMaterial[] = [
  {
    id: 'mat_1',
    courseId: '1',
    title: 'Course Introduction Video',
    description: 'Welcome to the course! This video covers what you will learn.',
    type: 'video',
    url: 'https://example.com/video1.mp4',
    uploadedBy: 'inst_1',
    uploadedAt: new Date('2024-01-15'),
    isVisible: true,
  },
  {
    id: 'mat_2',
    courseId: '1',
    title: 'Python Basics PDF',
    description: 'Comprehensive guide to Python syntax and basic concepts.',
    type: 'pdf',
    url: 'https://example.com/python-basics.pdf',
    uploadedBy: 'inst_1',
    uploadedAt: new Date('2024-01-16'),
    isVisible: true,
  },
  {
    id: 'mat_3',
    courseId: '1',
    title: 'Live Coding Session',
    description: 'Join us for live coding every Tuesday at 2 PM EST',
    type: 'zoom',
    url: 'https://zoom.us/j/123456789',
    uploadedBy: 'inst_1',
    uploadedAt: new Date('2024-01-17'),
    isVisible: true,
  },
];

// Mock assignments
const mockAssignments: Assignment[] = [
  {
    id: 'assign_1',
    courseId: '1',
    title: 'Hello World Program',
    description: 'Create your first Python program that prints "Hello, World!" to the console.',
    dueDate: new Date('2024-02-01'),
    maxPoints: 10,
    createdBy: 'inst_1',
    createdAt: new Date('2024-01-18'),
    isVisible: true,
  },
  {
    id: 'assign_2',
    courseId: '1',
    title: 'Variables and Data Types',
    description: 'Write a program demonstrating different data types in Python.',
    dueDate: new Date('2024-02-08'),
    maxPoints: 20,
    createdBy: 'inst_1',
    createdAt: new Date('2024-01-20'),
    isVisible: true,
  },
];



const getMaterialIcon = (type: string) => {
  const lower = type.toLowerCase();
  switch (type) {
    case 'video':
      return 'solar:videocamera-record-bold-duotone';
    case 'pdf':
      return 'solar:document-text-bold-duotone';
    case 'zoom':
      return 'solar:videocamera-bold-duotone';
    case 'link':
      return 'solar:link-bold-duotone';
    default:
      if (lower.includes('video')) return 'solar:videocamera-record-bold-duotone';
      if (lower.includes('pdf')) return 'solar:document-text-bold-duotone';
      if (lower.includes('zoom')) return 'solar:videocamera-bold-duotone';
      if (lower.includes('link')) return 'solar:link-bold-duotone';
      return 'solar:file-bold-duotone';
  }
};

export function CourseRoomView({ courseId }: CourseRoomViewProps) {
  const { user, hasRole } = useAuth();
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState(0);

  const [searchParams] = useSearchParams();
  const roundIdFromQuery = useMemo(() => searchParams.get('roundId') ?? '', [searchParams]);

  const { getRoundForStudent, getRoundsByCourse } = useCourseRoundsContext();
  const { getApplicationsByStudent, isLoading: applicationsLoading } = useApplicationsContext();
  const assignedRound = useMemo(() => {
    if (!hasRole('student')) return undefined;
    if (!user?.id) return undefined;
    return getRoundForStudent(courseId, user.id);
  }, [courseId, getRoundForStudent, hasRole, user?.id]);

  const isAcceptedStudent = useMemo(() => {
    if (!hasRole('student')) return false;
    if (!user?.id) return false;
    if (applicationsLoading) return false;
    return getApplicationsByStudent(user.id).some((a) => a.courseId === courseId && a.status === 'accepted');
  }, [applicationsLoading, courseId, getApplicationsByStudent, hasRole, user?.id]);

  const roundsCount = useMemo(() => getRoundsByCourse(courseId).length, [courseId, getRoundsByCourse]);

  const roundsForCourse = useMemo(() => getRoundsByCourse(courseId), [courseId, getRoundsByCourse]);
  const [selectedRoundId, setSelectedRoundId] = useState<string>('');

  useEffect(() => {
    if (!hasRole('instructor')) return;
    if (roundsForCourse.length === 0) return;
    if (roundIdFromQuery && roundsForCourse.some((r) => r.id === roundIdFromQuery)) {
      if (selectedRoundId !== roundIdFromQuery) setSelectedRoundId(roundIdFromQuery);
      return;
    }
    if (selectedRoundId) return;
    setSelectedRoundId(roundsForCourse[0].id);
  }, [hasRole, roundIdFromQuery, roundsForCourse, selectedRoundId]);

  const activeRoundId = useMemo(() => {
    if (hasRole('student')) return assignedRound?.id;
    if (hasRole('instructor')) return selectedRoundId || roundsForCourse[0]?.id;
    return undefined;
  }, [assignedRound?.id, hasRole, roundsForCourse, selectedRoundId]);

  const activeRound = useMemo(
    () => (activeRoundId ? roundsForCourse.find((r) => r.id === activeRoundId) : undefined),
    [activeRoundId, roundsForCourse]
  );

  const { courses } = useCoursesContext();
  const courseFromContext = useMemo(() => courses.find((c) => c.id === courseId), [courses, courseId]);
  const [courseFromApi, setCourseFromApi] = useState<ReturnType<typeof mapCourseDtoToCourse> | null>(null);
  const [courseLoading, setCourseLoading] = useState(false);

  useEffect(() => {
    let isActive = true;

    if (!courseId || courseFromContext) {
      setCourseFromApi(null);
      setCourseLoading(false);
      return () => {
        isActive = false;
      };
    }

    setCourseLoading(true);
    courseApi
      .getCourseById(courseId)
      .then((dto) => mapCourseDtoToCourse(dto))
      .then((mapped) => {
        if (isActive) setCourseFromApi(mapped);
      })
      .catch(() => {
        if (isActive) setCourseFromApi(null);
      })
      .finally(() => {
        if (isActive) setCourseLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [courseFromContext, courseId]);

  const resolvedCourse = courseFromContext ?? courseFromApi;

  const instructorHasAccess = useMemo(() => {
    if (!hasRole('instructor')) return true;
    if (!user?.id) return false;
    const ownsCourse = resolvedCourse?.instructorId === user.id;
    const ownsAnyRoundInCourse = roundsForCourse.some((r) => r.createdBy === user.id);
    return ownsCourse || ownsAnyRoundInCourse;
  }, [hasRole, resolvedCourse?.instructorId, roundsForCourse, user?.id]);

  const displayCourse = useMemo(
    () => ({
      id: courseId,
      title: resolvedCourse?.name ?? mockCourse.title,
      description: resolvedCourse?.description ?? mockCourse.description,
      instructor: resolvedCourse?.instructor ?? mockCourse.instructor,
      instructorId: resolvedCourse?.instructorId ?? mockCourse.instructorId,
      duration: resolvedCourse ? `${resolvedCourse.duration} hours` : mockCourse.duration,
      level: resolvedCourse ? `${resolvedCourse.level.charAt(0).toUpperCase()}${resolvedCourse.level.slice(1)}` : mockCourse.level,
      language: mockCourse.language,
      price: resolvedCourse?.price ?? mockCourse.price,
      students: resolvedCourse?.students ?? mockCourse.students,
      rating: resolvedCourse?.rating ?? mockCourse.rating,
      totalLessons: mockCourse.totalLessons,
      completedLessons: mockCourse.completedLessons,
      nextClass: mockCourse.nextClass,
      zoomLink: mockCourse.zoomLink,
      syllabus: mockCourse.syllabus,
    }),
    [courseId, resolvedCourse]
  );

  const [materials, setMaterials] = useState<MaterialDto[]>([]);
  const [zoomMeetings, setZoomMeetings] = useState<ZoomMeetingDto[]>([]);
  const [roundDataError, setRoundDataError] = useState<string>('');

  const assignments = useMemo(() => mockAssignments.map((a) => ({ ...a, courseId })), [courseId]);

  useEffect(() => {
    if (!activeRoundId) {
      setMaterials([]);
      setZoomMeetings([]);
      setRoundDataError('');
      return;
    }

    let cancelled = false;
    setRoundDataError('');

    Promise.all([
      materialApi.getByCourseRoundId(Number(activeRoundId)),
      zoomMeetingApi.getByCourseRoundId(Number(activeRoundId)),
    ])
      .then(([mats, zooms]) => {
        if (cancelled) return;
        setMaterials(mats);
        setZoomMeetings(zooms);
      })
      .catch((error: any) => {
        if (cancelled) return;
        setMaterials([]);
        setZoomMeetings([]);
        setRoundDataError(error?.message || 'Failed to load round materials/zoom meetings');
      });

    return () => {
      cancelled = true;
    };
  }, [activeRoundId]);

  const [materialDialogOpen, setMaterialDialogOpen] = useState(false);
  const [zoomDialogOpen, setZoomDialogOpen] = useState(false);

  const [materialForm, setMaterialForm] = useState({ title: '', description: '', link: '', materialType: 'link' });
  const [zoomForm, setZoomForm] = useState({
    topic: '',
    description: '',
    meetingLink: '',
    meetingId: '',
    passcode: '',
    meetingDateTime: new Date().toISOString().slice(0, 16),
    durationMinutes: 60,
  });

  const reloadRoundData = useCallback(async () => {
    if (!activeRoundId) return;
    setRoundDataError('');
    try {
      const [mats, zooms] = await Promise.all([
        materialApi.getByCourseRoundId(Number(activeRoundId)),
        zoomMeetingApi.getByCourseRoundId(Number(activeRoundId)),
      ]);
      setMaterials(mats);
      setZoomMeetings(zooms);
    } catch (error: any) {
      setRoundDataError(error?.message || 'Failed to load round materials/zoom meetings');
    }
  }, [activeRoundId]);

  const handleCreateMaterial = useCallback(async () => {
    if (!activeRoundId) return;
    if (!materialForm.title.trim() || !materialForm.link.trim()) return;
    try {
      await materialApi.create({
        courseRoundId: Number(activeRoundId),
        title: materialForm.title.trim(),
        description: materialForm.description.trim() || undefined,
        link: materialForm.link.trim(),
        materialType: materialForm.materialType,
      });
      setMaterialDialogOpen(false);
      setMaterialForm({ title: '', description: '', link: '', materialType: 'link' });
      await reloadRoundData();
    } catch (error: any) {
      setRoundDataError(error?.message || 'Failed to upload material');
    }
  }, [activeRoundId, materialForm, reloadRoundData]);

  const handleDeleteMaterial = useCallback(
    async (id: number) => {
      if (!confirm('Delete this material?')) return;
      try {
        await materialApi.delete(id);
        await reloadRoundData();
      } catch (error: any) {
        setRoundDataError(error?.message || 'Failed to delete material');
      }
    },
    [reloadRoundData]
  );

  const handleCreateZoomMeeting = useCallback(async () => {
    if (!activeRoundId) return;
    if (!zoomForm.topic.trim() || !zoomForm.meetingLink.trim()) return;
    try {
      await zoomMeetingApi.create({
        courseRoundId: Number(activeRoundId),
        topic: zoomForm.topic.trim(),
        description: zoomForm.description.trim() || undefined,
        meetingLink: zoomForm.meetingLink.trim(),
        meetingId: zoomForm.meetingId.trim() || undefined,
        passcode: zoomForm.passcode.trim() || undefined,
        meetingDateTime: new Date(zoomForm.meetingDateTime).toISOString(),
        durationMinutes: Number(zoomForm.durationMinutes) || 60,
      });
      setZoomDialogOpen(false);
      setZoomForm({
        topic: '',
        description: '',
        meetingLink: '',
        meetingId: '',
        passcode: '',
        meetingDateTime: new Date().toISOString().slice(0, 16),
        durationMinutes: 60,
      });
      await reloadRoundData();
    } catch (error: any) {
      setRoundDataError(error?.message || 'Failed to add zoom meeting');
    }
  }, [activeRoundId, reloadRoundData, zoomForm]);

  const handleDeleteZoomMeeting = useCallback(
    async (id: number) => {
      if (!confirm('Delete this zoom meeting?')) return;
      try {
        await zoomMeetingApi.delete(id);
        await reloadRoundData();
      } catch (error: any) {
        setRoundDataError(error?.message || 'Failed to delete zoom meeting');
      }
    },
    [reloadRoundData]
  );

  const nextZoomMeeting = useMemo(() => {
    const now = Date.now();
    const upcoming = zoomMeetings
      .map((m) => ({ m, t: new Date(m.meetingDateTime).getTime() }))
      .filter((x) => Number.isFinite(x.t) && x.t >= now)
      .sort((a, b) => a.t - b.t);
    return upcoming[0]?.m;
  }, [zoomMeetings]);

  // Simple content management state (Weeks/Modules & Lessons)
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [newWeekTitle, setNewWeekTitle] = useState('');
  const [newWeekDescription, setNewWeekDescription] = useState('');
  const [addWeekDialog, setAddWeekDialog] = useState(false);
  const [addLessonDialog, setAddLessonDialog] = useState<{ open: boolean; moduleId?: string }>({ open: false });
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonDescription, setNewLessonDescription] = useState('');

  const [editWeekDialog, setEditWeekDialog] = useState<{ open: boolean; moduleId?: string }>({ open: false });
  const [editWeekTitle, setEditWeekTitle] = useState('');
  const [editWeekDescription, setEditWeekDescription] = useState('');

  const [deleteWeekDialog, setDeleteWeekDialog] = useState<{ open: boolean; moduleId?: string }>({ open: false });

  const [editLessonDialog, setEditLessonDialog] = useState<{ open: boolean; moduleId?: string; lessonId?: string }>({ open: false });
  const [editLessonTitle, setEditLessonTitle] = useState('');
  const [editLessonDescription, setEditLessonDescription] = useState('');
  const [editLessonDuration, setEditLessonDuration] = useState<number>(30);
  const [editLessonContent, setEditLessonContent] = useState('');

  const [deleteLessonDialog, setDeleteLessonDialog] = useState<{ open: boolean; moduleId?: string; lessonId?: string }>({ open: false });

  useEffect(() => {
    const stored = safeParseModules(localStorage.getItem(courseContentStorageKey(courseId)));
    if (stored.length > 0) {
      setModules(stored);
      return;
    }

    const apiModules = resolvedCourse?.content?.modules;
    if (Array.isArray(apiModules) && apiModules.length > 0) {
      setModules(apiModules);
    }
  }, [courseId, resolvedCourse?.content?.modules]);

  useEffect(() => {
    localStorage.setItem(courseContentStorageKey(courseId), JSON.stringify(modules));
  }, [courseId, modules]);

  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  }, []);

  const handleSubmitAssignment = useCallback((assignment: Assignment) => {
    // setSelectedAssignment(assignment);
    // setSubmissionDialog(true);
  }, []);



  const tabs = [
    { label: 'Overview', value: 0, icon: 'solar:info-circle-bold-duotone' },
    { label: 'Materials', value: 1, icon: 'solar:folder-with-files-bold-duotone' },
    { label: 'Assignments', value: 2, icon: 'solar:documents-minimalistic-bold-duotone' },
    { label: 'Zoom Sessions', value: 3, icon: 'solar:videocamera-bold-duotone' },
    { label: 'Grades', value: 4, icon: 'solar:diploma-bold-duotone' },
    { label: 'Curriculum', value: 5, icon: 'solar:checklist-minimalistic-bold-duotone' },
    ...(hasRole('instructor') ? [{ label: 'Edit Content', value: 6, icon: 'solar:pen-new-square-bold-duotone' }] : []),
  ];

  const handleAddWeek = useCallback(() => {
    setNewWeekTitle('');
    setNewWeekDescription('');
    setAddWeekDialog(true);
  }, []);

  const saveNewWeek = useCallback(() => {
    if (!newWeekTitle.trim()) return;
    const newModule: CourseModule = {
      id: `mod_${Date.now()}`,
      title: newWeekTitle.trim(),
      description: newWeekDescription.trim(),
      lessons: [],
      assignments: [],
    };
    setModules((prev) => [...prev, newModule]);
    setAddWeekDialog(false);
  }, [newWeekTitle, newWeekDescription]);

  const handleAddLesson = useCallback((moduleId: string) => {
    setAddLessonDialog({ open: true, moduleId });
    setNewLessonTitle('');
    setNewLessonDescription('');
  }, []);

  const handleEditWeek = useCallback((module: CourseModule) => {
    setEditWeekDialog({ open: true, moduleId: module.id });
    setEditWeekTitle(module.title);
    setEditWeekDescription(module.description);
  }, []);

  const saveEditedWeek = useCallback(() => {
    if (!editWeekDialog.moduleId) return;
    if (!editWeekTitle.trim()) return;

    setModules((prev) =>
      prev.map((m) =>
        m.id === editWeekDialog.moduleId
          ? { ...m, title: editWeekTitle.trim(), description: editWeekDescription.trim() }
          : m
      )
    );
    setEditWeekDialog({ open: false });
  }, [editWeekDescription, editWeekDialog.moduleId, editWeekTitle]);

  const handleDeleteWeek = useCallback((moduleId: string) => {
    setDeleteWeekDialog({ open: true, moduleId });
  }, []);

  const confirmDeleteWeek = useCallback(() => {
    if (!deleteWeekDialog.moduleId) return;
    setModules((prev) => prev.filter((m) => m.id !== deleteWeekDialog.moduleId));
    setDeleteWeekDialog({ open: false });
  }, [deleteWeekDialog.moduleId]);

  const handleEditLesson = useCallback((moduleId: string, lesson: Lesson) => {
    setEditLessonDialog({ open: true, moduleId, lessonId: lesson.id });
    setEditLessonTitle(lesson.title);
    setEditLessonDescription(lesson.description);
    setEditLessonDuration(lesson.duration);
    setEditLessonContent(lesson.content);
  }, []);

  const saveEditedLesson = useCallback(() => {
    if (!editLessonDialog.moduleId || !editLessonDialog.lessonId) return;
    if (!editLessonTitle.trim()) return;

    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== editLessonDialog.moduleId) return m;
        return {
          ...m,
          lessons: m.lessons.map((l) =>
            l.id === editLessonDialog.lessonId
              ? {
                  ...l,
                  title: editLessonTitle.trim(),
                  description: editLessonDescription.trim(),
                  duration: Number.isFinite(editLessonDuration) ? editLessonDuration : l.duration,
                  content: editLessonContent,
                }
              : l
          ),
        };
      })
    );

    setEditLessonDialog({ open: false });
  }, [editLessonContent, editLessonDescription, editLessonDialog.lessonId, editLessonDialog.moduleId, editLessonDuration, editLessonTitle]);

  const handleDeleteLesson = useCallback((moduleId: string, lessonId: string) => {
    setDeleteLessonDialog({ open: true, moduleId, lessonId });
  }, []);

  const confirmDeleteLesson = useCallback(() => {
    if (!deleteLessonDialog.moduleId || !deleteLessonDialog.lessonId) return;

    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== deleteLessonDialog.moduleId) return m;
        const nextLessons = m.lessons
          .filter((l) => l.id !== deleteLessonDialog.lessonId)
          .map((l, idx) => ({ ...l, order: idx + 1 }));

        return { ...m, lessons: nextLessons };
      })
    );

    setDeleteLessonDialog({ open: false });
  }, [deleteLessonDialog.lessonId, deleteLessonDialog.moduleId]);

  const saveNewLesson = useCallback(() => {
    if (!addLessonDialog.moduleId || !newLessonTitle.trim()) return;
    setModules((prev) =>
      prev.map((m) =>
        m.id === addLessonDialog.moduleId
          ? {
              ...m,
              lessons: [
                ...m.lessons,
                {
                  id: `les_${Date.now()}`,
                  title: newLessonTitle.trim(),
                  description: newLessonDescription.trim(),
                  content: '',
                  duration: 30,
                  order: m.lessons.length + 1,
                } as Lesson,
              ],
            }
          : m
      )
    );
    setAddLessonDialog({ open: false });
  }, [addLessonDialog.moduleId, newLessonTitle, newLessonDescription]);

  if (hasRole('student') && user?.id && !assignedRound) {
    if (applicationsLoading) {
      return (
        <DashboardContent>
          <Container maxWidth="xl">
            <Card sx={{ p: 4, mt: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                Loading...
              </Typography>
              <LinearProgress />
            </Card>
          </Container>
        </DashboardContent>
      );
    }

    if (!isAcceptedStudent) {
      return (
        <DashboardContent>
          <Container maxWidth="xl">
            <Card sx={{ p: 4, mt: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                You do not have access to this course
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Please apply for the course and wait for admin acceptance.
              </Typography>
              <Button variant="contained" href="/courses" sx={{ borderRadius: 30 }}>
                Browse Courses
              </Button>
            </Card>
          </Container>
        </DashboardContent>
      );
    }

    return (
      <DashboardContent>
        <Container maxWidth="xl">
          <Card sx={{ p: 4, mt: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
              You are not assigned to a round yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              The admin has accepted your application. Please wait until the instructor creates a round and assigns you.
            </Typography>
            <Button variant="contained" href="/my-courses" sx={{ borderRadius: 30 }}>
              Back to My Courses
            </Button>
          </Card>
        </Container>
      </DashboardContent>
    );
  }

  if (hasRole('instructor') && courseLoading) {
    return (
      <DashboardContent>
        <Container maxWidth="xl">
          <Card sx={{ p: 4, mt: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
              Loading...
            </Typography>
            <LinearProgress />
          </Card>
        </Container>
      </DashboardContent>
    );
  }

  if (hasRole('instructor') && !instructorHasAccess) {
    return (
      <DashboardContent>
        <Container maxWidth="xl">
          <Card sx={{ p: 4, mt: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
              You do not have access to this course
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              This course is not assigned to your instructor account.
            </Typography>
            <Button variant="contained" href="/instructor/courses" sx={{ borderRadius: 30 }}>
              Back to My Courses
            </Button>
          </Card>
        </Container>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        {/* Glassmorphism Header */}
        <Box
          sx={{
            mb: 4,
            p: 4,
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
             background: `linear-gradient(135deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            color: 'white',
            boxShadow: theme.shadows[8],
          }}
        >
           <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 3 }}>
             <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                     <Chip label={displayCourse.level} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)' }} />
                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.8 }}>
                        <Iconify icon="solar:clock-circle-bold" width={16} />
                        <Typography variant="body2">{displayCourse.duration}</Typography>
                     </Box>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                  {displayCourse.title}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Iconify icon="solar:user-circle-bold" width={20} />
                  Instructor: {displayCourse.instructor}
                </Typography>

                {(assignedRound || (hasRole('instructor') && roundsCount > 0)) && (
                  <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', opacity: 0.95 }}>
                    {assignedRound && (
                      <>
                        <Chip
                          label={`Round: ${assignedRound.name}`}
                          size="small"
                          sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700 }}
                        />
                        <Chip
                          label={String(assignedRound.status).toUpperCase()}
                          size="small"
                          sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: 'white', fontWeight: 700 }}
                        />
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          {new Date(assignedRound.startDate).toLocaleDateString()} - {new Date(assignedRound.endDate).toLocaleDateString()}
                        </Typography>
                      </>
                    )}

                    {hasRole('instructor') && roundsCount > 0 && !assignedRound && (
                      <Chip
                        label={`Rounds: ${roundsCount}`}
                        size="small"
                        sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: 'white', fontWeight: 700 }}
                      />
                    )}
                  </Box>
                )}
             </Box>
             
             {/* Overall Progress Circle */}
             <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2, backdropFilter: 'blur(8px)', minWidth: 200 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Course Progress</Typography>
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                         <LinearProgress 
                            variant="determinate" 
                            value={(displayCourse.completedLessons / displayCourse.totalLessons) * 100}
                            sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.2)', '& .MuiLinearProgress-bar': { bgcolor: 'white' } }} 
                         />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {Math.round((displayCourse.completedLessons / displayCourse.totalLessons) * 100)}%
                    </Typography>
                 </Box>
                 <Typography variant="caption" sx={{ opacity: 0.8, mt: 0.5, display: 'block' }}>
                     {displayCourse.completedLessons} of {displayCourse.totalLessons} lessons completed
                 </Typography>
             </Box>
           </Box>

           <Box sx={{ position: 'absolute', top: -50, right: -50, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)' }} />
        </Box>

        {/* Styled Tabs */}
        <Card sx={{ mb: 4, boxShadow: theme.shadows[3] }}>
           <Tabs
             value={currentTab}
             onChange={handleTabChange}
             variant="scrollable"
             scrollButtons="auto"
             sx={{
               p: 1,
               '& .MuiTabs-indicator': { display: 'none' },
               '& .MuiTab-root': {
                 minHeight: 48,
                 minWidth: 100,
                 borderRadius: 1,
                 mr: 1,
                 textTransform: 'none',
                 fontWeight: 600,
                 transition: 'all 0.2s',
                 color: 'text.secondary',
                 '&.Mui-selected': {
                   color: 'primary.main',
                   bgcolor: alpha(theme.palette.primary.main, 0.08),
                 },
                 '&:hover:not(.Mui-selected)': {
                     bgcolor: 'action.hover',
                 }
               }
             }}
           >
             {tabs.map((tab) => (
               <Tab 
                 key={tab.value} 
                 label={tab.label} 
                 icon={<Iconify icon={tab.icon} width={20} />} 
                 iconPosition="start"
               />
             ))}
           </Tabs>
        </Card>

        {/* Overview Tab */}
        {currentTab === 0 && (
          <Box>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 8 }}>
                {/* Course Details */}
                <Card sx={{ p: 4, mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                      About this Course
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 4 }}>
                      {displayCourse.description}
                    </Typography>

                    {/* At a glance */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
                      <Box sx={{ p: 2, borderRadius: 1, bgcolor: alpha(theme.palette.primary.main, 0.04), border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}` }}>
                        <Typography variant="caption" color="text.secondary">Level</Typography>
                        <Typography variant="body2" fontWeight={700}>{displayCourse.level}</Typography>
                      </Box>
                      <Box sx={{ p: 2, borderRadius: 1, bgcolor: alpha(theme.palette.info.main, 0.04), border: `1px solid ${alpha(theme.palette.info.main, 0.12)}` }}>
                        <Typography variant="caption" color="text.secondary">Language</Typography>
                        <Typography variant="body2" fontWeight={700}>{displayCourse.language}</Typography>
                      </Box>
                      <Box sx={{ p: 2, borderRadius: 1, bgcolor: alpha(theme.palette.success.main, 0.04), border: `1px solid ${alpha(theme.palette.success.main, 0.12)}` }}>
                        <Typography variant="caption" color="text.secondary">Lessons</Typography>
                        <Typography variant="body2" fontWeight={700}>{displayCourse.totalLessons}</Typography>
                      </Box>
                      <Box sx={{ p: 2, borderRadius: 1, bgcolor: alpha(theme.palette.warning.main, 0.04), border: `1px solid ${alpha(theme.palette.warning.main, 0.12)}` }}>
                        <Typography variant="caption" color="text.secondary">Rating</Typography>
                        <Typography variant="body2" fontWeight={700}>{displayCourse.rating}</Typography>
                      </Box>
                    </Box>

                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                      What you&apos;ll learn
                    </Typography>
                    <Grid container spacing={2}>
                        {displayCourse.syllabus.map((topic, index) => (
                          <Grid size={{ xs: 12, sm: 6 }} key={index}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <Iconify icon="solar:check-circle-bold" width={20} sx={{ color: 'success.main' }} />
                                  <Typography variant="body2">{topic}</Typography>
                              </Box>
                          </Grid>
                        ))}
                    </Grid>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                 <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Next Class */}
                    <Card sx={{ p: 3, bgcolor: alpha(theme.palette.info.lighter, 0.4), border: `1px solid ${alpha(theme.palette.info.main, 0.2)}` }}>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Iconify icon="solar:calendar-mark-bold-duotone" sx={{ color: 'info.main' }} />
                        Next Live Session
                      </Typography>
                      
                      <Box sx={{ mt: 2, mb: 3 }}>
                        {nextZoomMeeting ? (
                          <>
                            <Typography variant="h6" sx={{ color: 'info.darker', mb: 0.5, fontWeight: 800 }}>
                              {nextZoomMeeting.topic}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                              {new Date(nextZoomMeeting.meetingDateTime).toLocaleString()}
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            No zoom sessions scheduled yet.
                          </Typography>
                        )}
                      </Box>

                      <Button
                        variant="contained"
                        color="info"
                        fullWidth
                        startIcon={<Iconify icon="solar:videocamera-bold" />}
                        href={nextZoomMeeting?.meetingLink}
                        target="_blank"
                        disabled={!nextZoomMeeting?.meetingLink}
                      >
                        Join Zoom
                      </Button>
                    </Card>

                    {/* Stats */}
                    <Card sx={{ p: 3 }}>
                       <Typography variant="h6" sx={{ mb: 2 }}>Course Stats</Typography>
                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                               <Typography variant="body2" color="text.secondary">Skill Level</Typography>
                               <Chip label={displayCourse.level} size="small" color="primary" variant="outlined" />
                           </Box>
                           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                               <Typography variant="body2" color="text.secondary">Language</Typography>
                               <Typography variant="body2" fontWeight={600}>{displayCourse.language}</Typography>
                           </Box>
                           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                               <Typography variant="body2" color="text.secondary">Students</Typography>
                               <Typography variant="body2" fontWeight={600}>{displayCourse.students}</Typography>
                           </Box>
                           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                               <Typography variant="body2" color="text.secondary">Certificate</Typography>
                               <Typography variant="body2" fontWeight={600} color="success.main">Yes</Typography>
                           </Box>
                       </Box>
                    </Card>
                 </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Curriculum Tab (Student view) */}
        {currentTab === 5 && (
          <Box>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
              Curriculum
            </Typography>

            {modules.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {modules.map((module, idx) => (
                  <Card key={module.id} sx={{ transition: 'all 0.3s', '&:hover': { boxShadow: theme.shadows[4] } }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>Week {idx + 1}: {module.title}</Typography>
                          {module.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{module.description}</Typography>
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Chip label={`${module.lessons.length} lessons`} color="primary" variant="outlined" />
                          <IconButton size="small" onClick={() => handleEditWeek(module)} aria-label="Edit week">
                            <Iconify icon="solar:pen-bold" width={18} />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDeleteWeek(module.id)} aria-label="Delete week">
                            <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                          </IconButton>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {module.lessons.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">No lessons added yet.</Typography>
                        ) : (
                          module.lessons.map((lesson) => (
                            <Box key={lesson.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: 'background.neutral', borderRadius: 1 }}>
                              <Typography variant="body2" fontWeight={600}>
                                {lesson.order}. {lesson.title}
                              </Typography>
                              <Chip label={`${lesson.duration}m`} size="small" variant="outlined" />
                            </Box>
                          ))
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Card sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Course Outline</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {mockCourse.syllabus.map((topic, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Iconify icon="solar:check-circle-bold" width={18} sx={{ color: 'success.main' }} />
                      <Typography variant="body2">{topic}</Typography>
                    </Box>
                  ))}
                </Box>
              </Card>
            )}
          </Box>
        )}

        {/* Content (Weeks) Tab - Instructor only */}
        {hasRole('instructor') && currentTab === 6 && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h5">Course Content (Weeks)</Typography>
              <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold-duotone" />} onClick={handleAddWeek}>
                Add Week
              </Button>
            </Box>

            {modules.length === 0 ? (
              <Card sx={{ p: 6, textAlign: 'center' }}>
                 <Iconify icon="solar:folder-with-files-bold-duotone" width={64} sx={{ color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  No weeks added yet. Click &quot;Add Week&quot; to create the first week.
                </Typography>
              </Card>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {modules.map((module, idx) => (
                  <Card key={module.id} sx={{ transition: 'all 0.3s', '&:hover': { boxShadow: theme.shadows[4] } }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>Week {idx + 1}: {module.title}</Typography>
                          {module.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{module.description}</Typography>
                          )}
                        </Box>
                        <Chip label={`${module.lessons.length} lessons`} color="primary" variant="outlined" />
                      </Box>

                      {/* Lessons */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                        {module.lessons.map((lesson) => (
                          <Box key={lesson.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                              <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                                {lesson.order}
                              </Box>
                              <Box sx={{ minWidth: 0 }}>
                                <Typography variant="body2" fontWeight={600} noWrap>
                                  {lesson.title}
                                </Typography>
                                {lesson.description && (
                                  <Typography variant="caption" color="text.secondary" noWrap>
                                    {lesson.description}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Chip label={`${lesson.duration}m`} size="small" variant="outlined" />
                              <IconButton size="small" onClick={() => handleEditLesson(module.id, lesson)} aria-label="Edit lesson">
                                <Iconify icon="solar:pen-bold" width={18} />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => handleDeleteLesson(module.id, lesson.id)} aria-label="Delete lesson">
                                <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                              </IconButton>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                    <CardActions sx={{ borderTop: `1px dashed ${theme.palette.divider}`, p: 2 }}>
                      <Button variant="text" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={() => handleAddLesson(module.id)}>
                        Add Lesson
                      </Button>
                    </CardActions>
                  </Card>
                ))}
              </Box>
            )}

            {/* Add Week Dialog */}
            <Dialog open={addWeekDialog} onClose={() => setAddWeekDialog(false)} maxWidth="sm" fullWidth>
              <DialogTitle>Add New Week</DialogTitle>
              <DialogContent>
                <TextField fullWidth label="Week Title" sx={{ mt: 1 }} value={newWeekTitle} onChange={(e) => setNewWeekTitle(e.target.value)} />
                <TextField fullWidth label="Description" sx={{ mt: 2 }} multiline rows={3} value={newWeekDescription} onChange={(e) => setNewWeekDescription(e.target.value)} />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setAddWeekDialog(false)}>Cancel</Button>
                <Button variant="contained" onClick={saveNewWeek} disabled={!newWeekTitle.trim()}>Save</Button>
              </DialogActions>
            </Dialog>

            {/* Add Lesson Dialog */}
            <Dialog open={addLessonDialog.open} onClose={() => setAddLessonDialog({ open: false })} maxWidth="sm" fullWidth>
              <DialogTitle>Add New Lesson</DialogTitle>
              <DialogContent>
                <TextField fullWidth label="Lesson Title" sx={{ mt: 1 }} value={newLessonTitle} onChange={(e) => setNewLessonTitle(e.target.value)} />
                <TextField fullWidth label="Description" sx={{ mt: 2 }} multiline rows={3} value={newLessonDescription} onChange={(e) => setNewLessonDescription(e.target.value)} />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setAddLessonDialog({ open: false })}>Cancel</Button>
                <Button variant="contained" onClick={saveNewLesson} disabled={!newLessonTitle.trim()}>Save</Button>
              </DialogActions>
            </Dialog>

            <Dialog open={editWeekDialog.open} onClose={() => setEditWeekDialog({ open: false })} maxWidth="sm" fullWidth>
              <DialogTitle>Edit Week</DialogTitle>
              <DialogContent>
                <TextField fullWidth label="Week Title" sx={{ mt: 1 }} value={editWeekTitle} onChange={(e) => setEditWeekTitle(e.target.value)} />
                <TextField fullWidth label="Description" sx={{ mt: 2 }} multiline rows={3} value={editWeekDescription} onChange={(e) => setEditWeekDescription(e.target.value)} />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setEditWeekDialog({ open: false })}>Cancel</Button>
                <Button variant="contained" onClick={saveEditedWeek} disabled={!editWeekTitle.trim()}>
                  Save
                </Button>
              </DialogActions>
            </Dialog>

            <Dialog open={deleteWeekDialog.open} onClose={() => setDeleteWeekDialog({ open: false })} maxWidth="xs" fullWidth>
              <DialogTitle>Delete Week</DialogTitle>
              <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  This will permanently delete the week and all lessons inside it.
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDeleteWeekDialog({ open: false })}>Cancel</Button>
                <Button variant="contained" color="error" onClick={confirmDeleteWeek}>
                  Delete
                </Button>
              </DialogActions>
            </Dialog>

            <Dialog open={editLessonDialog.open} onClose={() => setEditLessonDialog({ open: false })} maxWidth="sm" fullWidth>
              <DialogTitle>Edit Lesson</DialogTitle>
              <DialogContent>
                <TextField fullWidth label="Lesson Title" sx={{ mt: 1 }} value={editLessonTitle} onChange={(e) => setEditLessonTitle(e.target.value)} />
                <TextField fullWidth label="Description" sx={{ mt: 2 }} multiline rows={3} value={editLessonDescription} onChange={(e) => setEditLessonDescription(e.target.value)} />
                <TextField
                  fullWidth
                  label="Duration (minutes)"
                  sx={{ mt: 2 }}
                  type="number"
                  value={editLessonDuration}
                  onChange={(e) => setEditLessonDuration(Number(e.target.value))}
                />
                <TextField
                  fullWidth
                  label="Content"
                  sx={{ mt: 2 }}
                  multiline
                  rows={6}
                  value={editLessonContent}
                  onChange={(e) => setEditLessonContent(e.target.value)}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setEditLessonDialog({ open: false })}>Cancel</Button>
                <Button variant="contained" onClick={saveEditedLesson} disabled={!editLessonTitle.trim()}>
                  Save
                </Button>
              </DialogActions>
            </Dialog>

            <Dialog open={deleteLessonDialog.open} onClose={() => setDeleteLessonDialog({ open: false })} maxWidth="xs" fullWidth>
              <DialogTitle>Delete Lesson</DialogTitle>
              <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  This will permanently delete the lesson.
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDeleteLessonDialog({ open: false })}>Cancel</Button>
                <Button variant="contained" color="error" onClick={confirmDeleteLesson}>
                  Delete
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}

        {/* Materials Tab */}
        {currentTab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>Course Materials</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {hasRole('instructor') && roundsForCourse.length > 0 && (
                  <FormControl size="small" sx={{ minWidth: 220 }}>
                    <InputLabel>Round</InputLabel>
                    <Select
                      value={activeRoundId ?? ''}
                      label="Round"
                      onChange={(e) => setSelectedRoundId(String(e.target.value))}
                    >
                      {roundsForCourse.map((r) => (
                        <MenuItem key={r.id} value={r.id}>
                          {r.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                {hasRole('instructor') && (
                  <Button
                    variant="contained"
                    startIcon={<Iconify icon="solar:upload-square-bold-duotone" />}
                    onClick={() => setMaterialDialogOpen(true)}
                    disabled={!activeRoundId}
                  >
                    Upload Material
                  </Button>
                )}
              </Box>
            </Box>

            {roundDataError && (
              <Card sx={{ p: 2 }}>
                <Typography variant="body2" color="error">
                  {roundDataError}
                </Typography>
              </Card>
            )}

            {!activeRoundId && (
              <Card sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Select a course round to view materials.
                </Typography>
              </Card>
            )}

            {activeRoundId && materials.length === 0 && (
              <Card sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  No materials added yet.
                </Typography>
              </Card>
            )}

            <Grid container spacing={3}>
              {materials.map((material) => (
                <Grid size={{ xs: 12, md: 6 }} key={material.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[8] } }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            color: 'primary.main',
                          }}
                        >
                          <Iconify icon={getMaterialIcon(material.materialType)} width={32} />
                        </Box>

                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>{material.title}</Typography>
                            <Chip
                              label={String(material.materialType || 'link').toUpperCase()}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                            {material.description}
                          </Typography>
                          <Typography variant="caption" color="text.disabled" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                             <Iconify icon="solar:calendar-mark-bold" width={12} />
                            Uploaded: {new Date(material.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>

                    <CardActions sx={{ p: 2, pt: 0 }}>
                      {hasRole('instructor') && (
                        <IconButton color="error" onClick={() => handleDeleteMaterial(material.id)} aria-label="Delete material">
                          <Iconify icon="solar:trash-bin-trash-bold" width={20} />
                        </IconButton>
                      )}
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<Iconify icon="solar:eye-bold" />}
                        href={material.link}
                        target="_blank"
                        sx={{ borderRadius: 1 }}
                      >
                        {String(material.materialType || '').toLowerCase().includes('zoom') ? 'Join Session' : 'View Material'}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Dialog open={materialDialogOpen} onClose={() => setMaterialDialogOpen(false)} maxWidth="sm" fullWidth>
              <DialogTitle>Upload Material</DialogTitle>
              <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                  <TextField
                    label="Title"
                    value={materialForm.title}
                    onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                    required
                    fullWidth
                  />
                  <TextField
                    label="Description"
                    value={materialForm.description}
                    onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                    multiline
                    rows={3}
                    fullWidth
                  />
                  <TextField
                    label="Link"
                    value={materialForm.link}
                    onChange={(e) => setMaterialForm({ ...materialForm, link: e.target.value })}
                    required
                    fullWidth
                    placeholder="https://example.com/material.pdf"
                  />
                  <FormControl fullWidth>
                    <InputLabel>Material Type</InputLabel>
                    <Select
                      value={materialForm.materialType}
                      onChange={(e) => setMaterialForm({ ...materialForm, materialType: String(e.target.value) })}
                      label="Material Type"
                    >
                      <MenuItem value="link">Link</MenuItem>
                      <MenuItem value="pdf">PDF</MenuItem>
                      <MenuItem value="video">Video</MenuItem>
                      <MenuItem value="document">Document</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setMaterialDialogOpen(false)}>Cancel</Button>
                <Button variant="contained" onClick={handleCreateMaterial} disabled={!materialForm.title.trim() || !materialForm.link.trim()}>
                  Upload
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}

        {/* Assignments Tab */}
        {currentTab === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>Assignments</Typography>
              {hasRole('instructor') && (
                <Button
                  variant="contained"
                  startIcon={<Iconify icon="solar:add-circle-bold-duotone" />}
                >
                  Create Assignment
                </Button>
              )}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {assignments.map((assignment) => (
                <Card key={assignment.id} sx={{ transition: 'all 0.3s', '&:hover': { boxShadow: theme.shadows[4] } }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                          {assignment.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {assignment.description}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${assignment.maxPoints} Points`}
                        color="primary"
                        variant="filled"
                        sx={{ borderRadius: 1, fontWeight: 700 }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, pt: 2, borderTop: `1px dashed ${theme.palette.divider}` }}>
                       <Box sx={{ display: 'flex', gap: 3 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                             <Iconify icon="solar:calendar-date-bold" width={16} sx={{ color: 'error.main' }} />
                            Due: {assignment.dueDate.toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                             <Iconify icon="solar:clock-circle-bold" width={16} />
                            Created: {assignment.createdAt.toLocaleDateString()}
                          </Typography>
                       </Box>
                       
                       <Box>
                          {hasRole('student') && (
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Iconify icon="solar:upload-bold-duotone" />}
                              onClick={() => handleSubmitAssignment(assignment)}
                              sx={{ borderRadius: 30 }}
                            >
                              Submit
                            </Button>
                          )}
                          {hasRole('instructor') && (
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Iconify icon="solar:eye-bold-duotone" />}
                              sx={{ borderRadius: 30 }}
                            >
                              View Submissions
                            </Button>
                          )}
                       </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        )}

        {/* Zoom Sessions Tab */}
        {currentTab === 3 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>Zoom Sessions</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {hasRole('instructor') && roundsForCourse.length > 0 && (
                  <FormControl size="small" sx={{ minWidth: 220 }}>
                    <InputLabel>Round</InputLabel>
                    <Select
                      value={activeRoundId ?? ''}
                      label="Round"
                      onChange={(e) => setSelectedRoundId(String(e.target.value))}
                    >
                      {roundsForCourse.map((r) => (
                        <MenuItem key={r.id} value={r.id}>
                          {r.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                {hasRole('instructor') && (
                  <Button
                    variant="contained"
                    startIcon={<Iconify icon="solar:videocamera-add-bold" />}
                    onClick={() => setZoomDialogOpen(true)}
                    disabled={!activeRoundId}
                  >
                    Add Zoom
                  </Button>
                )}
              </Box>
            </Box>

            {roundDataError && (
              <Card sx={{ p: 2, mb: 2 }}>
                <Typography variant="body2" color="error">
                  {roundDataError}
                </Typography>
              </Card>
            )}

            {!activeRoundId && (
              <Card sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Select a course round to view zoom meetings.
                </Typography>
              </Card>
            )}

            {activeRoundId && zoomMeetings.length === 0 && (
              <Card sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  No zoom meetings scheduled yet.
                </Typography>
              </Card>
            )}

            <Grid container spacing={2}>
              {zoomMeetings
                .slice()
                .sort((a, b) => new Date(a.meetingDateTime).getTime() - new Date(b.meetingDateTime).getTime())
                .map((meeting) => (
                  <Grid key={meeting.id} size={{ xs: 12, md: 6 }}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800 }} noWrap>
                              {meeting.topic}
                            </Typography>
                            {meeting.description && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {meeting.description}
                              </Typography>
                            )}
                            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                <strong>Date/Time:</strong> {new Date(meeting.meetingDateTime).toLocaleString()}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                <strong>Duration:</strong> {meeting.durationMinutes} minutes
                              </Typography>
                              {meeting.meetingId && (
                                <Typography variant="caption" color="text.secondary">
                                  <strong>Meeting ID:</strong> {meeting.meetingId}
                                </Typography>
                              )}
                              {meeting.passcode && (
                                <Typography variant="caption" color="text.secondary">
                                  <strong>Passcode:</strong> {meeting.passcode}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                          {hasRole('instructor') && (
                            <IconButton color="error" onClick={() => handleDeleteZoomMeeting(meeting.id)} aria-label="Delete zoom meeting">
                              <Iconify icon="solar:trash-bin-trash-bold" width={20} />
                            </IconButton>
                          )}
                        </Box>
                      </CardContent>
                      <CardActions sx={{ px: 2, pb: 2 }}>
                        <Button
                          variant="contained"
                          fullWidth
                          startIcon={<Iconify icon="solar:play-circle-bold" />}
                          href={meeting.meetingLink}
                          target="_blank"
                        >
                          Join Zoom
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
            </Grid>

            <Dialog open={zoomDialogOpen} onClose={() => setZoomDialogOpen(false)} maxWidth="sm" fullWidth>
              <DialogTitle>Add Zoom Meeting</DialogTitle>
              <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                  <TextField
                    label="Topic"
                    value={zoomForm.topic}
                    onChange={(e) => setZoomForm({ ...zoomForm, topic: e.target.value })}
                    required
                    fullWidth
                  />
                  <TextField
                    label="Description"
                    value={zoomForm.description}
                    onChange={(e) => setZoomForm({ ...zoomForm, description: e.target.value })}
                    multiline
                    rows={3}
                    fullWidth
                  />
                  <TextField
                    label="Meeting Link"
                    value={zoomForm.meetingLink}
                    onChange={(e) => setZoomForm({ ...zoomForm, meetingLink: e.target.value })}
                    required
                    fullWidth
                    placeholder="https://zoom.us/j/123456789"
                  />
                  <TextField
                    label="Meeting ID (optional)"
                    value={zoomForm.meetingId}
                    onChange={(e) => setZoomForm({ ...zoomForm, meetingId: e.target.value })}
                    fullWidth
                  />
                  <TextField
                    label="Passcode (optional)"
                    value={zoomForm.passcode}
                    onChange={(e) => setZoomForm({ ...zoomForm, passcode: e.target.value })}
                    fullWidth
                  />
                  <TextField
                    label="Date & Time"
                    type="datetime-local"
                    value={zoomForm.meetingDateTime}
                    onChange={(e) => setZoomForm({ ...zoomForm, meetingDateTime: e.target.value })}
                    required
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="Duration (minutes)"
                    type="number"
                    value={zoomForm.durationMinutes}
                    onChange={(e) => setZoomForm({ ...zoomForm, durationMinutes: Number(e.target.value) })}
                    required
                    fullWidth
                  />
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setZoomDialogOpen(false)}>Cancel</Button>
                <Button variant="contained" onClick={handleCreateZoomMeeting} disabled={!zoomForm.topic.trim() || !zoomForm.meetingLink.trim()}>
                  Add Zoom
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}

        {/* Grades Tab */}
        {currentTab === 4 && (
          <Box>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
              My Grades
            </Typography>
            
            <Card>
               <Typography variant="caption" sx={{ p: 2, display: 'block', color: 'text.secondary', textAlign: 'center' }}>
                  Grades will appear here once assignments are graded by the instructor.
               </Typography>
               {/* Refined grades list logic can go here */}
            </Card>
          </Box>
        )}

      </Container>
    </DashboardContent>
  );
}
