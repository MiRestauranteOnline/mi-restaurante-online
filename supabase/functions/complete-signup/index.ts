import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Complete signup function called');

    // Read payload (public function; do NOT rely on auth headers)
    let payload: any = {};
    try {
      payload = await req.json();
    } catch {
      payload = {};
    }

    const clientId: string | undefined = payload?.clientId;
    const faqsPayload: Array<{ question: string; answer: string }>
      = Array.isArray(payload?.faqs) ? payload.faqs : [];

    if (!clientId || typeof clientId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing clientId in payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Service role client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Fetch client
    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .maybeSingle();

    if (clientError || !client) {
      console.error('Client fetch failed:', clientError);
      return new Response(
        JSON.stringify({ error: 'Client not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate steps
    const validationErrors: string[] = [];

    if (client.subscription_status !== 'active') {
      validationErrors.push('Payment not completed - subscription is not active');
    }
    if (!client.opening_hours || Object.keys(client.opening_hours).length === 0) {
      validationErrors.push('Opening hours not configured');
    }

    // Check if carousel is enabled in admin_content
    const { data: adminContent } = await supabaseAdmin
      .from('admin_content')
      .select('carousel_enabled')
      .eq('client_id', clientId)
      .maybeSingle();

    // Only require carousel images if carousel_enabled is true
    if (adminContent?.carousel_enabled) {
      const { data: images, error: imagesError } = await supabaseAdmin
        .from('carousel_images')
        .select('id')
        .eq('client_id', clientId)
        .eq('is_active', true);
      if (imagesError || !images || images.length === 0) {
        validationErrors.push('Carousel enabled but no carousel images uploaded');
      }
    }

    // Insert FAQs if provided and none exist yet
    if (faqsPayload.length > 0) {
      const { data: existingFaqs } = await supabaseAdmin
        .from('faqs')
        .select('id')
        .eq('client_id', clientId)
        .eq('is_active', true);

      if (!existingFaqs || existingFaqs.length === 0) {
        const records = faqsPayload
          .filter((f) => f?.question && f?.answer)
          .map((f) => ({
            client_id: clientId,
            question: String(f.question).trim(),
            answer: String(f.answer).trim(),
            is_active: true,
          }));
        if (records.length > 0) {
          const { error: insertFaqsError } = await supabaseAdmin
            .from('faqs')
            .insert(records);
          if (insertFaqsError) {
            console.error('Failed to insert FAQs from payload:', insertFaqsError);
          }
        }
      }
    }

    const { data: faqs, error: faqsError } = await supabaseAdmin
      .from('faqs')
      .select('id')
      .eq('client_id', clientId)
      .eq('is_active', true);
    if (faqsError || !faqs || faqs.length === 0) {
      validationErrors.push('No FAQs added');
    }

    if (validationErrors.length > 0) {
      console.error('Signup validation failed:', validationErrors);
      return new Response(
        JSON.stringify({ error: 'Signup not complete', validation_errors: validationErrors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark signup completed with both deactivation flags
    const { error: updateError } = await supabaseAdmin
      .from('clients')
      .update({ 
        signup_completed: true,
        is_deactivated: true,
        dashboard_is_deactivated: true
      })
      .eq('id', clientId);
    if (updateError) {
      console.error('Failed to update signup_completed:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to complete signup' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send registration completion email (to client)
    try {
      const resend = new Resend(Deno.env.get('RESEND_API_KEY')!);
      
      const dashboardUrl = `https://${client.subdomain}.mirestaurante.online/login`;
      const namecheapGuideUrl = 'https://mirestaurante.online/guias/configurar-dominio-namecheap';
      const emailGuideUrl = 'https://mirestaurante.online/guias/configurar-email';
      
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #484848; }
              .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; }
              h1 { color: #1a1a1a; font-size: 28px; margin-bottom: 30px; }
              .success-box { background-color: #d1fae5; padding: 24px; border-radius: 8px; border: 2px solid #10b981; margin: 24px 0; text-align: center; }
              .info-box { background-color: #dbeafe; padding: 24px; border-radius: 8px; border: 2px solid #3b82f6; margin: 24px 0; }
              .warning-box { background-color: #fef3c7; padding: 24px; border-radius: 8px; border: 2px solid #fbbf24; margin: 24px 0; }
              .button { display: inline-block; background-color: #e11d48; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 12px 0; }
              .button-secondary { display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 8px 0; font-size: 14px; }
              .footer { color: #898989; font-size: 14px; text-align: center; margin-top: 32px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🎉 ¡Registro Completado!</h1>
              <p>Hola ${client.restaurant_name},</p>
              <p>¡Felicitaciones! Has completado todos los pasos del registro. Tu sitio web estará listo y en línea <strong>dentro de 72 horas</strong>.</p>
              
              <div class="success-box">
                <strong style="color: #065f46; font-size: 20px;">✅ Información Recibida</strong><br>
                <span style="color: #065f46; font-size: 16px;">Nuestro equipo está preparando tu sitio web profesional</span>
              </div>

              <div class="info-box">
                <strong>🌐 ¿Qué prefieres para tu dominio?</strong><br><br>
                
                <strong>Opción 1: Usar subdominio gratuito</strong><br>
                Tu sitio estará disponible en: <strong>${client.subdomain}.mirestaurante.online</strong><br>
                <em>No requiere configuración adicional - listo para usar</em><br><br>

                <strong>Opción 2: Usar tu propio dominio</strong><br>
                Si tienes un dominio propio (ejemplo: ${client.restaurant_name.toLowerCase().replace(/\s+/g, '')}.com), podemos configurarlo para ti.<br><br>
                
                <strong>📝 Para configurar tu dominio:</strong><br>
                1️⃣ Debes cambiar los nameservers en tu proveedor de dominios<br>
                2️⃣ <a href="${namecheapGuideUrl}" style="color: #e11d48;">Ver guía paso a paso para Namecheap</a><br>
                3️⃣ Responde a este email cuando hayas configurado los nameservers<br><br>

                <strong>¿Podemos hacerlo por ti?</strong> Envíanos tus credenciales de acceso al proveedor de dominios y lo configuramos nosotros.<br><br>

                <strong>¿No tienes dominio?</strong><br>
                Recomendamos comprarlo en <a href="https://www.namecheap.com" style="color: #3b82f6;">Namecheap</a> - es rápido, confiable y económico.<br>
                <em>Nota: No compramos dominios por los clientes para evitar problemas de propiedad y renovación.</em>
              </div>

              <div class="warning-box">
                <strong>📧 Configuración de Email Profesional</strong><br><br>
                ¿Quieres emails personalizados con tu dominio? (ejemplo: info@${client.restaurant_name.toLowerCase().replace(/\s+/g, '')}.com)<br><br>
                <a href="${emailGuideUrl}" class="button-secondary">Ver Guía de Configuración de Email</a>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${dashboardUrl}" class="button">Acceder a Mi Panel</a>
              </div>

              <p><strong>📹 Próximos pasos:</strong> Una vez que tu sitio esté en línea, te enviaremos un email con el enlace a tu sitio web y tutoriales en video sobre cómo usar tu panel de control.</p>

              <p>¿Tienes preguntas? Responde a este email o contáctanos en <a href="mailto:soporte@mirestaurante.online" style="color: #e11d48;">soporte@mirestaurante.online</a></p>

              <div class="footer">
                <a href="https://mirestaurante.online" style="color: #898989;">MiRestaurante.online</a><br>
                Sitios web profesionales para restaurantes en Perú
              </div>
            </div>
          </body>
        </html>
      `;

      await resend.emails.send({
        from: 'MiRestaurante <info@mirestaurante.online>',
        to: [client.email],
        subject: '🎉 Registro Completado - Tu Sitio Estará Listo en 72h',
        html,
      });

      console.log('Registration completion email sent to:', client.email);
    } catch (emailError) {
      console.error('Error sending registration completion email:', emailError);
    }

    // Send internal notification to admin team
    try {
      const resend = new Resend(Deno.env.get('RESEND_API_KEY')!);
      
      const adminHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: monospace; line-height: 1.6; color: #1a1a1a; }
              .container { max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
              h1 { color: #e11d48; }
              .data-section { background-color: #ffffff; padding: 20px; margin: 10px 0; border-left: 4px solid #e11d48; }
              .data-row { margin: 8px 0; }
              .label { font-weight: bold; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🆕 Nuevo Cliente Completó Registro</h1>
              
              <div class="data-section">
                <h3>Información Básica</h3>
                <div class="data-row"><span class="label">ID Cliente:</span> ${client.id}</div>
                <div class="data-row"><span class="label">Restaurante:</span> ${client.restaurant_name}</div>
                <div class="data-row"><span class="label">Email:</span> ${client.email}</div>
                <div class="data-row"><span class="label">Teléfono:</span> ${client.phone_country_code} ${client.phone}</div>
                <div class="data-row"><span class="label">WhatsApp:</span> ${client.whatsapp_country_code} ${client.whatsapp}</div>
              </div>

              <div class="data-section">
                <h3>Dominios y Acceso</h3>
                <div class="data-row"><span class="label">Subdominio:</span> ${client.subdomain}.mirestaurante.online</div>
                <div class="data-row"><span class="label">Dominio Personalizado:</span> ${client.domain || 'No especificado'}</div>
                <div class="data-row"><span class="label">Panel:</span> https://${client.subdomain}.mirestaurante.online/login</div>
              </div>

              <div class="data-section">
                <h3>Suscripción</h3>
                <div class="data-row"><span class="label">Plan:</span> ${client.plan_type}</div>
                <div class="data-row"><span class="label">Estado:</span> ${client.subscription_status}</div>
                <div class="data-row"><span class="label">Estado Pago:</span> ${client.payment_status}</div>
                <div class="data-row"><span class="label">Precio Básico:</span> S/ ${client.locked_basic_price || 'No especificado'}</div>
                <div class="data-row"><span class="label">Precio Avanzado:</span> S/ ${client.locked_advanced_price || 'No especificado'}</div>
              </div>

              <div class="data-section">
                <h3>Ubicación</h3>
                <div class="data-row"><span class="label">Dirección:</span> ${client.address || 'No especificada'}</div>
                <div class="data-row"><span class="label">País:</span> ${client.country_code}</div>
                <div class="data-row"><span class="label">Zona Horaria:</span> ${client.timezone}</div>
              </div>

              <div class="data-section">
                <h3>Datos Fiscales</h3>
                <div class="data-row"><span class="label">RUC:</span> ${client.ruc || 'No especificado'}</div>
                <div class="data-row"><span class="label">Razón Social:</span> ${client.razon_social || 'No especificada'}</div>
              </div>

              <div class="data-section">
                <h3>Configuración</h3>
                <div class="data-row"><span class="label">Horarios:</span> ${client.opening_hours ? 'Configurados' : 'No configurados'}</div>
                <div class="data-row"><span class="label">Redes Sociales:</span> ${client.social_media_links ? JSON.stringify(client.social_media_links) : 'No configuradas'}</div>
                <div class="data-row"><span class="label">Delivery:</span> ${client.delivery ? JSON.stringify(client.delivery) : 'No configurado'}</div>
              </div>

              <div class="data-section">
                <h3>Acciones Requeridas</h3>
                <div class="data-row">✅ Verificar toda la información</div>
                <div class="data-row">✅ Preparar el sitio web</div>
                <div class="data-row">✅ Activar sitio (cambiar is_deactivated a false)</div>
                <div class="data-row">✅ Enviar email de sitio en vivo</div>
              </div>
            </div>
          </body>
        </html>
      `;

      await resend.emails.send({
        from: 'MiRestaurante Sistema <noreply@mirestaurante.online>',
        to: ['soporte@mirestaurante.online'],
        subject: `🆕 Nuevo Cliente: ${client.restaurant_name} (${client.subdomain})`,
        html: adminHtml,
      });

      console.log('Internal notification sent to admin team');
    } catch (emailError) {
      console.error('Error sending internal notification:', emailError);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Signup completed successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in complete-signup function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});