import { useOutletContext } from 'react-router-dom';
import { SubscriptionManagement } from '@/components/client/SubscriptionManagement';

interface ClientContext {
  selectedClientId: string;
  selectedClient: any;
}

export default function ClientSubscription() {
  const { selectedClientId } = useOutletContext<ClientContext>();

  return <SubscriptionManagement clientId={selectedClientId} />;
}