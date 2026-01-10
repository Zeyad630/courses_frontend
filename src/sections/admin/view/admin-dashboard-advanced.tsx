import type { ApexOptions } from 'apexcharts';

import Chart from 'react-apexcharts';
import { useCallback, useEffect, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import TableRow from '@mui/material/TableRow';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';
import TableContainer from '@mui/material/TableContainer';

import { DashboardContent } from 'src/layouts/dashboard';
import { useAuth } from 'src/contexts/simple-auth-context';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const mockAnalytics = {
  totalCourses: 42,
  activeCourses: 28,
  totalStudents: 1250,
  totalInstructors: 45,
  pendingApplications: 67,
  acceptedApplications: 892,
  rejectedApplications: 45,
  totalRevenue: 245600,
  monthlyRevenue: 42300,
  courseCompletionRate: 82,
  studentSatisfaction: 4.8,
  systemUptime: 99.95,
  activeUsers: 523,
  newRegistrations: 125,
  coursesThisMonth: 8,
};

const mockRecentApplications = [
  {
    id: 'app_1',
    studentName: 'Sarah Johnson',
    studentEmail: 'sarah.j@email.com',
    courseName: 'Advanced Web Development',
    coursePrice: 599,
    appliedAt: new Date('2024-01-25'),
    status: 'pending',
    avatar: 'SJ',
  },
  {
    id: 'app_2',
    studentName: 'Michael Chen',
    studentEmail: 'michael.c@email.com',
    courseName: 'Data Science Bootcamp',
    coursePrice: 699,
    appliedAt: new Date('2024-01-24'),
    status: 'pending',
    avatar: 'MC',
  },
  {
    id: 'app_3',
    studentName: 'Emma Davis',
    studentEmail: 'emma.d@email.com',
    courseName: 'Mobile App Development',
    coursePrice: 549,
    appliedAt: new Date('2024-01-23'),
    status: 'pending',
    avatar: 'ED',
  },
];

const mockTopCourses = [
  {
    id: '1',
    title: 'Full Stack Web Development',
    students: 234,
    revenue: 140000,
    rating: 4.9,
    completion: 88,
    instructor: 'John Smith',
  },
  {
    id: '2',
    title: 'Machine Learning Fundamentals',
    students: 189,
    revenue: 132300,
    rating: 4.7,
    completion: 75,
    instructor: 'Dr. Lisa Wang',
  },
  {
    id: '3',
    title: 'UI/UX Design Masterclass',
    students: 156,
    revenue: 93600,
    rating: 4.8,
    completion: 92,
    instructor: 'Alex Rivera',
  },
];

const mockSystemMetrics = [
  { label: 'Server Response Time', value: 145, unit: 'ms', status: 'good' },
  { label: 'Database Queries', value: 1250, unit: '/min', status: 'good' },
  { label: 'API Requests', value: 8900, unit: '/hour', status: 'excellent' },
  { label: 'Error Rate', value: 0.02, unit: '%', status: 'excellent' },
];

// TabPanel Component
function TabPanel(props: any) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export function AdminDashboardAdvanced() {
  const { user } = useAuth();
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [analytics] = useState(mockAnalytics);
  const [recentApplications] = useState(mockRecentApplications);
  const [topCourses] = useState(mockTopCourses);
  const [systemMetrics] = useState(mockSystemMetrics);

  const latestApplications = useMemo(
    () =>
      [...recentApplications]
        .sort((a, b) => b.appliedAt.getTime() - a.appliedAt.getTime())
        .slice(0, 3),
    [recentApplications]
  );

  const rankedTopCourses = useMemo(
    () => [...topCourses].sort((a, b) => b.revenue - a.revenue),
    [topCourses]
  );

  const getSystemStatusMeta = useCallback(
    (status: string) => {
      switch (status) {
        case 'excellent':
          return {
            color: 'success' as const,
            icon: 'solar:shield-check-bold-duotone',
            surface: alpha(theme.palette.success.lighter, 0.32),
            border: alpha(theme.palette.success.main, 0.35),
          };
        case 'good':
          return {
            color: 'info' as const,
            icon: 'solar:check-circle-bold-duotone',
            surface: alpha(theme.palette.info.lighter, 0.28),
            border: alpha(theme.palette.info.main, 0.3),
          };
        case 'warning':
          return {
            color: 'warning' as const,
            icon: 'solar:danger-circle-bold-duotone',
            surface: alpha(theme.palette.warning.lighter, 0.28),
            border: alpha(theme.palette.warning.main, 0.3),
          };
        default:
          return {
            color: 'error' as const,
            icon: 'solar:danger-triangle-bold-duotone',
            surface: alpha(theme.palette.error.lighter, 0.24),
            border: alpha(theme.palette.error.main, 0.32),
          };
      }
    },
    [theme]
  );

  const systemHealth = useMemo(() => {
    const counts = systemMetrics.reduce(
      (acc, m) => {
        acc[m.status] = (acc[m.status] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const score = systemMetrics.reduce((acc, m) => {
      if (m.status === 'excellent') return acc + 100;
      if (m.status === 'good') return acc + 85;
      if (m.status === 'warning') return acc + 65;
      return acc + 45;
    }, 0);

    const pct = systemMetrics.length ? Math.round(score / systemMetrics.length) : 0;
    const isOperational = (counts.warning ?? 0) === 0 && (counts.error ?? 0) === 0 && (counts.critical ?? 0) === 0;

    return { counts, pct, isOperational };
  }, [systemMetrics]);

  useEffect(() => {
    let active = true;
    setIsLoading(true);

    const t = setTimeout(() => {
      if (!active) return;
      setIsLoading(false);
    }, 300);

    return () => {
      active = false;
      clearTimeout(t);
    };
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  }, []);

  const statsCards = [
    {
      title: 'Total Students',
      value: analytics.totalStudents,
      icon: 'solar:users-group-rounded-bold',
      color: theme.palette.primary.main,
      textColor: theme.palette.primary.darker,
      subtitle: `+${analytics.newRegistrations} new this month`,
      trend: '+18%',
      bgGradient: `linear-gradient(135deg, ${alpha(theme.palette.primary.lighter, 0.8)} 0%, ${alpha(theme.palette.primary.light, 0.9)} 100%)`,
    },
    {
      title: 'Active Courses',
      value: analytics.activeCourses,
      icon: 'solar:notebook-bold',
      color: theme.palette.info.main,
      textColor: theme.palette.info.darker,
      subtitle: `${analytics.totalCourses} total available`,
      trend: '+12%',
      bgGradient: `linear-gradient(135deg, ${alpha(theme.palette.info.lighter, 0.8)} 0%, ${alpha(theme.palette.info.light, 0.9)} 100%)`,
    },
    {
      title: 'Pending Reviews',
      value: analytics.pendingApplications,
      icon: 'solar:clock-circle-bold',
      color: theme.palette.warning.main,
      textColor: theme.palette.warning.darker,
      subtitle: 'Awaiting approval',
      trend: '+8%',
      bgGradient: `linear-gradient(135deg, ${alpha(theme.palette.warning.lighter, 0.8)} 0%, ${alpha(theme.palette.warning.light, 0.9)} 100%)`,
    },
    {
      title: 'Total Revenue',
      value: `$${(analytics.totalRevenue / 1000).toFixed(0)}K`,
      icon: 'solar:wad-of-money-bold',
      color: theme.palette.success.main,
      textColor: theme.palette.success.darker,
      subtitle: `$${(analytics.monthlyRevenue / 1000).toFixed(0)}K this month`,
      trend: '+25%',
      bgGradient: `linear-gradient(135deg, ${alpha(theme.palette.success.lighter, 0.8)} 0%, ${alpha(theme.palette.success.light, 0.9)} 100%)`,
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
      name: 'Active Users',
      data: [320, 450, 420, 550, 600, 480, 523],
    },
    {
      name: 'New Registrations',
      data: [15, 25, 20, 35, 40, 28, 32],
    },
  ];

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        {error && (
          <Box sx={{ mb: 3 }}>
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={handleRetry}>
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          </Box>
        )}

        {isLoading && (
          <Box sx={{ mb: 3 }}>
            <Card sx={{ p: 2 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                Loading dashboard...
              </Typography>
            </Card>
          </Box>
        )}

        {/* Header Section */}
        <Box
          sx={{
            mb: 6,
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
                width: 72,
                height: 72,
                bgcolor: 'white',
                color: 'primary.main',
                fontSize: '2rem',
                fontWeight: 'bold',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              }}
            >
              {user?.name?.charAt(0) || 'A'}
            </Avatar>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                Admin Dashboard
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Welcome back, {user?.name}! Here&apos;s your platform overview
              </Typography>
            </Box>
          </Box>
          {/* Decorative Circles */}
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

        {/* Key Metrics Grid */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {statsCards.map((card, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                sx={{
                  height: '100%',
                  background: card.bgGradient,
                  color: card.textColor,
                  position: 'relative',
                  overflow: 'visible',
                  boxShadow: 'none',
                  p: 3,
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
                        bgcolor: 'rgba(255, 255, 255, 0.3)',
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
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
                    {card.subtitle}
                  </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Activity Chart */}
        <Card sx={{ mb: 6, p: 3, boxShadow: theme.shadows[2] }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
             <Typography variant="h6" sx={{ fontWeight: 700 }}>Platform Activity (Last 7 Days)</Typography>
             <Button variant="outlined" size="small">Download Report</Button>
          </Stack>
          <Box sx={{ height: 350, width: '100%' }}>
            <Chart
              options={chartOptions}
              series={chartSeries}
              type="area"
              height={350}
            />
          </Box>
        </Card>

        {/* Main Content Tabs */}
        <Card sx={{ mb: 6, boxShadow: theme.shadows[3] }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              px: 3,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                color: 'text.secondary',
                '&.Mui-selected': {
                  color: 'primary.main',
                },
              },
            }}
          >
            <Tab label="Recent Applications" icon={<Iconify icon="solar:pen-bold-duotone" />} iconPosition="start" />
            <Tab label="Top Courses" icon={<Iconify icon="solar:star-bold-duotone" />} iconPosition="start" />
            <Tab label="System Health" icon={<Iconify icon="solar:server-square-bold-duotone" />} iconPosition="start" />
          </Tabs>

          {/* Applications Tab */}
          <TabPanel value={tabValue} index={0}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'background.neutral' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Course</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Applied Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {latestApplications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                          No recent applications.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    latestApplications.map((app) => (
                      <TableRow key={app.id} sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.lighter, 0.2) } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                              sx={{
                                bgcolor: 'primary.lighter',
                                color: 'primary.dark',
                                width: 40,
                                height: 40,
                                fontWeight: 'bold',
                              }}
                            >
                              {app.avatar}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {app.studentName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {app.studentEmail}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{app.courseName}</TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'success.main' }}>
                            ${app.coursePrice}
                          </Typography>
                        </TableCell>
                        <TableCell>{app.appliedAt.toLocaleDateString()}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              variant="outlined"
                              color="primary"
                              size="small"
                              startIcon={<Iconify icon="solar:eye-bold" width={16} />}
                            >
                              Review
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<Iconify icon="solar:trash-bin-trash-bold" width={16} />}
                            >
                              Reject
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Top Courses Tab */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              {rankedTopCourses.map((course, idx) => (
                <Grid key={course.id} size={{ xs: 12, md: 4 }}>
                  <Paper
                    sx={{
                      p: 3,
                      background: alpha(theme.palette.background.neutral, 0.5),
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: theme.shadows[10],
                        transform: 'translateY(-4px)',
                        bgcolor: 'background.paper',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {course.title}
                      </Typography>
                      <Chip
                        label={`#${idx + 1}`}
                        size="small"
                        color={idx === 0 ? 'success' : idx === 1 ? 'info' : 'default'}
                        variant={idx === 0 ? 'filled' : 'outlined'}
                        sx={{ fontWeight: 900 }}
                      />
                    </Box>

                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 3 }}>
                      <Iconify icon="solar:user-circle-bold" width={14} />
                       {course.instructor}
                    </Typography>

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                      <Box>
                        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                          {course.students}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Students
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="h6" color="success.main" sx={{ fontWeight: 700 }}>
                          ${(course.revenue / 1000).toFixed(0)}K
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Revenue
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="h6" color="warning.main" sx={{ fontWeight: 700 }}>
                          {course.rating}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Rating
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="h6" color="info.main" sx={{ fontWeight: 700 }}>
                          {course.completion}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Completion
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: 1,
                        mb: 2.5,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Iconify icon="solar:users-group-rounded-bold" width={16} />
                        <Typography variant="caption" color="text.secondary">
                          {(course.revenue / Math.max(course.students, 1)).toFixed(0)} / student
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Iconify icon="solar:money-bag-bold-duotone" width={16} />
                        <Typography variant="caption" color="text.secondary">
                          ${(course.revenue / 1000).toFixed(1)}k gross
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Iconify icon="solar:star-bold" width={16} />
                        <Typography variant="caption" color="text.secondary">
                          {course.rating} avg
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Progress
                        </Typography>
                        <Typography variant="body2" color="primary">
                          {course.completion}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={course.completion}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: alpha(theme.palette.error.main, 0.1),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                             backgroundImage: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`
                          },
                        }}
                      />
                    </Box>

                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<Iconify icon="solar:eye-bold" width={16} />}
                      sx={{ borderRadius: 30 }}
                    >
                      View Details
                    </Button>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          {/* System Health Tab */}
          <TabPanel value={tabValue} index={2}>
            <Card
              sx={{
                mb: 3,
                p: 2.5,
                borderRadius: 2,
                border: '1px solid',
                borderColor: systemHealth.isOperational
                  ? alpha(theme.palette.success.main, 0.22)
                  : alpha(theme.palette.warning.main, 0.22),
                bgcolor: systemHealth.isOperational
                  ? alpha(theme.palette.success.lighter, 0.22)
                  : alpha(theme.palette.warning.lighter, 0.2),
              }}
            >
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }} justifyContent="space-between">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: systemHealth.isOperational
                        ? alpha(theme.palette.success.main, 0.14)
                        : alpha(theme.palette.warning.main, 0.14),
                      color: systemHealth.isOperational ? 'success.main' : 'warning.main',
                    }}
                  >
                    <Iconify
                      icon={systemHealth.isOperational ? 'solar:shield-check-bold-duotone' : 'solar:danger-circle-bold-duotone'}
                      width={24}
                    />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>
                      {systemHealth.isOperational ? 'All systems operational' : 'Attention needed'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Health score: {systemHealth.pct}%
                    </Typography>
                  </Box>
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip label={`Excellent: ${systemHealth.counts.excellent ?? 0}`} size="small" color="success" variant="outlined" />
                  <Chip label={`Good: ${systemHealth.counts.good ?? 0}`} size="small" color="info" variant="outlined" />
                  <Chip label={`Warnings: ${systemHealth.counts.warning ?? 0}`} size="small" color="warning" variant="outlined" />
                </Stack>
              </Stack>
            </Card>

            <Grid container spacing={3}>
              {systemMetrics.map((metric, index) => {
                const meta = getSystemStatusMeta(metric.status);

                return (
                  <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        background: meta.surface,
                        border: '1px solid',
                        borderColor: meta.border,
                        borderRadius: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        <Iconify icon={meta.icon} width={40} color={`${meta.color}.main`} />
                      </Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        {metric.value}
                        <Typography component="span" variant="body2" color="text.secondary">
                          {' '}
                          {metric.unit}
                        </Typography>
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                        {metric.label}
                      </Typography>
                      <Chip
                        label={metric.status.toUpperCase()}
                        size="small"
                        color={meta.color}
                        variant="outlined"
                        sx={{ mt: 2, fontWeight: 'bold' }}
                      />
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </TabPanel>
        </Card>

        {/* Quick Actions */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<Iconify icon="solar:pen-bold" />}
              sx={{ py: 2, borderRadius: 2, boxShadow: theme.shadows[8] }}
              href="/admin/applications"
            >
              Review Applications
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              startIcon={<Iconify icon="solar:users-group-rounded-bold" />}
              sx={{ py: 2, borderRadius: 2, borderWidth: 2 }}
              href="/admin/users"
            >
              Manage Users
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              startIcon={<Iconify icon="solar:notebook-bold" />}
              sx={{ py: 2, borderRadius: 2, borderWidth: 2 }}
              href="/admin/courses"
            >
              Course Management
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              startIcon={<Iconify icon="solar:settings-bold" />}
              sx={{ py: 2, borderRadius: 2, borderWidth: 2 }}
              href="/admin/reports"
            >
              System Settings
            </Button>
          </Grid>
        </Grid>
      </Container>
    </DashboardContent>
  );
}
