import { redirect } from 'next/navigation'
import ComingSoonPopup from '@/components/ComingSoonToast'
export default function MyListRoute() {
  // सीधा home पर भेज दें – navbar से कोई पहुँचेगा ही नहीं
  const showSoon = true;
  return <ComingSoonPopup open={showSoon} />;
  // redirect('/')
}
