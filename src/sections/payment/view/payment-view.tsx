import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';

import { DashboardContent } from 'src/layouts/dashboard';
import { useAuth } from 'src/contexts/simple-auth-context';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type PaymentViewProps = {
  applicationId: string;
};

// Mock payment data
const mockPaymentData = {
  applicationId: 'app_1',
  courseName: 'Introduction to Programming',
  courseDescription: 'Learn the fundamentals of programming with Python',
  instructor: 'Dr. Smith',
  amount: 299,
  studentName: 'John Doe',
  studentEmail: 'john.doe@email.com',
};

export function PaymentView({ applicationId }: PaymentViewProps) {
  const { user } = useAuth();
  const [paymentData] = useState(mockPaymentData);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [processing, setProcessing] = useState(false);

  const handlePayment = useCallback(async () => {
    setProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Payment processed successfully for application:', applicationId);
      console.log('Payment details:', {
        amount: paymentData.amount,
        method: paymentMethod,
        cardNumber: cardNumber.slice(-4),
      });
      
      // TODO: Redirect to course room or success page
      alert('Payment successful! You now have access to the course.');
      
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  }, [applicationId, paymentData.amount, paymentMethod, cardNumber]);

  return (
    <DashboardContent>
      <Container maxWidth="md">
        <Box sx={{ mb: 5 }}>
          <Typography variant="h4">Course Payment</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Complete your payment to access the course materials and start learning.
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {/* Course Summary */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Course Summary
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  {paymentData.courseName}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {paymentData.courseDescription}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Instructor: {paymentData.instructor}
                </Typography>
              </Box>

              <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1">Course Fee</Typography>
                  <Typography variant="h5" color="primary">
                    ${paymentData.amount}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Student: {paymentData.studentName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Email: {paymentData.studentEmail}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment Information
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  fullWidth
                  label="Cardholder Name"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="John Doe"
                />

                <TextField
                  fullWidth
                  label="Card Number"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  inputProps={{ maxLength: 19 }}
                />

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <TextField
                    label="Expiry Date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    placeholder="MM/YY"
                    inputProps={{ maxLength: 5 }}
                  />
                  <TextField
                    label="CVV"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="123"
                    inputProps={{ maxLength: 4 }}
                  />
                </Box>

                <Box sx={{ p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Iconify icon="solar:shield-keyhole-bold-duotone" color="info.main" />
                    <Typography variant="subtitle2" color="info.main">
                      Secure Payment
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="info.dark">
                    Your payment information is encrypted and secure. We use industry-standard SSL encryption.
                  </Typography>
                </Box>
              </Box>
            </CardContent>

            <CardActions sx={{ p: 3, pt: 0 }}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handlePayment}
                disabled={processing || !cardNumber || !expiryDate || !cvv || !cardName}
                startIcon={processing ? <Iconify icon="solar:clock-circle-outline" /> : <Iconify icon="solar:cart-3-bold" />}
              >
                {processing ? 'Processing Payment...' : `Pay $${paymentData.amount}`}
              </Button>
            </CardActions>
          </Card>
        </Box>

        {/* Payment Methods Info */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Accepted Payment Methods
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon="solar:cart-3-bold" color="primary.main" />
                <Typography variant="body2">Credit Cards</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon="solar:cart-3-bold" color="primary.main" />
                <Typography variant="body2">Debit Cards</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon="solar:shield-keyhole-bold-duotone" color="success.main" />
                <Typography variant="body2">Secure & Encrypted</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </DashboardContent>
  );
}
