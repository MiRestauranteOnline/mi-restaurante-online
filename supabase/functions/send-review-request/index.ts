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

    console.log("Starting review request email job...");

    // Find clients whose sites went live exactly 30 days ago and haven't received review request
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStart = new Date(thirtyDaysAgo.setHours(0, 0, 0, 0)).toISOString();
    const thirtyDaysAgoEnd = new Date(thirtyDaysAgo.setHours(23, 59, 59, 999)).toISOString();

    const { data: clients, error: clientsError } = await supabase
      .from("clients")
      .select(`
        id, 
        restaurant_name, 
        email,
        subdomain, 
        custom_domain, 
        review_request_sent_at,
        site_live_at
      `)
      .eq("subscription_status", "active")
      .eq("is_deactivated", false)
      .is("review_request_sent_at", null)
      .not("site_live_at", "is", null)
      .lte("site_live_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .limit(50);

    if (clientsError) {
      console.error("Error fetching clients:", clientsError);
      throw clientsError;
    }

    if (!clients || clients.length === 0) {
      console.log("No clients eligible for review request today");
      return new Response(
        JSON.stringify({ message: "No clients eligible for review request" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Found ${clients.length} clients eligible for review request`);

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
        const siteUrl = client.custom_domain 
          ? `https://${client.custom_domain}`
          : `https://${client.subdomain}.mirestaurante.online`;

        // Generate 25% discount coupon (valid for 60 days)
        const couponCode = `REVIEW25-${client.id.substring(0, 8).toUpperCase()}`;
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 60);

        // Create the discount coupon
        const { error: couponError } = await supabase
          .from("coupons")
          .insert({
            code: couponCode,
            discount_type: "percentage",
            discount_value: 25,
            max_uses: 1,
            used_count: 0,
            expires_at: expiryDate.toISOString(),
            is_active: true,
            description: `25% discount for ${client.restaurant_name} - Review Request Reward`,
          });

        if (couponError) {
          console.error(`Failed to create coupon for client ${client.id}:`, couponError);
        }

        // Email HTML template
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>¡Nos encantaría saber tu opinión!</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                ¡Han pasado 30 días! 🎉
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
                ¡Ha pasado un mes desde que tu sitio web entró en funcionamiento! Esperamos que esté atrayendo muchos nuevos clientes a tu restaurante.
              </p>

              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Nos encantaría conocer tu experiencia con nuestro servicio. <strong>¿Podrías compartir tu opinión en Google?</strong> Tu reseña nos ayuda enormemente a mejorar y a ayudar a otros restaurantes como el tuyo.
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="https://g.page/r/CSSfTqPXvjL8EAE/review" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
                  Dejar una Reseña en Google
                </a>
              </div>

              <!-- Discount Reward -->
              <div style="background-color: #f8f9ff; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <h3 style="margin: 0 0 15px 0; color: #667eea; font-size: 18px;">
                  🎁 ¡Gracias Especial!
                </h3>
                <p style="margin: 0 0 10px 0; color: #333333; font-size: 15px; line-height: 1.6;">
                  Como agradecimiento por compartir tu experiencia, hemos creado un cupón exclusivo con <strong>25% de descuento</strong> para tu próxima renovación:
                </p>
                <div style="background-color: #ffffff; padding: 15px; border-radius: 4px; text-align: center; margin-top: 15px;">
                  <code style="font-size: 20px; font-weight: 600; color: #667eea; letter-spacing: 2px; font-family: 'Courier New', monospace;">
                    ${couponCode}
                  </code>
                  <p style="margin: 10px 0 0 0; color: #666666; font-size: 13px;">
                    Válido por 60 días • Un solo uso
                  </p>
                </div>
              </div>

              <p style="margin: 20px 0 0 0; color: #333333; font-size: 16px; line-height: 1.6;">
                ¡Gracias por confiar en Mi Restaurante Online! Estamos aquí para ayudarte a crecer.
              </p>

              <p style="margin: 20px 0 0 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Saludos cordiales,<br>
                <strong>El equipo de Mi Restaurante Online</strong>
              </p>

              <!-- Site Link -->
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eeeeee;">
                <p style="margin: 0; color: #666666; font-size: 14px;">
                  Tu sitio web: <a href="${siteUrl}" style="color: #667eea; text-decoration: none;">${siteUrl}</a>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="margin: 0 0 10px 0; color: #666666; font-size: 13px;">
                Mi Restaurante Online - Sitios web profesionales para restaurantes
              </p>
              <p style="margin: 0 0 10px 0; color: #666666; font-size: 13px;">
                <a href="https://wa.me/51952040074" style="color: #667eea; text-decoration: none;">WhatsApp: +51 952 040 074</a> | 
                <a href="mailto:hola@mirestaurante.online" style="color: #667eea; text-decoration: none;">hola@mirestaurante.online</a>
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">
                Santiago de Surco, Lima, Perú
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
          subject: `${client.restaurant_name} - ¡Nos encantaría conocer tu opinión! 🌟`,
          html: emailHtml,
        });

        if (emailResponse.error) {
          console.error(`Failed to send email to ${email}:`, emailResponse.error);
          results.failed.push(client.id);
          continue;
        }

        // Mark review request as sent
        const { error: updateError } = await supabase
          .from("clients")
          .update({ review_request_sent_at: new Date().toISOString() })
          .eq("id", client.id);

        if (updateError) {
          console.error(`Failed to update review_request_sent_at for ${client.id}:`, updateError);
        }

        console.log(`✅ Review request sent to ${email} for client ${client.id}`);
        results.sent.push(client.id);

      } catch (clientError) {
        console.error(`Error processing client ${client.id}:`, clientError);
        results.failed.push(client.id);
      }
    }

    console.log(`Review request job completed. Sent: ${results.sent.length}, Failed: ${results.failed.length}`);

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
    console.error("Error in send-review-request function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
