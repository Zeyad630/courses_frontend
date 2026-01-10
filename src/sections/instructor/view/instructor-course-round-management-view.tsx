import type { CourseRoundDto } from 'src/api/models/course-round';
import type { CourseRoundStudentDto } from 'src/api/models/course-round-student';

import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Snackbar from '@mui/material/Snackbar';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import useMediaQuery from '@mui/material/useMediaQuery';

import { DashboardContent } from 'src/layouts/dashboard';
import { courseRoundApi, courseRoundStudentApi } from 'src/api';

import { Iconify } from 'src/components/iconify';

type CourseRoundForView = {
  id: number;
  courseId: number;
  roundNumber: number;
  startDate: string;
  endDate: string;
  status: string;
  instructor: string;
};

export function InstructorCourseRoundManagementView() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [courseRounds, setCourseRounds] = useState<CourseRoundForView[]>([]);
  const [selectedRoundId, setSelectedRoundId] = useState<number | null>(null);
  const [assignedStudents, setAssignedStudents] = useState<CourseRoundStudentDto[]>([]);
  
  // Dialogs
  const [assignStudentDialogOpen, setAssignStudentDialogOpen] = useState(false);
  
  // Forms
  const [assignStudentForm, setAssignStudentForm] = useState({ studentId: '' });
  
  const [toast, setToast] = useState<{ open: boolean; severity: 'success' | 'error'; message: string }>({
    open: false,
    severity: 'success',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  // Load course rounds
  const loadCourseRounds = useCallback(async () => {
    if (!selectedCourseId) return;
    try {
      setLoading(true);
      const allRounds: CourseRoundDto[] = await courseRoundApi.getAll();
      const roundsForCourse = allRounds.filter((r) => r.courseId === selectedCourseId);
      setCourseRounds(roundsForCourse.map((r) => ({
        id: r.id,
        courseId: r.courseId,
        roundNumber: r.roundNumber,
        startDate: r.startDate,
        endDate: r.endDate,
        status: r.status,
        instructor: r.instructor,
      })));
    } catch (error: any) {
      setToast({ open: true, severity: 'error', message: error?.message || 'Failed to load course rounds' });
    } finally {
      setLoading(false);
    }
  }, [selectedCourseId]);

  // Load materials, zoom meetings, and students for selected round
  const loadRoundData = useCallback(async () => {
    if (!selectedRoundId) {
      setAssignedStudents([]);
      return;
    }

    try {
      setLoading(true);
      const students = await courseRoundStudentApi.getByCourseRoundId(selectedRoundId);
      setAssignedStudents(students);
    } catch (error: any) {
      setToast({ open: true, severity: 'error', message: error?.message || 'Failed to load round data' });
    } finally {
      setLoading(false);
    }
  }, [selectedRoundId]);

  useEffect(() => {
    loadCourseRounds();
  }, [loadCourseRounds]);

  useEffect(() => {
    loadRoundData();
  }, [loadRoundData]);

  const handleAssignStudent = useCallback(async () => {
    if (!selectedRoundId || !assignStudentForm.studentId) return;
    try {
      await courseRoundStudentApi.assignStudent(selectedRoundId, {
        studentId: Number(assignStudentForm.studentId),
      });
      setToast({ open: true, severity: 'success', message: 'Student assigned successfully!' });
      setAssignStudentDialogOpen(false);
      setAssignStudentForm({ studentId: '' });
      await loadRoundData();
    } catch (error: any) {
      setToast({ open: true, severity: 'error', message: error?.message || 'Failed to assign student' });
    }
  }, [selectedRoundId, assignStudentForm, loadRoundData]);

  const handleUnassignStudent = useCallback(async (id: number) => {
    if (!confirm('Are you sure you want to unassign this student?')) return;
    try {
      await courseRoundStudentApi.unassignStudent(id);
      setToast({ open: true, severity: 'success', message: 'Student unassigned successfully!' });
      await loadRoundData();
    } catch (error: any) {
      setToast({ open: true, severity: 'error', message: error?.message || 'Failed to unassign student' });
    }
  }, [loadRoundData]);

  const selectedRound = courseRounds.find(r => r.id === selectedRoundId);

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
            Course Round Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage course rounds and student assignments
          </Typography>
        </Box>

        {/* Course Selection */}
        <Card sx={{ mb: 3, p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            Select Course
          </Typography>
          <TextField
            label="Course ID"
            type="number"
            value={selectedCourseId || ''}
            onChange={(e) => {
              const id = e.target.value ? Number(e.target.value) : null;
              setSelectedCourseId(id);
              setSelectedRoundId(null);
            }}
            placeholder="Enter course ID"
          />
          <Button
            variant="contained"
            onClick={loadCourseRounds}
            disabled={!selectedCourseId}
            sx={{ ml: 2 }}
          >
            Load Rounds
          </Button>
        </Card>

        {/* Course Rounds List */}
        {courseRounds.length > 0 && (
          <Card sx={{ mb: 3, p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              Course Rounds ({courseRounds.length})
            </Typography>
            <Grid container spacing={2}>
              {courseRounds.map((round) => (
                <Grid key={round.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: selectedRoundId === round.id ? `2px solid ${theme.palette.primary.main}` : '1px solid',
                      borderColor: selectedRoundId === round.id ? 'primary.main' : 'divider',
                      '&:hover': { boxShadow: 4 },
                    }}
                    onClick={() => setSelectedRoundId(round.id)}
                  >
                    <CardContent>
                      <Typography variant="h6">Round {round.roundNumber}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(round.startDate).toLocaleDateString()} - {new Date(round.endDate).toLocaleDateString()}
                      </Typography>
                      <Chip label={round.status} size="small" sx={{ mt: 1 }} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Card>
        )}

        {/* Selected Round Details */}
        {selectedRound && (
          <Box>
            <Card sx={{ mb: 3, p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    Round {selectedRound.roundNumber}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(selectedRound.startDate).toLocaleDateString()} - {new Date(selectedRound.endDate).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Iconify icon="solar:user-plus-bold" />}
                    onClick={() => setAssignStudentDialogOpen(true)}
                  >
                    Assign Student
                  </Button>
                </Box>
              </Box>

              {/* Assigned Students Section */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Assigned Students ({assignedStudents.length})
                </Typography>
                {assignedStudents.length === 0 ? (
                  <Alert severity="info">No students assigned yet</Alert>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {assignedStudents.map((assignment) => (
                      <Card key={assignment.id}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="subtitle1">{assignment.studentName}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {assignment.studentEmail}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                            <Button
                              size="small"
                              color="error"
                              onClick={() => handleUnassignStudent(assignment.id)}
                            >
                              Unassign
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}
              </Box>
            </Card>
          </Box>
        )}

        {/* Assign Student Dialog */}
        <Dialog open={assignStudentDialogOpen} onClose={() => setAssignStudentDialogOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
          <DialogTitle>Assign Student to Course Round</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Student ID"
                type="number"
                value={assignStudentForm.studentId}
                onChange={(e) => setAssignStudentForm({ studentId: e.target.value })}
                required
                fullWidth
                placeholder="Enter student account ID"
              />
              <Alert severity="info">
                Enter the student&apos;s account ID to assign them to this course round.
              </Alert>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAssignStudentDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleAssignStudent}
              disabled={!assignStudentForm.studentId}
            >
              Assign Student
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={toast.open}
          autoHideDuration={4000}
          onClose={() => setToast({ ...toast, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity} variant="filled">
            {toast.message}
          </Alert>
        </Snackbar>
      </Container>
    </DashboardContent>
  );
}
