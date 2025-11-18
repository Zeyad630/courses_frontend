import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';

import { DashboardContent } from 'src/layouts/dashboard';
import { useAuth } from 'src/contexts/simple-auth-context';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// Enhanced mock analytics data
const mockAnalytics = {
  totalCourses: 12,
  activeCourses: 8,
  totalStudents: 156,
  totalInstructors: 8,
  pendingApplications: 23,
  acceptedApplications: 89,
  rejectedApplications: 12,
  totalRevenue: 45600,
  monthlyRevenue: 8900,
  courseCompletionRate: 78,
  studentSatisfaction: 4.6,
  systemUptime: 99.9,
  activeUsers: 142,
  newRegistrations: 15,
  coursesThisMonth: 3,
};

const mockRecentApplications = [
  {
    id: 'app_1',
    studentName: 'John Doe',
    studentEmail: 'john.doe@email.com',
    courseName: 'Web Development Bootcamp',
    coursePrice: 499,
    appliedAt: new Date('2024-01-20'),
    status: 'pending',
  },
  {
    id: 'app_2',
    studentName: 'Jane Smith',
    studentEmail: 'jane.smith@email.com',
    courseName: 'Data Science Fundamentals',
    coursePrice: 399,
    appliedAt: new Date('2024-01-19'),
    status: 'pending',
  },
  {
    id: 'app_3',
    studentName: 'Mike Johnson',
    studentEmail: 'mike.johnson@email.com',
    courseName: 'Mobile App Development',
    coursePrice: 349,
    appliedAt: new Date('2024-01-18'),
    status: 'pending',
  },
];

const mockSystemAlerts = [
  {
    id: '1',
    title: 'Server Maintenance',
    message: 'Scheduled maintenance on Sunday 2 AM - 4 AM',
    type: 'info',
    priority: 'medium',
    time: '2 hours ago',
  },
  {
    id: '2',
    title: 'High Application Volume',
    message: '50+ applications received in the last 24 hours',
    type: 'warning',
    priority: 'high',
    time: '4 hours ago',
  },
  {
    id: '3',
    title: 'Payment Gateway Update',
    message: 'Payment system updated successfully',
    type: 'success',
    priority: 'low',
    time: '1 day ago',
  },
];

const mockTopCourses = [
  {
    id: '1',
    title: 'Web Development Bootcamp',
    students: 45,
    revenue: 22500,
    rating: 4.8,
    completion: 85,
  },
  {
    id: '2',
    title: 'Data Science Fundamentals',
    students: 38,
    revenue: 15200,
    rating: 4.6,
    completion: 78,
  },
  {
    id: '3',
    title: 'Mobile App Development',
    students: 32,
    revenue: 11200,
    rating: 4.7,
    completion: 82,
  },
];

