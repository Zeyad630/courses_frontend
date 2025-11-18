import { useParams } from 'react-router-dom';

import { usePageTitle } from 'src/hooks';

import { PaymentView } from 'src/sections/payment/view/payment-view';

// ----------------------------------------------------------------------

export default function PaymentPage() {
  const { applicationId } = useParams();
  usePageTitle('Payment');
  
  return <PaymentView applicationId={applicationId || ''} />;
}
