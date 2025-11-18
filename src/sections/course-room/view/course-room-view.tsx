import type { Assignment, CourseMaterial } from 'src/types/user';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
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
import LinearProgress from '@mui/material/LinearProgress';

import { DashboardContent } from 'src/layouts/dashboard';
import { useAuth } from 'src/contexts/simple-auth-context';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type CourseRoomViewProps = {
  courseId: string;
};

// Enhanced mock course data
const mockCourse = {
  id: '1',
  title: 'Introduction to Programming',
  description: 'Learn the fundamentals of programming with Python. This comprehensive course covers variables, functions, loops, and object-oriented programming concepts.',
  instructor: 'Dr. Smith',
  instructorId: 'inst_1',
  duration: '12 weeks',
  level: 'Beginner',
  language: 'English',
  price: 299,
  students: 25,
  rating: 4.8,
  totalLessons: 24,
  completedLessons: 8,
  nextClass: new Date('2024-01-25T14:00:00'),
  zoomLink: 'https://zoom.us/j/123456789?pwd=abcd1234',
  syllabus: [
    'Introduction to Programming Concepts',
    'Variables and Data Types',
    'Control Structures (if/else, loops)',
    'Functions and Methods',
    'Object-Oriented Programming',
    'File Handling and I/O',
    'Error Handling and Debugging',
    'Final Project Development'
  ],
};

// Mock materials
const mockMaterials: CourseMaterial[] = [
  {
    id: 'mat_1',
    courseId: '1',
    title: 'Course Introduction Video',
    description: 'Welcome to the course! This video covers what you will learn.',
    type: 'video',
    url: 'https://example.com/video1.mp4',
    uploadedBy: 'inst_1',
    uploadedAt: new Date('2024-01-15'),
    isVisible: true,
  },
  {
    id: 'mat_2',
    courseId: '1',
    title: 'Python Basics PDF',
    description: 'Comprehensive guide to Python syntax and basic concepts.',
    type: 'pdf',
    url: 'https://example.com/python-basics.pdf',
    uploadedBy: 'inst_1',
    uploadedAt: new Date('2024-01-16'),
    isVisible: true,
  },
  {
    id: 'mat_3',
    courseId: '1',
    title: 'Live Coding Session',
    description: 'Join us for live coding every Tuesday at 2 PM EST',
    type: 'zoom',
    url: 'https://zoom.us/j/123456789',
    uploadedBy: 'inst_1',
    uploadedAt: new Date('2024-01-17'),
    isVisible: true,
  },
];

// Mock assignments
const mockAssignments: Assignment[] = [
  {
    id: 'assign_1',
    courseId: '1',
    title: 'Hello World Program',
    description: 'Create your first Python program that prints "Hello, World!" to the console.',
    dueDate: new Date('2024-02-01'),
    maxPoints: 10,
    createdBy: 'inst_1',
    createdAt: new Date('2024-01-18'),
    isVisible: true,
  },
  {
    id: 'assign_2',
    courseId: '1',
    title: 'Variables and Data Types',
    description: 'Write a program demonstrating different data types in Python.',
    dueDate: new Date('2024-02-08'),
    maxPoints: 20,
    createdBy: 'inst_1',
    createdAt: new Date('2024-01-20'),
    isVisible: true,
  },
];

const getMaterialIcon = (type: CourseMaterial['type']) => {
  switch (type) {
    case 'video':
      return 'solar:pen-bold';
    case 'pdf':
      return 'solar:pen-bold';
    case 'zoom':
      return 'solar:pen-bold';
    case 'link':
      return 'solar:share-bold';
    default:
      return 'solar:pen-bold';
  }
};

