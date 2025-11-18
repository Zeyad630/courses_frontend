import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import LinearProgress from '@mui/material/LinearProgress';

import { DashboardContent } from 'src/layouts/dashboard';
import { useAuth } from 'src/contexts/simple-auth-context';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// Mock enrolled courses data for students
const mockEnrolledCourses = [
  {
    id: '1',
    title: 'Introduction to Programming',
    description: 'Learn the fundamentals of programming with Python',
    instructor: 'Dr. Smith',
    progress: 65,
    totalLessons: 20,
    completedLessons: 13,
    nextLesson: 'Functions and Methods',
    dueAssignment: 'Variables Assignment',
    dueDate: new Date('2024-02-01'),
    grade: 'B+',
    status: 'active',
    enrolledAt: new Date('2024-01-15'),
    image: '/assets/school/course.webp',
  },
  {
    id: '2',
    title: 'Web Development Bootcamp',
    description: 'Full-stack web development with React and Node.js',
    instructor: 'Prof. Johnson',
    progress: 30,
    totalLessons: 30,
    completedLessons: 9,
    nextLesson: 'React Components',
    dueAssignment: 'HTML/CSS Project',
    dueDate: new Date('2024-01-28'),
    grade: 'A-',
    status: 'active',
    enrolledAt: new Date('2024-01-20'),
    image: '/assets/school/course.webp',
  },
  {
    id: '3',
    title: 'Data Science Fundamentals',
    description: 'Introduction to data analysis and machine learning',
    instructor: 'Dr. Williams',
    progress: 100,
    totalLessons: 15,
    completedLessons: 15,
    nextLesson: null,
    dueAssignment: null,
    dueDate: null,
    grade: 'A',
    status: 'completed',
    enrolledAt: new Date('2023-12-01'),
    completedAt: new Date('2024-01-10'),
    image: '/assets/school/course.webp',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'primary';
    case 'completed':
      return 'success';
    case 'paused':
      return 'warning';
    default:
      return 'default';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    case 'paused':
      return 'Paused';
    default:
      return status;
  }
};

export function MyCoursesView() {
  const { user, hasRole } = useAuth();
  const [enrolledCourses] = useState(mockEnrolledCourses);

  const activeCourses = enrolledCourses.filter(course => course.status === 'active');
  const completedCourses = enrolledCourses.filter(course => course.status === 'completed');

  if (!hasRole('student')) {
    return (
      <DashboardContent>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              This page is only available for students
            </Typography>
          </Box>
        </Container>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h4">My Courses</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Track your learning progress and access course materials
          </Typography>
        </Box>

        {/* Statistics */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3, mb: 5 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Iconify icon="solar:pen-bold" width={32} color="primary.main" sx={{ mb: 1 }} />
              <Typography variant="h4" color="primary.main">
                {enrolledCourses.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Courses
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Iconify icon="solar:clock-circle-outline" width={32} color="warning.main" sx={{ mb: 1 }} />
              <Typography variant="h4" color="warning.main">
                {activeCourses.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In Progress
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Iconify icon="solar:eye-bold" width={32} color="success.main" sx={{ mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {completedCourses.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Iconify icon="solar:share-bold" width={32} color="info.main" sx={{ mb: 1 }} />
              <Typography variant="h4" color="info.main">
                {Math.round(enrolledCourses.reduce((acc, course) => acc + course.progress, 0) / enrolledCourses.length) || 0}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Progress
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Active Courses */}
        {activeCourses.length > 0 && (
          <Box sx={{ mb: 5 }}>
            <Typography variant="h5" sx={{ mb: 3 }}>
              Active Courses
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 3 }}>
              {activeCourses.map((course) => (
                <Card key={course.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box
                    sx={{
                      height: 120,
                      backgroundImage: `url(${course.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundColor: (theme) => theme.palette.grey[200],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {/* <img
                      src={course.image}
                      alt={course.title}
                      style={{
                        maxWidth: '60%',
                        maxHeight: '60%',
                        objectFit: 'contain',
                      }}
                    /> */}
                  </Box>

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        {course.title}
                      </Typography>
                      <Chip
                        label={getStatusLabel(course.status)}
                        color={getStatusColor(course.status)}
                        size="small"
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" paragraph>
                      Instructor: {course.instructor}
                    </Typography>

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

                    {course.nextLesson && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Next: {course.nextLesson}
                      </Typography>
                    )}

                    {course.dueAssignment && course.dueDate && (
                      <Typography variant="body2" color="warning.main">
                        Due: {course.dueAssignment} ({course.dueDate.toLocaleDateString()})
                      </Typography>
                    )}

                    <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                      Current Grade: {course.grade}
                    </Typography>
                  </CardContent>

                  <CardActions>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<Iconify icon="solar:eye-bold" />}
                      href={`/course-room/${course.id}`}
                    >
                      Continue Learning
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Box>
          </Box>
        )}

        {/* Completed Courses */}
        {completedCourses.length > 0 && (
          <Box sx={{ mb: 5 }}>
            <Typography variant="h5" sx={{ mb: 3 }}>
              Completed Courses
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 3 }}>
              {completedCourses.map((course) => (
                <Card key={course.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box
                    sx={{
                      height: 120,
                      backgroundImage: `url(${course.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundColor: (theme) => theme.palette.grey[200],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    {/* <img
                      src={course.image}
                      alt={course.title}
                      style={{
                        maxWidth: '60%',
                        maxHeight: '60%',
                        objectFit: 'contain',
                      }}
                    /> */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'success.main',
                        color: 'white',
                        borderRadius: '50%',
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Iconify icon="solar:eye-bold" width={16} />
                    </Box>
                  </Box>

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        {course.title}
                      </Typography>
                      <Chip
                        label={getStatusLabel(course.status)}
                        color={getStatusColor(course.status)}
                        size="small"
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" paragraph>
                      Instructor: {course.instructor}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Completed: {course.completedAt?.toLocaleDateString()}
                    </Typography>

                    <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
                      Final Grade: {course.grade}
                    </Typography>
                  </CardContent>

                  <CardActions>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<Iconify icon="solar:eye-bold" />}
                      href={`/course-room/${course.id}`}
                    >
                      Review Course
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Box>
          </Box>
        )}

        {/* Empty State */}
        {enrolledCourses.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Iconify icon="solar:pen-bold" width={64} color="text.disabled" sx={{ mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No courses enrolled yet
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
              Browse available courses and start your learning journey
            </Typography>
            <Button
              variant="contained"
              startIcon={<Iconify icon="solar:eye-bold" />}
              href="/courses"
            >
              Browse Courses
            </Button>
          </Box>
        )}
      </Container>
    </DashboardContent>
  );
}
