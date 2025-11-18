import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { DashboardContent } from 'src/layouts/dashboard';
import { useAuth } from 'src/contexts/simple-auth-context';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// Mock course data
const mockCourses = [
  {
    id: '1',
    title: 'Introduction to Programming',
    description: 'Learn the fundamentals of programming with Python. This comprehensive course covers variables, functions, loops, and object-oriented programming.',
    instructor: 'Dr. Smith',
    instructorId: 'inst_1',
    students: 25,
    duration: '8 weeks',
    level: 'Beginner',
    price: 299,
    category: 'Programming',
    isActive: true,
    maxStudents: 30,
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-03-29'),
    createdAt: new Date('2024-01-01'),
    image: '/assets/school/course.webp',
  },
  {
    id: '2',
    title: 'Web Development Bootcamp',
    description: 'Full-stack web development with React and Node.js. Build real-world applications and deploy them to the cloud.',
    instructor: 'Prof. Johnson',
    instructorId: 'inst_2',
    students: 18,
    duration: '12 weeks',
    level: 'Intermediate',
    price: 499,
    category: 'Web Development',
    isActive: true,
    maxStudents: 25,
    startDate: new Date('2024-02-15'),
    endDate: new Date('2024-05-10'),
    createdAt: new Date('2024-01-05'),
    image: '/assets/school/course.webp',
  },
  {
    id: '3',
    title: 'Data Science Fundamentals',
    description: 'Introduction to data analysis and machine learning using Python, pandas, and scikit-learn.',
    instructor: 'Dr. Williams',
    instructorId: 'inst_3',
    students: 22,
    duration: '10 weeks',
    level: 'Intermediate',
    price: 399,
    category: 'Data Science',
    isActive: true,
    maxStudents: 20,
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-05-10'),
    createdAt: new Date('2024-01-10'),
    image: '/assets/school/course.webp',
  },
  {
    id: '4',
    title: 'Mobile App Development',
    description: 'Build mobile apps with React Native for both iOS and Android platforms.',
    instructor: 'Ms. Davis',
    instructorId: 'inst_4',
    students: 15,
    duration: '6 weeks',
    level: 'Advanced',
    price: 349,
    category: 'Mobile Development',
    isActive: true,
    maxStudents: 18,
    startDate: new Date('2024-02-20'),
    endDate: new Date('2024-04-05'),
    createdAt: new Date('2024-01-15'),
    image: '/assets/school/course.webp',
  },
];

export function CoursesView() {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [courses] = useState(mockCourses);
  const [applicationDialog, setApplicationDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [applicationForm, setApplicationForm] = useState({
    motivation: '',
    experience: '',
    goals: '',
  });

  const handleApplyCourse = useCallback((course: any) => {
    setSelectedCourse(course);
    setApplicationDialog(true);
  }, []);

  const handleCloseApplication = useCallback(() => {
    setApplicationDialog(false);
    setSelectedCourse(null);
    setApplicationForm({
      motivation: '',
      experience: '',
      goals: '',
    });
  }, []);

  const handleSubmitApplication = useCallback(() => {
    console.log('Submitting application for course:', selectedCourse?.id, applicationForm);
    // TODO: Implement application submission logic
    // This should create a new application with status 'pending'
    handleCloseApplication();
    // Show success message or redirect
  }, [selectedCourse, applicationForm, handleCloseApplication]);

  const handleCreateCourse = useCallback(() => {
    console.log('Creating new course');
    // Implement course creation logic here
  }, []);

  const canCreateCourse = hasRole('admin') || hasRole('instructor');

  return (
    <DashboardContent>
      <Container maxWidth="xl">

        <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h4">Courses</Typography>
          
          {canCreateCourse && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="solar:pen-bold" />}
              onClick={handleCreateCourse}
            >
              Create Course
            </Button>
          )}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
          {courses.map((course) => (
            <Card
              key={course.id}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => theme.shadows[8],
                  },
                }}
              >
                <Box
                  sx={{
                    height: 200,
                    backgroundImage: `url(${course.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
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
                      maxWidth: '80%',
                      maxHeight: '80%',
                      objectFit: 'contain',
                    }}
                  /> */}
                </Box>

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {course.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {course.description}
                  </Typography>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                    <Chip
                      label={course.category}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label={course.level}
                      size="small"
                      color="info"
                      variant="outlined"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Iconify icon="solar:pen-bold" width={16} />
                      <Typography variant="caption">{course.instructor}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Iconify icon="solar:eye-bold" width={16} />
                      <Typography variant="caption">{course.students} students</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Iconify icon="solar:clock-circle-outline" width={16} />
                      <Typography variant="caption">{course.duration}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Starts: {course.startDate.toLocaleDateString()}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      ${course.price}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {course.students}/{course.maxStudents} enrolled
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  {hasRole('student') && (
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<Iconify icon="solar:pen-bold" />}
                      onClick={() => handleApplyCourse(course)}
                      disabled={course.students >= course.maxStudents}
                    >
                      {course.students >= course.maxStudents ? 'Course Full' : 'Apply for Course'}
                    </Button>
                  )}
                  
                  {(hasRole('admin') || hasRole('instructor')) && (
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Iconify icon="solar:eye-bold" />}
                      href={`/course-room/${course.id}`}
                    >
                      Manage Course
                    </Button>
                  )}
                  
                  {hasRole('student') && course.students > 0 && (
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Iconify icon="solar:eye-bold" />}
                      href={`/course-room/${course.id}`}
                      sx={{ mt: 1 }}
                    >
                      Enter Course Room
                    </Button>
                  )}
                </CardActions>
              </Card>
          ))}
        </Box>

        {courses.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No courses available
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {canCreateCourse ? 'Create your first course to get started.' : 'Check back later for new courses.'}
            </Typography>
          </Box>
        )}

        {/* Application Dialog */}
        <Dialog
          open={applicationDialog}
          onClose={handleCloseApplication}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Apply for Course: {selectedCourse?.title}
          </DialogTitle>
          
          <DialogContent>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" paragraph>
                Please fill out this application form to apply for the course. Your application will be reviewed by our admissions team.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Chip label={`Price: $${selectedCourse?.price}`} color="primary" variant="outlined" />
                <Chip label={`Duration: ${selectedCourse?.duration}`} color="info" variant="outlined" />
                <Chip label={`Level: ${selectedCourse?.level}`} color="warning" variant="outlined" />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Why do you want to take this course?"
                multiline
                rows={4}
                value={applicationForm.motivation}
                onChange={(e) => setApplicationForm(prev => ({ ...prev, motivation: e.target.value }))}
                placeholder="Explain your motivation and what you hope to achieve..."
                required
              />
              
              <TextField
                label="Previous Experience"
                multiline
                rows={3}
                value={applicationForm.experience}
                onChange={(e) => setApplicationForm(prev => ({ ...prev, experience: e.target.value }))}
                placeholder="Describe any relevant experience or background knowledge..."
              />
              
              <TextField
                label="Learning Goals"
                multiline
                rows={3}
                value={applicationForm.goals}
                onChange={(e) => setApplicationForm(prev => ({ ...prev, goals: e.target.value }))}
                placeholder="What specific skills or knowledge do you want to gain?"
                required
              />
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseApplication}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmitApplication}
              disabled={!applicationForm.motivation || !applicationForm.goals}
              startIcon={<Iconify icon="solar:pen-bold" />}
            >
              Submit Application
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardContent>
  );
}
