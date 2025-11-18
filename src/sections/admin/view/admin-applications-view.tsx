import type { CourseApplication, ApplicationStatus } from 'src/types/user';

import { useState, useCallback } from 'react';

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

// Mock applications data with more details
const mockApplications: (CourseApplication & { 
  studentName: string; 
  studentEmail: string;
  courseName: string; 
  coursePrice: number;
})[] = [
  {
    id: 'app_1',
    studentId: 'student_1',
    studentName: 'John Doe',
    studentEmail: 'john.doe@email.com',
    courseId: '1',
    courseName: 'Introduction to Programming',
    coursePrice: 299,
    status: 'pending',
    appliedAt: new Date('2024-01-20'),
  },
  {
    id: 'app_2',
    studentId: 'student_2',
    studentName: 'Jane Smith',
    studentEmail: 'jane.smith@email.com',
    courseId: '2',
    courseName: 'Web Development Bootcamp',
    coursePrice: 499,
    status: 'pending',
    appliedAt: new Date('2024-01-19'),
  },
  {
    id: 'app_3',
    studentId: 'student_3',
    studentName: 'Mike Johnson',
    studentEmail: 'mike.johnson@email.com',
    courseId: '3',
    courseName: 'Data Science Fundamentals',
    coursePrice: 399,
    status: 'accepted',
    appliedAt: new Date('2024-01-18'),
    reviewedAt: new Date('2024-01-20'),
    reviewedBy: 'admin_1',
    notes: 'Great background in mathematics. Approved for enrollment.',
  },
  {
    id: 'app_4',
    studentId: 'student_4',
    studentName: 'Sarah Wilson',
    studentEmail: 'sarah.wilson@email.com',
    courseId: '4',
    courseName: 'Mobile App Development',
    coursePrice: 349,
    status: 'rejected',
    appliedAt: new Date('2024-01-17'),
    reviewedAt: new Date('2024-01-19'),
    reviewedBy: 'admin_1',
    notes: 'Insufficient programming experience. Please complete basic programming course first.',
  },
];

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
  const [applications, setApplications] = useState(mockApplications);
  const [selectedApplication, setSelectedApplication] = useState<typeof mockApplications[0] | null>(null);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  const handleReviewApplication = useCallback((application: typeof mockApplications[0]) => {
    setSelectedApplication(application);
    setReviewNotes(application.notes || '');
    setReviewDialog(true);
  }, []);

  const handleApproveApplication = useCallback(() => {
    if (!selectedApplication) return;

    setApplications(prev => prev.map(app => 
      app.id === selectedApplication.id 
        ? {
            ...app,
            status: 'accepted' as ApplicationStatus,
            reviewedAt: new Date(),
            reviewedBy: user?.id || 'admin',
            notes: reviewNotes,
          }
        : app
    ));

    setReviewDialog(false);
    setSelectedApplication(null);
    setReviewNotes('');
  }, [selectedApplication, reviewNotes, user?.id]);

  const handleRejectApplication = useCallback(() => {
    if (!selectedApplication) return;

    setApplications(prev => prev.map(app => 
      app.id === selectedApplication.id 
        ? {
            ...app,
            status: 'rejected' as ApplicationStatus,
            reviewedAt: new Date(),
            reviewedBy: user?.id || 'admin',
            notes: reviewNotes,
          }
        : app
    ));

    setReviewDialog(false);
    setSelectedApplication(null);
    setReviewNotes('');
  }, [selectedApplication, reviewNotes, user?.id]);

  const pendingApplications = applications.filter(app => app.status === 'pending');
  const reviewedApplications = applications.filter(app => app.status !== 'pending');

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        <Box sx={{ mb: 5 }}>
          <Typography variant="h4">Application Management</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Review and manage student course applications.
          </Typography>
        </Box>

        {/* Pending Applications */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h5" sx={{ mb: 3 }}>
            Pending Applications ({pendingApplications.length})
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {pendingApplications.map((application) => (
              <Card key={application.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">{application.studentName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {application.studentEmail}
                      </Typography>
                    </Box>
                    <Chip
                      label={application.status.toUpperCase()}
                      color={getStatusColor(application.status)}
                      variant="filled"
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" color="primary">
                      Course: {application.courseName}
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      Fee: ${application.coursePrice}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary">
                    Applied on: {application.appliedAt.toLocaleDateString()}
                  </Typography>
                </CardContent>

                <CardActions>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Iconify icon="solar:eye-bold" />}
                    onClick={() => handleReviewApplication(application)}
                  >
                    Review Application
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>

          {pendingApplications.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No Pending Applications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All applications have been reviewed.
              </Typography>
            </Box>
          )}
        </Box>

        {/* Reviewed Applications */}
        <Box>
          <Typography variant="h5" sx={{ mb: 3 }}>
            Reviewed Applications ({reviewedApplications.length})
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {reviewedApplications.map((application) => (
              <Card key={application.id} sx={{ opacity: 0.8 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">{application.studentName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {application.studentEmail}
                      </Typography>
                    </Box>
                    <Chip
                      label={application.status.toUpperCase()}
                      color={getStatusColor(application.status)}
                      variant="filled"
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" color="primary">
                      Course: {application.courseName}
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      Fee: ${application.coursePrice}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Applied: {application.appliedAt.toLocaleDateString()}
                    </Typography>
                    {application.reviewedAt && (
                      <Typography variant="body2" color="text.secondary">
                        Reviewed: {application.reviewedAt.toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>

                  {application.notes && (
                    <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
                      <Typography variant="body2">
                        <strong>Review Notes:</strong> {application.notes}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        {/* Review Dialog */}
        <Dialog open={reviewDialog} onClose={() => setReviewDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Review Application: {selectedApplication?.studentName}
          </DialogTitle>
          
          <DialogContent>
            {selectedApplication && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Course: {selectedApplication.courseName}
                </Typography>
                <Typography variant="h6" color="primary" gutterBottom>
                  Student: {selectedApplication.studentName}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Email: {selectedApplication.studentEmail}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Applied: {selectedApplication.appliedAt.toLocaleDateString()}
                </Typography>
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
              sx={{ mt: 2 }}
            />
          </DialogContent>

          <DialogActions>
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
            >
              Approve
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardContent>
  );
}
