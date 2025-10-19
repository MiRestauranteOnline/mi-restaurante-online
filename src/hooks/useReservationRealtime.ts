import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useReservationRealtime = (clientId: string, onUpdate: () => void) => {
  useEffect(() => {
    if (!clientId) return;

    console.log('Setting up real-time subscription for client:', clientId);
    
    const channel = supabase
      .channel(`reservations-${clientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations',
          filter: `client_id=eq.${clientId}`
        },
        (payload) => {
          console.log('Reservation changed:', payload);
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [clientId, onUpdate]);
};
