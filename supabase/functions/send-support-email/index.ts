import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
console.log("Resend API key configured:", !!Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DNSRecord {
  type: string;
  name: string;
  content: string;
  priority?: string;
  ttl?: string;
}

interface SupportRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  clientId?: string;
  supportType: string;
  consultType?: string;
  dnsRecords?: DNSRecord[];
  premiumEmail?: string;
  premiumPin?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Send support email function called");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Processing support email request...");
    const requestData: (SupportRequest & { ping?: boolean }) = await req.json();
    console.log("Request data received:", requestData);

    if (requestData.ping) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { name, email, subject, message, clientId, supportType, consultType, dnsRecords, premiumEmail, premiumPin } = requestData;

    const normalizedSupportType = supportType === "premium" ? "premium" : "general";

    console.log("Support request received:", { name, email, subject, supportType, consultType, clientId });

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify premium support if needed
    if (supportType === "premium") {
      if (!premiumEmail || !premiumPin) {
        return new Response(
          JSON.stringify({ error: "Premium email and PIN are required for premium support" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Find client by email
      const { data: client, error: clientError } = await supabase
        .from("clients")
        .select("id, plan_type")
        .eq("email", premiumEmail)
        .single();

      if (clientError || !client) {
        return new Response(
          JSON.stringify({ error: "Cliente no encontrado con ese email" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      if (client.plan_type !== "advanced") {
        return new Response(
          JSON.stringify({ error: "Este cliente no tiene plan premium activo" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Verify PIN
      const { data: premiumFeatures, error: pinError } = await supabase
        .from("premium_features")
        .select("unique_support_pin")
        .eq("client_id", client.id)
        .single();

      if (pinError || !premiumFeatures || premiumFeatures.unique_support_pin !== premiumPin) {
        return new Response(
          JSON.stringify({ error: "PIN de soporte premium inválido" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Format DNS records into message if present
    let fullMessage = message;
    if (consultType === 'dns' && dnsRecords && dnsRecords.length > 0) {
      fullMessage += '\n\n=== DNS RECORDS TO ADD ===\n\n';
      dnsRecords.forEach((record, index) => {
        fullMessage += `Record ${index + 1}:\n`;
        fullMessage += `- Type: ${record.type}\n`;
        fullMessage += `- Name: ${record.name}\n`;
        fullMessage += `- Content: ${record.content}\n`;
        if (record.priority) fullMessage += `- Priority: ${record.priority}\n`;
        if (record.ttl) fullMessage += `- TTL: ${record.ttl}\n`;
        fullMessage += '\n';
      });
    }

    // Create support ticket in database
    let ticketData: any = {
      subject: consultType === 'dns' ? `[DNS] ${subject}` : subject,
      message: fullMessage,
      customer_name: name,
      customer_email: email,
      support_type: normalizedSupportType
    };

    // Add client_id if available
    if (clientId) {
      ticketData.client_id = clientId;
    } else if (supportType === "premium" && premiumEmail) {
      // For premium support, find client by email
      const { data: client } = await supabase
        .from("clients")
        .select("id")
        .eq("email", premiumEmail)
        .single();
      
      if (client) {
        ticketData.client_id = client.id;
      }
    }

    const { data: ticket, error: ticketError } = await supabase
      .from("support_tickets")
      .insert(ticketData)
      .select()
      .single();

    if (ticketError) {
      console.error("Error creating ticket:", ticketError);
      return new Response(
        JSON.stringify({ error: "Failed to create support ticket" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Support ticket created:", ticket.ticket_number);

    // Determine email destination
    const supportEmail = supportType === "premium" ? "premiumsoporte@mirestaurante.online" : "soporte@mirestaurante.online";

    // Send email notification to support team
    const emailSubject = `${supportType === "premium" ? "[PREMIUM] " : ""}${consultType === "dns" ? "[DNS] " : ""}Nuevo Ticket de Soporte: ${ticket.ticket_number}`;
    
    let dnsRecordsHtml = '';
    if (consultType === 'dns' && dnsRecords && dnsRecords.length > 0) {
      dnsRecordsHtml = `
        <h3 style="margin-top: 20px;">Registros DNS a Agregar:</h3>
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #ffc107;">
          ${dnsRecords.map((record, index) => `
            <div style="margin-bottom: 15px; padding: 10px; background: white; border-radius: 4px;">
              <h4 style="margin: 0 0 10px 0; color: #333;">Registro ${index + 1}</h4>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 5px; font-weight: bold; width: 100px;">Type:</td><td style="padding: 5px;">${record.type}</td></tr>
                <tr><td style="padding: 5px; font-weight: bold;">Name:</td><td style="padding: 5px;">${record.name}</td></tr>
                <tr><td style="padding: 5px; font-weight: bold;">Content:</td><td style="padding: 5px;">${record.content}</td></tr>
                ${record.priority ? `<tr><td style="padding: 5px; font-weight: bold;">Priority:</td><td style="padding: 5px;">${record.priority}</td></tr>` : ''}
                ${record.ttl ? `<tr><td style="padding: 5px; font-weight: bold;">TTL:</td><td style="padding: 5px;">${record.ttl}</td></tr>` : ''}
              </table>
            </div>
          `).join('')}
        </div>
      `;
    }
    
    const emailContent = `
      <h2>Nuevo Ticket de Soporte</h2>
      <p><strong>Número de Ticket:</strong> ${ticket.ticket_number}</p>
      <p><strong>Tipo:</strong> ${supportType === "premium" ? "Premium" : "General"}</p>
      ${consultType ? `<p><strong>Consulta:</strong> ${consultType === "dns" ? "DNS Records" : consultType}</p>` : ""}
      <p><strong>Asunto:</strong> ${subject}</p>
      <p><strong>Cliente:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      ${clientId ? `<p><strong>Client ID:</strong> ${clientId}</p>` : ""}
      
      <h3>Mensaje:</h3>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
        ${message.replace(/\n/g, '<br>')}
      </div>
      
      ${dnsRecordsHtml}
      
      <p><em>Este ticket ha sido creado automáticamente en el sistema de gestión de tickets.</em></p>
    `;

    const emailResponse = await resend.emails.send({
      from: "Mi Restaurante Online <soporte@mirestaurante.online>",
      to: [supportEmail],
      subject: emailSubject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 3px solid #FF6B35;">
            <img src="https://mirestaurante.online/logo.svg" alt="Mi Restaurante Online" style="width: 60px; height: 60px;" />
            <h1 style="color: #333; margin: 10px 0;">Mi Restaurante Online</h1>
          </div>
          <div style="padding: 20px;">
            ${emailContent}
          </div>
          <div style="background-color: #f8f9fa; padding: 15px; text-align: center; border-top: 1px solid #ddd; margin-top: 20px;">
            <p style="color: #666; font-size: 12px; margin: 0;"><em>Sistema de Gestión de Tickets</em></p>
          </div>
        </div>
      `,
    });

    if (emailResponse.error) {
      console.error("Error sending email:", emailResponse.error);
      // Don't fail the request if email fails, ticket is already created
    } else {
      console.log("Support email sent successfully to:", supportEmail);
      
      // Log email to resend_email_logs (non-blocking)
      try {
        await supabase.from("resend_email_logs").insert({
          email_type: "support_request",
          recipient_email: supportEmail,
          recipient_type: "admin",
          client_id: clientId,
          ticket_number: ticket.ticket_number,
          status: "sent",
          resend_id: emailResponse.data?.id,
        });
      } catch (logError) {
        console.error("Failed to log email:", logError);
      }
    }

    // Send confirmation email to customer
    const confirmationResponse = await resend.emails.send({
      from: "Mi Restaurante Online <soporte@mirestaurante.online>",
      to: [email],
      subject: `Confirmación de Ticket de Soporte: ${ticket.ticket_number}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 3px solid #FF6B35;">
            <img src="https://mirestaurante.online/logo.svg" alt="Mi Restaurante Online" style="width: 60px; height: 60px;" />
            <h1 style="color: #333; margin: 10px 0;">Mi Restaurante Online</h1>
          </div>
          <div style="padding: 20px;">
            <h2>Hemos recibido tu solicitud de soporte</h2>
            <p>Hola ${name},</p>
            <p>Tu ticket de soporte ha sido creado exitosamente:</p>
            
            <div style="background-color: #f0f9ff; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Número de Ticket:</strong> ${ticket.ticket_number}</p>
              <p><strong>Asunto:</strong> ${subject}</p>
              <p><strong>Tipo:</strong> ${supportType === "premium" ? "Premium" : "General"}</p>
            </div>
            
            <p>Nuestro equipo revisará tu solicitud y te responderemos a la brevedad.</p>
            
            ${supportType === "premium" ? 
              "<p><em>Como cliente premium, tu ticket será procesado con prioridad alta.</em></p>" : 
              ""
            }
            
            <p>Gracias por contactarnos.</p>
            <p><strong>Equipo de Soporte</strong><br>Mi Restaurante Online</p>
          </div>
          <div style="background-color: #f8f9fa; padding: 15px; text-align: center; border-top: 1px solid #ddd; margin-top: 20px;">
            <p style="color: #666; font-size: 12px; margin: 0;"><em>Equipo de Soporte</em></p>
          </div>
        </div>
      `,
    });

    if (confirmationResponse.error) {
      console.error("Error sending confirmation email:", confirmationResponse.error);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        ticketNumber: ticket.ticket_number,
        message: "Ticket de soporte creado exitosamente" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-support-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);