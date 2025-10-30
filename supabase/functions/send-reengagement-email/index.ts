import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Starting re-engagement email job...");

    // Find clients who cancelled exactly 7 days ago and haven't received re-engagement email
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStart = new Date(sevenDaysAgo.setHours(0, 0, 0, 0)).toISOString();
    const sevenDaysAgoEnd = new Date(sevenDaysAgo.setHours(23, 59, 59, 999)).toISOString();

    const { data: clients, error: clientsError } = await supabase
      .from("clients")
      .select(`
        id, 
        restaurant_name, 
        email,
        subdomain, 
        custom_domain, 
        plan_type,
        reengagement_sent_at,
        cancelled_at
      `)
      .in("subscription_status", ["cancelled", "expired"])
      .is("reengagement_sent_at", null)
      .not("cancelled_at", "is", null)
      .lte("cancelled_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(50);

    if (clientsError) {
      console.error("Error fetching clients:", clientsError);
      throw clientsError;
    }

    if (!clients || clients.length === 0) {
      console.log("No clients eligible for re-engagement today");
      return new Response(
        JSON.stringify({ message: "No clients eligible for re-engagement" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Found ${clients.length} clients eligible for re-engagement`);

    const results = {
      sent: [] as string[],
      failed: [] as string[],
    };

    for (const client of clients) {
      try {
        // Use email from clients table directly
        if (!client.email) {
          console.error(`Client ${client.id} has no email address`);
          results.failed.push(client.id);
          continue;
        }

        const email = client.email;
        const planName = client.plan_type === 'basic' ? 'Plan Básico' : 'Plan Avanzado';

        // Generate 30% win-back discount coupon (valid for 30 days)
        const couponCode = `WINBACK30-${client.id.substring(0, 8).toUpperCase()}`;
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        // Create the discount coupon
        const { error: couponError } = await supabase
          .from("coupons")
          .insert({
            code: couponCode,
            discount_type: "percentage",
            discount_value: 30,
            max_uses: 1,
            used_count: 0,
            expires_at: expiryDate.toISOString(),
            is_active: true,
            description: `30% discount for ${client.restaurant_name} - Win-back Campaign`,
          });

        if (couponError) {
          console.error(`Failed to create coupon for client ${client.id}:`, couponError);
        }

        const dashboardUrl = "https://mirestaurante.online/dashboard";

        // Email HTML template
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Te echamos de menos</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #44a79b 0%, #2d7a6e 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                ¡Te echamos de menos! 💙
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Hola ${client.restaurant_name},
              </p>
              
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Notamos que cancelaste tu suscripción hace una semana. Esperamos que todo esté bien.
              </p>

              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Entendemos que cada negocio tiene sus razones, pero nos encantaría tenerte de vuelta. <strong>Tu sitio web puede seguir trabajando para ti, atrayendo nuevos clientes todos los días.</strong>
              </p>

              <!-- Win-back Offer -->
              <div style="background: linear-gradient(135deg, #e6f7f515 0%, #e6f7f515 100%); border: 2px solid #44a79b; padding: 25px; margin: 30px 0; border-radius: 8px; text-align: center;">
                <h2 style="margin: 0 0 15px 0; color: #2d7a6e; font-size: 24px; font-weight: 700;">
                  🎁 Oferta Especial de Regreso
                </h2>
                <p style="margin: 0 0 20px 0; color: #333333; font-size: 18px; line-height: 1.6;">
                  <strong>30% de descuento</strong> en tu próxima suscripción
                </p>
                <div style="background-color: #ffffff; padding: 20px; border-radius: 6px; margin: 20px 0;">
                  <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                    Código de descuento exclusivo:
                  </p>
                  <code style="display: block; font-size: 24px; font-weight: 700; color: #44a79b; letter-spacing: 3px; font-family: 'Courier New', monospace; margin: 10px 0;">
                    ${couponCode}
                  </code>
                  <p style="margin: 10px 0 0 0; color: #999999; font-size: 13px;">
                    Válido por 30 días • Un solo uso
                  </p>
                </div>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${dashboardUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #44a79b 0%, #2d7a6e 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(68, 167, 155, 0.3);">
                  Reactivar Mi Suscripción
                </a>
              </div>

              <!-- Why Return -->
              <div style="background-color: #f8f9ff; padding: 25px; margin: 30px 0; border-radius: 6px;">
                <h3 style="margin: 0 0 15px 0; color: #333333; font-size: 18px;">
                  ¿Por qué volver?
                </h3>
                <ul style="margin: 0; padding: 0 0 0 20px; color: #666666; font-size: 15px; line-height: 1.8;">
                  <li style="margin-bottom: 10px;">✨ Sitio web profesional siempre actualizado</li>
                  <li style="margin-bottom: 10px;">📱 Sistema de reservas automatizado</li>
                  <li style="margin-bottom: 10px;">📊 Panel de control con métricas en tiempo real</li>
                  <li style="margin-bottom: 10px;">🎨 Actualizaciones y mejoras continuas</li>
                  <li style="margin-bottom: 10px;">💬 Soporte técnico incluido</li>
                </ul>
              </div>

              <p style="margin: 20px 0 0 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Si tienes alguna pregunta o inquietud, estamos aquí para ayudarte. No dudes en contactarnos por WhatsApp o correo.
              </p>

              <p style="margin: 20px 0 0 0; color: #333333; font-size: 16px; line-height: 1.6;">
                ¡Esperamos verte pronto!<br>
                <strong>El equipo de Mi Restaurante Online</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="margin: 0 0 10px 0; color: #666666; font-size: 13px;">
                <strong>¿Necesitas ayuda?</strong> Estamos aquí para ti
              </p>
              <p style="margin: 0 0 10px 0; color: #666666; font-size: 13px;">
                <a href="https://wa.me/51952040074" style="color: #44a79b; text-decoration: none;">📱 WhatsApp: +51 952 040 074</a>
              </p>
              <p style="margin: 0 0 15px 0; color: #666666; font-size: 13px;">
                <a href="mailto:hola@mirestaurante.online" style="color: #44a79b; text-decoration: none;">✉️ hola@mirestaurante.online</a>
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">
                Mi Restaurante Online - Santiago de Surco, Lima, Perú
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `;

        // Send email via Resend
        const emailResponse = await resend.emails.send({
          from: "Mi Restaurante Online <info@mirestaurante.online>",
          to: [email],
          subject: `${client.restaurant_name} - Te echamos de menos 💜`,
          html: emailHtml,
        });

        if (emailResponse.error) {
          console.error(`Failed to send email to ${email}:`, emailResponse.error);
          results.failed.push(client.id);
          continue;
        }

        // Mark re-engagement email as sent
        const { error: updateError } = await supabase
          .from("clients")
          .update({ reengagement_sent_at: new Date().toISOString() })
          .eq("id", client.id);

        if (updateError) {
          console.error(`Failed to update reengagement_sent_at for ${client.id}:`, updateError);
        }

        console.log(`✅ Re-engagement email sent to ${email} for client ${client.id}`);
        results.sent.push(client.id);

      } catch (clientError) {
        console.error(`Error processing client ${client.id}:`, clientError);
        results.failed.push(client.id);
      }
    }

    console.log(`Re-engagement job completed. Sent: ${results.sent.length}, Failed: ${results.failed.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: results.sent.length,
        failed: results.failed.length,
        details: results,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-reengagement-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
