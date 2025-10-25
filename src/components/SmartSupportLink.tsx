import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ButtonProps } from "@/components/ui/button";

interface SmartSupportLinkProps extends ButtonProps {
  children: React.ReactNode;
}

export function SmartSupportLink({ children, ...props }: SmartSupportLinkProps) {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsChecking(true);

    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Not logged in - redirect to auth page
        navigate('/auth');
        return;
      }

      // User is logged in - get their client ID
      const { data: userClients, error } = await supabase
        .from('user_clients')
        .select('client_id')
        .eq('user_id', session.user.id)
        .limit(1);

      if (error || !userClients || userClients.length === 0) {
        // No client found - redirect to auth or show error
        navigate('/auth');
        return;
      }

      // Redirect to client-specific support page
      navigate(`/client/support/${userClients[0].client_id}`);
    } catch (error) {
      console.error('Error navigating to support:', error);
      navigate('/auth');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Button
      {...props}
      onClick={handleClick}
      disabled={isChecking}
    >
      {isChecking ? 'Cargando...' : children}
    </Button>
  );
}