export function CourseRoomView({ courseId }: CourseRoomViewProps) {
  const { user, hasRole } = useAuth();
  const [currentTab, setCurrentTab] = useState(0);
  const [materials] = useState(mockMaterials);
  const [assignments] = useState(mockAssignments);
  const [submissionDialog, setSubmissionDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState('');

  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  }, []);

  const handleSubmitAssignment = useCallback((assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setSubmissionDialog(true);
  }, []);

  const handleSubmissionSubmit = useCallback(() => {
    console.log('Submitting assignment:', selectedAssignment?.id, 'Content:', submissionText);
    // TODO: Implement submission logic
    setSubmissionDialog(false);
    setSelectedAssignment(null);
    setSubmissionText('');
  }, [selectedAssignment, submissionText]);

  const tabs = [
    { label: 'Overview', value: 0 },
    { label: 'Materials', value: 1 },
    { label: 'Assignments', value: 2 },
    { label: 'Zoom Sessions', value: 3 },
    { label: 'Grades', value: 4 },
  ];

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        <Box sx={{ mb: 5 }}>
          <Typography variant="h4">{mockCourse.title}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Instructor: {mockCourse.instructor}
          </Typography>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={currentTab} onChange={handleTabChange}>
            {tabs.map((tab) => (
              <Tab key={tab.value} label={tab.label} />
            ))}
          </Tabs>
        </Box>

        {/* Overview Tab */}
        {currentTab === 0 && (
          <Box>
            <Typography variant="h5" sx={{ mb: 3 }}>
              Course Overview
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
              {/* Course Details */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Course Information
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" paragraph>
                      {mockCourse.description}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Duration</Typography>
                      <Typography variant="body1">{mockCourse.duration}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Level</Typography>
                      <Typography variant="body1">{mockCourse.level}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Language</Typography>
                      <Typography variant="body1">{mockCourse.language}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Students</Typography>
                      <Typography variant="body1">{mockCourse.students} enrolled</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Rating</Typography>
                      <Typography variant="body1">{mockCourse.rating}⭐</Typography>
                    </Box>
                  </Box>

                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Course Syllabus
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {mockCourse.syllabus.map((topic, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip
                          label={index + 1}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        <Typography variant="body2">{topic}</Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>

              {/* Progress & Quick Actions */}
              <Box>
                {/* Progress Card */}
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Your Progress
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">
                          Lessons: {mockCourse.completedLessons}/{mockCourse.totalLessons}
                        </Typography>
                        <Typography variant="body2" color="primary">
                          {Math.round((mockCourse.completedLessons / mockCourse.totalLessons) * 100)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(mockCourse.completedLessons / mockCourse.totalLessons) * 100}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                      Keep up the great work! You&apos;re making excellent progress.
                    </Typography>
                  </CardContent>
                </Card>

                {/* Next Class */}
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Next Live Session
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Iconify icon="solar:share-bold" color="primary.main" width={24} />
                      <Box>
                        <Typography variant="subtitle2">
                          {mockCourse.nextClass.toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {mockCourse.nextClass.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                    </Box>

                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<Iconify icon="solar:share-bold" />}
                      href={mockCourse.zoomLink}
                      target="_blank"
                      sx={{ mb: 1 }}
                    >
                      Join Zoom Session
                    </Button>
                    
                    <Typography variant="caption" color="text.disabled">
                      Session will be available 15 minutes before start time
                    </Typography>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Quick Actions
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<Iconify icon="solar:pen-bold" />}
                        onClick={() => setCurrentTab(1)}
                      >
                        View Materials
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<Iconify icon="solar:eye-bold" />}
                        onClick={() => setCurrentTab(2)}
                      >
                        Check Assignments
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<Iconify icon="solar:share-bold" />}
                        onClick={() => setCurrentTab(4)}
                      >
                        View Grades
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </Box>
        )}

        {/* Materials Tab */}
        {currentTab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5">Course Materials</Typography>
              {hasRole('instructor') && (
                <Button
                  variant="contained"
                  startIcon={<Iconify icon="solar:pen-bold" />}
                >
                  Upload Material
                </Button>
              )}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {materials.map((material) => (
                <Card key={material.id}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'primary.lighter',
                          color: 'primary.main',
                        }}
                      >
                        <Iconify icon={getMaterialIcon(material.type)} width={24} />
                      </Box>

                      <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h6">{material.title}</Typography>
                          <Chip
                            label={material.type.toUpperCase()}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {material.description}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          Uploaded: {material.uploadedAt.toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>

                  <CardActions>
                    <Button
                      variant="contained"
                      startIcon={<Iconify icon="solar:eye-bold" />}
                      href={material.url}
                      target="_blank"
                    >
                      {material.type === 'zoom' ? 'Join Session' : 'View Material'}
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Box>
          </Box>
        )}

        {/* Assignments Tab */}
        {currentTab === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5">Assignments</Typography>
              {hasRole('instructor') && (
                <Button
                  variant="contained"
                  startIcon={<Iconify icon="solar:pen-bold" />}
                >
                  Create Assignment
                </Button>
              )}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {assignments.map((assignment) => (
                <Card key={assignment.id}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {assignment.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {assignment.description}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${assignment.maxPoints} pts`}
                        color="primary"
                        variant="outlined"
                      />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Due: {assignment.dueDate.toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        Created: {assignment.createdAt.toLocaleDateString()}
                      </Typography>
                    </Box>
                  </CardContent>

                  <CardActions>
                    {hasRole('student') && (
                      <Button
                        variant="contained"
                        startIcon={<Iconify icon="solar:pen-bold" />}
                        onClick={() => handleSubmitAssignment(assignment)}
                      >
                        Submit Assignment
                      </Button>
                    )}
                    {hasRole('instructor') && (
                      <Button
                        variant="outlined"
                        startIcon={<Iconify icon="solar:eye-bold" />}
                      >
                        View Submissions
                      </Button>
                    )}
                  </CardActions>
                </Card>
              ))}
            </Box>
          </Box>
        )}

        {/* Zoom Sessions Tab */}
        {currentTab === 3 && (
          <Box>
            <Typography variant="h5" sx={{ mb: 3 }}>
              Zoom Sessions
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Current Session */}
              <Card sx={{ border: 2, borderColor: 'primary.main' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Iconify icon="solar:share-bold" color="primary.main" width={32} />
                    <Box>
                      <Typography variant="h6" color="primary.main">
                        Live Session - Functions and Methods
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {mockCourse.nextClass.toLocaleDateString()} at {mockCourse.nextClass.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="body1" paragraph>
                    Join us for an interactive session covering Python functions, parameters, and return values. 
                    We&apos;ll work through practical examples and answer your questions.
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Chip label="Live" color="error" variant="filled" />
                    <Chip label="Interactive" color="primary" variant="outlined" />
                    <Chip label="Q&A Session" color="info" variant="outlined" />
                  </Box>

                  <Box sx={{ p: 2, bgcolor: 'info.lighter', borderRadius: 1, mb: 2 }}>
                    <Typography variant="body2" color="info.dark">
                      <strong>Meeting ID:</strong> 123-456-789<br />
                      <strong>Password:</strong> abcd1234<br />
                      <strong>Duration:</strong> 90 minutes
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Iconify icon="solar:share-bold" />}
                    href={mockCourse.zoomLink}
                    target="_blank"
                  >
                    Join Zoom Session
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Iconify icon="solar:pen-bold" />}
                  >
                    Add to Calendar
                  </Button>
                </CardActions>
              </Card>

              {/* Upcoming Sessions */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Upcoming Sessions
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[
                      {
                        title: 'Object-Oriented Programming Basics',
                        date: new Date('2024-02-01T14:00:00'),
                        description: 'Introduction to classes, objects, and methods in Python',
                      },
                      {
                        title: 'File Handling and I/O Operations',
                        date: new Date('2024-02-08T14:00:00'),
                        description: 'Working with files, reading and writing data',
                      },
                      {
                        title: 'Error Handling and Debugging',
                        date: new Date('2024-02-15T14:00:00'),
                        description: 'Exception handling and debugging techniques',
                      },
                    ].map((session, index) => (
                      <Box
                        key={index}
                        sx={{
                          p: 2,
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 1,
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="subtitle1">{session.title}</Typography>
                          <Chip
                            label={session.date.toLocaleDateString()}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {session.description}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {session.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 90 minutes
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>

              {/* Past Sessions */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Past Sessions (Recordings Available)
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[
                      {
                        title: 'Course Introduction and Setup',
                        date: new Date('2024-01-11T14:00:00'),
                        recording: 'https://example.com/recording1',
                      },
                      {
                        title: 'Variables and Data Types',
                        date: new Date('2024-01-18T14:00:00'),
                        recording: 'https://example.com/recording2',
                      },
                    ].map((session, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          p: 2,
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 1,
                        }}
                      >
                        <Box>
                          <Typography variant="subtitle2">{session.title}</Typography>
                          <Typography variant="caption" color="text.disabled">
                            {session.date.toLocaleDateString()} at {session.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </Box>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Iconify icon="solar:eye-bold" />}
                          href={session.recording}
                          target="_blank"
                        >
                          Watch Recording
                        </Button>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        )}

        {/* Grades Tab */}
        {currentTab === 4 && (
          <Box>
            <Typography variant="h5" sx={{ mb: 3 }}>
              My Grades
            </Typography>
            <Card>
              <CardContent>
                <Typography variant="body1" color="text.secondary">
                  Grades will be displayed here once assignments are graded.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Assignment Submission Dialog */}
        <Dialog open={submissionDialog} onClose={() => setSubmissionDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            Submit Assignment: {selectedAssignment?.title}
          </DialogTitle>
          
          <DialogContent>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" gutterBottom>
                {selectedAssignment?.description}
              </Typography>
              <Typography variant="body2" color="primary">
                Due: {selectedAssignment?.dueDate.toLocaleDateString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Points: {selectedAssignment?.maxPoints}
              </Typography>
            </Box>

            <TextField
              fullWidth
              multiline
              rows={6}
              label="Your Submission"
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              placeholder="Enter your solution or upload files..."
              sx={{ mt: 2 }}
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setSubmissionDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmissionSubmit}
              disabled={!submissionText.trim()}
            >
              Submit Assignment
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardContent>
  );
}
