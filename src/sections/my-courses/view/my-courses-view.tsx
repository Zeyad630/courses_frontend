import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import { alpha, useTheme } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';

import { DashboardContent } from 'src/layouts/dashboard';
import { useAuth } from 'src/contexts/simple-auth-context';
import { useCoursesContext } from 'src/contexts/courses-context';
import { useApplicationsContext } from 'src/contexts/applications-context';
import { useCourseRoundsContext } from 'src/contexts/course-rounds-context';

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
    whatYouWillLearn: [
      'Understand the basics of Python syntax and control flow',
      'Write clean and efficient code with functions',
      'Debug and troubleshoot common programming errors',
    ],
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
    whatYouWillLearn: [
      'Build full-stack applications with React and Node.js',
      'Understand REST APIs and database integration',
      'Master modern JavaScript features and async programming',
    ],
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
    whatYouWillLearn: [
      'Master data analysis with Python and Pandas',
      'Understand machine learning algorithms',
      'Create data visualizations with Matplotlib',
    ],
  },
];



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
  const theme = useTheme();

  const { courses } = useCoursesContext();
  const { applications } = useApplicationsContext();
  const { getRoundForStudent } = useCourseRoundsContext();

  const { enrolledCourses, waitingCourses } = useMemo(() => {
    const userId = user?.id;
    if (!userId) return { enrolledCourses: [], waitingCourses: [] };

    const accepted = applications.filter((a) => a.studentId === userId && a.status === 'accepted');

    const enrolled: any[] = [];
    const waiting: any[] = [];

    accepted.forEach((app, index) => {
      const course = courses.find((c) => c.id === app.courseId);
      const fallback = mockEnrolledCourses[index % mockEnrolledCourses.length];

      const round = getRoundForStudent(app.courseId, userId);
      const mappedStatus =
        round?.status === 'finished'
          ? 'completed'
          : round?.status === 'cancelled'
            ? 'paused'
            : 'active';

      const base = {
        id: app.courseId,
        title: course?.name ?? app.metadata?.courseName ?? fallback?.title ?? 'Course',
        description: course?.description ?? fallback?.description ?? '',
        instructor: course?.instructor ?? fallback?.instructor ?? '',
        progress: 0,
        totalLessons: fallback?.totalLessons ?? 1,
        completedLessons: 0,
        nextLesson: 'Start learning',
        dueAssignment: '—',
        dueDate: new Date(Date.now() + (index + 3) * 24 * 60 * 60 * 1000),
        grade: '—',
        status: mappedStatus,
        enrolledAt: app.appliedAt,
        completedAt: fallback?.completedAt,
        image: fallback?.image ?? '/assets/school/course.webp',
        whatYouWillLearn: fallback?.whatYouWillLearn ?? [],
      };

      if (!round) {
        waiting.push(base);
        return;
      }

      enrolled.push({
        ...base,
        round,
      });
    });

    return { enrolledCourses: enrolled, waitingCourses: waiting };
  }, [applications, courses, getRoundForStudent, user?.id]);

  const activeCourses = enrolledCourses.filter(course => course.status === 'active');
  const pausedCourses = enrolledCourses.filter(course => course.status === 'paused');
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
         {/* Glassmorphism Header */}
        <Box
          sx={{
            mb: 5,
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
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                  My Learning Journey
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Track your progress, resume lessons, and achieve your goals.
                </Typography>
             </Box>
             
             <Button
                variant="outlined"
                size="large"
                startIcon={<Iconify icon="solar:global-search-bold" />}
                href="/courses"
                sx={{ 
                    borderColor: 'rgba(255,255,255,0.4)', 
                    color: 'white', 
                    fontWeight: 700,
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } 
                }}
              >
                Browse More Courses
              </Button>
          </Box>
          <Box sx={{ position: 'absolute', top: -50, right: -50, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)' }} />
        </Box>

        {/* Statistics */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3, mb: 5 }}>
          {[
            {
              title: 'Total Courses',
              value: enrolledCourses.length,
              icon: 'solar:notebook-bold-duotone',
              color: 'primary',
              bg: alpha(theme.palette.primary.main, 0.1),
              grad: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.2)} 0%, ${alpha(theme.palette.primary.main, 0.2)} 100%)`
            },
            {
              title: 'In Progress',
              value: activeCourses.length,
              icon: 'solar:clock-circle-bold-duotone',
              color: 'warning',
               bg: alpha(theme.palette.warning.main, 0.1),
               grad: `linear-gradient(135deg, ${alpha(theme.palette.warning.light, 0.2)} 0%, ${alpha(theme.palette.warning.main, 0.2)} 100%)`
            },
            {
              title: 'Completed',
              value: completedCourses.length,
              icon: 'solar:check-circle-bold-duotone',
              color: 'success',
               bg: alpha(theme.palette.success.main, 0.1),
               grad: `linear-gradient(135deg, ${alpha(theme.palette.success.light, 0.2)} 0%, ${alpha(theme.palette.success.main, 0.2)} 100%)`
            },
            {
              title: 'Avg. Progress',
              value: `${Math.round(enrolledCourses.reduce((acc, course) => acc + course.progress, 0) / enrolledCourses.length) || 0}%`,
              icon: 'solar:graph-up-bold-duotone',
              color: 'info',
               bg: alpha(theme.palette.info.main, 0.1),
               grad: `linear-gradient(135deg, ${alpha(theme.palette.info.light, 0.2)} 0%, ${alpha(theme.palette.info.main, 0.2)} 100%)`
            },
          ].map((stat, index) => (
             <Card 
                key={index} 
                sx={{ 
                    p: 3, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    background: stat.grad,
                    boxShadow: theme.shadows[2],
                    transition: 'transform 0.3s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[8] }
                }}
             >
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: `${stat.color}.darker` }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: `${stat.color}.dark`, fontWeight: 600 }}>
                    {stat.title}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: 'white', display: 'flex' }}>
                   <Iconify icon={stat.icon} width={32} sx={{ color: `${stat.color}.main` }} />
                </Box>
             </Card>
          ))}
        </Box>

        {waitingCourses.length > 0 && (
          <Card
            sx={{
              mb: 6,
              p: 3,
              borderRadius: 3,
              border: `1px dashed ${alpha(theme.palette.warning.main, 0.32)}`,
              bgcolor: alpha(theme.palette.warning.main, 0.04),
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  bgcolor: alpha(theme.palette.warning.main, 0.16),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Iconify icon="solar:clock-circle-bold-duotone" width={24} sx={{ color: 'warning.main' }} />
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                  Waiting for round assignment
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  You have been accepted by the admin. Please wait until the instructor creates a round and assigns you.
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {waitingCourses.map((c) => (
                    <Chip key={c.id} label={c.title} variant="outlined" />
                  ))}
                </Box>
              </Box>
            </Box>
          </Card>
        )}

        {/* Active Courses */}
        {activeCourses.length > 0 && (
          <Box sx={{ mb: 6 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 800 }}>
              Continue Learning
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 3 }}>
              {activeCourses.map((course) => (
                <Card 
                    key={course.id} 
                    sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        transition: 'all 0.3s',
                        '&:hover': { transform: 'translateY(-8px)', boxShadow: theme.shadows[16] } 
                    }}
                >
                  <Box
                    sx={{
                      height: 160,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.lighter, 0.5)} 0%, ${alpha(theme.palette.secondary.lighter, 0.5)} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                     <Iconify icon="solar:programming-bold-duotone" width={80} sx={{ color: 'primary.main', opacity: 0.6 }} />
                     <Chip
                        label={getStatusLabel(course.status)}
                        color="primary"
                        size="small"
                        variant="filled"
                        sx={{ position: 'absolute', top: 12, right: 12, fontWeight: 700 }}
                      />
                  </Box>

                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, minHeight: 64 }}>
                      {course.title}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                         <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                             <Iconify icon="solar:user-circle-bold" width={16} sx={{ color: 'text.secondary' }} />
                         </Box>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                           {course.instructor}
                        </Typography>
                    </Box>

                    {course.round && (
                      <Box
                        sx={{
                          mb: 3,
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.info.main, 0.06),
                          border: `1px solid ${alpha(theme.palette.info.main, 0.16)}`,
                          display: 'flex',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <Chip
                          label={`Round: ${course.round.name}`}
                          size="small"
                          color="info"
                          variant="outlined"
                        />
                        <Chip
                          label={String(course.round.status).toUpperCase()}
                          size="small"
                          color={
                            course.round.status === 'active'
                              ? 'success'
                              : course.round.status === 'finished'
                                ? 'info'
                                : course.round.status === 'cancelled'
                                  ? 'error'
                                  : 'warning'
                          }
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                          {new Date(course.round.startDate).toLocaleDateString()} - {new Date(course.round.endDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" fontWeight={600} color="text.secondary">
                          {course.completedLessons} / {course.totalLessons} Lessons
                        </Typography>
                        <Typography variant="caption" fontWeight={700} color="primary.main">
                          {course.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={course.progress}
                        sx={{ height: 8, borderRadius: 4, bgcolor: alpha(theme.palette.primary.main, 0.12) }}
                      />
                    </Box>

                    {course.nextLesson && (
                      <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.04), borderRadius: 1, border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`, mb: 2 }}>
                         <Typography variant="caption" color="primary.main" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                             <Iconify icon="solar:play-bold" width={12} />
                             UP NEXT
                         </Typography>
                        <Typography variant="body2" fontWeight={600} sx={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                           {course.nextLesson}
                        </Typography>
                      </Box>
                    )}

                    {course.whatYouWillLearn && (
                      <Box sx={{ mb: 3, p: 2, bgcolor: alpha(theme.palette.background.neutral, 0.5), borderRadius: 2 }}>
                         <Typography variant="subtitle2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Iconify icon="solar:star-bold-duotone" color="warning.main" width={18} />
                            Key Takeaways
                         </Typography>
                         <Box component="ul" sx={{ pl: 2.5, m: 0, typography: 'caption', color: 'text.secondary', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {course.whatYouWillLearn.map((item: string, i: number) => (
                              <li key={i}>{item}</li>
                            ))}
                         </Box>
                      </Box>
                    )}

                    {course.dueAssignment && course.dueDate && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          p: 1.5,
                          borderRadius: 2,
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)',
                          background: `linear-gradient(135deg, ${alpha(theme.palette.warning.light, 0.16)} 0%, ${alpha(theme.palette.background.paper, 0.4)} 100%)`,
                          border: `1px solid ${alpha(theme.palette.warning.main, 0.24)}`,
                          boxShadow: `0 4px 12px ${alpha(theme.palette.warning.main, 0.12)}`,
                          color: 'warning.darker',
                        }}
                      >
                        <Iconify icon="solar:alarm-bold" width={20} />
                        <Box>
                          <Typography variant="caption" fontWeight={800} display="block">
                            DUE SOON
                          </Typography>
                          <Typography variant="body2" fontWeight={700}>
                            {course.dueAssignment}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </CardContent>

                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      startIcon={<Iconify icon="solar:play-circle-bold" />}
                      href={`/course-room/${course.id}`}
                      sx={{ borderRadius: 30, boxShadow: theme.shadows[4] }}
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
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
              Completed Courses
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 3 }}>
              {completedCourses.map((course) => (
                <Card key={course.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column', opacity: 0.9, transition: 'all 0.3s', '&:hover': { opacity: 1, transform: 'translateY(-4px)', boxShadow: theme.shadows[8] } }}>
                  <Box
                    sx={{
                      height: 120,
                       background: `linear-gradient(135deg, ${alpha(theme.palette.success.lighter, 0.3)} 0%, ${alpha(theme.palette.success.light, 0.3)} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    <Iconify icon="solar:diploma-bold-duotone" width={60} sx={{ color: 'success.main' }} />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
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
                      <Iconify icon="solar:check-read-bold" width={20} />
                    </Box>
                  </Box>

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                      {course.title}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                       <Iconify icon="solar:user-circle-bold" width={16} />
                       {course.instructor}
                    </Typography>

                    <Box sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.08), borderRadius: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                             <Typography variant="body2" color="text.secondary">Completed On</Typography>
                             <Typography variant="body2" fontWeight={600}>{course.completedAt?.toLocaleDateString()}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                             <Typography variant="body2" color="text.secondary">Final Grade</Typography>
                             <Typography variant="body2" fontWeight={700} color="success.main">{course.grade}</Typography>
                        </Box>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 2 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<Iconify icon="solar:eye-bold" />}
                      href={`/course-room/${course.id}`}
                      color="inherit"
                    >
                      Review Course
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Box>
          </Box>
        )}

        {/* Paused Courses */}
        {pausedCourses.length > 0 && (
          <Box sx={{ mb: 5 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
              Paused Courses
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 3 }}>
              {pausedCourses.map((course) => (
                <Card key={course.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column', opacity: 0.95, transition: 'all 0.3s', '&:hover': { opacity: 1, transform: 'translateY(-4px)', boxShadow: theme.shadows[8] } }}>
                  <Box
                    sx={{
                      height: 120,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.warning.lighter, 0.3)} 0%, ${alpha(theme.palette.warning.light, 0.3)} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    <Iconify icon="solar:pause-circle-bold-duotone" width={60} sx={{ color: 'warning.main' }} />
                    <Chip
                      label={getStatusLabel(course.status)}
                      size="small"
                      color="warning"
                      sx={{ position: 'absolute', top: 12, right: 12, fontWeight: 800 }}
                    />
                  </Box>

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                      {course.title}
                    </Typography>

                    {course.round && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Round: {course.round.name}
                      </Typography>
                    )}

                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Iconify icon="solar:user-circle-bold" width={16} />
                      {course.instructor}
                    </Typography>
                  </CardContent>

                  <CardActions sx={{ p: 2 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<Iconify icon="solar:eye-bold" />}
                      href={`/course-room/${course.id}`}
                      color="inherit"
                    >
                      View Course
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Box>
          </Box>
        )}

        {/* Empty State */}
        {enrolledCourses.length === 0 && waitingCourses.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Box sx={{ mb: 3, p: 4, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.08), display: 'inline-flex' }}>
                 <Iconify icon="solar:notebook-minimalistic-bold-duotone" width={64} sx={{ color: 'primary.main', opacity: 0.6 }} />
            </Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
              Start Your Learning Journey
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
              You haven&apos;t enrolled in any courses yet. Explore our course catalog to find the perfect course for you.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<Iconify icon="solar:global-search-bold" />}
              href="/courses"
              sx={{ borderRadius: 30, px: 4, py: 1.5, fontSize: '1rem' }}
            >
              Browse Courses
            </Button>
          </Box>
        )}
      </Container>
    </DashboardContent>
  );
}
