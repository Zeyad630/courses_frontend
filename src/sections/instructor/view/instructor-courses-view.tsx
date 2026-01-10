import type { Course } from 'src/types/course';

import { useTranslation } from 'react-i18next';
import { useMemo, useState, useCallback, useEffect } from 'react';

import { alpha, useTheme } from '@mui/material/styles';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Checkbox,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';

import { courseApi } from 'src/api';
import { DashboardContent } from 'src/layouts/dashboard';
import { useAuth } from 'src/contexts/simple-auth-context';
import { mapCourseDtoToCourse } from 'src/api/mappers/course.mapper';
import { useApplicationsContext } from 'src/contexts/applications-context';
import { useCourseRoundsContext } from 'src/contexts/course-rounds-context';

import { Iconify } from 'src/components/iconify';

const toDateInputValue = (value: string) => value.slice(0, 10);

const toPrettyDate = (value: string) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString();
};

const getRoundStatusColor = (status: string) => {
  switch (status) {
    case 'scheduled':
      return 'warning' as const;
    case 'active':
      return 'success' as const;
    case 'finished':
      return 'info' as const;
    case 'cancelled':
      return 'error' as const;
    default:
      return 'default' as const;
  }
};

export function InstructorCoursesView() {
  const { t } = useTranslation();
  const theme = useTheme();

  const { user, hasRole } = useAuth();
  const { getApplicationsByCourse } = useApplicationsContext();
  const {
    createRound,
    updateRound,
    deleteRound,
    getRoundsByCourse,
    assignStudentsToRound,
    getAssignmentForStudent,
    getRoundById,
    getAssignmentsByRound,
  } = useCourseRoundsContext();

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [roundName, setRoundName] = useState('');
  const [roundStartDate, setRoundStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [roundEndDate, setRoundEndDate] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
  const [roundDetails, setRoundDetails] = useState('');

  const [selectedRoundId, setSelectedRoundId] = useState<string>('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<Record<string, boolean>>({});

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [instructorCourses, setInstructorCourses] = useState<Course[]>([]);

  // Load courses assigned to this instructor
  useEffect(() => {
    const loadInstructorCourses = async () => {
      if (!user?.id) return;
      try {
        const instructorId = Number(user.id);
        if (isNaN(instructorId)) return;

        const coursesData = await courseApi.getCoursesByInstructor(instructorId);
        const mappedCourses: Course[] = coursesData.map(mapCourseDtoToCourse);
        setInstructorCourses(mappedCourses);
      } catch (error) {
        console.error('Failed to load instructor courses:', error);
        setInstructorCourses([]);
      }
    };
    loadInstructorCourses();
  }, [user?.id]);

  const courseRounds = useMemo(() => {
    if (!selectedCourse) return [];
    return getRoundsByCourse(selectedCourse.id);
  }, [getRoundsByCourse, selectedCourse]);

  const acceptedApplications = useMemo(() => {
    if (!selectedCourse) return [];
    return getApplicationsByCourse(selectedCourse.id).filter((a) => a.status === 'accepted');
  }, [getApplicationsByCourse, selectedCourse]);

  const openCourse = useCallback((course: Course) => {
    setSelectedCourse(course);
    setDrawerOpen(true);
    setSelectedStudentIds({});
    setSelectedRoundId('');
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setSelectedCourse(null);
    setSelectedStudentIds({});
    setSelectedRoundId('');
  }, []);

  const toggleStudent = useCallback((studentId: string) => {
    setSelectedStudentIds((prev) => ({ ...prev, [studentId]: !prev[studentId] }));
  }, []);

  const selectedStudentsArray = useMemo(
    () => Object.entries(selectedStudentIds).filter(([, v]) => v).map(([k]) => k),
    [selectedStudentIds]
  );

  const handleOpenCreateRound = useCallback(() => {
    setRoundName('');
    setRoundDetails('');
    setRoundStartDate(new Date().toISOString().slice(0, 10));
    setRoundEndDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
    setCreateDialogOpen(true);
  }, []);

  const handleCreateRound = useCallback(async () => {
    if (!selectedCourse || !user) return;
    if (!roundName.trim()) return;

    try {
      const created = await createRound({
        courseId: selectedCourse.id,
        name: roundName.trim(),
        startDate: new Date(roundStartDate).toISOString(),
        endDate: new Date(roundEndDate).toISOString(),
        details: roundDetails.trim(),
        createdBy: user.id,
      });

      setSelectedRoundId(created.id);
      setCreateDialogOpen(false);
    } catch (error: any) {
      console.error('Failed to create round:', error);
      alert(error?.message || 'Failed to create course round');
    }
  }, [createRound, roundDetails, roundEndDate, roundName, roundStartDate, selectedCourse, user]);

  const handleAssign = useCallback(async () => {
    if (!selectedCourse) return;
    if (!selectedRoundId) return;
    if (selectedStudentsArray.length === 0) return;

    try {
      await assignStudentsToRound({
        courseId: selectedCourse.id,
        roundId: selectedRoundId,
        studentIds: selectedStudentsArray,
      });

      setSelectedStudentIds({});
      alert('Students assigned successfully!');
    } catch (error: any) {
      console.error('Failed to assign students:', error);
      alert(error?.message || 'Failed to assign students');
    }
  }, [assignStudentsToRound, selectedCourse, selectedRoundId, selectedStudentsArray]);

  const handleAssignAllAccepted = useCallback(() => {
    if (!selectedCourse) return;
    if (!selectedRoundId) return;

    const ids = acceptedApplications.map((a) => a.studentId);
    if (ids.length === 0) return;

    assignStudentsToRound({
      courseId: selectedCourse.id,
      roundId: selectedRoundId,
      studentIds: ids,
    });

    setSelectedStudentIds({});
  }, [acceptedApplications, assignStudentsToRound, selectedCourse, selectedRoundId]);

  const selectedRound = useMemo(() => (selectedRoundId ? getRoundById(selectedRoundId) : undefined), [getRoundById, selectedRoundId]);

  const selectedRoundAssignedCount = useMemo(() => {
    if (!selectedRound) return 0;
    return getAssignmentsByRound(selectedRound.id).length;
  }, [getAssignmentsByRound, selectedRound]);

  if (!hasRole('instructor')) {
    return (
      <DashboardContent>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              {t('courses.instructorOnly')}
            </Typography>
          </Box>
        </Container>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Container maxWidth="xl">
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
          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'flex-start', md: 'center' },
              justifyContent: 'space-between',
              gap: 3,
            }}
          >
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                {t('courses.courseRounds')}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {t('courses.courseRoundsDescription')}
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
            }}
          />
        </Box>

        <Grid container spacing={3}>
          {instructorCourses.map((course) => (
            <Grid key={course.id} size={{ xs: 12, md: 6, lg: 4 }}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'all 0.3s',
                  '&:hover': { transform: 'translateY(-6px)', boxShadow: theme.shadows[8] },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {course.name}
                      </Typography>
                    </Box>
                    <Chip
                      label={course.status.toUpperCase()}
                      color={course.status === 'active' ? 'success' : 'default'}
                      variant="outlined"
                      size="small"
                    />
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                  >
                    {course.description}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                    <Chip label={`${t('courses.level')}: ${course.level}`} size="small" />
                    <Chip label={`${t('courses.duration')}: ${course.duration}h`} size="small" />
                    <Chip label={`${t('courses.students')}: ${course.students}`} size="small" />
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<Iconify icon="solar:calendar-bold-duotone" />}
                      onClick={() => openCourse(course)}
                      sx={{ borderRadius: 30 }}
                    >
                      {t('courses.manageRounds')}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={closeDrawer}
          PaperProps={{ sx: { width: { xs: '100%', sm: 520 }, p: 3 } }}
        >
          {selectedCourse && (
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    {selectedCourse.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('courses.roundsForCourse')}
                  </Typography>
                </Box>
                <Button onClick={closeDrawer} color="inherit">
                  {t('common.close')}
                </Button>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Iconify icon="solar:add-circle-bold" />}
                  onClick={handleOpenCreateRound}
                  sx={{ borderRadius: 30 }}
                >
                  {t('courses.createRound')}
                </Button>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                  {t('courses.selectRound')}
                </Typography>

                {courseRounds.length === 0 ? (
                  <Card sx={{ p: 2.5, borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('courses.noRoundsYet')}
                    </Typography>
                  </Card>
                ) : (
                  <Box sx={{ borderRadius: 2, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
                    <List disablePadding>
                      {courseRounds.map((r) => (
                        <ListItemButton
                          key={r.id}
                          selected={r.id === selectedRoundId}
                          onClick={() => setSelectedRoundId(r.id)}
                          sx={{
                            py: 1.25,
                            '&.Mui-selected': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
                            '&.Mui-selected:hover': { bgcolor: alpha(theme.palette.primary.main, 0.12) },
                          }}
                        >
                          <ListItemText
                            primary={r.name}
                            secondary={`${toPrettyDate(r.startDate)} - ${toPrettyDate(r.endDate)}`}
                          />
                          <Chip
                            label={t(`courses.roundStatus.${r.status}`)}
                            color={getRoundStatusColor(r.status)}
                            size="small"
                            variant="outlined"
                            sx={{ ml: 1 }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </Box>
                )}

                {selectedRound && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                      border: `1px dashed ${alpha(theme.palette.primary.main, 0.24)}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                        {selectedRound.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={t(`courses.roundStatus.${selectedRound.status}`)}
                          color={getRoundStatusColor(selectedRound.status)}
                          size="small"
                        />
                        <Chip
                          label={`${selectedRoundAssignedCount} ${t('courses.students')}`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {toPrettyDate(selectedRound.startDate)} - {toPrettyDate(selectedRound.endDate)}
                    </Typography>
                    {selectedRound.details && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {selectedRound.details}
                      </Typography>
                    )}

                    <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>

                      <Button
                        size="small"
                        variant="outlined"
                        color="warning"
                        onClick={async () => {
                          try {
                            await updateRound(selectedRound.id, { status: 'scheduled' });
                          } catch (error: any) {
                            alert(error?.message || 'Failed to update status');
                          }
                        }}
                      >
                        {t('courses.markScheduled')}
                      </Button>

                      <Button
                        size="small"
                        variant="outlined"
                        onClick={async () => {
                          try {
                            await updateRound(selectedRound.id, { status: 'active' });
                          } catch (error: any) {
                            alert(error?.message || 'Failed to update status');
                          }
                        }}
                      >
                        {t('courses.markActive')}
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="info"
                        onClick={async () => {
                          try {
                            await updateRound(selectedRound.id, { status: 'finished' });
                          } catch (error: any) {
                            alert(error?.message || 'Failed to update status');
                          }
                        }}
                      >
                        {t('courses.markFinished')}
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={async () => {
                          try {
                            await updateRound(selectedRound.id, { status: 'cancelled' });
                          } catch (error: any) {
                            alert(error?.message || 'Failed to update status');
                          }
                        }}
                      >
                        {t('courses.markCancelled')}
                      </Button>
                      <Button
                        size="small"
                        variant="text"
                        color="error"
                        onClick={() => setDeleteDialogOpen(true)}
                      >
                        {t('common.delete')}
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {t('courses.acceptedStudents')}
                </Typography>
                <Chip
                  label={`${acceptedApplications.length}`}
                  color="success"
                  size="small"
                  variant="outlined"
                />
              </Box>

              {acceptedApplications.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('courses.noAcceptedStudents')}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ flexGrow: 1, overflow: 'auto', borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                  <List disablePadding>
                    {acceptedApplications.map((app) => {
                      const assigned = getAssignmentForStudent(selectedCourse.id, app.studentId);
                      const assignedRound = assigned ? getRoundById(assigned.roundId) : undefined;

                      return (
                        <ListItemButton key={app.id} onClick={() => toggleStudent(app.studentId)}>
                          <Checkbox checked={Boolean(selectedStudentIds[app.studentId])} />
                          <ListItemText
                            primary={app.metadata?.fullName || app.studentId}
                            secondary={app.metadata?.email || ''}
                          />
                          {assignedRound && (
                            <Chip
                              label={assignedRound.name}
                              size="small"
                              variant="outlined"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </ListItemButton>
                      );
                    })}
                  </List>
                </Box>
              )}

              <Box sx={{ mt: 2, display: 'flex', gap: 1.5 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleAssign}
                  disabled={!selectedRoundId || selectedStudentsArray.length === 0}
                  startIcon={<Iconify icon="solar:check-circle-bold" />}
                  sx={{ borderRadius: 30 }}
                >
                  {t('courses.assignSelected')}
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleAssignAllAccepted}
                  disabled={!selectedRoundId || acceptedApplications.length === 0}
                  startIcon={<Iconify icon="solar:users-group-rounded-bold" />}
                  sx={{ borderRadius: 30 }}
                >
                  {t('courses.assignAllAccepted')}
                </Button>
              </Box>
            </Box>
          )}
        </Drawer>

        <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>{t('courses.createRound')}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label={t('courses.roundName')}
                value={roundName}
                onChange={(e) => setRoundName(e.target.value)}
                fullWidth
              />

              <TextField
                label={t('courses.startDate')}
                type="date"
                value={toDateInputValue(new Date(roundStartDate).toISOString())}
                onChange={(e) => setRoundStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label={t('courses.endDate')}
                type="date"
                value={toDateInputValue(new Date(roundEndDate).toISOString())}
                onChange={(e) => setRoundEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label={t('courses.details')}
                value={roundDetails}
                onChange={(e) => setRoundDetails(e.target.value)}
                fullWidth
                multiline
                rows={4}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button variant="contained" onClick={handleCreateRound} disabled={!roundName.trim()}>
              {t('common.save')}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} fullWidth maxWidth="xs">
          <DialogTitle>{t('courses.deleteRound')}</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t('courses.deleteRoundConfirm')}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button
              variant="contained"
              color="error"
              onClick={async () => {
                if (!selectedRound) return;
                try {
                  await deleteRound(selectedRound.id);
                  setSelectedRoundId('');
                  setDeleteDialogOpen(false);
                } catch (error: any) {
                  console.error('Failed to delete round:', error);
                  alert(error?.message || 'Failed to delete course round');
                }
              }}
            >
              {t('common.delete')}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardContent>
  );
}