import type { ApexOptions } from 'apexcharts';

import Chart from 'react-apexcharts';
import { useEffect, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CardContent from '@mui/material/CardContent';
import { alpha, useTheme } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';

import { zoomMeetingApi } from 'src/api';
import { DashboardContent } from 'src/layouts/dashboard';
import { useAuth } from 'src/contexts/simple-auth-context';
import { useCoursesContext } from 'src/contexts/courses-context';
import { useApplicationsContext } from 'src/contexts/applications-context';
import { useCourseRoundsContext } from 'src/contexts/course-rounds-context';

import { Iconly } from 'src/components/iconly';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// Mock student data
const mockStudentData = {
  enrolledCourses: [
    {
      id: '1',
      title: 'Introduction to Programming',
      instructor: 'Dr. Smith',
      progress: 75,
      totalLessons: 20,
      completedLessons: 15,
      nextLesson: 'Functions and Methods',
      dueAssignment: 'Variables Assignment',
      dueDate: new Date('2024-02-01'),
      grade: 'A-',
      coverUrl: '/assets/images/courses/course-1.webp', // Assuming assets exist or using placeholders
    },
    {
      id: '2',
      title: 'Web Development Bootcamp',
      instructor: 'Prof. Johnson',
      progress: 45,
      totalLessons: 30,
      completedLessons: 14,
      nextLesson: 'React Components',
      dueAssignment: 'HTML/CSS Project',
      dueDate: new Date('2024-01-28'),
      grade: 'B+',
      coverUrl: '/assets/images/courses/course-2.webp',
    },
  ],
  recentNotifications: [
    {
      id: '1',
      title: 'New assignment',
      message: 'Functions assignment is now available.',
      time: '2 hours ago',
      type: 'assignment',
      read: false,
    },
    {
      id: '2',
      title: 'Grade updated',
      message: 'Variables assignment graded: A-.',
      time: '1 day ago',
      type: 'grade',
      read: false,
    },
    {
      id: '3',
      title: 'Live session soon',
      message: 'Live session starts in 30 minutes.',
      time: '30 minutes',
      type: 'meeting',
      read: true,
    },
  ],
  upcomingEvents: [
    {
      id: '1',
      title: 'Live session',
      course: 'Introduction to Programming',
      date: new Date('2024-01-25T14:00:00'),
      type: 'zoom',
    },
    {
      id: '2',
      title: 'Assignment due',
      course: 'Web Development Bootcamp',
      date: new Date('2024-01-28T23:59:00'),
      type: 'assignment',
    },
  ],
  stats: {
    totalCourses: 2,
    completedAssignments: 8,
    averageGrade: 'B+',
    studyHours: 45,
  },
};

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'assignment':
      return 'solar:pen-bold-duotone';
    case 'grade':
      return 'solar:eye-bold-duotone';
    case 'meeting':
      return 'solar:videocamera-bold-duotone';
    default:
      return 'solar:bell-bold-duotone';
  }
};

const getEventIcon = (type: string) => {
  switch (type) {
    case 'zoom':
      return 'solar:videocamera-bold-duotone';
    case 'assignment':
      return 'solar:pen-bold-duotone';
    default:
      return 'solar:calendar-bold-duotone';
  }
};

type EnrolledCourse = {
  id: string;
  title: string;
  instructor: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  nextLesson: string;
  dueAssignment: string;
  dueDate: Date;
  grade: string;
  coverUrl: string;
  roundId?: string;
  nextZoomLink?: string;
  nextZoomTime?: string;
};

