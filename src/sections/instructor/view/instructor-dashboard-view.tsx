import type { ApexOptions } from 'apexcharts';

import { useMemo } from 'react';
import Chart from 'react-apexcharts';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import { alpha, useTheme } from '@mui/material/styles';

import { DashboardContent } from 'src/layouts/dashboard';
import { useAuth } from 'src/contexts/simple-auth-context';
import { useCoursesContext } from 'src/contexts/courses-context';
import { useCourseRoundsContext } from 'src/contexts/course-rounds-context';

import { Iconify } from 'src/components/iconify';

export function InstructorDashboardView() {
  const { user } = useAuth();
  const theme = useTheme();

  const { courses } = useCoursesContext();
  const { rounds } = useCourseRoundsContext();

  const instructorCourses = useMemo(() => {
    const myId = user?.id;
    if (!myId) return [];
    return courses.filter((c) => c.instructorId === myId);
  }, [courses, user?.id]);

  const totalStudents = useMemo(
    () => instructorCourses.reduce((acc, c) => acc + (Number.isFinite(c.students) ? c.students : 0), 0),
    [instructorCourses]
  );

  const avgCourseRating = useMemo(() => {
    if (instructorCourses.length === 0) return 0;
    const sum = instructorCourses.reduce((acc, c) => acc + (Number.isFinite(c.rating) ? c.rating : 0), 0);
    return Math.round((sum / instructorCourses.length) * 10) / 10;
  }, [instructorCourses]);

  const myCourses = useMemo(
    () =>
      instructorCourses.map((c) => ({
        id: c.id,
        title: c.name,
        students: c.students,
        pendingAssignments: 0,
        avgGrade: '—',
      })),
    [instructorCourses]
  );

  const myCourseRounds = useMemo(() => {
    const myId = user?.id;
    if (!myId) return [];

    const rows = rounds
      .filter((round) => round.createdBy === myId)
      .map((round) => {
        const course = courses.find((c) => c.id === round.courseId);
        return {
          ...round,
          courseTitle: course?.name ?? `Course ${round.courseId}`,
        };
      });

    return rows.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }, [courses, rounds, user?.id]);

  const statsCards = [
    {
      title: 'Total Students',
      value: totalStudents,
      icon: 'solar:users-group-rounded-bold-duotone',
      color: theme.palette.primary.main,
      textColor: theme.palette.primary.darker,
      subtitle: 'Across all your courses',
      bgGradient: `linear-gradient(135deg, ${alpha(theme.palette.primary.lighter, 0.8)} 0%, ${alpha(theme.palette.primary.light, 0.9)} 100%)`,
      trend: '+12%',
    },
    {
      title: 'Active Courses',
      value: instructorCourses.length,
      icon: 'solar:notebook-bold-duotone',
      color: theme.palette.secondary.main,
      textColor: theme.palette.secondary.darker,
      subtitle: 'Currently running',
      bgGradient: `linear-gradient(135deg, ${alpha(theme.palette.secondary.lighter, 0.8)} 0%, ${alpha(theme.palette.secondary.light, 0.9)} 100%)`,
      trend: 'Active',
    },
    {
      title: 'Pending Grades',
      value: 0,
      icon: 'solar:clipboard-list-bold-duotone',
      color: theme.palette.grey[700],
      textColor: theme.palette.grey[900],
      subtitle: 'Needs review',
      bgGradient: `linear-gradient(135deg, ${alpha(theme.palette.grey[200], 0.9)} 0%, ${alpha(theme.palette.grey[400], 0.9)} 100%)`,
      trend: 'Needs Action',
    },
    {
      title: 'Course Rating',
      value: `${avgCourseRating}⭐`,
      icon: 'solar:star-bold-duotone',
      color: theme.palette.primary.main,
      textColor: theme.palette.primary.darker,
      subtitle: 'Average score',
      bgGradient: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.75)} 0%, ${alpha(theme.palette.primary.main, 0.9)} 100%)`,
      trend: '+0.2',
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
    },
    tooltip: {
      theme: theme.palette.mode,
    },
  };

  const chartSeries = [
    {
      name: 'Student Activity',
      data: [45, 52, 38, 24, 33, 26, 21],
    },
    {
      name: 'Submissions',
      data: [35, 41, 62, 42, 13, 18, 29],
    },
  ];

  return (
    <DashboardContent>
      <Container maxWidth="xl">
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
          <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar
              alt={user?.name}
              sx={{
                width: 84,
                height: 84,
                bgcolor: 'white',
                color: 'primary.main',
                fontSize: '2.5rem',
                fontWeight: 'bold',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              }}
            >
              {user?.name?.charAt(0) || 'I'}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                Instructor Dashboard
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Welcome back, {user?.name}! Manage courses, review grades, and track engagement.
              </Typography>
            </Box>
            <Button
              variant="outlined"
              href="/instructor/courses"
              sx={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white' }}
            >
              My Courses
            </Button>
          </Box>

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
        </Box>

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
                  <Box component="span" sx={{ p: 1, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.35)' }}>
                    <Iconify icon={card.icon} width={24} />
                  </Box>
                  <Chip
                    label={card.trend}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.3)',
                      color: 'inherit',
                      fontWeight: 'bold',
                    }}
                  />
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>
                  {card.value}
                </Typography>
                <Typography variant="subtitle2" sx={{ opacity: 0.85, fontWeight: 700 }}>
                  {card.title}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.75 }}>
                  {card.subtitle}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card sx={{ mb: 3, p: 3, boxShadow: theme.shadows[2] }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Student Engagement (Last 7 Days)
                </Typography>
                <Button variant="outlined" size="small">
                  Export
                </Button>
              </Stack>
              <Box sx={{ height: 350, width: '100%' }}>
                <Chart options={chartOptions} series={chartSeries} type="area" height={350} />
              </Box>
            </Card>

            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                My Courses
              </Typography>
              <Button href="/instructor/courses" endIcon={<Iconify icon="solar:alt-arrow-right-line-duotone" />}>
                View All
              </Button>
            </Stack>

            <Stack spacing={2.5}>
              {myCourses.map((course) => (
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
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800 }} noWrap>
                          {course.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {course.students} students enrolled
                        </Typography>
                      </Box>
                      <Chip label={`Avg: ${course.avgGrade}`} color="primary" variant="outlined" sx={{ fontWeight: 700 }} />
                    </Stack>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2 }}>
                      <Chip
                        icon={<Iconify icon="solar:clipboard-list-bold-duotone" width={16} />}
                        label={`${course.pendingAssignments} assignments to grade`}
                        variant="outlined"
                        sx={{ fontWeight: 700 }}
                      />
                      <Chip
                        icon={<Iconify icon="solar:calendar-bold-duotone" width={16} />}
                        label="Next class: —"
                        variant="outlined"
                        sx={{ fontWeight: 700 }}
                      />
                    </Stack>

                    <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
                      <Typography variant="body2" color="text.secondary">
                        Recent: —
                      </Typography>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
                    <Button
                      variant="contained"
                      startIcon={<Iconify icon="solar:eye-bold-duotone" />}
                      href={`/course-room/${course.id}`}
                    >
                      Manage
                    </Button>
                    <Button variant="outlined" href="/instructor/assignments" startIcon={<Iconify icon="solar:pen-bold-duotone" />}>
                      Grade
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Stack>

            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 5, mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                My Course Rounds
              </Typography>
            </Stack>

            {myCourseRounds.length === 0 ? (
              <Card sx={{ borderRadius: 3, p: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  No course rounds yet.
                </Typography>
              </Card>
            ) : (
              <Stack spacing={2}>
                {myCourseRounds.map((round) => (
                  <Card key={round.id} sx={{ borderRadius: 3 }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800 }} noWrap>
                            {round.courseTitle} — {round.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(round.startDate).toLocaleDateString()} - {new Date(round.endDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Chip label={String(round.status).toUpperCase()} color="primary" variant="outlined" sx={{ fontWeight: 700 }} />
                      </Stack>
                    </CardContent>

                    <CardActions sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
                      <Button
                        variant="contained"
                        startIcon={<Iconify icon="solar:eye-bold-duotone" />}
                        href={`/course-room/${round.courseId}?roundId=${round.id}`}
                      >
                        Open Course Room
                      </Button>
                    </CardActions>
                  </Card>
                ))}
              </Stack>
            )}

            <Typography variant="h5" sx={{ mt: 5, mb: 2, fontWeight: 800 }}>
              Pending Grading
            </Typography>

            <Stack spacing={2}>
              {([] as any[]).map((item) => (
                <Card key={item.id} sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }} noWrap>
                          {item.studentName} - {item.assignment}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          Course: {item.course}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          Submitted: {item.submittedAt.toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Stack alignItems="flex-end" spacing={1}>
                        {item.daysOverdue > 0 && (
                          <Chip label={`${item.daysOverdue} days overdue`} color="error" size="small" sx={{ fontWeight: 700 }} />
                        )}
                        <Button variant="contained" size="small" href="/instructor/assignments" startIcon={<Iconify icon="solar:pen-bold-duotone" />}>
                          Grade Now
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{ mb: 3, boxShadow: theme.shadows[2] }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                  Quick Actions
                </Typography>

                <Stack spacing={1.5}>
                  <Button variant="contained" fullWidth startIcon={<Iconify icon="solar:pen-bold-duotone" />} href="/instructor/assignments">
                    Create Assignment
                  </Button>
                  <Button variant="outlined" fullWidth startIcon={<Iconify icon="solar:upload-square-bold-duotone" />}>
                    Upload Materials
                  </Button>
                  <Button variant="outlined" fullWidth startIcon={<Iconify icon="solar:videocamera-bold-duotone" />}>
                    Schedule Zoom
                  </Button>
                  <Button variant="outlined" fullWidth startIcon={<Iconify icon="solar:chart-square-bold-duotone" />}>
                    View Analytics
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ boxShadow: theme.shadows[2] }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                  Recent Notifications
                </Typography>

                <Stack spacing={1.5}>
                  {([] as any[]).map((notification) => (
                    <Box
                      key={notification.id}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: notification.read ? 'transparent' : alpha(theme.palette.primary.main, 0.08),
                        border: '1px solid',
                        borderColor: notification.read ? theme.palette.divider : 'transparent',
                        display: 'flex',
                        gap: 2,
                      }}
                    >
                      <Box sx={{ mt: 0.5 }}>
                        <Iconify
                          icon="solar:bell-bold-duotone"
                          color={notification.read ? 'text.disabled' : 'primary.main'}
                          width={22}
                        />
                      </Box>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }} noWrap>
                          {notification.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }} noWrap>
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                          {notification.time}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>

                <Button variant="text" size="small" sx={{ mt: 2 }} href="/notifications">
                  View All Notifications
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </DashboardContent>
  );
}
