import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DomainData {
  custom_domain: string | null;
  domain_verified: boolean;
  ssl_status: 'pending' | 'active' | 'failed';
  domain_verification_date: string | null;
  ssl_issued_date: string | null;
  last_domain_check: string | null;
  dns_records_status: any;
}

export const useClientDomain = (clientId: string) => {
  const [domainData, setDomainData] = useState<DomainData>({
    custom_domain: null,
    domain_verified: false,
    ssl_status: 'pending',
    domain_verification_date: null,
    ssl_issued_date: null,
    last_domain_check: null,
    dns_records_status: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchDomainData = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('custom_domain, domain_verified, ssl_status, domain_verification_date, ssl_issued_date, last_domain_check, dns_records_status')
        .eq('id', clientId)
        .single();

      if (error) throw error;

      if (data) {
        setDomainData(data as any);
      }
    } catch (error: any) {
      console.error('Error fetching domain data:', error);
    }
  };

  const addDomain = async (domain: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-custom-domain', {
        body: {
          client_id: clientId,
          custom_domain: domain,
          action: 'add'
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to add domain');
      }

      toast({
        title: "Dominio agregado",
        description: "El dominio se ha agregado exitosamente. Configura los registros DNS.",
      });

      await fetchDomainData();
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo agregar el dominio",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyDomain = async (silent = false) => {
    if (!domainData.custom_domain) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-custom-domain', {
        body: {
          client_id: clientId,
          custom_domain: domainData.custom_domain,
          action: 'verify'
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Verification failed');
      }

      await fetchDomainData();

      if (!silent) {
        if (data.verified) {
          toast({
            title: "¡Dominio verificado!",
            description: data.message || "El dominio está activo y el SSL está configurado.",
          });
        } else {
          toast({
            title: "Verificación pendiente",
            description: data.message || "Los registros DNS aún no se han propagado. Intenta nuevamente en unas horas.",
            variant: "default"
          });
        }
      }

      return data;
    } catch (error: any) {
      if (!silent) {
        toast({
          title: "Error",
          description: error.message || "No se pudo verificar el dominio",
          variant: "destructive"
        });
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeDomain = async () => {
    if (!domainData.custom_domain) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-custom-domain', {
        body: {
          client_id: clientId,
          custom_domain: domainData.custom_domain,
          action: 'remove'
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to remove domain');
      }

      toast({
        title: "Dominio eliminado",
        description: "El dominio personalizado ha sido eliminado exitosamente.",
      });

      setDomainData({
        custom_domain: null,
        domain_verified: false,
        ssl_status: 'pending',
        domain_verification_date: null,
        ssl_issued_date: null,
        last_domain_check: null,
        dns_records_status: null
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el dominio",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    domainData,
    isLoading,
    fetchDomainData,
    addDomain,
    verifyDomain,
    removeDomain
  };
};
