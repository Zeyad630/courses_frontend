import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TableRow from '@mui/material/TableRow';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';

import { DashboardContent } from 'src/layouts/dashboard';
import { useCoursesContext } from 'src/contexts/courses-context';
import { Iconify } from 'src/components/iconify';

import type { Course, CreateCourseInput, UpdateCourseInput, CourseLevel } from 'src/types/course';

// ----------------------------------------------------------------------

interface CourseFormData {
  name: string;
  code: string;
  description: string;
  category: string;
  level: CourseLevel;
  price: number;
  instructorId: string;
  duration: number;
}

const initialFormData: CourseFormData = {
  name: '',
  code: '',
  description: '',
  category: '',
  level: 'beginner',
  price: 0,
  instructorId: '',
  duration: 0,
};

export function AdminCourseManagementView() {
  const { t } = useTranslation();
  const { courses, createCourse, updateCourse, deleteCourse } = useCoursesContext();

  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<CourseFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        name: course.name,
        code: course.code,
        description: course.description,
        category: course.category,
        level: course.level,
        price: course.price,
        instructorId: course.instructorId,
        duration: course.duration,
      });
    } else {
      setEditingCourse(null);
      setFormData(initialFormData);
    }
    setOpenDialog(true);
    setError(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCourse(null);
    setFormData(initialFormData);
    setError(null);
  };

  const handleFormChange = (field: keyof CourseFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveCourse = useCallback(async () => {
    if (!formData.name || !formData.code || !formData.description) {
      setError(t('validation.required'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (editingCourse) {
        await updateCourse({
          id: editingCourse.id,
          ...formData,
        } as UpdateCourseInput);
        setSuccess(t('courses.courseUpdatedSuccess'));
      } else {
        await createCourse(formData as CreateCourseInput);
        setSuccess(t('courses.courseCreatedSuccess'));
      }

      setTimeout(() => {
        handleCloseDialog();
        setSuccess(null);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('messages.savingError'));
    } finally {
      setLoading(false);
    }
  }, [formData, editingCourse, createCourse, updateCourse, t]);

  const handleDeleteCourse = useCallback(
    async (courseId: string) => {
      if (!window.confirm(t('courses.deleteCourseConfirm'))) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        await deleteCourse(courseId);
        setSuccess(t('courses.courseDeletedSuccess'));
        setTimeout(() => {
          setSuccess(null);
        }, 1500);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('messages.savingError'));
      } finally {
        setLoading(false);
      }
    },
    [deleteCourse, t]
  );

  const activeCourses = courses.filter((c) => c.status === 'active');
  const inactiveCourses = courses.filter((c) => c.status !== 'active');

  const renderCourseForm = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label={t('courses.courseName')}
        value={formData.name}
        onChange={(e) => handleFormChange('name', e.target.value)}
        placeholder={t('courses.courseName')}
      />

      <TextField
        fullWidth
        label={t('courses.courseCode')}
        value={formData.code}
        onChange={(e) => handleFormChange('code', e.target.value)}
        placeholder="e.g., WEB-101"
      />

      <TextField
        fullWidth
        multiline
        rows={3}
        label={t('courses.courseDescription')}
        value={formData.description}
        onChange={(e) => handleFormChange('description', e.target.value)}
        placeholder={t('courses.courseDescription')}
      />

      <TextField
        fullWidth
        label={t('courses.category')}
        value={formData.category}
        onChange={(e) => handleFormChange('category', e.target.value)}
        placeholder="e.g., Web Development"
      />

      <FormControl fullWidth>
        <InputLabel>{t('courses.level')}</InputLabel>
        <Select
          value={formData.level}
          label={t('courses.level')}
          onChange={(e) => handleFormChange('level', e.target.value)}
        >
          <MenuItem value="beginner">{t('courses.beginner')}</MenuItem>
          <MenuItem value="intermediate">{t('courses.intermediate')}</MenuItem>
          <MenuItem value="advanced">{t('courses.advanced')}</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        type="number"
        label={t('courses.price')}
        value={formData.price}
        onChange={(e) => handleFormChange('price', parseFloat(e.target.value))}
        placeholder="0"
      />

      <TextField
        fullWidth
        label={t('courses.instructor')}
        value={formData.instructorId}
        onChange={(e) => handleFormChange('instructorId', e.target.value)}
        placeholder="Instructor ID"
      />

      <TextField
        fullWidth
        type="number"
        label={t('courses.duration')}
        value={formData.duration}
        onChange={(e) => handleFormChange('duration', parseInt(e.target.value, 10))}
        placeholder="Hours"
      />
    </Box>
  );

  const renderCoursesTable = (courseList: Course[]) => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'primary.lighter' }}>
            <TableCell>{t('courses.courseName')}</TableCell>
            <TableCell>{t('courses.courseCode')}</TableCell>
            <TableCell>{t('courses.category')}</TableCell>
            <TableCell>{t('courses.level')}</TableCell>
            <TableCell align="right">{t('courses.price')}</TableCell>
            <TableCell align="right">{t('courses.students')}</TableCell>
            <TableCell align="center">{t('common.action')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {courseList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {t('courses.noCourses')}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            courseList.map((course) => (
              <TableRow key={course.id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {course.name}
                  </Typography>
                </TableCell>
                <TableCell>{course.code}</TableCell>
                <TableCell>{course.category}</TableCell>
                <TableCell>
                  <Typography
                    variant="caption"
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 0.75,
                      bgcolor:
                        course.level === 'beginner'
                          ? 'success.lighter'
                          : course.level === 'intermediate'
                            ? 'warning.lighter'
                            : 'error.lighter',
                      color:
                        course.level === 'beginner'
                          ? 'success.dark'
                          : course.level === 'intermediate'
                            ? 'warning.dark'
                            : 'error.dark',
                      textTransform: 'capitalize',
                    }}
                  >
                    {t(`courses.${course.level}`)}
                  </Typography>
                </TableCell>
                <TableCell align="right">${course.price}</TableCell>
                <TableCell align="right">{course.students}</TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(course)}
                    sx={{ color: 'primary.main' }}
                  >
                    <Iconify icon="solar:pen-bold" width={18} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteCourse(course.id)}
                    sx={{ color: 'error.main' }}
                  >
                    <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <DashboardContent>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {t('courses.courseManagement')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {t('admin.management')} {t('courses.courses').toLowerCase()}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:check-circle-bold" width={20} />}
            onClick={() => handleOpenDialog()}
          >
            {t('courses.addCourse')}
          </Button>
        </Box>

        {/* Success Alert */}
        {success && (
          <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {/* Tabs */}
        <Card sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ px: 2 }}>
            <Tab label={`${t('admin.activeCourses')} (${activeCourses.length})`} />
            <Tab label={`${t('messages.noData')} (${inactiveCourses.length})`} />
          </Tabs>
        </Card>

        {/* Courses Table */}
        <Card>
          <CardContent>
            {tabValue === 0 && renderCoursesTable(activeCourses)}
            {tabValue === 1 && renderCoursesTable(inactiveCourses)}
          </CardContent>
        </Card>

        {/* Course Form Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingCourse ? t('courses.editCourse') : t('courses.addCourse')}
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            {renderCourseForm}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>{t('common.cancel')}</Button>
            <Button
              variant="contained"
              onClick={handleSaveCourse}
              disabled={loading}
            >
              {loading ? t('common.loading') : t('common.save')}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardContent>
  );
}
