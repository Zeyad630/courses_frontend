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
  const [instructorData] = useState(mockInstructorData);

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
              {user?.name?.charAt(0) || 'I'}
            </Avatar>
            <Box>
              <Typography variant="h4">Welcome, Professor {user?.name}!</Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your courses and help students succeed
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
                {instructorData.stats.totalStudents}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Students
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Iconify icon="solar:eye-bold" width={32} color="success.main" sx={{ mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {instructorData.stats.totalCourses}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Courses
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Iconify icon="solar:share-bold" width={32} color="warning.main" sx={{ mb: 1 }} />
              <Typography variant="h4" color="warning.main">
                {instructorData.stats.pendingGrades}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Grades
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Iconify icon="solar:clock-circle-outline" width={32} color="info.main" sx={{ mb: 1 }} />
              <Typography variant="h4" color="info.main">
                {instructorData.stats.avgCourseRating}⭐
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Course Rating
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
              {instructorData.myCourses.map((course) => (
                <Card key={course.id}>
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
                        <Typography variant="body2" color="warning.main">
                          {course.pendingAssignments} assignments to grade
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="info.main">
                          Next class: {course.nextClass.toLocaleDateString()} at {course.nextClass.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                      startIcon={<Iconify icon="solar:eye-bold" />}
                      href={`/course-room/${course.id}`}
                    >
                      Manage Course
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Iconify icon="solar:pen-bold" />}
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
                          startIcon={<Iconify icon="solar:pen-bold" />}
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
                    startIcon={<Iconify icon="solar:pen-bold" />}
                  >
                    Create Assignment
                  </Button>
                  
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Iconify icon="solar:eye-bold" />}
                  >
                    Upload Materials
                  </Button>
                  
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Iconify icon="solar:share-bold" />}
                  >
                    Schedule Zoom
                  </Button>
                  
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Iconify icon="solar:clock-circle-outline" />}
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
                        icon="solar:pen-bold"
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
