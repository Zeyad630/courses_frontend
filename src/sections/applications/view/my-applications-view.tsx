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

const premiumGlass = (theme: any) => ({
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
  boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.05)}`,
  borderRadius: 3,
});

// ----------------------------------------------------------------------

// Applications are sourced from ApplicationsContext

const getStatusColor = (status: ApplicationStatus) => {
  switch (status) {
    case 'payed':
      return 'success';
    case 'accepted':
      return 'success';
    case 'rejected':
      return 'error';
    case 'pending':
    default:
      return 'info';
  }
};

const getStatusIcon = (status: ApplicationStatus) => {
  switch (status) {
    case 'payed':
      return 'solar:shield-check-bold';
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
        {/* Premium Header */}
        <Box
          sx={{
            mb: 5,
            p: 3,
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

           <Box sx={{ position: 'relative', zIndex: 1 }}>
             <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5, color: 'common.white', textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
               My Course Applications
             </Typography>
             <Typography variant="body2" sx={{ color: 'common.white', opacity: 0.8, fontWeight: 500 }}>
               Track the status of your course applications and make payments for accepted courses.
             </Typography>
           </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {myApplications.map((application) => (
            <Card 
              key={application.id}
              sx={{
                ...premiumGlass(theme),
                position: 'relative',
                overflow: 'visible',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[16],
                },
              }}
            >
               {/* Status Indicator Line */}
               <Box
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 6,
                    borderTopLeftRadius: 12,
                    borderBottomLeftRadius: 12,
                    bgcolor: `${getStatusColor(application.status)}.main`,
                    boxShadow: `4px 0 12px ${alpha(theme.palette[getStatusColor(application.status) as 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'].main, 0.5)}`,
                  }}
               />

              <CardContent sx={{ p: { xs: 2.5, md: 4 }, pl: { xs: 3.5, md: 5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                      {application.metadata?.courseName || application.courseId}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'text.secondary', flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                             <Iconify icon="solar:calendar-date-bold" width={16} />
                             <Typography variant="body2" fontWeight={600}>
                                Applied: {application.appliedAt.toLocaleDateString()}
                             </Typography>
                        </Box>
                        {application.reviewedAt && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                 <Iconify icon="solar:user-check-bold" width={16} />
                                 <Typography variant="body2" fontWeight={600}>
                                    Reviewed: {application.reviewedAt.toLocaleDateString()}
                                 </Typography>
                            </Box>
                        )}
                    </Box>
                  </Box>
                  
                  <Chip
                    icon={<Iconify icon={getStatusIcon(application.status)} />}
                    label={application.status.toUpperCase()}
                    color={getStatusColor(application.status)}
                    variant="filled"
                    sx={{ 
                        fontWeight: 800, 
                        borderRadius: 1, 
                        height: 32,
                        px: 1,
                        boxShadow: `0 4px 12px ${alpha(theme.palette[getStatusColor(application.status) as 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'].main, 0.4)}`
                    }}
                  />
                </Box>

                <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.background.default, 0.5), border: `1px dashed ${alpha(theme.palette.divider, 0.5)}`, mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>
                        Course Fee: {application.metadata?.coursePrice ?? ''} EGP
                      </Typography>
                    </Box>
                </Box>

                {application.notes && (
                  <Box sx={{ p: 2.5, bgcolor: alpha(theme.palette.info.main, 0.08), borderRadius: 2, borderLeft: `4px solid ${theme.palette.info.main}` }}>
                    <Typography variant="subtitle2" sx={{ color: 'info.main', mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Iconify icon="solar:info-circle-bold" width={18} /> Admin Notes
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.primary', fontStyle: 'italic' }}>
                      &quot;{application.notes}&quot;
                    </Typography>
                  </Box>
                )}
              </CardContent>

              <CardActions sx={{ p: 3, pt: 0, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                {application.status === 'accepted' && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Iconify icon="solar:upload-bold" />}
                    onClick={() => handlePayment(application.id, application.metadata?.coursePrice || 0)}
                  >
                    Complete Payment
                  </Button>
                )}

                {application.status === 'payed' && application.paymentProofUrl && (
                  <Button
                    variant="outlined"
                    startIcon={<Iconify icon="solar:eye-bold" />}
                    onClick={() => window.open(application.paymentProofUrl, '_blank')}
                  >
                    View Payment Proof
                  </Button>
                )}
              </CardActions>

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
