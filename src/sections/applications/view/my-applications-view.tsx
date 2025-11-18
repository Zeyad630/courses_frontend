import type { CourseApplication, ApplicationStatus } from 'src/types/user';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';

import { DashboardContent } from 'src/layouts/dashboard';
import { useAuth } from 'src/contexts/simple-auth-context';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// Mock applications data
const mockApplications: (CourseApplication & { courseName: string; coursePrice: number })[] = [
  {
    id: 'app_1',
    studentId: 'student_1',
    courseId: '1',
    courseName: 'Introduction to Programming',
    coursePrice: 299,
    status: 'accepted',
    appliedAt: new Date('2024-01-15'),
    reviewedAt: new Date('2024-01-18'),
    reviewedBy: 'admin_1',
    notes: 'Great application! Welcome to the course.',
  },
  {
    id: 'app_2',
    studentId: 'student_1',
    courseId: '2',
    courseName: 'Web Development Bootcamp',
    coursePrice: 499,
    status: 'pending',
    appliedAt: new Date('2024-01-20'),
  },
  {
    id: 'app_3',
    studentId: 'student_1',
    courseId: '3',
    courseName: 'Data Science Fundamentals',
    coursePrice: 399,
    status: 'rejected',
    appliedAt: new Date('2024-01-10'),
    reviewedAt: new Date('2024-01-12'),
    reviewedBy: 'admin_1',
    notes: 'Prerequisites not met. Please complete basic programming course first.',
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

const getStatusIcon = (status: ApplicationStatus) => {
  switch (status) {
    case 'accepted':
      return 'solar:check-circle-bold';
    case 'rejected':
      return 'solar:pen-bold';
    case 'pending':
    default:
      return 'solar:clock-circle-outline';
  }
};

export function MyApplicationsView() {
  const { user } = useAuth();
  const [applications] = useState(mockApplications);

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
          {applications.map((application) => (
            <Card key={application.id}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {application.courseName}
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
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" color="primary">
                    Course Fee: ${application.coursePrice}
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

              <CardActions sx={{ p: 2, pt: 0 }}>
                {application.status === 'accepted' && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Iconify icon="solar:cart-3-bold" />}
                    onClick={() => handlePayment(application.id, application.coursePrice)}
                  >
                    Pay ${application.coursePrice} & Access Course
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
                    color="error"
                    startIcon={<Iconify icon="solar:pen-bold" />}
                    disabled
                  >
                    Application Rejected
                  </Button>
                )}
              </CardActions>
            </Card>
          ))}
        </Box>

        {applications.length === 0 && (
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
