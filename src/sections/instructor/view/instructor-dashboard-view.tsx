import type { ApexOptions } from 'apexcharts';

import { useState } from 'react';
import Chart from 'react-apexcharts';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import { useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';

import { DashboardContent } from 'src/layouts/dashboard';
import { useAuth } from 'src/contexts/simple-auth-context';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// Mock instructor data
const mockInstructorData = {
  myCourses: [
    {
      id: '1',
      title: 'Introduction to Programming',
      students: 25,
      pendingAssignments: 8,
      avgGrade: 'B+',
      nextClass: new Date('2024-01-25T14:00:00'),
      recentActivity: 'New assignment submitted by John Doe',
    },
    {
      id: '2',
      title: 'Advanced JavaScript',
      students: 18,
      pendingAssignments: 3,
      avgGrade: 'A-',
      nextClass: new Date('2024-01-26T10:00:00'),
      recentActivity: '5 students completed React project',
    },
  ],
  pendingGrading: [
    {
      id: '1',
      studentName: 'John Doe',
      assignment: 'Variables and Functions',
      course: 'Introduction to Programming',
      submittedAt: new Date('2024-01-20'),
      daysOverdue: 2,
    },
    {
      id: '2',
      studentName: 'Jane Smith',
      assignment: 'React Components',
      course: 'Advanced JavaScript',
      submittedAt: new Date('2024-01-22'),
      daysOverdue: 0,
    },
  ],
  recentNotifications: [
    {
      id: '1',
      title: 'Assignment Submitted',
      message: 'John Doe submitted Variables Assignment',
      time: '1 hour ago',
      type: 'submission',
      read: false,
    },
    {
      id: '2',
      title: 'Student Question',
      message: 'Sarah Wilson asked a question in Programming course',
      time: '3 hours ago',
      type: 'question',
      read: false,
    },
  ],
  stats: {
    totalStudents: 43,
    totalCourses: 2,
    pendingGrades: 11,
    avgCourseRating: 4.8,
  },
};

export function InstructorDashboardView() {
  const { user } = useAuth();
  const theme = useTheme();
  const [instructorData] = useState(mockInstructorData);

  const statsCards = [
    {
      title: 'Total Students',
      value: instructorData.stats.totalStudents,
      icon: 'solar:users-group-rounded-bold-duotone',
      color: 'primary',
      bgGradient: 'linear-gradient(135deg, #DC2626 0%, #FF6B6B 100%)',
      trend: '+12%',
    },
    {
      title: 'Active Courses',
      value: instructorData.stats.totalCourses,
      icon: 'solar:notebook-bold-duotone',
      color: 'info',
      bgGradient: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
      trend: 'Active',
    },
    {
      title: 'Pending Grades',
      value: instructorData.stats.pendingGrades,
      icon: 'solar:clipboard-list-bold-duotone',
      color: 'warning',
      bgGradient: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
      trend: 'Needs Action',
    },
    {
      title: 'Course Rating',
      value: `${instructorData.stats.avgCourseRating}⭐`,
      icon: 'solar:star-bold-duotone',
      color: 'success',
      bgGradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
      trend: '+0.2',
    },
  ];

  const chartOptions: ApexOptions = {
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: theme.typography.fontFamily,
    },
    colors: [theme.palette.primary.main, theme.palette.warning.main],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.9,
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
        {/* Welcome Section */}
        <Box sx={{ mb: 5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
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
              {user?.name?.charAt(0) || 'I'}
            </Avatar>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                Welcome, Professor {user?.name}!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your courses and help students succeed
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 5 }}>
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
                  <Iconify
                    icon={card.icon}
                    width={40}
                    sx={{
                      position: 'absolute',
                      right: 24,
                      bottom: 24,
                      opacity: 0.4,
                    }}
                  />
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

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
          {/* Main Content Area */}
          <Box>
            {/* Activity Chart */}
            <Card sx={{ mb: 3, p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>Student Engagement</Typography>
              <Box sx={{ height: 350, width: '100%' }}>
                <Chart
                  options={chartOptions}
                  series={chartSeries}
                  type="area"
                  height={350}
                />
              </Box>
            </Card>

            {/* My Courses */}
            <Typography variant="h5" sx={{ mb: 3 }}>
              My Courses
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {instructorData.myCourses.map((course) => (
                <Card key={course.id} sx={{ transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.1)' } }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {course.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {course.students} students enrolled
                        </Typography>
                      </Box>
                      <Chip label={`Avg: ${course.avgGrade}`} color="primary" variant="outlined" />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                      <Box>
                        <Typography variant="body2" color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Iconify icon="solar:clipboard-list-bold-duotone" width={16} />
                          {course.pendingAssignments} assignments to grade
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="info.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Iconify icon="solar:calendar-bold-duotone" width={16} />
                          Next class: {course.nextClass.toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Recent: {course.recentActivity}
                      </Typography>
                    </Box>
                  </CardContent>

                  <CardActions>
                    <Button
                      variant="contained"
                      startIcon={<Iconify icon="solar:eye-bold-duotone" />}
                      href={`/course-room/${course.id}`}
                    >
                      Manage Course
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Iconify icon="solar:pen-bold-duotone" />}
                    >
                      Grade Assignments
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Box>

            {/* Pending Grading */}
            <Typography variant="h5" sx={{ mt: 5, mb: 3 }}>
              Pending Grading
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {instructorData.pendingGrading.map((item) => (
                <Card key={item.id}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle1" gutterBottom>
                          {item.studentName} - {item.assignment}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Course: {item.course}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          Submitted: {item.submittedAt.toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        {item.daysOverdue > 0 && (
                          <Chip
                            label={`${item.daysOverdue} days overdue`}
                            color="error"
                            size="small"
                            sx={{ mb: 1 }}
                          />
                        )}
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<Iconify icon="solar:pen-bold-duotone" />}
                        >
                          Grade Now
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>

          {/* Sidebar */}
          <Box>
            {/* Quick Actions */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<Iconify icon="solar:pen-bold-duotone" />}
                  >
                    Create Assignment
                  </Button>
                  
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Iconify icon="solar:upload-square-bold-duotone" />}
                  >
                    Upload Materials
                  </Button>
                  
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Iconify icon="solar:videocamera-bold-duotone" />}
                  >
                    Schedule Zoom
                  </Button>
                  
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Iconify icon="solar:chart-square-bold-duotone" />}
                  >
                    View Analytics
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Notifications
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {instructorData.recentNotifications.map((notification) => (
                    <Box
                      key={notification.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 2,
                        p: 2,
                        bgcolor: notification.read ? 'background.neutral' : 'primary.lighter',
                        borderRadius: 1,
                        border: notification.read ? 'none' : 1,
                        borderColor: 'primary.main',
                      }}
                    >
                      <Iconify
                        icon="solar:bell-bold-duotone"
                        color={notification.read ? 'text.secondary' : 'primary.main'}
                        width={20}
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          {notification.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {notification.time}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>

                <Button
                  variant="text"
                  size="small"
                  sx={{ mt: 2 }}
                  href="/notifications"
                >
                  View All Notifications
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </DashboardContent>
  );
}
