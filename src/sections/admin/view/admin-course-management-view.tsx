import type { Course, CourseLevel } from 'src/types/course';

import * as XLSX from 'xlsx';
import { useTranslation } from 'react-i18next';
import { useMemo, useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Menu from '@mui/material/Menu';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import ButtonGroup from '@mui/material/ButtonGroup';
import CardContent from '@mui/material/CardContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import { alpha, useTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';

import { ApiError } from 'src/api/errors';
import { accountApi, courseApi } from 'src/api';
import { DashboardContent } from 'src/layouts/dashboard';
import { useAuth } from 'src/contexts/simple-auth-context';
import { mapCourseDtoToCourse } from 'src/api/mappers/course.mapper';
import { useApplicationsContext } from 'src/contexts/applications-context';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

interface CourseFormData {
  name: string;
  description: string;
  level: CourseLevel;
  price: number;
  instructorIds: number[];
  duration: number;
}

const initialFormData: CourseFormData = {
  name: '',
  description: '',
  level: 'beginner',
  price: 0,
  instructorIds: [],
  duration: 0,
};

export function AdminCourseManagementView() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user } = useAuth();
  const { getApplicationsByCourse, updateApplicationStatus, deleteApplication, updateApplicationMetadata } =
    useApplicationsContext();

  const [adminCourses, setAdminCourses] = useState<Course[]>([]);

  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<CourseFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [exportMenuAnchorEl, setExportMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [exportingFormat, setExportingFormat] = useState<null | 'xlsx' | 'csv'>(null);
  const [exportFormat, setExportFormat] = useState<'xlsx' | 'csv'>('xlsx');
  const [editAppDialog, setEditAppDialog] = useState<{
    open: boolean;
    appId?: string;
    values: { fullName: string; email: string; phone: string };
  }>({ open: false, values: { fullName: '', email: '', phone: '' } });
  const [successDialog, setSuccessDialog] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
  const [instructors, setInstructors] = useState<Array<{ id: number; fullNameEn: string; email: string }>>([]);
  const [loadingInstructors, setLoadingInstructors] = useState(false);

  const loadAdminCourses = useCallback(async () => {
    try {
      const items = await courseApi.getCourses();
      setAdminCourses(items.map(mapCourseDtoToCourse));
    } catch (err) {
      console.error('Failed to load courses:', err);
      setAdminCourses([]);
    }
  }, []);

  useEffect(() => {
    loadAdminCourses();
  }, [loadAdminCourses]);

  // Load instructors when component mounts
  useEffect(() => {
    const loadInstructors = async () => {
      try {
        setLoadingInstructors(true);
        const data = await accountApi.getInstructors();
        setInstructors(data);
      } catch (err) {
        console.error('Failed to load instructors:', err);
      } finally {
        setLoadingInstructors(false);
      }
    };
    loadInstructors();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        name: course.name,
        description: course.description,
        level: course.level,
        price: course.price,
        instructorIds: course.instructorId ? [Number(course.instructorId)] : [],
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

  const levelIdFromForm = useCallback(
    (level: CourseLevel) => (level === 'beginner' ? 1 : level === 'intermediate' ? 2 : 3),
    []
  );

  const handleSaveCourse = useCallback(async () => {
    if (!formData.name || !formData.description) {
      setError(t('validation.required'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (editingCourse) {
        await courseApi.updateCourse(editingCourse.id, {
          title: formData.name,
          description: formData.description,
          levelStatusId: levelIdFromForm(formData.level),
          durationHours: formData.duration,
          price: formData.price,
          instructorIds: formData.instructorIds,
        });

        await loadAdminCourses();
        handleCloseDialog();
        setSuccessDialog({ open: true, message: t('courses.courseUpdatedSuccess') });
      } else {
        // Use courseApi directly to send instructorIds
        await courseApi.createCourse({
          title: formData.name,
          description: formData.description,
          levelStatusId: levelIdFromForm(formData.level),
          durationHours: formData.duration,
          maxStudents: undefined,
          price: formData.price,
          instructorIds: formData.instructorIds,
        });

        await loadAdminCourses();
        handleCloseDialog();
        setSuccessDialog({ open: true, message: t('courses.courseCreatedSuccess') });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('messages.savingError'));
    } finally {
      setLoading(false);
    }
  }, [formData, editingCourse, handleCloseDialog, levelIdFromForm, loadAdminCourses, t]);

  const handleDeleteCourse = useCallback(
    async (courseId: string) => {
      if (!window.confirm(t('courses.deleteCourseConfirm'))) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        await courseApi.deleteCourse(courseId);
        await loadAdminCourses();
        setSuccessDialog({ open: true, message: t('courses.courseDeletedSuccess') });
      } catch (err) {
        console.error('Failed to delete course:', err);

        if (err instanceof ApiError) {
          const data = err.data as any;
          const details =
            data && typeof data === 'object'
              ? typeof data.message === 'string'
                ? data.message
                : typeof data.detail === 'string'
                  ? data.detail
                  : typeof data.title === 'string'
                    ? data.title
                    : undefined
              : undefined;

          setError(details ? `${err.message} - ${details}` : err.message);
          return;
        }

        setError(err instanceof Error ? err.message : t('messages.savingError'));
      } finally {
        setLoading(false);
      }
    },
    [loadAdminCourses, t]
  );

  const handleOpenDetails = (course: Course) => {
    setSelectedCourse(course);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedCourse(null);
  };

  const courseApplications = useMemo(
    () => (selectedCourse ? getApplicationsByCourse(selectedCourse.id) : []),
    [selectedCourse, getApplicationsByCourse]
  );

  const pendingCount = courseApplications.filter((a) => a.status === 'pending').length;
  const acceptedCount = courseApplications.filter((a) => a.status === 'accepted').length;
  const rejectedCount = courseApplications.filter((a) => a.status === 'rejected').length;

  const approveApp = useCallback(
    async (id: string) => {
      if (!user) return;
      await updateApplicationStatus(id, 'accepted', user.id);
    },
    [updateApplicationStatus, user]
  );

  const rejectApp = useCallback(
    async (id: string) => {
      if (!user) return;
      await updateApplicationStatus(id, 'rejected', user.id);
    },
    [updateApplicationStatus, user]
  );

  const removeApp = useCallback(
    async (id: string) => {
      if (!window.confirm('Delete this application?')) return;
      await deleteApplication(id);
    },
    [deleteApplication]
  );

  const onEditApp = useCallback(
    (id: string) => {
      const app = courseApplications.find((a) => a.id === id);
      setEditAppDialog({
        open: true,
        appId: id,
        values: {
          fullName: app?.metadata?.fullName || '',
          email: app?.metadata?.email || '',
          phone: app?.metadata?.phone || '',
        },
      });
    },
    [courseApplications]
  );

  const saveEditApp = useCallback(async () => {
    if (!editAppDialog.appId) return;
    await updateApplicationMetadata(editAppDialog.appId, editAppDialog.values);
    setEditAppDialog({ open: false, values: { fullName: '', email: '', phone: '' } });
  }, [editAppDialog, updateApplicationMetadata]);

  const exportCourseCsv = useCallback(() => {
    if (!selectedCourse) return;
    const rows = [
      ['Course', 'Student ID', 'Name', 'Email', 'Phone', 'Applied At', 'Status'],
      ...courseApplications.map((a) => [
        selectedCourse.name,
        a.studentId,
        a.metadata?.fullName ?? '',
        a.metadata?.email ?? '',
        a.metadata?.phone ?? '',
        a.appliedAt.toISOString(),
        a.status,
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedCourse.code || selectedCourse.name}_applications.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [selectedCourse, courseApplications]);

  const exportCourseXlsx = useCallback(() => {
    if (!selectedCourse) return;
    const wb = XLSX.utils.book_new();
    const rows = [
      ['Course', 'Student ID', 'Name', 'Email', 'Phone', 'Applied At', 'Reviewed At', 'Status'],
      ...courseApplications.map((a) => [
        selectedCourse.name,
        a.studentId,
        a.metadata?.fullName ?? '',
        a.metadata?.email ?? '',
        a.metadata?.phone ?? '',
        a.appliedAt.toISOString(),
        a.reviewedAt ? a.reviewedAt.toISOString() : '',
        a.status,
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const safeName = (selectedCourse.name || 'Course').toString().slice(0, 31).replace(/[\\/?*:[\]]/g, ' ');
    XLSX.utils.book_append_sheet(wb, ws, safeName || 'Sheet');
    XLSX.writeFile(wb, `${selectedCourse.code || selectedCourse.id}_applications.xlsx`);
  }, [selectedCourse, courseApplications]);

  const exportMenuOpen = Boolean(exportMenuAnchorEl);
  const canExportCourse = Boolean(selectedCourse) && courseApplications.length > 0;

  const selectedCourseInstructorName = useMemo(() => {
    if (!selectedCourse) return '';
    if (selectedCourse.instructor && selectedCourse.instructor.trim()) return selectedCourse.instructor;
    if (!selectedCourse.instructorId) return '';
    const inst = instructors.find((i) => String(i.id) === String(selectedCourse.instructorId));
    return inst?.fullNameEn ?? '';
  }, [instructors, selectedCourse]);

  const handleOpenExportMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setExportMenuAnchorEl(event.currentTarget);
  }, []);

  const handleCloseExportMenu = useCallback(() => {
    setExportMenuAnchorEl(null);
  }, []);

  const runExport = useCallback(
    async (format: 'xlsx' | 'csv') => {
      if (!selectedCourse || courseApplications.length === 0) return;

      setExportingFormat(format);
      try {
        if (format === 'csv') {
          exportCourseCsv();
          setSuccess('CSV export downloaded.');
        } else {
          exportCourseXlsx();
          setSuccess('Excel export downloaded.');
        }
        setTimeout(() => setSuccess(null), 2500);
      } catch (err) {
        setError('Export failed. Please try again.');
      } finally {
        setExportingFormat(null);
        setExportMenuAnchorEl(null);
      }
    },
    [selectedCourse, courseApplications.length, exportCourseCsv, exportCourseXlsx]
  );

  const activeCourses = adminCourses.filter((c) => c.status === 'active');
  const inactiveCourses = adminCourses.filter((c) => c.status !== 'active');

  const stats = [
    {
      title: t('admin.totalCourses'),
      value: adminCourses.length,
      icon: 'solar:notebook-bold-duotone',
      color: 'primary',
      bgGradient: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.2)} 0%, ${alpha(theme.palette.primary.main, 0.2)} 100%)`,
    },
    {
      title: t('admin.activeCourses'),
      value: activeCourses.length,
      icon: 'solar:check-circle-bold-duotone',
      color: 'success',
      bgGradient: `linear-gradient(135deg, ${alpha(theme.palette.success.light, 0.2)} 0%, ${alpha(theme.palette.success.main, 0.2)} 100%)`,
    },
    {
      title: t('admin.draftCourses'),
      value: inactiveCourses.length,
      icon: 'solar:file-text-bold-duotone',
      color: 'warning',
      bgGradient: `linear-gradient(135deg, ${alpha(theme.palette.warning.light, 0.2)} 0%, ${alpha(theme.palette.warning.main, 0.2)} 100%)`,
    },
    {
      title: t('admin.totalRevenue'),
      value: `$${adminCourses.reduce((acc, c) => acc + (c.price * (c.students || 0)), 0).toLocaleString()}`,
      icon: 'solar:dollar-minimalistic-bold-duotone',
      color: 'info',
      bgGradient: `linear-gradient(135deg, ${alpha(theme.palette.info.light, 0.2)} 0%, ${alpha(theme.palette.info.main, 0.2)} 100%)`,
    },
  ];

  const renderCourseForm = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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
        multiline
        rows={4}
        label={t('courses.courseDescription')}
        value={formData.description}
        onChange={(e) => handleFormChange('description', e.target.value)}
        placeholder={t('courses.courseDescription')}
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
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

        <FormControl fullWidth>
          <InputLabel>{t('courses.instructors')}</InputLabel>
          <Select
            multiple
            value={formData.instructorIds}
            onChange={(e) => handleFormChange('instructorIds', e.target.value as number[])}
            label={t('courses.instructors')}
            renderValue={(selected) => {
              const selectedNames = instructors
                .filter((inst) => (selected as number[]).includes(inst.id))
                .map((inst) => inst.fullNameEn);
              return selectedNames.join(', ');
            }}
          >
            {instructors.map((instructor) => (
              <MenuItem key={instructor.id} value={instructor.id}>
                {instructor.fullNameEn} ({instructor.email})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        <TextField
            fullWidth
            type="number"
            label={t('courses.price')}
            value={formData.price}
            onChange={(e) => handleFormChange('price', parseFloat(e.target.value))}
            placeholder="0"
            InputProps={{
               startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>$</Typography>
            }}
        />

        <TextField
            fullWidth
            type="number"
            label={t('courses.duration')}
            value={formData.duration}
            onChange={(e) => handleFormChange('duration', parseInt(e.target.value, 10))}
        />
      </Box>
    </Box>
  );

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return { bgcolor: 'success.lighter', color: 'success.dark' };
      case 'intermediate': return { bgcolor: 'warning.lighter', color: 'warning.dark' };
      case 'advanced': return { bgcolor: 'error.lighter', color: 'error.dark' };
      default: return { bgcolor: 'primary.lighter', color: 'primary.dark' };
    }
  };

  const renderCoursesTable = (courseList: Course[]) => (
    <TableContainer component={Paper} sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: alpha(theme.palette.grey[500], 0.08) }}>
            <TableCell sx={{ borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }}>{t('courses.courseName')}</TableCell>
            <TableCell>{t('courses.level')}</TableCell>
            <TableCell align="right">{t('courses.price')}</TableCell>
            <TableCell align="right">{t('courses.students')}</TableCell>
            <TableCell align="center" sx={{ borderTopRightRadius: 8, borderBottomRightRadius: 8 }}>{t('common.action')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {courseList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                   <Iconify icon="solar:folder-with-files-bold-duotone" width={48} sx={{ color: 'text.disabled', mb: 1 }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {t('courses.noCourses')}
                    </Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            courseList.map((course) => (
              <TableRow 
                  key={course.id} 
                  hover 
                  onClick={() => handleOpenDetails(course)}
                  sx={{ 
                      transition: 'background-color 0.2s',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) } 
                  }}
              >
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {course.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 0.75,
                      display: 'inline-block',
                      ...getLevelColor(course.level),
                      textTransform: 'capitalize',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {t(`courses.${course.level}`)}
                  </Box>
                </TableCell>
                <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>${course.price}</Typography>
                  </TableCell>
                <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                        <Iconify icon="solar:users-group-rounded-bold" width={16} sx={{ color: 'text.secondary' }} />
                        {course.students}
                    </Box>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); handleOpenDialog(course); }}
                        sx={{ color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.16) } }}
                      >
                        <Iconify icon="solar:pen-bold" width={18} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course.id); }}
                        sx={{ color: 'error.main', bgcolor: alpha(theme.palette.error.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.16) } }}
                      >
                        <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                      </IconButton>
                  </Box>
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
                  {t('courses.courseManagement')}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Create, edit, and manage all your courses in one place.
                </Typography>
             </Box>
             
             <Button
                variant="contained"
                size="large"
                startIcon={<Iconify icon="solar:add-circle-bold" />}
                onClick={() => handleOpenDialog()}
                sx={{ 
                    bgcolor: 'white', 
                    color: 'primary.dark', 
                    fontWeight: 700,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } 
                }}
              >
                {t('courses.addCourse')}
              </Button>
          </Box>
          <Box sx={{ position: 'absolute', top: -50, right: -50, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)' }} />
        </Box>

        {/* Stats Cards */}
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, mb: 5 }}>
          {stats.map((stat, index) => (
            <Card 
                key={index} 
                sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    p: 3,
                    background: stat.bgGradient,
                    transition: 'transform 0.3s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[8] }
                }}
            >
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {stat.title}
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800 }}>
                  {stat.value}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'white',
                  color: `${stat.color}.main`,
                  boxShadow: theme.shadows[2],
                }}
              >
                <Iconify icon={stat.icon} width={32} />
              </Box>
            </Card>
          ))}
        </Box>

        {/* Success Alert */}
        {success && (
          <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {/* Main Content Area */}
        <Card sx={{ boxShadow: theme.shadows[4] }}>
          <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              sx={{ 
                  px: 2, 
                  pt: 2,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  '& .MuiTabs-indicator': { height: 3, borderRadius: 1.5 }
              }}
          >
            <Tab 
                label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {t('admin.activeCourses')}
                        <Chip label={activeCourses.length} size="small" color="success" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                    </Box>
                } 
            />
            <Tab 
                label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        Drafts / Inactive
                        <Chip label={inactiveCourses.length} size="small" color="default" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                    </Box>
                } 
            />
          </Tabs>

          <CardContent sx={{ p: 0 }}>
            {tabValue === 0 && renderCoursesTable(activeCourses)}
            {tabValue === 1 && renderCoursesTable(inactiveCourses)}
          </CardContent>
        </Card>

        {/* Course Form Dialog */}
        <Dialog 
            open={openDialog} 
            onClose={handleCloseDialog} 
            maxWidth="md" 
            fullWidth
            PaperProps={{ sx: { borderRadius: 2 } }}
        >
          <DialogTitle sx={{ fontWeight: 700, pb: 2 }}>
            {editingCourse ? t('courses.editCourse') : t('courses.addCourse')}
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            {renderCourseForm}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseDialog} variant="outlined">{t('common.cancel')}</Button>
            <Button
              variant="contained"
              onClick={handleSaveCourse}
              disabled={loading}
              startIcon={<Iconify icon="solar:disk-bold" />}
            >
              {loading ? t('common.loading') : t('common.save')}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={successDialog.open}
          onClose={() => setSuccessDialog({ open: false, message: '' })}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { borderRadius: 2 } }}
        >
          <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Iconify icon="solar:check-circle-bold-duotone" width={28} />
            {t('common.success')}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              {successDialog.message}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button variant="contained" onClick={() => setSuccessDialog({ open: false, message: '' })}>
              {t('common.ok')}
            </Button>
          </DialogActions>
        </Dialog>
        <Drawer anchor="right" open={detailsOpen} onClose={handleCloseDetails} PaperProps={{ sx: { width: 460 } }}>
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
            {selectedCourse && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>{selectedCourse.name}</Typography>
                  </Box>
                  <Chip label={t(`courses.${selectedCourse.level}`)} size="small" color="primary" variant="outlined" />
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Instructor</Typography>
                    <Typography variant="body2" fontWeight={600}>{selectedCourseInstructorName}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Price</Typography>
                    <Typography variant="body2" fontWeight={700}>${selectedCourse.price}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Duration</Typography>
                    <Typography variant="body2" fontWeight={600}>{selectedCourse.duration}h</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">{t('courses.students')}</Typography>
                    <Typography variant="body2" fontWeight={700}>{selectedCourse.students}</Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">{t('courses.courseDescription')}</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {selectedCourse.description}
                  </Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Chip label={`Pending: ${pendingCount}`} color="warning" variant="outlined" />
                  <Chip label={`Accepted: ${acceptedCount}`} color="success" variant="outlined" />
                  <Chip label={`Rejected: ${rejectedCount}`} color="error" variant="outlined" />
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <ButtonGroup
                    variant="contained"
                    size="small"
                    sx={{
                      bgcolor: 'background.paper',
                      boxShadow: theme.shadows[2],
                      '& .MuiButton-root': {
                        bgcolor: 'background.paper',
                        color: 'text.primary',
                        '&:hover': { bgcolor: alpha(theme.palette.grey[500], 0.08) },
                      },
                      '& .MuiButtonGroup-grouped:not(:last-of-type)': {
                        borderColor: theme.palette.divider,
                      },
                    }}
                  >
                    <Button
                      startIcon={
                        exportingFormat ? (
                          <Iconify icon="solar:refresh-bold" />
                        ) : (
                          <Iconify icon="solar:download-bold-duotone" />
                        )
                      }
                      onClick={() => runExport(exportFormat)}
                      disabled={loading || exportingFormat !== null || !canExportCourse}
                    >
                      {exportFormat === 'xlsx' ? 'Export Excel' : 'Export CSV'}
                    </Button>
                    <Button onClick={handleOpenExportMenu} disabled={loading || exportingFormat !== null || !canExportCourse}>
                      <Iconify icon="eva:arrow-ios-downward-fill" />
                    </Button>
                  </ButtonGroup>

                  <Menu
                    anchorEl={exportMenuAnchorEl}
                    open={exportMenuOpen}
                    onClose={handleCloseExportMenu}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  >
                    <MenuItem
                      onClick={() => {
                        setExportFormat('xlsx');
                        void runExport('xlsx');
                      }}
                      disabled={loading || exportingFormat !== null || !canExportCourse}
                    >
                      <Iconify icon="mdi:file-excel" width={20} style={{ marginRight: 10 }} />
                      Excel
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setExportFormat('csv');
                        void runExport('csv');
                      }}
                      disabled={loading || exportingFormat !== null || !canExportCourse}
                    >
                      <Iconify icon="solar:document-text-bold-duotone" width={20} style={{ marginRight: 10 }} />
                      CSV
                    </MenuItem>
                  </Menu>
                </Box>
                <Divider />
                <Typography variant="subtitle2">Applicants</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, overflow: 'auto' }}>
                  {courseApplications.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No applications yet.</Typography>
                  ) : (
                    courseApplications.map((app) => (
                      <Box key={app.id} sx={{ p: 1.5, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="subtitle2">{app.metadata?.fullName || app.studentId}</Typography>
                            <Typography variant="caption" color="text.secondary">{app.metadata?.email}</Typography>
                          </Box>
                          <Chip label={app.status.toUpperCase()} size="small" color={app.status === 'accepted' ? 'success' : app.status === 'rejected' ? 'error' : 'warning'} />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1, justifyContent: 'flex-end' }}>
                          {app.status === 'pending' && (
                            <>
                              <Button size="small" variant="outlined" color="success" onClick={() => approveApp(app.id)}>Approve</Button>
                              <Button size="small" variant="outlined" color="error" onClick={() => rejectApp(app.id)}>Reject</Button>
                            </>
                          )}
                          <Button size="small" variant="text" onClick={() => onEditApp(app.id)}>Edit</Button>
                          <Button size="small" variant="text" color="error" onClick={() => removeApp(app.id)}>Delete</Button>
                        </Box>
                      </Box>
                    ))
                  )}
                </Box>
              </>
            )}
          </Box>
        </Drawer>
        <Dialog open={editAppDialog.open} onClose={() => setEditAppDialog({ open: false, values: { fullName: '', email: '', phone: '' } })} maxWidth="xs" fullWidth>
          <DialogTitle>Edit Applicant</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField label="Full Name" value={editAppDialog.values.fullName} onChange={(e) => setEditAppDialog((d) => ({ ...d, values: { ...d.values, fullName: e.target.value } }))} fullWidth />
              <TextField label="Email" value={editAppDialog.values.email} onChange={(e) => setEditAppDialog((d) => ({ ...d, values: { ...d.values, email: e.target.value } }))} fullWidth />
              <TextField label="Phone" value={editAppDialog.values.phone} onChange={(e) => setEditAppDialog((d) => ({ ...d, values: { ...d.values, phone: e.target.value } }))} fullWidth />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditAppDialog({ open: false, values: { fullName: '', email: '', phone: '' } })}>Cancel</Button>
            <Button variant="contained" onClick={saveEditApp}>Save</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardContent>
  );
}