export function StudentDashboardView() {
  const { user } = useAuth();
  const theme = useTheme();

  const { courses } = useCoursesContext();
  const { applications } = useApplicationsContext();

  const { getRoundForStudent } = useCourseRoundsContext();
  const [nextZoomByCourseId, setNextZoomByCourseId] = useState<Record<string, { meetingLink: string; meetingDateTime: string }>>({});

  const enrolledCoursesData: EnrolledCourse[] = useMemo(() => {
    const userId = user?.id;
    if (!userId) return [];

    const accepted = applications.filter((a) => a.studentId === userId && a.status === 'accepted');

    return accepted.map((app, index) => {
      const course = courses.find((c) => c.id === app.courseId);
      const title = course?.name ?? app.metadata?.courseName ?? 'Course';
      const instructor = course?.instructor ?? '';

      const round = getRoundForStudent(app.courseId, userId);
      const zoom = nextZoomByCourseId[app.courseId];

      return {
        id: app.courseId,
        title,
        instructor,
        progress: 0,
        totalLessons: 1,
        completedLessons: 0,
        nextLesson: 'Start learning',
        dueAssignment: '—',
        dueDate: new Date(Date.now() + (index + 3) * 24 * 60 * 60 * 1000),
        grade: '—',
        coverUrl: '/assets/school/course.webp',
        roundId: round?.id,
        nextZoomLink: zoom?.meetingLink ?? '',
        nextZoomTime: zoom?.meetingDateTime ?? '',
      };
    });
  }, [applications, courses, getRoundForStudent, nextZoomByCourseId, user?.id]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const userId = user?.id;
      if (!userId) return;

      const accepted = applications.filter((a) => a.studentId === userId && a.status === 'accepted');
      if (accepted.length === 0) {
        setNextZoomByCourseId({});
        return;
      }

      const roundPairs = accepted
        .map((a) => ({ courseId: a.courseId, roundId: getRoundForStudent(a.courseId, userId)?.id }))
        .filter((x): x is { courseId: string; roundId: string } => Boolean(x.roundId));

      if (roundPairs.length === 0) {
        setNextZoomByCourseId({});
        return;
      }

      try {
        const now = Date.now();
        const results = await Promise.all(
          roundPairs.map(async ({ courseId, roundId }) => {
            const meetings = await zoomMeetingApi.getByCourseRoundId(Number(roundId));
            const next = meetings
              .filter((m) => m.isActive !== false)
              .map((m) => ({ meetingLink: m.meetingLink, meetingDateTime: m.meetingDateTime }))
              .filter((m) => {
                const ts = new Date(m.meetingDateTime).getTime();
                return Number.isFinite(ts) && ts >= now;
              })
              .sort((a, b) => new Date(a.meetingDateTime).getTime() - new Date(b.meetingDateTime).getTime())[0];

            return next ? { courseId, next } : null;
          })
        );

        if (cancelled) return;

        const map: Record<string, { meetingLink: string; meetingDateTime: string }> = {};
        results.forEach((r) => {
          if (!r) return;
          map[r.courseId] = r.next;
        });
        setNextZoomByCourseId(map);
      } catch {
        if (cancelled) return;
        setNextZoomByCourseId({});
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [applications, getRoundForStudent, user?.id]);

  const studentData = useMemo(
    () => ({
      enrolledCourses: enrolledCoursesData,
      recentNotifications: mockStudentData.recentNotifications,
      upcomingEvents: mockStudentData.upcomingEvents,
      stats: {
        totalCourses: enrolledCoursesData.length,
        completedAssignments: 0,
        averageGrade: '—',
        studyHours: 0,
      },
    }),
    [enrolledCoursesData]
  );

  const statsCards = [
    {
      title: 'Enrolled Courses',
      value: studentData.stats.totalCourses,
      icon: 'solar:notebook-bold-duotone',
      color: theme.palette.primary.main,
      bgGradient: `linear-gradient(135deg, ${alpha(theme.palette.primary.lighter, 0.8)} 0%, ${alpha(theme.palette.primary.light, 0.9)} 100%)`,
      textColor: theme.palette.primary.darker,
      trend: 'Active',
    },
    {
      title: 'Completed Tasks',
      value: studentData.stats.completedAssignments,
      icon: 'solar:check-circle-bold-duotone',
      color: theme.palette.success.main,
      bgGradient: `linear-gradient(135deg, ${alpha(theme.palette.success.lighter, 0.8)} 0%, ${alpha(theme.palette.success.light, 0.9)} 100%)`,
      textColor: theme.palette.success.darker,
      trend: '+3 this week',
    },
    {
      title: 'Average Grade',
      value: studentData.stats.averageGrade,
      icon: 'solar:diploma-bold-duotone',
      color: theme.palette.warning.main,
      bgGradient: `linear-gradient(135deg, ${alpha(theme.palette.warning.lighter, 0.8)} 0%, ${alpha(theme.palette.warning.light, 0.9)} 100%)`,
      textColor: theme.palette.warning.darker,
      trend: 'Top 10%',
    },
    {
      title: 'Study Hours',
      value: `${studentData.stats.studyHours}h`,
      icon: 'solar:clock-circle-bold-duotone',
      color: theme.palette.info.main,
      bgGradient: `linear-gradient(135deg, ${alpha(theme.palette.info.lighter, 0.8)} 0%, ${alpha(theme.palette.info.light, 0.9)} 100%)`,
      textColor: theme.palette.info.darker,
      trend: '+5h vs last week',
    },
  ];

  const chartOptions: ApexOptions = {
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: theme.typography.fontFamily,
      background: 'transparent',
    },
    colors: [theme.palette.primary.main, theme.palette.secondary.main],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100],
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    xaxis: {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      labels: {
        style: { colors: theme.palette.text.secondary },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: theme.palette.text.secondary },
      },
    },
    grid: {
      strokeDashArray: 3,
      borderColor: theme.palette.divider,
      xaxis: { lines: { show: false } },
    },
    tooltip: {
      theme: theme.palette.mode,
      x: { show: false },
    },
  };

  const chartSeries = [
    {
      name: 'Study Hours',
      data: [2, 4, 3, 5, 4, 6, 3],
    },
  ];

  const enrolledCourses = studentData.enrolledCourses;
  const overallProgress = enrolledCourses.length
    ? Math.round(enrolledCourses.reduce((sum, course) => sum + course.progress, 0) / enrolledCourses.length)
    : 0;
  const activeCoursesCount = enrolledCourses.filter((course) => course.progress > 0 && course.progress < 100).length;
  const nextUpCourse = enrolledCourses.reduce(
    (best, course) => {
      if (!best) return course;
      if (course.progress === best.progress) return course.dueDate < best.dueDate ? course : best;
      return course.progress > best.progress ? course : best;
    },
    enrolledCourses[0]
  );
  const nearestDueCourse = enrolledCourses.reduce(
    (best, course) => {
      if (!best) return course;
      return course.dueDate < best.dueDate ? course : best;
    },
    enrolledCourses[0]
  );

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        {/* Advanced Welcome Section */}
        <Box
          sx={{
            mb: 5,
            p: 4,
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            color: 'white',
            boxShadow: theme.shadows[8],
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar
              alt={user?.name}
              sx={{
                width: 88,
                height: 88,
                border: '4px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                fontSize: '2.5rem',
                bgcolor: 'white',
                color: 'primary.main',
              }}
            >
              {user?.name?.charAt(0) || 'S'}
            </Avatar>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                Welcome back, {user?.name}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                Completed{' '}
                <Box component="span" sx={{ fontWeight: 'bold' }}>
                  {studentData.stats.completedAssignments} tasks
                </Box>{' '}
                this week.
              </Typography>
            </Box>
          </Box>
          
          {/* Decorative Circles */}
          <Box
            sx={{
              position: 'absolute',
              top: -40,
              right: -40,
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -60,
              right: 180,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%)',
            }}
          />
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          {statsCards.map((card, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                sx={{
                  height: '100%',
                  background: card.bgGradient,
                  color: card.textColor,
                  boxShadow: 'none',
                  p: 3,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: theme.shadows[10],
                  },
                }}
              >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box component="span" sx={{ p: 1, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.3)' }}>
                      <Iconify icon={card.icon} width={24} />
                    </Box>
                    <Chip
                      label={card.trend}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.3)',
                        color: 'inherit',
                        fontWeight: 'bold',
                      }}
                    />
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>
                    {card.value}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                    {card.title}
                  </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {/* Main Content: Courses & Chart */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              justifyContent="space-between"
              sx={{ mb: 2, gap: 1.5 }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconly name="Bookmark" size={22} sx={{ color: 'primary.main' }} />
                My Learning Path
              </Typography>
              <Button
                href="/my-courses"
                endIcon={<Iconly name="Arrow - Right" size={18} sx={{ color: 'inherit' }} />}
                sx={{ fontWeight: 600 }}
              >
                View All
              </Button>
            </Stack>

            <Card
              sx={{
                mb: 3,
                p: 2.5,
                borderRadius: 3,
                boxShadow: 'none',
                border: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.16),
                bgcolor: alpha(theme.palette.primary.main, 0.06),
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Iconly name="Chart" size={20} sx={{ color: 'primary.main' }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        Overall progress
                      </Typography>
                      <Chip
                        label={`${overallProgress}%`}
                        size="small"
                        color="primary"
                        sx={{ fontWeight: 700, ml: 'auto' }}
                      />
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={overallProgress}
                      sx={{
                        height: 10,
                        borderRadius: 6,
                        bgcolor: alpha(theme.palette.grey[500], 0.16),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 6,
                          backgroundImage: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                        },
                      }}
                    />
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {activeCoursesCount} active course{activeCoursesCount === 1 ? '' : 's'} • Keep going!
                    </Typography>
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1.5}
                    alignItems={{ xs: 'stretch', sm: 'center' }}
                    justifyContent="flex-end"
                  >
                    {nearestDueCourse ? (
                      <Chip
                        icon={<Iconly name="Time Circle" size={16} sx={{ color: 'inherit' }} />}
                        label={`Next due: ${nearestDueCourse.dueDate.toLocaleDateString()}`}
                        variant="outlined"
                        sx={{
                          fontWeight: 600,
                          borderColor: alpha(theme.palette.warning.main, 0.35),
                          color: theme.palette.warning.darker,
                          bgcolor: alpha(theme.palette.warning.main, 0.08),
                        }}
                      />
                    ) : null}

                    {nextUpCourse ? (
                      <Button
                        href={`/course-room/${nextUpCourse.id}`}
                        variant="contained"
                        startIcon={<Iconly name="Play" size={18} sx={{ color: 'inherit' }} />}
                        sx={{
                          px: 2,
                          borderRadius: 2,
                          boxShadow: '0 10px 22px rgba(37, 99, 235, 0.24)',
                          fontWeight: 700,
                        }}
                      >
                        Continue learning
                      </Button>
                    ) : null}
                  </Stack>
                </Grid>
              </Grid>
            </Card>

            {/* Activity Chart */}
            <Card sx={{ mb: 3, p: 3, boxShadow: theme.shadows[2] }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Learning Activity</Typography>
                <Button endIcon={<Iconify icon="solar:alt-arrow-right-line-duotone" />} size="small">
                  View Full Report
                </Button>
              </Stack>
              <Box sx={{ height: 350, width: '100%' }}>
                <Chart options={chartOptions} series={chartSeries} type="area" height={350} />
              </Box>
            </Card>

            <Stack spacing={2.5}>
              {enrolledCourses.map((course) => (
                <Card
                  key={course.id}
                  sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      borderColor: alpha(theme.palette.primary.main, 0.35),
                      boxShadow: theme.shadows[10],
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.25 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid size={{ xs: 12, sm: 'auto' }}>
                        <Box
                          sx={{
                            width: 96,
                            height: 96,
                            borderRadius: 2.5,
                            overflow: 'hidden',
                            position: 'relative',
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            backgroundImage: course.coverUrl ? `url(${course.coverUrl})` : undefined,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        >
                          <Box
                            sx={{
                              position: 'absolute',
                              inset: 0,
                              bgcolor: alpha(theme.palette.common.black, 0.25),
                            }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              inset: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'common.white',
                            }}
                          >
                            <Iconly name="Document" size={34} sx={{ color: 'common.white' }} />
                          </Box>
                        </Box>
                      </Grid>

                      <Grid size={{ xs: 12, md: 5 }}>
                        <Stack spacing={0.75}>
                          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                            {course.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {course.instructor}
                          </Typography>

                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                            <Chip
                              label={`Next: ${course.nextLesson}`}
                              size="small"
                              color="info"
                              sx={{ fontWeight: 700 }}
                            />
                            {course.nextZoomLink ? (
                              <Chip
                                icon={<Iconify icon="solar:videocamera-bold-duotone" />}
                                label="Next live session"
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ fontWeight: 700 }}
                              />
                            ) : null}
                            <Chip
                              label={`Grade: ${course.grade}`}
                              size="small"
                              variant="outlined"
                              color="success"
                              sx={{ fontWeight: 700 }}
                            />
                          </Stack>

                          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mt: 0.25 }}>
                            <Stack direction="row" spacing={0.75} alignItems="center">
                              <Iconly name="Tick Square" size={16} sx={{ color: 'text.secondary' }} />
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                {course.completedLessons}/{course.totalLessons} lessons
                              </Typography>
                            </Stack>
                            <Stack direction="row" spacing={0.75} alignItems="center">
                              <Iconly name="Time Circle" size={16} sx={{ color: 'warning.main' }} />
                              <Typography variant="caption" sx={{ color: 'warning.darker', fontWeight: 700 }}>
                                {course.dueDate.toLocaleDateString()}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                • {course.dueAssignment}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Stack>
                      </Grid>

                      <Grid size={{ xs: 12, md: 4 }}>
                        <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                            Progress
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 800 }}>
                            {course.progress}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={course.progress}
                          sx={{
                            height: 10,
                            borderRadius: 6,
                            bgcolor: alpha(theme.palette.grey[500], 0.16),
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 6,
                              backgroundImage: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                            },
                          }}
                        />

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.25 }}>
                          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            {[0, 1, 2].map((i) => {
                              const active = course.progress >= (i + 1) * 33;
                              return (
                                <Box
                                  key={i}
                                  sx={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    bgcolor: active ? 'primary.main' : alpha(theme.palette.text.disabled, 0.35),
                                  }}
                                />
                              );
                            })}
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                              Milestones
                            </Typography>
                          </Box>

                          <IconButton
                            href={course.roundId ? `/course-room/${course.id}?roundId=${course.roundId}` : `/course-room/${course.id}`}
                            color="primary"
                            sx={{
                              width: 52,
                              height: 52,
                              bgcolor: 'primary.main',
                              color: 'common.white',
                              '&:hover': { bgcolor: 'primary.dark', transform: 'scale(1.06)' },
                              transition: 'all 0.2s',
                              boxShadow: '0 10px 18px rgba(37, 99, 235, 0.24)',
                            }}
                          >
                            <Iconly name="Play" size={24} sx={{ color: 'common.white' }} />
                          </IconButton>
                        </Box>

                        {course.nextZoomLink ? (
                          <Button
                            fullWidth
                            variant="outlined"
                            href={course.nextZoomLink}
                            target="_blank"
                            rel="noreferrer"
                            startIcon={<Iconify icon="solar:videocamera-bold-duotone" />}
                            sx={{ mt: 1.5, borderRadius: 2, fontWeight: 800 }}
                          >
                            Join next live session
                          </Button>
                        ) : null}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Grid>

          {/* Sidebar: Notifications & Events */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{ height: '100%', boxShadow: theme.shadows[4] }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                  Updates & Events
                </Typography>

                <Stack spacing={3}>
                   <Box>
                      <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 2, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1 }}>
                        Notifications
                      </Typography>
                      <Stack spacing={2}>
                        {studentData.recentNotifications.map((notification) => (
                          <Box 
                            key={notification.id} 
                            sx={{ 
                              p: 2, 
                              borderRadius: 2, 
                              bgcolor: notification.read ? 'transparent' : alpha(theme.palette.primary.main, 0.08),
                              border: '1px solid',
                              borderColor: notification.read ? theme.palette.divider : 'transparent',
                              display: 'flex',
                              gap: 2
                            }}
                          >
                             <Box sx={{ mt: 0.5 }}>
                                <Iconify icon={getNotificationIcon(notification.type)} color={notification.read ? 'text.disabled' : 'primary.main'} width={24} />
                             </Box>
                             <Box>
                                <Typography variant="subtitle2">{notification.title}</Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>{notification.message}</Typography>
                                <Typography variant="caption" sx={{ color: 'text.disabled' }}>{notification.time}</Typography>
                             </Box>
                          </Box>
                        ))}
                      </Stack>
                   </Box>
                   
                   <Box>
                      <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 2, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1 }}>
                        Upcoming
                      </Typography>
                      <Stack spacing={2}>
                        {studentData.upcomingEvents.map((event) => (
                           <Card key={event.id} sx={{ bgcolor: alpha(theme.palette.secondary.lighter, 0.4), p: 2, boxShadow: 'none' }}>
                              <Stack direction="row" spacing={2} alignItems="center">
                                 <Box sx={{ p: 1, bgcolor: 'secondary.main', borderRadius: 1.5, color: 'white' }}>
                                    <Iconify icon={getEventIcon(event.type)} width={20} />
                                 </Box>
                                 <Box>
                                    <Typography variant="subtitle2">{event.title}</Typography>
                                    <Typography variant="caption" color="text.secondary">{event.date.toLocaleDateString()} • {event.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Typography>
                                 </Box>
                              </Stack>
                           </Card>
                        ))}
                      </Stack>
                   </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </DashboardContent>
  );
}
