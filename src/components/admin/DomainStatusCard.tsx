import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface DomainStatusCardProps {
  domain: string;
  domainVerified: boolean;
  sslStatus: 'pending' | 'active' | 'failed';
  verificationDate: string | null;
  lastCheck: string | null;
}

export const DomainStatusCard = ({
  domain,
  domainVerified,
  sslStatus,
  verificationDate,
  lastCheck
}: DomainStatusCardProps) => {
  const getDomainStatusBadge = () => {
    if (domainVerified) {
      return <Badge variant="default" className="gap-1"><CheckCircle2 className="h-3 w-3" />Activo ✓</Badge>;
    }
    return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />DNS Pendiente</Badge>;
  };

  const getSSLStatusBadge = () => {
    switch (sslStatus) {
      case 'active':
        return <Badge variant="default" className="gap-1"><CheckCircle2 className="h-3 w-3" />SSL Activo ✓</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />SSL Fallido</Badge>;
      default:
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />SSL Pendiente</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: es 
      });
    } catch {
      return '-';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Globe className="h-5 w-5" />
          {domain}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {getDomainStatusBadge()}
          {getSSLStatusBadge()}
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Verificado:</span>
            <span className="font-medium">{formatDate(verificationDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Última revisión:</span>
            <span className="font-medium">{formatRelativeTime(lastCheck)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
