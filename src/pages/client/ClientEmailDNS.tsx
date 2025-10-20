import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmailDNSConfigForm } from '@/components/client/EmailDNSConfigForm';

interface ClientContext {
  selectedClientId: string;
  selectedClient: any;
}

export default function ClientEmailDNS() {
  const { selectedClientId } = useOutletContext<ClientContext>();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Configuración de Email DNS</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuración de DNS para Email</CardTitle>
        </CardHeader>
        <CardContent>
          <EmailDNSConfigForm clientId={selectedClientId} />
        </CardContent>
      </Card>
    </div>
  );
}
