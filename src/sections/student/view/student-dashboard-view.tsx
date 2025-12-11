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
import LinearProgress from '@mui/material/LinearProgress';

import { DashboardContent } from 'src/layouts/dashboard';
import { useAuth } from 'src/contexts/simple-auth-context';

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
    },
  ],
  recentNotifications: [
    {
      id: '1',
      title: 'New Assignment Posted',
      message: 'Functions Assignment has been posted for Introduction to Programming',
      time: '2 hours ago',
      type: 'assignment',
      read: false,
    },
    {
      id: '2',
      title: 'Grade Updated',
      message: 'Your Variables Assignment has been graded: A-',
      time: '1 day ago',
      type: 'grade',
      read: false,
    },
    {
      id: '3',
      title: 'Upcoming Zoom Session',
      message: 'Live coding session starts in 30 minutes',
      time: '30 minutes',
      type: 'meeting',
      read: true,
    },
  ],
  upcomingEvents: [
    {
      id: '1',
      title: 'Programming Live Session',
      course: 'Introduction to Programming',
      date: new Date('2024-01-25T14:00:00'),
      type: 'zoom',
    },
    {
      id: '2',
      title: 'Assignment Due',
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

export function StudentDashboardView() {
  const { user } = useAuth();
  const theme = useTheme();
  const [studentData] = useState(mockStudentData);

  const statsCards = [
    {
      title: 'Enrolled Courses',
      value: studentData.stats.totalCourses,
      icon: 'solar:notebook-bold-duotone',
      color: 'primary',
      bgGradient: 'linear-gradient(135deg, #DC2626 0%, #FF6B6B 100%)',
      trend: 'Active',
    },
    {
      title: 'Completed Tasks',
      value: studentData.stats.completedAssignments,
      icon: 'solar:check-circle-bold-duotone',
      color: 'success',
      bgGradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
      trend: '+3 this week',
    },
    {
      title: 'Average Grade',
      value: studentData.stats.averageGrade,
      icon: 'solar:diploma-bold-duotone',
      color: 'warning',
      bgGradient: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
      trend: 'Top 10%',
    },
    {
      title: 'Study Hours',
      value: `${studentData.stats.studyHours}h`,
      icon: 'solar:clock-circle-bold-duotone',
      color: 'info',
      bgGradient: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
      trend: '+5h vs last week',
    },
  ];

  const chartOptions: ApexOptions = {
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: theme.typography.fontFamily,
    },
    colors: [theme.palette.primary.main],
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
      name: 'Study Hours',
      data: [2, 4, 3, 5, 4, 6, 3],
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
                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                fontSize: '2rem',
                fontWeight: 'bold',
                boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
              }}
            >
              {user?.name?.charAt(0) || 'S'}
            </Avatar>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                Welcome back, {user?.name}!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Ready to continue your learning journey?
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
              <Typography variant="h6" sx={{ mb: 3 }}>Learning Activity</Typography>
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
              {studentData.enrolledCourses.map((course) => (
                <Card key={course.id} sx={{ transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.1)' } }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {course.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Instructor: {course.instructor}
                        </Typography>
                      </Box>
                      <Chip label={`Grade: ${course.grade}`} color="primary" variant="outlined" />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">
                          Progress: {course.completedLessons}/{course.totalLessons} lessons
                        </Typography>
                        <Typography variant="body2" color="primary">
                          {course.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={course.progress}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: 'background.neutral',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            background: 'linear-gradient(90deg, #3B82F6 0%, #2563EB 100%)',
                          },
                        }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Iconify icon="solar:book-bookmark-bold-duotone" width={16} />
                          Next: {course.nextLesson}
                        </Typography>
                        <Typography variant="body2" color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Iconify icon="solar:alarm-bold-duotone" width={16} />
                          Due: {course.dueAssignment} ({course.dueDate.toLocaleDateString()})
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>

                  <CardActions>
                    <Button
                      variant="contained"
                      startIcon={<Iconify icon="solar:play-circle-bold-duotone" />}
                      href={`/course-room/${course.id}`}
                    >
                      Continue Learning
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Iconify icon="solar:upload-bold-duotone" />}
                    >
                      Submit Assignment
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Box>
          </Box>

          {/* Sidebar */}
          <Box>
            {/* Notifications */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Notifications
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {studentData.recentNotifications.slice(0, 4).map((notification) => (
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
                        icon={getNotificationIcon(notification.type)}
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

            {/* Upcoming Events */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Upcoming Events
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {studentData.upcomingEvents.map((event) => (
                    <Box
                      key={event.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 2,
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                      }}
                    >
                      <Iconify
                        icon={getEventIcon(event.type)}
                        color="primary.main"
                        width={24}
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          {event.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {event.course}
                        </Typography>
                        <Typography variant="caption" color="primary.main">
                          {event.date.toLocaleDateString()} at {event.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>

                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  sx={{ mt: 2 }}
                  href="/calendar"
                >
                  View Calendar
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </DashboardContent>
  );
}
