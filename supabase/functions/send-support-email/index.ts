import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
console.log("Resend API key configured:", !!Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SupportRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  clientId?: string;
  supportType: string;
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

    const { name, email, subject, message, clientId, supportType, premiumEmail, premiumPin } = requestData;

    console.log("Support request received:", { name, email, subject, supportType, clientId });

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

    // Create support ticket in database
    let ticketData: any = {
      subject,
      message,
      customer_name: name,
      customer_email: email,
      support_type: supportType
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
    const supportEmail = supportType === "premium" ? "premiumsoporte@mirestaurant.online" : "soporte@mirestaurant.online";

    // Send email notification to support team
    const emailSubject = `${supportType === "premium" ? "[PREMIUM] " : ""}Nuevo Ticket de Soporte: ${ticket.ticket_number}`;
    
    const emailContent = `
      <h2>Nuevo Ticket de Soporte</h2>
      <p><strong>Número de Ticket:</strong> ${ticket.ticket_number}</p>
      <p><strong>Tipo:</strong> ${supportType === "premium" ? "Premium" : "General"}</p>
      <p><strong>Asunto:</strong> ${subject}</p>
      <p><strong>Cliente:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      ${clientId ? `<p><strong>Client ID:</strong> ${clientId}</p>` : ""}
      
      <h3>Mensaje:</h3>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
        ${message.replace(/\n/g, '<br>')}
      </div>
      
      <p><em>Este ticket ha sido creado automáticamente en el sistema de gestión de tickets.</em></p>
    `;

    const emailResponse = await resend.emails.send({
      from: "Mi Restaurante Online <soporte@mirestaurant.online>",
      to: [supportEmail],
      subject: emailSubject,
      html: emailContent,
    });

    if (emailResponse.error) {
      console.error("Error sending email:", emailResponse.error);
      // Don't fail the request if email fails, ticket is already created
    } else {
      console.log("Support email sent successfully to:", supportEmail);
    }

    // Send confirmation email to customer
    const confirmationResponse = await resend.emails.send({
      from: "Mi Restaurante Online <soporte@mirestaurant.online>",
      to: [email],
      subject: `Confirmación de Ticket de Soporte: ${ticket.ticket_number}`,
      html: `
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