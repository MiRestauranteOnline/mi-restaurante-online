import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TicketViewer } from "@/components/client/TicketViewer";
import { useOutletContext } from "react-router-dom";

interface ClientContext {
  selectedClientId: string;
  selectedClient: any;
}

export default function ClientSupport() {
  const { selectedClientId } = useOutletContext<ClientContext>();

  return <TicketViewer clientId={selectedClientId} />;
}