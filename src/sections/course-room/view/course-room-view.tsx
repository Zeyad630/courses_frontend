import type { Lesson, CourseModule } from 'src/types/course';
import type { Assignment, CourseMaterial } from 'src/types/user';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import DialogTitle from '@mui/material/DialogTitle';
import { alpha, useTheme } from '@mui/material/styles';
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
      return 'solar:videocamera-record-bold-duotone';
    case 'pdf':
      return 'solar:document-text-bold-duotone';
    case 'zoom':
      return 'solar:videocamera-bold-duotone';
    case 'link':
      return 'solar:link-bold-duotone';
    default:
      return 'solar:file-bold-duotone';
  }
};

export function CourseRoomView({ courseId }: CourseRoomViewProps) {
  const { hasRole } = useAuth();
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState(0);
  const [materials] = useState(mockMaterials);
  const [assignments] = useState(mockAssignments);

  // Simple content management state (Weeks/Modules & Lessons)
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [newWeekTitle, setNewWeekTitle] = useState('');
  const [newWeekDescription, setNewWeekDescription] = useState('');
  const [addWeekDialog, setAddWeekDialog] = useState(false);
  const [addLessonDialog, setAddLessonDialog] = useState<{ open: boolean; moduleId?: string }>({ open: false });
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonDescription, setNewLessonDescription] = useState('');

  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  }, []);

  const handleSubmitAssignment = useCallback((assignment: Assignment) => {
    // setSelectedAssignment(assignment);
    // setSubmissionDialog(true);
  }, []);



  const tabs = [
    { label: 'Overview', value: 0, icon: 'solar:info-circle-bold-duotone' },
    { label: 'Materials', value: 1, icon: 'solar:folder-with-files-bold-duotone' },
    { label: 'Assignments', value: 2, icon: 'solar:documents-minimalistic-bold-duotone' },
    { label: 'Zoom Sessions', value: 3, icon: 'solar:videocamera-bold-duotone' },
    { label: 'Grades', value: 4, icon: 'solar:diploma-bold-duotone' },
    { label: 'Curriculum', value: 5, icon: 'solar:checklist-minimalistic-bold-duotone' },
    ...(hasRole('instructor') ? [{ label: 'Edit Content', value: 6, icon: 'solar:pen-new-square-bold-duotone' }] : []),
  ];

  const handleAddWeek = useCallback(() => {
    setNewWeekTitle('');
    setNewWeekDescription('');
    setAddWeekDialog(true);
  }, []);

  const saveNewWeek = useCallback(() => {
    if (!newWeekTitle.trim()) return;
    const newModule: CourseModule = {
      id: `mod_${Date.now()}`,
      title: newWeekTitle.trim(),
      description: newWeekDescription.trim(),
      lessons: [],
      assignments: [],
    };
    setModules((prev) => [...prev, newModule]);
    setAddWeekDialog(false);
  }, [newWeekTitle, newWeekDescription]);

  const handleAddLesson = useCallback((moduleId: string) => {
    setAddLessonDialog({ open: true, moduleId });
    setNewLessonTitle('');
    setNewLessonDescription('');
  }, []);

  const saveNewLesson = useCallback(() => {
    if (!addLessonDialog.moduleId || !newLessonTitle.trim()) return;
    setModules((prev) =>
      prev.map((m) =>
        m.id === addLessonDialog.moduleId
          ? {
              ...m,
              lessons: [
                ...m.lessons,
                {
                  id: `les_${Date.now()}`,
                  title: newLessonTitle.trim(),
                  description: newLessonDescription.trim(),
                  content: '',
                  duration: 30,
                  order: m.lessons.length + 1,
                } as Lesson,
              ],
            }
          : m
      )
    );
    setAddLessonDialog({ open: false });
  }, [addLessonDialog.moduleId, newLessonTitle, newLessonDescription]);

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        {/* Glassmorphism Header */}
        <Box
          sx={{
            mb: 4,
            p: 4,
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
             background: `linear-gradient(135deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            color: 'white',
            boxShadow: theme.shadows[8],
          }}
        >
           <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 3 }}>
             <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                     <Chip label={mockCourse.level} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)' }} />
                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.8 }}>
                        <Iconify icon="solar:clock-circle-bold" width={16} />
                        <Typography variant="body2">{mockCourse.duration}</Typography>
                     </Box>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                  {mockCourse.title}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Iconify icon="solar:user-circle-bold" width={20} />
                  Instructor: {mockCourse.instructor}
                </Typography>
             </Box>
             
             {/* Overall Progress Circle */}
             <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2, backdropFilter: 'blur(8px)', minWidth: 200 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Course Progress</Typography>
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                         <LinearProgress 
                            variant="determinate" 
                            value={(mockCourse.completedLessons / mockCourse.totalLessons) * 100}
                            sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.2)', '& .MuiLinearProgress-bar': { bgcolor: 'white' } }} 
                         />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {Math.round((mockCourse.completedLessons / mockCourse.totalLessons) * 100)}%
                    </Typography>
                 </Box>
                 <Typography variant="caption" sx={{ opacity: 0.8, mt: 0.5, display: 'block' }}>
                     {mockCourse.completedLessons} of {mockCourse.totalLessons} lessons completed
                 </Typography>
             </Box>
           </Box>

           <Box sx={{ position: 'absolute', top: -50, right: -50, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)' }} />
        </Box>

        {/* Styled Tabs */}
        <Card sx={{ mb: 4, boxShadow: theme.shadows[3] }}>
           <Tabs
             value={currentTab}
             onChange={handleTabChange}
             variant="scrollable"
             scrollButtons="auto"
             sx={{
               p: 1,
               '& .MuiTabs-indicator': { display: 'none' },
               '& .MuiTab-root': {
                 minHeight: 48,
                 minWidth: 100,
                 borderRadius: 1,
                 mr: 1,
                 textTransform: 'none',
                 fontWeight: 600,
                 transition: 'all 0.2s',
                 color: 'text.secondary',
                 '&.Mui-selected': {
                   color: 'primary.main',
                   bgcolor: alpha(theme.palette.primary.main, 0.08),
                 },
                 '&:hover:not(.Mui-selected)': {
                     bgcolor: 'action.hover',
                 }
               }
             }}
           >
             {tabs.map((tab) => (
               <Tab 
                 key={tab.value} 
                 label={tab.label} 
                 icon={<Iconify icon={tab.icon} width={20} />} 
                 iconPosition="start"
               />
             ))}
           </Tabs>
        </Card>

        {/* Overview Tab */}
        {currentTab === 0 && (
          <Box>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 8 }}>
                {/* Course Details */}
                <Card sx={{ p: 4, mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                      About this Course
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 4 }}>
                      {mockCourse.description}
                    </Typography>

                    {/* At a glance */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
                      <Box sx={{ p: 2, borderRadius: 1, bgcolor: alpha(theme.palette.primary.main, 0.04), border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}` }}>
                        <Typography variant="caption" color="text.secondary">Level</Typography>
                        <Typography variant="body2" fontWeight={700}>{mockCourse.level}</Typography>
                      </Box>
                      <Box sx={{ p: 2, borderRadius: 1, bgcolor: alpha(theme.palette.info.main, 0.04), border: `1px solid ${alpha(theme.palette.info.main, 0.12)}` }}>
                        <Typography variant="caption" color="text.secondary">Language</Typography>
                        <Typography variant="body2" fontWeight={700}>{mockCourse.language}</Typography>
                      </Box>
                      <Box sx={{ p: 2, borderRadius: 1, bgcolor: alpha(theme.palette.success.main, 0.04), border: `1px solid ${alpha(theme.palette.success.main, 0.12)}` }}>
                        <Typography variant="caption" color="text.secondary">Lessons</Typography>
                        <Typography variant="body2" fontWeight={700}>{mockCourse.totalLessons}</Typography>
                      </Box>
                      <Box sx={{ p: 2, borderRadius: 1, bgcolor: alpha(theme.palette.warning.main, 0.04), border: `1px solid ${alpha(theme.palette.warning.main, 0.12)}` }}>
                        <Typography variant="caption" color="text.secondary">Rating</Typography>
                        <Typography variant="body2" fontWeight={700}>{mockCourse.rating}</Typography>
                      </Box>
                    </Box>

                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                      What you&apos;ll learn
                    </Typography>
                    <Grid container spacing={2}>
                        {mockCourse.syllabus.map((topic, index) => (
                          <Grid size={{ xs: 12, sm: 6 }} key={index}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <Iconify icon="solar:check-circle-bold" width={20} sx={{ color: 'success.main' }} />
                                  <Typography variant="body2">{topic}</Typography>
                              </Box>
                          </Grid>
                        ))}
                    </Grid>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                 <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Next Class */}
                    <Card sx={{ p: 3, bgcolor: alpha(theme.palette.info.lighter, 0.4), border: `1px solid ${alpha(theme.palette.info.main, 0.2)}` }}>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Iconify icon="solar:calendar-mark-bold-duotone" sx={{ color: 'info.main' }} />
                        Next Live Session
                      </Typography>
                      
                      <Box sx={{ mt: 2, mb: 3 }}>
                        <Typography variant="h4" sx={{ color: 'info.darker', mb: 0.5 }}>
                           {mockCourse.nextClass.getDate()}
                        </Typography>
                        <Typography variant="subtitle1" sx={{ color: 'info.dark' }}>
                           {mockCourse.nextClass.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                           {mockCourse.nextClass.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', weekday: 'long' })}
                        </Typography>
                      </Box>

                      <Button
                        variant="contained"
                        color="info"
                        fullWidth
                        startIcon={<Iconify icon="solar:videocamera-bold" />}
                        href={mockCourse.zoomLink}
                        target="_blank"
                      >
                        Join Zoom
                      </Button>
                    </Card>

                    {/* Stats */}
                    <Card sx={{ p: 3 }}>
                       <Typography variant="h6" sx={{ mb: 2 }}>Course Stats</Typography>
                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                               <Typography variant="body2" color="text.secondary">Skill Level</Typography>
                               <Chip label={mockCourse.level} size="small" color="primary" variant="outlined" />
                           </Box>
                           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                               <Typography variant="body2" color="text.secondary">Language</Typography>
                               <Typography variant="body2" fontWeight={600}>{mockCourse.language}</Typography>
                           </Box>
                           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                               <Typography variant="body2" color="text.secondary">Students</Typography>
                               <Typography variant="body2" fontWeight={600}>{mockCourse.students}</Typography>
                           </Box>
                           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                               <Typography variant="body2" color="text.secondary">Certificate</Typography>
                               <Typography variant="body2" fontWeight={600} color="success.main">Yes</Typography>
                           </Box>
                       </Box>
                    </Card>
                 </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Curriculum Tab (Student view) */}
        {currentTab === 5 && (
          <Box>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
              Curriculum
            </Typography>

            {modules.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {modules.map((module, idx) => (
                  <Card key={module.id} sx={{ transition: 'all 0.3s', '&:hover': { boxShadow: theme.shadows[4] } }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>Week {idx + 1}: {module.title}</Typography>
                          {module.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{module.description}</Typography>
                          )}
                        </Box>
                        <Chip label={`${module.lessons.length} lessons`} color="primary" variant="outlined" />
                      </Box>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {module.lessons.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">No lessons added yet.</Typography>
                        ) : (
                          module.lessons.map((lesson) => (
                            <Box key={lesson.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: 'background.neutral', borderRadius: 1 }}>
                              <Typography variant="body2" fontWeight={600}>
                                {lesson.order}. {lesson.title}
                              </Typography>
                              <Chip label={`${lesson.duration}m`} size="small" variant="outlined" />
                            </Box>
                          ))
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Card sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Course Outline</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {mockCourse.syllabus.map((topic, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Iconify icon="solar:check-circle-bold" width={18} sx={{ color: 'success.main' }} />
                      <Typography variant="body2">{topic}</Typography>
                    </Box>
                  ))}
                </Box>
              </Card>
            )}
          </Box>
        )}

        {/* Content (Weeks) Tab - Instructor only */}
        {hasRole('instructor') && currentTab === 6 && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h5">Course Content (Weeks)</Typography>
              <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold-duotone" />} onClick={handleAddWeek}>
                Add Week
              </Button>
            </Box>

            {modules.length === 0 ? (
              <Card sx={{ p: 6, textAlign: 'center' }}>
                 <Iconify icon="solar:folder-with-files-bold-duotone" width={64} sx={{ color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  No weeks added yet. Click &quot;Add Week&quot; to create the first week.
                </Typography>
              </Card>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {modules.map((module, idx) => (
                  <Card key={module.id} sx={{ transition: 'all 0.3s', '&:hover': { boxShadow: theme.shadows[4] } }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>Week {idx + 1}: {module.title}</Typography>
                          {module.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{module.description}</Typography>
                          )}
                        </Box>
                        <Chip label={`${module.lessons.length} lessons`} color="primary" variant="outlined" />
                      </Box>

                      {/* Lessons */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                        {module.lessons.map((lesson) => (
                          <Box key={lesson.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                               <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                                 {lesson.order}
                               </Box>
                               <Typography variant="body2" fontWeight={600}>
                                 {lesson.title}
                               </Typography>
                            </Box>
                            <Chip label={`${lesson.duration}m`} size="small" variant="outlined" />
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                    <CardActions sx={{ borderTop: `1px dashed ${theme.palette.divider}`, p: 2 }}>
                      <Button variant="text" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={() => handleAddLesson(module.id)}>
                        Add Lesson
                      </Button>
                    </CardActions>
                  </Card>
                ))}
              </Box>
            )}

            {/* Add Week Dialog */}
            <Dialog open={addWeekDialog} onClose={() => setAddWeekDialog(false)} maxWidth="sm" fullWidth>
              <DialogTitle>Add New Week</DialogTitle>
              <DialogContent>
                <TextField fullWidth label="Week Title" sx={{ mt: 1 }} value={newWeekTitle} onChange={(e) => setNewWeekTitle(e.target.value)} />
                <TextField fullWidth label="Description" sx={{ mt: 2 }} multiline rows={3} value={newWeekDescription} onChange={(e) => setNewWeekDescription(e.target.value)} />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setAddWeekDialog(false)}>Cancel</Button>
                <Button variant="contained" onClick={saveNewWeek} disabled={!newWeekTitle.trim()}>Save</Button>
              </DialogActions>
            </Dialog>

            {/* Add Lesson Dialog */}
            <Dialog open={addLessonDialog.open} onClose={() => setAddLessonDialog({ open: false })} maxWidth="sm" fullWidth>
              <DialogTitle>Add New Lesson</DialogTitle>
              <DialogContent>
                <TextField fullWidth label="Lesson Title" sx={{ mt: 1 }} value={newLessonTitle} onChange={(e) => setNewLessonTitle(e.target.value)} />
                <TextField fullWidth label="Description" sx={{ mt: 2 }} multiline rows={3} value={newLessonDescription} onChange={(e) => setNewLessonDescription(e.target.value)} />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setAddLessonDialog({ open: false })}>Cancel</Button>
                <Button variant="contained" onClick={saveNewLesson} disabled={!newLessonTitle.trim()}>Save</Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}

        {/* Materials Tab */}
        {currentTab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>Course Materials</Typography>
              {hasRole('instructor') && (
                <Button
                  variant="contained"
                  startIcon={<Iconify icon="solar:upload-square-bold-duotone" />}
                >
                  Upload Material
                </Button>
              )}
            </Box>

            <Grid container spacing={3}>
              {materials.map((material) => (
                <Grid size={{ xs: 12, md: 6 }} key={material.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[8] } }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            color: 'primary.main',
                          }}
                        >
                          <Iconify icon={getMaterialIcon(material.type)} width={32} />
                        </Box>

                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>{material.title}</Typography>
                            <Chip
                              label={material.type.toUpperCase()}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                            {material.description}
                          </Typography>
                          <Typography variant="caption" color="text.disabled" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                             <Iconify icon="solar:calendar-mark-bold" width={12} />
                            Uploaded: {material.uploadedAt.toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>

                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<Iconify icon="solar:eye-bold" />}
                        href={material.url}
                        target="_blank"
                        sx={{ borderRadius: 1 }}
                      >
                        {material.type === 'zoom' ? 'Join Session' : 'View Material'}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Assignments Tab */}
        {currentTab === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>Assignments</Typography>
              {hasRole('instructor') && (
                <Button
                  variant="contained"
                  startIcon={<Iconify icon="solar:add-circle-bold-duotone" />}
                >
                  Create Assignment
                </Button>
              )}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {assignments.map((assignment) => (
                <Card key={assignment.id} sx={{ transition: 'all 0.3s', '&:hover': { boxShadow: theme.shadows[4] } }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                          {assignment.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {assignment.description}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${assignment.maxPoints} Points`}
                        color="primary"
                        variant="filled"
                        sx={{ borderRadius: 1, fontWeight: 700 }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, pt: 2, borderTop: `1px dashed ${theme.palette.divider}` }}>
                       <Box sx={{ display: 'flex', gap: 3 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                             <Iconify icon="solar:calendar-date-bold" width={16} sx={{ color: 'error.main' }} />
                            Due: {assignment.dueDate.toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                             <Iconify icon="solar:clock-circle-bold" width={16} />
                            Created: {assignment.createdAt.toLocaleDateString()}
                          </Typography>
                       </Box>
                       
                       <Box>
                          {hasRole('student') && (
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Iconify icon="solar:upload-bold-duotone" />}
                              onClick={() => handleSubmitAssignment(assignment)}
                              sx={{ borderRadius: 30 }}
                            >
                              Submit
                            </Button>
                          )}
                          {hasRole('instructor') && (
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Iconify icon="solar:eye-bold-duotone" />}
                              sx={{ borderRadius: 30 }}
                            >
                              View Submissions
                            </Button>
                          )}
                       </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        )}

        {/* Zoom Sessions Tab */}
        {currentTab === 3 && (
          <Box>
            <Grid container spacing={3}>
               <Grid size={{ xs: 12, md: 7 }}>
                  {/* Current Session */}
                  <Card sx={{ border: '2px solid', borderColor: 'primary.main', position: 'relative', overflow: 'hidden', mb: 3 }}>
                    <Box sx={{ position: 'absolute', top: 0, right: 0, p: 1, bgcolor: 'primary.main', borderBottomLeftRadius: 8, color: 'white', fontWeight: 700, px: 2, fontSize: '0.75rem' }}>
                       UPCOMING
                    </Box>
                    <CardContent sx={{ pt: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: 'primary.lighter', color: 'primary.main' }}>
                            <Iconify icon="solar:videocamera-bold" width={32} />
                        </Box>
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            Live Session - Functions
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {mockCourse.nextClass.toLocaleDateString()} at {mockCourse.nextClass.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography variant="body1" paragraph sx={{ mb: 3 }}>
                        Join us for an interactive session covering Python functions, parameters, and return values. 
                        We&apos;ll work through practical examples and answer your questions.
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                        <Chip label="Live" color="error" variant="filled" size="small" />
                        <Chip label="Interactive" color="primary" variant="outlined" size="small" />
                        <Chip label="Q&A" color="info" variant="outlined" size="small" />
                      </Box>

                      <Box sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.08), borderRadius: 1, mb: 2, border: `1px dashed ${alpha(theme.palette.info.main, 0.4)}` }}>
                        <Typography variant="body2" color="text.primary" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span><strong>Meeting ID:</strong> 123-456-789</span>
                          <span><strong>Pass:</strong> abcd1234</span>
                        </Typography>
                      </Box>

                      <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        startIcon={<Iconify icon="solar:play-circle-bold" />}
                        href={mockCourse.zoomLink}
                        target="_blank"
                        sx={{ borderRadius: 1 }}
                      >
                        Join Zoom Session
                      </Button>
                    </CardContent>
                  </Card>
               </Grid>
               
               <Grid size={{ xs: 12, md: 5 }}>
                  <Card sx={{ height: '100%' }}>
                     <CardContent>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Upcoming Schedule</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                            {[
                              { title: 'OOP Basics', date: new Date('2024-02-01T14:00:00'), color: 'warning.main' },
                              { title: 'File Handling', date: new Date('2024-02-08T14:00:00'), color: 'success.main' },
                              { title: 'Error Handling', date: new Date('2024-02-15T14:00:00'), color: 'info.main' },
                            ].map((session, index) => (
                              <Box
                                key={index}
                                sx={{
                                  p: 2,
                                  borderLeft: '4px solid',
                                  borderColor: session.color,
                                  bgcolor: alpha(theme.palette.grey[500], 0.04),
                                  mb: 2,
                                  borderRadius: 0.5
                                }}
                              >
                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{session.title}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {session.date.toLocaleDateString()} • 2:00 PM
                                </Typography>
                              </Box>
                            ))}
                        </Box>
                     </CardContent>
                  </Card>
               </Grid>
            </Grid>
          </Box>
        )}

        {/* Grades Tab */}
        {currentTab === 4 && (
          <Box>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
              My Grades
            </Typography>
            
            <Card>
               <Typography variant="caption" sx={{ p: 2, display: 'block', color: 'text.secondary', textAlign: 'center' }}>
                  Grades will appear here once assignments are graded by the instructor.
               </Typography>
               {/* Refined grades list logic can go here */}
            </Card>
          </Box>
        )}

      </Container>
    </DashboardContent>
  );
}
