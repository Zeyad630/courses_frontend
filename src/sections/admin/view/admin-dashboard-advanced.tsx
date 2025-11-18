import { useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import TableRow from '@mui/material/TableRow';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
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
  const [tabValue, setTabValue] = useState(0);
  const [analytics] = useState(mockAnalytics);
  const [recentApplications] = useState(mockRecentApplications);
  const [topCourses] = useState(mockTopCourses);
  const [systemMetrics] = useState(mockSystemMetrics);

  const statsCards = [
    {
      title: 'Total Students',
      value: analytics.totalStudents,
      icon: 'solar:pen-bold',
      color: 'primary',
      subtitle: `+${analytics.newRegistrations} new this month`,
      trend: '+18%',
      bgGradient: 'linear-gradient(135deg, #DC2626 0%, #FF6B6B 100%)',
    },
    {
      title: 'Active Courses',
      value: analytics.activeCourses,
      icon: 'solar:eye-bold',
      color: 'info',
      subtitle: `${analytics.totalCourses} total available`,
      trend: '+12%',
      bgGradient: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
    },
    {
      title: 'Pending Reviews',
      value: analytics.pendingApplications,
      icon: 'solar:clock-circle-outline',
      color: 'warning',
      subtitle: 'Awaiting approval',
      trend: '+8%',
      bgGradient: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
    },
    {
      title: 'Total Revenue',
      value: `$${(analytics.totalRevenue / 1000).toFixed(0)}K`,
      icon: 'solar:cart-3-bold',
      color: 'success',
      subtitle: `$${(analytics.monthlyRevenue / 1000).toFixed(0)}K this month`,
      trend: '+25%',
      bgGradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
    },
  ];

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        {/* Header Section */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
            <Avatar
              sx={{
                width: 72,
                height: 72,
                background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                fontSize: '2rem',
                fontWeight: 'bold',
                boxShadow: '0 8px 24px rgba(220, 38, 38, 0.3)',
              }}
            >
              {user?.name?.charAt(0) || 'A'}
            </Avatar>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                Admin Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Welcome back, {user?.name}! Here&apos;s your platform overview
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Key Metrics Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 6 }}>
          {statsCards.map((card, index) => (
            <Box key={index}>
              <Card
                sx={{
                  height: '100%',
                  background: card.bgGradient,
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.16)',
                  },
                }}
              >
                <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                        {card.title}
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        {card.value}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.85 }}>
                        {card.subtitle}
                      </Typography>
                    </Box>
                    <Chip
                      label={card.trend}
                      size="small"
                      sx={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </CardContent>
                <Box
                  sx={{
                    position: 'absolute',
                    top: -40,
                    right: -40,
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                  }}
                />
              </Card>
            </Box>
          ))}
        </Box>

        {/* Main Content Tabs */}
        <Card sx={{ mb: 6, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)' }}>
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
                fontWeight: 500,
              },
            }}
          >
            <Tab label="Recent Applications" icon={<Iconify icon="solar:pen-bold" />} iconPosition="start" />
            <Tab label="Top Courses" icon={<Iconify icon="solar:eye-bold" />} iconPosition="start" />
            <Tab label="System Health" icon={<Iconify icon="solar:restart-bold" />} iconPosition="start" />
          </Tabs>

          {/* Applications Tab */}
          <TabPanel value={tabValue} index={0}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'background.neutral' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Course</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Applied Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentApplications.map((app) => (
                    <TableRow key={app.id} sx={{ '&:hover': { bgcolor: 'background.neutral' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                            {app.avatar}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">{app.studentName}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {app.studentEmail}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{app.courseName}</TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          ${app.coursePrice}
                        </Typography>
                      </TableCell>
                      <TableCell>{app.appliedAt.toLocaleDateString()}</TableCell>
                      <TableCell align="right">
                        <Button
                          variant="contained"
                          size="small"
                          sx={{ mr: 1 }}
                          startIcon={<Iconify icon="solar:eye-bold" width={16} />}
                        >
                          Review
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Iconify icon="solar:share-bold" width={16} />}
                        >
                          Reject
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Top Courses Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
              {topCourses.map((course) => (
                <Box key={course.id}>
                  <Paper
                    sx={{
                      p: 3,
                      background: 'linear-gradient(135deg, #F5F7FA 0%, #FFFFFF 100%)',
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12)',
                        transform: 'translateY(-4px)',
                      },
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                      {course.title}
                    </Typography>

                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                      Instructor: {course.instructor}
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
                          {course.rating}⭐
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
                          background: 'rgba(220, 38, 38, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            background: 'linear-gradient(90deg, #DC2626 0%, #EF4444 100%)',
                          },
                        }}
                      />
                    </Box>

                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<Iconify icon="solar:eye-bold" width={16} />}
                    >
                      View Details
                    </Button>
                  </Paper>
                </Box>
              ))}
            </Box>
          </TabPanel>

          {/* System Health Tab */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3 }}>
              {systemMetrics.map((metric, index) => (
                <Box key={index}>
                  <Paper
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      background: metric.status === 'excellent' 
                        ? 'linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)'
                        : 'linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)',
                      border: '1px solid',
                      borderColor: metric.status === 'excellent' ? 'success.light' : 'warning.light',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                      <Iconify
                        icon={metric.status === 'excellent' ? 'solar:eye-bold' : 'solar:clock-circle-outline'}
                        width={32}
                        color={metric.status === 'excellent' ? 'success.main' : 'warning.main'}
                      />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                      {metric.value}
                      <Typography component="span" variant="body2" color="text.secondary">
                        {' '}
                        {metric.unit}
                      </Typography>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {metric.label}
                    </Typography>
                    <Chip
                      label={metric.status}
                      size="small"
                      color={metric.status === 'excellent' ? 'success' : 'warning'}
                      variant="outlined"
                      sx={{ mt: 2 }}
                    />
                  </Paper>
                </Box>
              ))}
            </Box>
          </TabPanel>
        </Card>

        {/* Quick Actions */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
          <Button
            variant="contained"
            fullWidth
            size="large"
            startIcon={<Iconify icon="solar:pen-bold" />}
            sx={{ py: 2 }}
          >
            Review Applications
          </Button>
          <Button
            variant="outlined"
            fullWidth
            size="large"
            startIcon={<Iconify icon="solar:eye-bold" />}
            sx={{ py: 2 }}
          >
            Manage Users
          </Button>
          <Button
            variant="outlined"
            fullWidth
            size="large"
            startIcon={<Iconify icon="solar:share-bold" />}
            sx={{ py: 2 }}
          >
            Course Management
          </Button>
          <Button
            variant="outlined"
            fullWidth
            size="large"
            startIcon={<Iconify icon="solar:restart-bold" />}
            sx={{ py: 2 }}
          >
            System Settings
          </Button>
        </Box>
      </Container>
    </DashboardContent>
  );
}
