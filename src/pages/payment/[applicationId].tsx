import { useParams } from 'react-router-dom';

import { PaymentView } from 'src/sections/payment/view/payment-view';

// ----------------------------------------------------------------------

export default function PaymentPage() {
  const { applicationId } = useParams();
  
  return <PaymentView applicationId={applicationId || ''} />;
}
