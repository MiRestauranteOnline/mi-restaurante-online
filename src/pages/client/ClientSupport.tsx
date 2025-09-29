import { useOutletContext } from 'react-router-dom';
import { SupportManagement } from '@/components/client/SupportManagement';

interface ClientContext {
  selectedClientId: string;
  selectedClient: any;
}

export default function ClientSupport() {
  const { selectedClientId, selectedClient } = useOutletContext<ClientContext>();

  return <SupportManagement clientId={selectedClientId} client={selectedClient} />;
}