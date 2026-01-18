import type { WeekDto } from 'src/api/models/week';

import { useMemo, useEffect, useState } from 'react';

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
import { weekApi } from 'src/api';
import { MaterialDto } from 'src/api/models/material';
import { courseMaterialApi } from 'src/api/services/course-material.api';
import { useAuth } from 'src/contexts/simple-auth-context';
import { useCoursesContext } from 'src/contexts/courses-context';
import { useApplicationsContext } from 'src/contexts/applications-context';
import { useCourseRoundsContext } from 'src/contexts/course-rounds-context';

import { Iconify } from 'src/components/iconify';

const premiumGlass = (theme: any) => ({
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
  boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.05)}`,
  borderRadius: 3,
});

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
      return 'Continue learning';
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
  const { rounds } = useCourseRoundsContext();

  const acceptedApplications = useMemo(() => {
    const userId = user?.id;
    if (!userId) return [];
    return applications.filter((a) => a.studentId === userId && (a.status === 'accepted' || a.status === 'payed'));
  }, [applications, user?.id]);

  const [weeksByRoundId, setWeeksByRoundId] = useState<Record<string, WeekDto[]>>({});
  const [materialsByRoundId, setMaterialsByRoundId] = useState<Record<string, MaterialDto[]>>({});

  useEffect(() => {
    let cancelled = false;

    const roundIds = Array.from(
      new Set(
        acceptedApplications
          .map((a) => String(a.courseRoundId))
          .filter((x) => x && x !== 'undefined' && x !== 'null')
      )
    );

    if (roundIds.length === 0) {
      setWeeksByRoundId({});
      setMaterialsByRoundId({});
      return () => {
        cancelled = true;
      };
    }

    Promise.all(
      roundIds.map(async (rid) => {
          try {
             const ws = await weekApi.getByCourseRoundId(Number(rid));
             const ms = await courseMaterialApi.getByCourseRoundId(Number(rid));
             return [rid, ws, ms] as const;
          } catch(e) {
             return [rid, [] as WeekDto[], [] as MaterialDto[]] as const;
          }
      })
    ).then((entries) => {
      if (cancelled) return;
      const nextWeeks: Record<string, WeekDto[]> = {};
      const nextMaterials: Record<string, MaterialDto[]> = {};
      
      entries.forEach(([rid, ws, ms]) => {
        nextWeeks[rid] = Array.isArray(ws) ? [...ws] : [];
        nextMaterials[rid] = Array.isArray(ms) ? [...ms] : [];
      });
      
      setWeeksByRoundId(nextWeeks);
      setMaterialsByRoundId(nextMaterials);
    });

    return () => {
      cancelled = true;
    };
  }, [acceptedApplications]);

  const { enrolledCourses } = useMemo(() => {
    if (!user?.id) return { enrolledCourses: [] };

    const enrolled: any[] = [];

    const now = new Date();
    const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    acceptedApplications.forEach((app, index) => {
      const courseId = app.courseId;

      const round = rounds.find((r) => String(r.id) === String(app.courseRoundId));
      const resolvedCourseId = round?.courseId ?? courseId;
      const course = courses.find((c) => c.id === resolvedCourseId);
      const mappedStatus =
        round?.status === 'finished'
          ? 'completed'
          : round?.status === 'cancelled'
            ? 'paused'
            : 'active';

      const roundWeeks = weeksByRoundId[String(app.courseRoundId)] ?? [];
      const roundMaterials = materialsByRoundId[String(app.courseRoundId)] ?? [];

      const weeksSorted = [...roundWeeks].sort(
        (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
      
      const totalWeeks = weeksSorted.length;
      const finishedWeeks = weeksSorted.filter((w) => new Date(w.endDate).getTime() < nowMidnight.getTime());
      const progress = totalWeeks > 0 ? Math.round((finishedWeeks.length / totalWeeks) * 100) : 0;
      
      const upNextWeek = weeksSorted.find((w) => new Date(w.endDate).getTime() >= nowMidnight.getTime());
      
      let upNextTitle = 'Start learning';
      let dueAssignment = '—';
      
      if (upNextWeek) {
          upNextTitle = upNextWeek.weekTitle ?? upNextWeek.title ?? `Week ${upNextWeek.id}`;
          
          // Check for specific lesson or assignment in this week
          const weeklyMaterials = roundMaterials.filter(m => m.weekId === upNextWeek.id);
          
          if (weeklyMaterials.length > 0) {
                // Look for Assignment/Quiz
                const assignment = weeklyMaterials.find(m => m.title.toLowerCase().includes('assignment') || m.title.toLowerCase().includes('quiz') || m.materialTypeStatusId === 36);
                if (assignment) dueAssignment = assignment.title;
                
                // If title generic, use first lesson
                if(upNextTitle.startsWith('Week')) {
                    const firstLesson = weeklyMaterials.find(m => (!m.parentMaterialId) && (m.materialTypeStatusId === 32 || m.materialTypeStatusId === 33 || m.materialTypeStatusId === 37)); // Lesson/Video/PPT
                    if(firstLesson) upNextTitle = firstLesson.title; 
                }
          }
      } else if (totalWeeks > 0 && finishedWeeks.length === totalWeeks) {
          upNextTitle = 'Course Completed';
      }

      const base = {
        id: resolvedCourseId,
        title: course?.name ?? app?.metadata?.courseName ?? 'Course',
        description: course?.description ?? '',
        instructor: round?.createdByName ?? course?.instructor ?? '',
        progress: Math.min(progress, 100),
        totalLessons: totalWeeks || 1,
        completedLessons: finishedWeeks.length,
        nextLesson: upNextTitle,
        dueAssignment,
        dueDate: upNextWeek?.endDate ? new Date(upNextWeek.endDate) : new Date(Date.now() + (index + 3) * 24 * 60 * 60 * 1000),
        grade: '—', // Placeholder
        status: mappedStatus,
        enrolledAt: app?.appliedAt,
        completedAt: undefined,
        image: '/assets/school/course.webp',
        whatYouWillLearn: weeksSorted.length
          ? weeksSorted.map((w) => (w.weekTitle ?? w.title ?? `Week ${w.id}`)).filter(Boolean)
          : [],
        weeksCount: totalWeeks,
        roundStatusName: round?.statusName ?? '',
      };

      enrolled.push({ ...base, round });
    });

    return { enrolledCourses: enrolled };
  }, [acceptedApplications, courses, rounds, user?.id, weeksByRoundId, materialsByRoundId]);

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
         {/* Premium Header */}
        <Box
          sx={{
            mb: 5,
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.8s ease-out',
          }}
        >
           {/* Background Mesh Gradient */}
           <Box sx={{
              position: 'absolute',
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0,
              background: `radial-gradient(at 0% 0%, ${alpha(theme.palette.secondary.dark, 0.8)} 0px, transparent 50%),
                           radial-gradient(at 100% 0%, ${alpha(theme.palette.primary.main, 0.9)} 0px, transparent 50%),
                           radial-gradient(at 100% 100%, ${alpha(theme.palette.info.main, 0.8)} 0px, transparent 50%),
                           radial-gradient(at 0% 100%, ${alpha(theme.palette.success.dark, 0.5)} 0px, transparent 50%),
                           linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)`, 
              zIndex: 0
           }} />

          <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 3 }}>
             <Box sx={{ color: 'white' }}>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                  My Learning Journey
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, fontSize: '1.1rem', fontWeight: 500 }}>
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
                    backdropFilter: 'blur(10px)',
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } 
                }}
              >
                Browse More Courses
              </Button>
          </Box>
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
                    ...premiumGlass(theme),
                    background: alpha(theme.palette.background.paper, 0.6),
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': { transform: 'translateY(-8px)', boxShadow: theme.shadows[14], background: alpha(theme.palette.background.paper, 0.8) }
                }}
             >
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: (theme.palette as any)[stat.color].main, textShadow: `0 2px 10px ${alpha((theme.palette as any)[stat.color].main, 0.3)}` }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                    {stat.title}
                  </Typography>
                </Box>
                <Box sx={{ 
                    p: 2, 
                    borderRadius: '50%', 
                    bgcolor: alpha((theme.palette as any)[stat.color].main, 0.1), 
                    display: 'flex',
                    boxShadow: `0 4px 12px ${alpha((theme.palette as any)[stat.color].main, 0.2)}`
                }}>
                   <Iconify icon={stat.icon} width={32} sx={{ color: (theme.palette as any)[stat.color].main }} />
                </Box>
             </Card>
          ))}
        </Box>

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
                        ...premiumGlass(theme),
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': { transform: 'translateY(-12px)', boxShadow: theme.shadows[20] } 
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
                     <Iconify icon="solar:play-circle-bold-duotone" width={80} sx={{ color: 'primary.main', opacity: 0.6 }} />
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

                    {course.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                      >
                        {course.description}
                      </Typography>
                    )}

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
                          label={(course.roundStatusName || String(course.round.status)).toUpperCase()}
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
                        {typeof course.weeksCount === 'number' && (
                          <Chip
                            label={`${course.weeksCount} WEEKS`}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 800 }}
                          />
                        )}
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
                      startIcon={<Iconify icon="solar:play-bold" />}
                      href={course.round ? `/course-room/${course.id}?roundId=${course.round.id}` : `/course-room/${course.id}`}
                      sx={{ 
                          borderRadius: 2, 
                          py: 1.5,
                          fontSize: '1rem',
                          fontWeight: 800,
                          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                          boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                          '&:hover': { boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.4)}` }
                      }}
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
                      href={course.round ? `/course-room/${course.id}?roundId=${course.round.id}` : `/course-room/${course.id}`}
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
                      href={course.round ? `/course-room/${course.id}?roundId=${course.round.id}` : `/course-room/${course.id}`}
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
        {enrolledCourses.length === 0 && (
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
