import type { ApplicationStatus } from 'src/types/user';

import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import { alpha, useTheme } from '@mui/material/styles';

import { DashboardContent } from 'src/layouts/dashboard';
import { useAuth } from 'src/contexts/simple-auth-context';
import { useApplicationsContext } from 'src/contexts/applications-context';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// Applications are sourced from ApplicationsContext

const getStatusColor = (status: ApplicationStatus) => {
  switch (status) {
    case 'accepted':
      return 'error';
    case 'rejected':
      return 'default';
    case 'pending':
    default:
      return 'info';
  }
};

const getStatusIcon = (status: ApplicationStatus) => {
  switch (status) {
    case 'accepted':
      return 'solar:check-circle-bold';
    case 'rejected':
      return 'solar:close-circle-bold';
    case 'pending':
    default:
      return 'solar:clock-circle-outline';
  }
};

export function MyApplicationsView() {
  const { user } = useAuth();
  const theme = useTheme();
  const { applications } = useApplicationsContext();
  const myApplications = useMemo(
    () => applications.filter((a) => a.studentId === user?.id),
    [applications, user?.id]
  );

  const handlePayment = (applicationId: string, coursePrice: number) => {
    console.log('Processing payment for application:', applicationId, 'Amount:', coursePrice);
    // Navigate to payment page
    window.location.href = `/payment/${applicationId}`;
  };

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        <Box sx={{ mb: 5 }}>
          <Typography variant="h4">My Course Applications</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Track the status of your course applications and make payments for accepted courses.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {myApplications.map((application) => (
            <Card key={application.id}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {application.metadata?.courseName || application.courseId}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Applied on: {application.appliedAt.toLocaleDateString()}
                    </Typography>
                  </Box>
                  
                  <Chip
                    icon={<Iconify icon={getStatusIcon(application.status)} />}
                    label={application.status.toUpperCase()}
                    color={getStatusColor(application.status)}
                    variant="filled"
                    sx={
                      application.status === 'rejected'
                        ? {
                            bgcolor: alpha(theme.palette.grey[600], 0.12),
                            color: theme.palette.text.secondary,
                            '& .MuiChip-icon': { color: theme.palette.text.secondary },
                          }
                        : application.status === 'accepted'
                          ? {
                              bgcolor: alpha(theme.palette.error.main, 0.12),
                              color: theme.palette.error.main,
                              '& .MuiChip-icon': { color: theme.palette.error.main },
                            }
                          : undefined
                    }
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" color="primary">
                    Course Fee: {application.metadata?.coursePrice ?? ''} EGP
                  </Typography>
                  
                  {application.reviewedAt && (
                    <Typography variant="caption" color="text.secondary">
                      Reviewed on: {application.reviewedAt.toLocaleDateString()}
                    </Typography>
                  )}
                </Box>

                {application.notes && (
                  <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1, mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Admin Notes:</strong> {application.notes}
                    </Typography>
                  </Box>
                )}
              </CardContent>

              {/* <CardActions sx={{ p: 2, pt: 0 }}>
                {application.status === 'accepted' && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Iconify icon="solar:cart-3-bold" />}
                    onClick={() => handlePayment(application.id, application.metadata?.coursePrice || 0)}
                  >
                    Pay {application.metadata?.coursePrice ?? ''} EGP & Access Course
                  </Button>
                )}
                
                {application.status === 'pending' && (
                  <Button
                    variant="outlined"
                    disabled
                    startIcon={<Iconify icon="solar:clock-circle-outline" />}
                  >
                    Waiting for Review
                  </Button>
                )}
                
                {application.status === 'rejected' && (
                  <Button
                    variant="outlined"
                    sx={{
                      borderColor: alpha(theme.palette.grey[600], 0.35),
                      color: theme.palette.text.secondary,
                    }}
                    startIcon={<Iconify icon="solar:close-circle-bold" />}
                    disabled
                  >
                    Application Declined
                  </Button>
                )}
              </CardActions> */}
            </Card>
          ))}
        </Box>

        {myApplications.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No Applications Yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Browse courses and apply to get started with your learning journey.
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 3 }}
              href="/courses"
            >
              Browse Courses
            </Button>
          </Box>
        )}
      </Container>
    </DashboardContent>
  );
}
