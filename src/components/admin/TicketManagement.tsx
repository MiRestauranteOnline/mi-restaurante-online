import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Clock, CheckCircle, AlertTriangle, User, Mail, Calendar } from "lucide-react";
import { format } from "date-fns";

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
  resolved_at: string | null;
  client_id: string | null;
  clients?: {
    restaurant_name: string;
  };
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

const priorityColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800"
};

export function TicketManagement() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [responses, setResponses] = useState<TicketResponse[]>([]);
  const [newResponse, setNewResponse] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const fetchTickets = async () => {
    try {
      let query = supabase
        .from("support_tickets")
        .select(`
          *,
          clients:client_id (
            restaurant_name
          )
        `)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTickets(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch tickets",
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
        .order("created_at", { ascending: true });

      if (error) throw error;
      setResponses(data || []);
    } catch (error: any) {
      toast({
        title: "Error", 
        description: "Failed to fetch responses",
        variant: "destructive"
      });
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const updateData: any = { 
        status, 
        updated_at: new Date().toISOString() 
      };

      if (status === "resolved" || status === "closed") {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("support_tickets")
        .update(updateData)
        .eq("id", ticketId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Ticket status updated to ${status}`
      });

      fetchTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update ticket status",
        variant: "destructive"
      });
    }
  };

  const addResponse = async () => {
    if (!selectedTicket || !newResponse.trim()) return;

    try {
      const { error } = await supabase
        .from("ticket_responses")
        .insert({
          ticket_id: selectedTicket.id,
          message: newResponse,
          is_internal_note: isInternalNote,
          created_by_name: "Admin",
          created_by_email: "admin@mirestaurant.online"
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: isInternalNote ? "Internal note added" : "Response added"
      });

      setNewResponse("");
      setIsInternalNote(false);
      fetchTicketResponses(selectedTicket.id);
      fetchTickets();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to add response",
        variant: "destructive"
      });
    }
  };

  const selectTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    fetchTicketResponses(ticket.id);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading tickets...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Support Tickets</h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tickets</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Tickets ({tickets.length})</h2>
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
                      {ticket.status}
                    </Badge>
                    <Badge variant="outline" className={priorityColors[ticket.priority as keyof typeof priorityColors]}>
                      {ticket.priority}
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
                    <User className="h-3 w-3" />
                    {ticket.customer_name}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(ticket.created_at), "MMM d")}
                  </div>
                </div>
                
                {ticket.clients?.restaurant_name && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    Client: {ticket.clients.restaurant_name}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          
          {tickets.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No tickets found
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
                  <Select
                    value={selectedTicket.status}
                    onValueChange={(status) => updateTicketStatus(selectedTicket.id, status)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Customer Info */}
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
                    <Clock className="h-4 w-4" />
                    {format(new Date(selectedTicket.created_at), "PPpp")}
                  </div>
                </div>

                {/* Original Message */}
                <div>
                  <h4 className="font-medium mb-2">Original Message</h4>
                  <p className="text-sm bg-muted p-3 rounded-lg">{selectedTicket.message}</p>
                </div>

                {/* Responses */}
                {responses.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Responses ({responses.length})</h4>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {responses.map((response) => (
                        <div
                          key={response.id}
                          className={`p-3 rounded-lg ${
                            response.is_internal_note 
                              ? "bg-yellow-50 border border-yellow-200" 
                              : "bg-blue-50 border border-blue-200"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-sm font-medium">
                              {response.created_by_name}
                              {response.is_internal_note && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  Internal Note
                                </Badge>
                              )}
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
                <div>
                  <h4 className="font-medium mb-2">Add Response</h4>
                  <Textarea
                    placeholder="Type your response..."
                    value={newResponse}
                    onChange={(e) => setNewResponse(e.target.value)}
                    className="mb-2"
                  />
                  <div className="flex justify-between items-center">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={isInternalNote}
                        onChange={(e) => setIsInternalNote(e.target.checked)}
                      />
                      Internal note (not visible to customer)
                    </label>
                    <Button onClick={addResponse} disabled={!newResponse.trim()}>
                      Add Response
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Select a ticket to view details
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}