import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Clock, User, Mail, Calendar, Plus, MessageCircle, Copy, Shield } from "lucide-react";
import { format } from "date-fns";
import { businessData } from "@/config/businessData";

interface SupportTicket {
  id: string;
  ticket_number: string;
  subject: string;
  message: string;
  customer_name: string;
  customer_email: string;
  support_type: string;
  status: string;
  priority: string;
  response_count: number;
  created_at: string;
  updated_at: string;
  last_response_at: string | null;
}

interface TicketResponse {
  id: string;
  message: string;
  is_internal_note: boolean;
  created_by_name: string;
  created_by_email: string;
  created_at: string;
}

const statusColors = {
  new: "bg-blue-500",
  "in-progress": "bg-yellow-500",
  resolved: "bg-green-500", 
  closed: "bg-gray-500"
};

const statusLabels = {
  new: "Nuevo",
  "in-progress": "En Progreso",
  resolved: "Resuelto",
  closed: "Cerrado"
};

const priorityColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800"
};

const priorityLabels = {
  low: "Baja",
  medium: "Media",
  high: "Alta"
};

interface TicketViewerProps {
  clientId: string;
}

export function TicketViewer({ clientId }: TicketViewerProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [responses, setResponses] = useState<TicketResponse[]>([]);
  const [newResponse, setNewResponse] = useState("");
  const [loading, setLoading] = useState(true);
  const [addingResponse, setAddingResponse] = useState(false);
  const [clientData, setClientData] = useState<any>(null);
  const [premiumFeatures, setPremiumFeatures] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTickets();
    fetchClientData();
  }, [clientId]);

  const fetchClientData = async () => {
    try {
      const { data: client, error: clientError } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .single();

      if (clientError) throw clientError;
      setClientData(client);

      const { data: premium, error: premiumError } = await supabase
        .from("premium_features")
        .select("unique_support_pin")
        .eq("client_id", clientId)
        .maybeSingle();

      if (!premiumError) {
        setPremiumFeatures(premium);
      }
    } catch (error: any) {
      console.error("Error fetching client data:", error);
    }
  };

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Error al cargar los tickets",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketResponses = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from("ticket_responses")
        .select("*")
        .eq("ticket_id", ticketId)
        .eq("is_internal_note", false) // Only show public responses to clients
        .order("created_at", { ascending: true });

      if (error) throw error;
      setResponses(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Error al cargar las respuestas", 
        variant: "destructive"
      });
    }
  };

  const addResponse = async () => {
    if (!selectedTicket || !newResponse.trim()) return;

    setAddingResponse(true);
    try {
      const { error } = await supabase
        .from("ticket_responses")
        .insert({
          ticket_id: selectedTicket.id,
          message: newResponse,
          is_internal_note: false,
          created_by_name: selectedTicket.customer_name,
          created_by_email: selectedTicket.customer_email
        });

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Respuesta agregada exitosamente"
      });

      setNewResponse("");
      fetchTicketResponses(selectedTicket.id);
      fetchTickets();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Error al agregar respuesta",
        variant: "destructive"
      });
    } finally {
      setAddingResponse(false);
    }
  };

  const selectTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    fetchTicketResponses(ticket.id);
  };

  const copyPinToClipboard = () => {
    if (premiumFeatures?.unique_support_pin) {
      navigator.clipboard.writeText(premiumFeatures.unique_support_pin);
      toast({
        title: "PIN copiado",
        description: "El PIN único ha sido copiado al portapapeles"
      });
    }
  };

  const handleWhatsAppSupport = () => {
    let message = `Hola, soy cliente de ${clientData?.restaurant_name || 'Mi Restaurante Online'}.`;
    message += `\n\nMi email es: ${clientData?.email || ''}`;
    
    if (clientData?.plan_type === 'advanced' && premiumFeatures?.unique_support_pin) {
      message += `\nMi PIN único de soporte es: ${premiumFeatures.unique_support_pin}`;
      message += `\n\nTengo el plan Avanzado y necesito ayuda.`;
    } else {
      message += `\n\nNecesito ayuda con mi sitio web.`;
    }

    const whatsappUrl = `${businessData.contact.whatsapp.url}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando tickets...</div>;
  }

  return (
    <div className="container mx-auto max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Tus Tickets de Soporte</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          {clientData?.plan_type === 'advanced' && (
            <Button 
              onClick={handleWhatsAppSupport}
              variant="outline"
              className="flex-1 sm:flex-initial"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Soporte WhatsApp
            </Button>
          )}
          <Button onClick={() => window.location.href = "/soporte"} className="flex-1 sm:flex-initial">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Ticket
          </Button>
        </div>
      </div>

      {/* Premium Support PIN Card */}
      {clientData?.plan_type === 'advanced' && premiumFeatures?.unique_support_pin && (
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">Tu PIN Único de Soporte Premium</p>
                  <p className="text-lg font-bold text-blue-600 tracking-wider">
                    {premiumFeatures.unique_support_pin}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyPinToClipboard}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Copiar PIN
              </Button>
            </div>
            <p className="text-xs text-blue-700 mt-2">
              Usa este PIN cuando contactes soporte por otros canales para recibir atención prioritaria.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Tus Tickets ({tickets.length})</h2>
          {tickets.map((ticket) => (
            <Card
              key={ticket.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedTicket?.id === ticket.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => selectTicket(ticket)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {ticket.ticket_number}
                    </Badge>
                    <Badge className={statusColors[ticket.status as keyof typeof statusColors]}>
                      {statusLabels[ticket.status as keyof typeof statusLabels]}
                    </Badge>
                    <Badge variant="outline" className={priorityColors[ticket.priority as keyof typeof priorityColors]}>
                      {priorityLabels[ticket.priority as keyof typeof priorityLabels]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageSquare className="h-3 w-3" />
                    {ticket.response_count}
                  </div>
                </div>
                
                <h3 className="font-medium text-sm mb-1 line-clamp-1">{ticket.subject}</h3>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{ticket.message}</p>
                
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Creado {format(new Date(ticket.created_at), "MMM d, yyyy")}
                  </div>
                  {ticket.last_response_at && (
                    <div className="flex items-center gap-1">
                      Última respuesta {format(new Date(ticket.last_response_at), "MMM d")}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {tickets.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="mb-2">Aún no tienes tickets de soporte</p>
                <Button onClick={() => window.location.href = "/soporte"}>
                  Crear tu primer ticket
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Ticket Details */}
        <div>
          {selectedTicket ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{selectedTicket.ticket_number}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{selectedTicket.subject}</p>
                  </div>
                  <Badge className={statusColors[selectedTicket.status as keyof typeof statusColors]}>
                    {statusLabels[selectedTicket.status as keyof typeof statusLabels]}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Ticket Info */}
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{selectedTicket.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {selectedTicket.customer_email}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Creado {format(new Date(selectedTicket.created_at), "PPpp")}
                  </div>
                </div>

                {/* Original Message */}
                <div>
                  <h4 className="font-medium mb-2">Tu Mensaje</h4>
                  <p className="text-sm bg-muted p-3 rounded-lg">{selectedTicket.message}</p>
                </div>

                {/* Responses */}
                {responses.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Conversación ({responses.length})</h4>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {responses.map((response) => (
                        <div
                          key={response.id}
                          className={`p-3 rounded-lg ${
                            response.created_by_name === selectedTicket.customer_name
                              ? "bg-blue-50 border border-blue-200 ml-4"
                              : "bg-green-50 border border-green-200 mr-4"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-sm font-medium">
                              {response.created_by_name === selectedTicket.customer_name 
                                ? "Tú" 
                                : "Equipo de Soporte"
                              }
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(response.created_at), "MMM d, HH:mm")}
                            </span>
                          </div>
                          <p className="text-sm">{response.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Response */}
                {selectedTicket.status !== "closed" && (
                  <div>
                    <h4 className="font-medium mb-2">Agregar Respuesta</h4>
                    <Textarea
                      placeholder="Escribe tu respuesta..."
                      value={newResponse}
                      onChange={(e) => setNewResponse(e.target.value)}
                      className="mb-2"
                    />
                    <div className="flex justify-end">
                      <Button 
                        onClick={addResponse} 
                        disabled={!newResponse.trim() || addingResponse}
                      >
                        {addingResponse ? "Enviando..." : "Enviar Respuesta"}
                      </Button>
                    </div>
                  </div>
                )}

                {selectedTicket.status === "closed" && (
                  <div className="p-3 bg-gray-50 rounded-lg text-center text-sm text-muted-foreground">
                    Este ticket ha sido cerrado. Crea un nuevo ticket si necesitas más ayuda.
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Selecciona un ticket para ver detalles y respuestas
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}