import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReclamacionRequest {
  claimCode: string;
  formData: {
    personType: string;
    fullName: string;
    documentNumber: string;
    ruc: string;
    businessName: string;
    email: string;
    phone: string;
    contractedItem: string;
    amount: string;
    purchaseDate: string;
    purchaseDocument: string;
    claimType: string;
    purchaseChannel: string;
    description: string;
    consumerRequest: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log("Send reclamacion email function called");

    const { claimCode, formData }: ReclamacionRequest = await req.json();

    console.log("Processing claim:", claimCode);

    // Translate field names for email
    const claimTypeText = formData.claimType === "reclamo" 
      ? "Reclamo (disconformidad sobre el producto/servicio)" 
      : "Queja (malestar o descontento con la atención)";
    
    const contractedItemText = formData.contractedItem === "producto" ? "Producto" : "Servicio";
    const personTypeText = formData.personType === "natural" ? "Persona Natural" : "Persona Jurídica";

    // Email to customer (confirmation)
    const customerEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Confirmación de Reclamo Registrado</h2>
        <p><strong>Código de Reclamo:</strong> ${claimCode}</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Datos del Reclamo</h3>
          
          <p><strong>Tipo de Persona:</strong> ${personTypeText}</p>
          <p><strong>${formData.personType === "natural" ? "Nombre" : "Representante Legal"}:</strong> ${formData.fullName}</p>
          ${formData.personType === "natural" ? `<p><strong>Documento:</strong> ${formData.documentNumber}</p>` : `<p><strong>RUC:</strong> ${formData.ruc}</p><p><strong>Razón Social:</strong> ${formData.businessName}</p>`}
          <p><strong>Correo:</strong> ${formData.email}</p>
          <p><strong>Teléfono:</strong> ${formData.phone}</p>
          <p><strong>Bien Contratado:</strong> ${contractedItemText}</p>
          <p><strong>Monto:</strong> S/ ${formData.amount}</p>
          <p><strong>Fecha de Compra:</strong> ${formData.purchaseDate}</p>
          <p><strong>Documento de Compra:</strong> ${formData.purchaseDocument}</p>
          <p><strong>Tipo:</strong> ${claimTypeText}</p>
          <p><strong>Canal de Compra:</strong> ${formData.purchaseChannel}</p>
          
          <h4 style="color: #333; margin-top: 20px;">Descripción:</h4>
          <p style="white-space: pre-wrap;">${formData.description}</p>
          
          <h4 style="color: #333; margin-top: 20px;">Pedido del Consumidor:</h4>
          <p style="white-space: pre-wrap;">${formData.consumerRequest}</p>
        </div>
        
        <p>Tu reclamo ha sido registrado correctamente. Te responderemos en un plazo máximo de <strong>30 días calendario</strong>.</p>
        
        <p>Guarda este código para futuras consultas: <strong>${claimCode}</strong></p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">
          Este correo fue generado automáticamente desde el Libro de Reclamaciones.<br>
          Mi Restaurante Online - Mujeres y Madres Internacional SAC<br>
          RUC: 20610336869<br>
          Conforme a la Ley N.º 29571
        </p>
      </div>
    `;

    // Email to admin (full details)
    const adminEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Nuevo Reclamo Recibido</h2>
        <p><strong>Código de Reclamo:</strong> ${claimCode}</p>
        <p><strong>Fecha y Hora:</strong> ${new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' })}</p>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h3 style="color: #333; margin-top: 0;">Datos del Consumidor</h3>
          <p><strong>Tipo de Persona:</strong> ${personTypeText}</p>
          <p><strong>${formData.personType === "natural" ? "Nombre" : "Representante Legal"}:</strong> ${formData.fullName}</p>
          ${formData.personType === "natural" ? `<p><strong>Documento:</strong> ${formData.documentNumber}</p>` : `<p><strong>RUC:</strong> ${formData.ruc}</p><p><strong>Razón Social:</strong> ${formData.businessName}</p>`}
          <p><strong>Correo:</strong> ${formData.email}</p>
          <p><strong>Teléfono:</strong> ${formData.phone}</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Detalles del Reclamo</h3>
          <p><strong>Bien Contratado:</strong> ${contractedItemText}</p>
          <p><strong>Monto:</strong> S/ ${formData.amount}</p>
          <p><strong>Fecha de Compra:</strong> ${formData.purchaseDate}</p>
          <p><strong>Documento de Compra:</strong> ${formData.purchaseDocument}</p>
          <p><strong>Tipo:</strong> ${claimTypeText}</p>
          <p><strong>Canal de Compra:</strong> ${formData.purchaseChannel}</p>
        </div>
        
        <div style="background-color: #e7f3ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196F3;">
          <h3 style="color: #333; margin-top: 0;">Descripción del Reclamo</h3>
          <p style="white-space: pre-wrap;">${formData.description}</p>
        </div>
        
        <div style="background-color: #f3e5f5; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #9c27b0;">
          <h3 style="color: #333; margin-top: 0;">Pedido del Consumidor</h3>
          <p style="white-space: pre-wrap;">${formData.consumerRequest}</p>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #d32f2f; font-weight: bold;">
          ⚠️ IMPORTANTE: Plazo máximo de respuesta 30 días calendario según Ley N.º 29571
        </p>
      </div>
    `;

    // Send email to customer
    const customerEmailResponse = await resend.emails.send({
      from: "Mi Restaurante Online <reclamaciones@mirestaurante.online>",
      to: [formData.email],
      subject: `Confirmación de Reclamo - ${claimCode}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 3px solid #FF6B35;">
            <img src="https://mirestaurante.online/logo.svg" alt="Mi Restaurante Online" style="width: 60px; height: 60px;" />
            <h1 style="color: #333; margin: 10px 0;">Mi Restaurante Online</h1>
          </div>
          <div style="padding: 20px;">
            ${customerEmailContent}
          </div>
        </div>
      `,
    });

    if (customerEmailResponse.error) {
      console.error("Error sending customer email:", customerEmailResponse.error);
      throw customerEmailResponse.error;
    }

    console.log("Customer email sent successfully:", customerEmailResponse);

    // Log customer email (non-blocking)
    try {
      await supabase.from("resend_email_logs").insert({
        email_type: "reclamacion_customer",
        recipient_email: formData.email,
        recipient_type: "customer",
        status: "sent",
        resend_id: customerEmailResponse.data?.id,
      });
    } catch (logError) {
      console.error("Failed to log customer email:", logError);
    }

    // Send email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "Mi Restaurante Online <reclamaciones@mirestaurante.online>",
      to: ["reclamaciones@mirestaurante.online"],
      subject: `Nuevo Reclamo - ${claimCode} - ${formData.fullName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 3px solid #FF6B35;">
            <img src="https://mirestaurante.online/logo.svg" alt="Mi Restaurante Online" style="width: 60px; height: 60px;" />
            <h1 style="color: #333; margin: 10px 0;">Mi Restaurante Online</h1>
          </div>
          <div style="padding: 20px;">
            ${adminEmailContent}
          </div>
          <div style="background-color: #f8f9fa; padding: 15px; text-align: center; border-top: 1px solid #ddd; margin-top: 20px;">
            <p style="color: #666; font-size: 12px; margin: 0;"><em>Sistema de Libro de Reclamaciones</em></p>
          </div>
        </div>
      `,
    });

    if (adminEmailResponse.error) {
      console.error("Error sending admin email:", adminEmailResponse.error);
      throw adminEmailResponse.error;
    }

    console.log("Admin email sent successfully:", adminEmailResponse);
    
    // Log admin email (non-blocking)
    try {
      await supabase.from("resend_email_logs").insert({
        email_type: "reclamacion_admin",
        recipient_email: "reclamaciones@mirestaurante.online",
        recipient_type: "admin",
        status: "sent",
        resend_id: adminEmailResponse.data?.id,
      });
    } catch (logError) {
      console.error("Failed to log admin email:", logError);
    }

    console.log("Admin email sent successfully:", adminEmailResponse);

    return new Response(JSON.stringify({ success: true, claimCode }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-reclamacion-email function:", error);
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