export function AdminDashboardView() {
  const { user } = useAuth();
  const [analytics] = useState(mockAnalytics);
  const [recentApplications] = useState(mockRecentApplications);
  const [systemAlerts] = useState(mockSystemAlerts);
  const [topCourses] = useState(mockTopCourses);

  const statsCards = [
    {
      title: 'Total Students',
      value: analytics.totalStudents,
      icon: 'solar:pen-bold',
      color: 'primary',
      subtitle: `+${analytics.newRegistrations} this month`,
      trend: '+12%',
    },
    {
      title: 'Active Courses',
      value: analytics.activeCourses,
      icon: 'solar:eye-bold',
      color: 'info',
      subtitle: `${analytics.totalCourses} total courses`,
      trend: '+8%',
    },
    {
      title: 'Pending Reviews',
      value: analytics.pendingApplications,
      icon: 'solar:clock-circle-outline',
      color: 'warning',
      subtitle: 'Need attention',
      trend: '+15%',
    },
    {
      title: 'Monthly Revenue',
      value: `$${analytics.monthlyRevenue.toLocaleString()}`,
      icon: 'solar:cart-3-bold',
      color: 'success',
      subtitle: `$${analytics.totalRevenue.toLocaleString()} total`,
      trend: '+23%',
    },
    {
      title: 'Completion Rate',
      value: `${analytics.courseCompletionRate}%`,
      icon: 'solar:share-bold',
      color: 'primary',
      subtitle: 'Course completion',
      trend: '+5%',
    },
    {
      title: 'Satisfaction',
      value: `${analytics.studentSatisfaction}⭐`,
      icon: 'solar:eye-bold',
      color: 'success',
      subtitle: 'Student rating',
      trend: '+0.2',
    },
    {
      title: 'System Uptime',
      value: `${analytics.systemUptime}%`,
      icon: 'solar:restart-bold',
      color: 'info',
      subtitle: 'Last 30 days',
      trend: 'Stable',
    },
    {
      title: 'Active Users',
      value: analytics.activeUsers,
      icon: 'solar:pen-bold',
      color: 'warning',
      subtitle: 'Online now',
      trend: '+18%',
    },
  ];

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        {/* Welcome Section */}
        <Box sx={{ mb: 5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: 'error.main',
                fontSize: '1.5rem',
                fontWeight: 'bold',
              }}
            >
              {user?.name?.charAt(0) || 'A'}
            </Avatar>
            <Box>
              <Typography variant="h4">Admin Control Center</Typography>
              <Typography variant="body1" color="text.secondary">
                Welcome back, {user?.name}! Monitor and manage your educational platform
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Enhanced Statistics Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 3, mb: 5 }}>
          {statsCards.map((card, index) => (
            <Card key={index} sx={{ position: 'relative', overflow: 'visible' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: `${card.color}.lighter`,
                      color: `${card.color}.main`,
                      mr: 2,
                    }}
                  >
                    <Iconify icon={card.icon as any} width={28} />
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h4" sx={{ mb: 0.5 }}>
                      {card.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {card.subtitle}
                    </Typography>
                  </Box>
                  <Chip
                    label={card.trend}
                    size="small"
                    color={card.trend.includes('+') ? 'success' : 'default'}
                    variant="outlined"
                  />
                </Box>
                <Typography variant="subtitle2" color="text.secondary">
                  {card.title}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3, mb: 5 }}>
          {/* Recent Applications */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Recent Applications</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  href="/admin/applications"
                  startIcon={<Iconify icon="solar:eye-bold" />}
                >
                  View All ({analytics.pendingApplications})
                </Button>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {recentApplications.map((application) => (
                  <Box
                    key={application.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 3,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 2,
                      '&:hover': {
                        bgcolor: 'background.neutral',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {application.studentName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">{application.studentName}</Typography>
                        <Typography variant="body2" color="primary.main">
                          {application.courseName}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          ${application.coursePrice} • {application.appliedAt.toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Iconify icon="solar:eye-bold" />}
                      href="/admin/applications"
                    >
                      Review
                    </Button>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* System Alerts */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                System Alerts
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {systemAlerts.map((alert) => (
                  <Box
                    key={alert.id}
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      bgcolor: alert.type === 'warning' ? 'warning.lighter' : 
                              alert.type === 'success' ? 'success.lighter' : 'info.lighter',
                      border: 1,
                      borderColor: alert.type === 'warning' ? 'warning.main' : 
                                  alert.type === 'success' ? 'success.main' : 'info.main',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Iconify
                        icon={alert.type === 'warning' ? 'solar:clock-circle-outline' : 
                              alert.type === 'success' ? 'solar:eye-bold' : 'solar:pen-bold'}
                        width={16}
                        color={alert.type === 'warning' ? 'warning.main' : 
                               alert.type === 'success' ? 'success.main' : 'info.main'}
                      />
                      <Typography variant="subtitle2">
                        {alert.title}
                      </Typography>
                      <Chip
                        label={alert.priority}
                        size="small"
                        color={alert.priority === 'high' ? 'error' : 
                               alert.priority === 'medium' ? 'warning' : 'default'}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {alert.message}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {alert.time}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Top Performing Courses */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Top Performing Courses
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
              {topCourses.map((course) => (
                <Box
                  key={course.id}
                  sx={{
                    p: 3,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom>
                    {course.title}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                    <Box>
                      <Typography variant="h6" color="primary.main">
                        {course.students}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Students
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="h6" color="success.main">
                        ${course.revenue.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Revenue
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="h6" color="warning.main">
                        {course.rating}⭐
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Rating
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Completion Rate</Typography>
                      <Typography variant="body2" color="primary">
                        {course.completion}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={course.completion}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>

                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    startIcon={<Iconify icon="solar:eye-bold" />}
                    href={`/course-room/${course.id}`}
                  >
                    View Course Details
                  </Button>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mt: 3 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Iconify icon="solar:pen-bold" />}
            href="/admin/applications"
            sx={{ py: 2 }}
          >
            Review Applications
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<Iconify icon="solar:eye-bold" />}
            href="/admin/users"
            sx={{ py: 2 }}
          >
            Manage Users
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<Iconify icon="solar:share-bold" />}
            href="/admin/courses"
            sx={{ py: 2 }}
          >
            Course Management
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<Iconify icon="solar:cart-3-bold" />}
            href="/admin/reports"
            sx={{ py: 2 }}
          >
            Financial Reports
          </Button>
        </Box>
      </Container>
    </DashboardContent>
  );
}
