import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SupportResponseRequest {
  ticketNumber: string;
  customerEmail: string;
  customerName: string;
  responseMessage: string;
  originalSubject: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Send support response function called");

    const { ticketNumber, customerEmail, customerName, responseMessage, originalSubject }: SupportResponseRequest = await req.json();

    console.log("Sending response email for ticket:", ticketNumber);

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Respuesta a su Ticket de Soporte</h2>
        <p><strong>Número de Ticket:</strong> ${ticketNumber}</p>
        <p><strong>Asunto:</strong> ${originalSubject}</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Respuesta de nuestro equipo:</h3>
          <p style="white-space: pre-wrap;">${responseMessage}</p>
        </div>
        
        <p>Si tiene alguna pregunta adicional, puede responder a este correo y será agregado automáticamente a su ticket.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">
          Este correo fue enviado desde nuestro sistema de soporte técnico.<br>
          Mi Restaurante Online - Soporte Técnico
        </p>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "Mi Restaurante Online <soporte@mirestaurante.online>",
      to: [customerEmail],
      subject: `Re: ${originalSubject} [${ticketNumber}]`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 3px solid #FF6B35;">
            <img src="https://mirestaurante.online/logo.svg" alt="Mi Restaurante Online" style="width: 60px; height: 60px;" />
            <h1 style="color: #333; margin: 10px 0;">Mi Restaurante Online</h1>
          </div>
          <div style="padding: 20px;">
            ${emailContent}
          </div>
        </div>
      `,
    });

    if (emailResponse.error) {
      throw emailResponse.error;
    }

    console.log("Support response email sent successfully:", emailResponse);

    // Log email to resend_email_logs (non-blocking)
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.75.0");
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      await supabase.from("resend_email_logs").insert({
        email_type: "support_response",
        recipient_email: customerEmail,
        recipient_type: "customer",
        ticket_number: ticketNumber,
        status: "sent",
        resend_id: emailResponse.data?.id,
      });
    } catch (logError) {
      console.error("Failed to log email:", logError);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-support-response function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);