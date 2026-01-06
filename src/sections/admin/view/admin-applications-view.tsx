import type { ApexOptions } from 'apexcharts';
import type { ApplicationStatus } from 'src/types/user';

import * as XLSX from 'xlsx';
import Chart from 'react-apexcharts';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import DialogTitle from '@mui/material/DialogTitle';
import { alpha, useTheme } from '@mui/material/styles';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { DashboardContent } from 'src/layouts/dashboard';
import { useAuth } from 'src/contexts/simple-auth-context';
import { useApplicationsContext } from 'src/contexts/applications-context';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// Applications are sourced from ApplicationsContext

const getStatusColor = (status: ApplicationStatus) => {
  switch (status) {
    case 'accepted':
      return 'success';
    case 'rejected':
      return 'error';
    case 'pending':
    default:
      return 'warning';
  }
};

export function AdminApplicationsView() {
  const { user } = useAuth();
  const theme = useTheme();
  const { applications, updateApplicationStatus } = useApplicationsContext();
  const [selectedApplication, setSelectedApplication] = useState<(typeof applications)[number] | null>(null);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  const handleReviewApplication = useCallback((application: (typeof applications)[number]) => {
    setSelectedApplication(application);
    setReviewNotes(application.notes || '');
    setReviewDialog(true);
  }, []);

  const handleApproveApplication = useCallback(async () => {
    if (!selectedApplication || !user) return;
    await updateApplicationStatus(selectedApplication.id, 'accepted', user.id, reviewNotes);
    setReviewDialog(false);
    setSelectedApplication(null);
    setReviewNotes('');
  }, [selectedApplication, reviewNotes, updateApplicationStatus, user]);

  const handleRejectApplication = useCallback(async () => {
    if (!selectedApplication || !user) return;
    await updateApplicationStatus(selectedApplication.id, 'rejected', user.id, reviewNotes);
    setReviewDialog(false);
    setSelectedApplication(null);
    setReviewNotes('');
  }, [selectedApplication, reviewNotes, updateApplicationStatus, user]);

  const pendingApplications = applications.filter(app => app.status === 'pending');
  const reviewedApplications = applications.filter(app => app.status !== 'pending');
  const acceptedApplications = applications.filter(app => app.status === 'accepted');
  const rejectedApplications = applications.filter(app => app.status === 'rejected');

  const exportAcceptedStudentsCsv = useCallback(() => {
    // Group accepted applications by course
    const rows = [
      ['Course ID', 'Course Name', 'Student ID', 'Student Name', 'Student Email', 'Applied At', 'Status'],
      ...acceptedApplications.map((a) => [
        a.courseId,
        a.metadata?.courseName ?? '',
        a.studentId,
        a.metadata?.fullName ?? '',
        a.metadata?.email ?? '',
        a.appliedAt.toISOString(),
        a.status,
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'accepted_students_by_course.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [acceptedApplications]);

  const exportApplicationsXlsx = useCallback(() => {
    // Group all applications by course (use course name when available)
    const byCourse = new Map<string, (typeof applications)[number][]>();
    applications.forEach((a) => {
      const key = a.metadata?.courseName || a.courseId;
      const arr = byCourse.get(key) || [];
      arr.push(a);
      byCourse.set(key, arr);
    });

    const wb = XLSX.utils.book_new();

    byCourse.forEach((apps, courseName) => {
      const rows = [
        [
          'Course ID',
          'Course Name',
          'Student ID',
          'Student Name',
          'Email',
          'Phone',
          'Experience',
          'Motivation',
          'Applied At',
          'Reviewed At',
          'Status',
          'Admin Notes',
        ],
        ...apps.map((a) => [
          a.courseId,
          a.metadata?.courseName ?? '',
          a.studentId,
          a.metadata?.fullName ?? '',
          a.metadata?.email ?? '',
          a.metadata?.phone ?? '',
          a.metadata?.experience ?? '',
          a.metadata?.motivation ?? '',
          a.appliedAt.toISOString(),
          a.reviewedAt ? a.reviewedAt.toISOString() : '',
          a.status,
          a.notes ?? '',
        ]),
      ];

      const ws = XLSX.utils.aoa_to_sheet(rows);
      // Excel sheet name max length is 31; sanitize forbidden characters
      const safeName = (courseName || 'Course').toString().slice(0, 31).replace(/[\\/?*:[\]]/g, ' ');
      XLSX.utils.book_append_sheet(wb, ws, safeName || 'Sheet');
    });

    XLSX.writeFile(wb, 'applications_by_course.xlsx');
  }, [applications]);

  const chartOptions: ApexOptions = {
    chart: {
      fontFamily: theme.typography.fontFamily,
      background: 'transparent',
    },
    colors: [
      theme.palette.warning.main,
      theme.palette.success.main,
      theme.palette.error.main,
    ],
    labels: ['Pending', 'Accepted', 'Rejected'],
    stroke: { colors: [theme.palette.background.paper], width: 2 },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
    },
    dataLabels: { enabled: true, dropShadow: { enabled: false } },
    tooltip: {
      theme: theme.palette.mode,
      fillSeriesColor: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              color: theme.palette.text.primary,
              fontSize: theme.typography.h6.fontSize as string,
              fontWeight: 800,
            },
            value: {
              fontSize: '1.5rem',
              fontWeight: 800,
              color: theme.palette.text.primary
            }
          }
        }
      }
    }
  };

  const chartSeries = [
    pendingApplications.length,
    acceptedApplications.length,
    rejectedApplications.length,
  ];

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
                  Application Management
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Review and manage student course applications efficiently.
                </Typography>
             </Box>
             
             <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Iconify icon="solar:download-bold-duotone" />}
                  onClick={exportAcceptedStudentsCsv}
                  disabled={acceptedApplications.length === 0}
                  sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
                >
                  Export Accepted (CSV)
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Iconify icon="mdi:file-excel" />}
                  onClick={exportApplicationsXlsx}
                  disabled={applications.length === 0}
                  sx={{ bgcolor: 'white', color: 'primary.dark', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
                >
                  Export Excel
                </Button>
             </Box>
          </Box>
          <Box sx={{ position: 'absolute', top: -50, right: -50, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)' }} />
        </Box>

        {/* Summary Section */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%', boxShadow: theme.shadows[3] }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Application Status</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Chart
                    options={chartOptions}
                    series={chartSeries}
                    type="donut"
                    height={280}
                    width="100%"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Grid container spacing={3}>
                {[
                  { title: 'Pending Review', value: pendingApplications.length, icon: 'solar:clock-circle-bold-duotone', color: 'warning', bg: alpha(theme.palette.warning.lighter, 0.4) },
                  { title: 'Total Processed', value: reviewedApplications.length, icon: 'solar:check-circle-bold-duotone', color: 'success', bg: alpha(theme.palette.success.lighter, 0.4) },
                  { title: 'Acceptance Rate', value: reviewedApplications.length > 0 ? `${Math.round((acceptedApplications.length / reviewedApplications.length) * 100)}%` : '0%', icon: 'solar:graph-up-bold-duotone', color: 'info', bg: alpha(theme.palette.info.lighter, 0.4) },
                  { title: 'Avg. Review Time', value: '1.2d', icon: 'solar:hourglass-bold-duotone', color: 'primary', bg: alpha(theme.palette.primary.lighter, 0.4) }
                ].map((stat, index) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={index}>
                    <Card sx={{ 
                        p: 3, 
                        height: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${stat.bg} 100%)`,
                        boxShadow: theme.shadows[2],
                        transition: 'transform 0.3s',
                        '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[8] }
                    }}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>{stat.title}</Typography>
                        <Typography variant="h3" sx={{ fontWeight: 800, mt: 1 }}>{stat.value}</Typography>
                      </Box>
                      <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: 'white', display: 'flex' }}>
                         <Iconify icon={stat.icon} width={32} sx={{ color: `${stat.color}.main` }} />
                      </Box>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          </Grid>
        </Grid>

        {/* Pending Applications */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
            Pending Applications ({pendingApplications.length})
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {pendingApplications.map((application) => (
              <Card key={application.id} sx={{ '&:hover': { boxShadow: theme.shadows[4] }, transition: 'all 0.3s' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: 'primary.lighter', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.dark', fontWeight: 700 }}>
                         {application.metadata?.fullName?.charAt(0) || application.studentId.charAt(0)}
                      </Box>
                      <Box>
                        <Typography variant="h6">{application.metadata?.fullName || application.studentId}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {application.metadata?.email || ''}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={application.status.toUpperCase()}
                      color={getStatusColor(application.status)}
                      variant="outlined"
                      sx={{ borderRadius: 1, fontWeight: 700 }}
                    />
                  </Box>

                  <Grid container spacing={2} sx={{ mb: 2, pl: 8 }}>
                     <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="subtitle2" color="text.secondary">Course</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{application.metadata?.courseName || application.courseId}</Typography>
                     </Grid>
                     <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="subtitle2" color="text.secondary">Applied</Typography>
                        <Typography variant="body1">{application.appliedAt.toLocaleDateString()}</Typography>
                     </Grid>
                  </Grid>
                </CardContent>

                <CardActions sx={{ borderTop: `1px dashed ${theme.palette.divider}`, justifyContent: 'flex-end', p: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Iconify icon="solar:eye-bold-duotone" />}
                    onClick={() => handleReviewApplication(application)}
                    sx={{ borderRadius: 30 }}
                  >
                    Review Application
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>

          {pendingApplications.length === 0 && (
            <Card sx={{ textAlign: 'center', py: 8, bgcolor: 'transparent', boxShadow: 'none' }}>
              <Iconify icon="solar:clipboard-check-bold-duotone" width={64} sx={{ color: 'text.secondary', mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" color="text.secondary">
                No Pending Applications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Great job! All applications have been reviewed.
              </Typography>
            </Card>
          )}
        </Box>

        {/* Reviewed Applications */}
        <Box>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
            Reviewed Applications ({reviewedApplications.length})
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {reviewedApplications.map((application) => (
              <Card key={application.id} sx={{ opacity: 0.9, '&:hover': { opacity: 1, boxShadow: theme.shadows[4] }, transition: 'all 0.3s' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                     <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary', fontWeight: 700 }}>
                         {application.metadata?.fullName?.charAt(0) || application.studentId.charAt(0)}
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontSize: '1rem' }}>{application.metadata?.fullName || application.studentId}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {application.metadata?.courseName}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={application.status.toUpperCase()}
                      color={getStatusColor(application.status)}
                      variant="outlined"
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>

                  {application.notes && (
                    <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1, mt: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.5, display: 'block' }}>REVIEW NOTES</Typography>
                      <Typography variant="body2">
                         {application.notes}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        {/* Review Dialog */}
        <Dialog open={reviewDialog} onClose={() => setReviewDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
          <DialogTitle sx={{ fontWeight: 700 }}>
            Review Application
          </DialogTitle>
          
          <DialogContent>
            {selectedApplication && (
              <Box sx={{ mb: 3, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.04), borderRadius: 1, border: `1px dashed ${theme.palette.primary.main}` }}>
                <Typography variant="h6" color="primary" gutterBottom>
                   {selectedApplication.metadata?.fullName || selectedApplication.studentId}
                </Typography>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" color="text.secondary">Course</Typography>
                        <Typography variant="body2" fontWeight={600}>{selectedApplication.metadata?.courseName}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" color="text.secondary">Email</Typography>
                        <Typography variant="body2" fontWeight={600}>{selectedApplication.metadata?.email}</Typography>
                    </Grid>
                     <Grid size={{ xs: 12 }}>
                        <Typography variant="caption" color="text.secondary">Experience</Typography>
                        <Typography variant="body2">{selectedApplication.metadata?.experience || 'N/A'}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="caption" color="text.secondary">Motivation</Typography>
                        <Typography variant="body2">{selectedApplication.metadata?.motivation || 'N/A'}</Typography>
                    </Grid>
                </Grid>
              </Box>
            )}

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Review Notes"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Add notes about your decision..."
              sx={{ mt: 1 }}
            />
          </DialogContent>

          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setReviewDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleRejectApplication}
            >
              Reject
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleApproveApplication}
              startIcon={<Iconify icon="solar:check-circle-bold" />}
            >
              Approve
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardContent>
  );
}
