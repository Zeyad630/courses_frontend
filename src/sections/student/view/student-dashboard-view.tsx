import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
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
      return 'solar:pen-bold';
    case 'grade':
      return 'solar:eye-bold';
    case 'meeting':
      return 'solar:share-bold';
    default:
      return 'solar:pen-bold';
  }
};

const getEventIcon = (type: string) => {
  switch (type) {
    case 'zoom':
      return 'solar:share-bold';
    case 'assignment':
      return 'solar:pen-bold';
    default:
      return 'solar:pen-bold';
  }
};

export function StudentDashboardView() {
  const { user } = useAuth();
  const [studentData] = useState(mockStudentData);

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
                bgcolor: 'primary.main',
                fontSize: '1.5rem',
                fontWeight: 'bold',
              }}
            >
              {user?.name?.charAt(0) || 'S'}
            </Avatar>
            <Box>
              <Typography variant="h4">Welcome back, {user?.name}!</Typography>
              <Typography variant="body1" color="text.secondary">
                Ready to continue your learning journey?
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3, mb: 5 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Iconify icon="solar:pen-bold" width={32} color="primary.main" sx={{ mb: 1 }} />
              <Typography variant="h4" color="primary.main">
                {studentData.stats.totalCourses}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enrolled Courses
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Iconify icon="solar:eye-bold" width={32} color="success.main" sx={{ mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {studentData.stats.completedAssignments}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed Tasks
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Iconify icon="solar:share-bold" width={32} color="warning.main" sx={{ mb: 1 }} />
              <Typography variant="h4" color="warning.main">
                {studentData.stats.averageGrade}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average Grade
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Iconify icon="solar:clock-circle-outline" width={32} color="info.main" sx={{ mb: 1 }} />
              <Typography variant="h4" color="info.main">
                {studentData.stats.studyHours}h
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Study Hours
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
          {/* My Courses */}
          <Box>
            <Typography variant="h5" sx={{ mb: 3 }}>
              My Courses
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {studentData.enrolledCourses.map((course) => (
                <Card key={course.id}>
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
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Next: {course.nextLesson}
                        </Typography>
                        <Typography variant="body2" color="warning.main">
                          Due: {course.dueAssignment} ({course.dueDate.toLocaleDateString()})
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>

                  <CardActions>
                    <Button
                      variant="contained"
                      startIcon={<Iconify icon="solar:eye-bold" />}
                      href={`/course-room/${course.id}`}
                    >
                      Continue Learning
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Iconify icon="solar:pen-bold" />}
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
