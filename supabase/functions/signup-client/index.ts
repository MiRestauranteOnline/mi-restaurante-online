import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SignupRequest {
  email: string;
  password: string;
  restaurantName: string;
  subdomain: string;
  phone: string;
  phone_country_code?: string;
  whatsapp_country_code?: string;
  paymentId?: string;
  customDomain?: string;
  referralSource?: string;
  address?: string;
  ruc?: string;
  razonSocial?: string;
  locked_basic_price?: number;
  locked_advanced_price?: number;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Signup client function called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const reqBody: any = await req.json();
    const {
      email,
      password,
      restaurantName,
      subdomain,
      phone,
      phone_country_code,
      whatsapp_country_code,
      paymentId,
      customDomain,
      referralSource,
      address,
      ruc,
      razonSocial,
      locked_basic_price,
      locked_advanced_price
    } = reqBody;

    const signupFormData = reqBody.signupFormData;
    const websiteRequirements = reqBody.websiteRequirements as any;

    console.log('Creating user for:', email, 'with subdomain:', subdomain);

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Check if subdomain is already taken
    const { data: existingClient } = await supabaseAdmin
      .from('clients')
      .select('id')
      .eq('subdomain', subdomain.toLowerCase())
      .single();

    if (existingClient) {
      return new Response(
        JSON.stringify({ success: false, error: 'El subdominio ya está en uso' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if email is already registered
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const emailExists = existingUser.users.some(user => user.email === email);

    if (emailExists) {
      return new Response(
        JSON.stringify({ success: false, error: 'El email ya está registrado' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create user using admin API
    const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createUserError || !newUser.user) {
      console.error('Error creating user:', createUserError);
      return new Response(
        JSON.stringify({ success: false, error: 'Error al crear el usuario', details: createUserError?.message }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User created successfully:', newUser.user.id);

    // Create client record with proper initial dates
    const now = new Date();
    const subscriptionEndDate = new Date(now);
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .insert({
        restaurant_name: restaurantName,
        subdomain: subdomain.toLowerCase(),
        phone: phone,
        whatsapp: phone,
        phone_country_code: phone_country_code || '+51',
        whatsapp_country_code: whatsapp_country_code || '+51',
        email: email,
        domain: customDomain || null,
        address: address || null,
        ruc: ruc || null,
        razon_social: razonSocial || null,
        locked_basic_price: locked_basic_price || null,
        locked_advanced_price: locked_advanced_price || null,
        subscription_status: 'pending',
        subscription_start_date: now.toISOString(),
        subscription_end_date: subscriptionEndDate.toISOString(),
        next_billing_date: subscriptionEndDate.toISOString(),
        other_customizations: {
          paymentId: paymentId || 'temp-payment-id',
          referralSource: referralSource || null,
        }
      })
      .select()
      .single();

    if (clientError) {
      console.error('Error creating client:', clientError);
      
      // Clean up created user if client creation fails
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      
      return new Response(
        JSON.stringify({ success: false, error: 'Error al crear el cliente', details: clientError.message }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Client created successfully:', client.id);

    // Link user to client
    const { error: linkError } = await supabaseAdmin
      .from('user_clients')
      .insert({
        user_id: newUser.user.id,
        client_id: client.id,
        role: 'owner'
      });

    if (linkError) {
      console.error('Error linking user to client:', linkError);
      
      // Clean up created records if linking fails
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      await supabaseAdmin.from('clients').delete().eq('id', client.id);
      
      return new Response(
        JSON.stringify({ success: false, error: 'Error al vincular usuario con cliente', details: linkError.message }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Add client_owner role to the user
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: newUser.user.id,
        role: 'client_owner'
      });

    if (roleError) {
      console.error('Error adding role to user:', roleError);
      // Don't fail the entire operation for this, just log it
    }

    console.log('Client signup completed successfully');

    // Send account creation confirmation email
    try {
      const resend = new Resend(Deno.env.get('RESEND_API_KEY')!);
      
      const loginUrl = `https://mirestaurante.online/registro`;
      
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
              .details-box { background-color: #f8fafc; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 24px 0; }
              .button { display: inline-block; background-color: #44a79b; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 24px 0; }
              .footer { color: #898989; font-size: 14px; text-align: center; margin-top: 32px; }
              .credentials { background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 24px 0; border: 2px solid #fbbf24; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>✅ ¡Cuenta Creada Exitosamente!</h1>
              <p>Hola ${restaurantName},</p>
              <p>¡Bienvenido a MiRestaurante.online! Tu cuenta ha sido creada correctamente.</p>
              
              <div class="success-box">
                <strong style="color: #065f46; font-size: 20px;">🎉 ¡Ya puedes continuar!</strong><br>
                <span style="color: #065f46; font-size: 16px;">Completa los pasos restantes para activar tu sitio web</span>
              </div>

              <div class="credentials">
                <strong>📧 Tus datos de acceso:</strong><br><br>
                <strong>Email:</strong> ${email}<br>
                <strong>Subdominio:</strong> ${subdomain}.mirestaurante.online<br><br>
                <em>Guarda esta información en un lugar seguro. La necesitarás para acceder a tu panel de control.</em>
              </div>

              <div class="details-box">
                <strong>📋 Próximos pasos:</strong><br><br>
                1️⃣ Completa la información de tu restaurante<br>
                2️⃣ Configura tus horarios de atención<br>
                3️⃣ Sube las imágenes de tu restaurante<br>
                4️⃣ Agrega preguntas frecuentes<br>
                5️⃣ Realiza el pago de tu suscripción
              </div>

              <p><strong>⚠️ Importante:</strong> Si algo interrumpe el proceso, puedes iniciar sesión en cualquier momento y continuar donde lo dejaste.</p>
              
              <div style="text-align: center;">
                <a href="${loginUrl}" class="button">Continuar Registro</a>
              </div>

              <p>¿Necesitas ayuda? Contáctanos en <a href="mailto:soporte@mirestaurante.online" style="color: #e11d48;">soporte@mirestaurante.online</a></p>

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
        to: [email],
        subject: '✅ Cuenta Creada - Completa tu Registro',
        html,
      });

      console.log('Account creation email sent to:', email);
    } catch (emailError) {
      console.error('Error sending account creation email:', emailError);
      // Don't fail signup if email fails
    }

    // Generate OTP for auto-login (bypasses CAPTCHA)
    // This creates a one-time token that can be used to establish a session
    let loginToken = null;
    try {
      const { data: otpData, error: otpError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: email,
      });

      if (!otpError && otpData?.properties?.hashed_token) {
        loginToken = {
          email: email,
          token_hash: otpData.properties.hashed_token,
          type: 'magiclink'
        };
        console.log('✅ Login token (magiclink token_hash) generated successfully for auto-login');
      } else {
        console.error('Failed to generate login token:', otpError);
      }
    } catch (tokenGenError) {
      console.error('Error generating login token:', tokenGenError);
    }

    // Auto-generate and store briefings right after signup
    try {
      const contentBriefing = `${websiteRequirements?.additionalInfo || ''}\n\nTipo de restaurante: ${websiteRequirements?.businessType || ''}\nPúblico objetivo: ${websiteRequirements?.targetAudience || ''}\nEstilo del sitio web: ${websiteRequirements?.websiteStyle || ''}`;
      const styleBriefing = `Estilo del sitio web: ${websiteRequirements?.websiteStyle || ''}\nInformación de marca: ${websiteRequirements?.brandInfo || 'No especificado'}\nLogo: ${(websiteRequirements?.logoUrl ? 'Proporcionado' : 'No proporcionado')}`;
      const contactDeliveryBriefing = `Nombre del restaurante: ${restaurantName}\nTeléfono: ${phone}\nEmail: ${email}\nDirección: ${address || ''}\nTiene delivery: ${websiteRequirements?.hasDelivery ? 'Sí' : 'No'}\nPlatformas de delivery: ${Object.entries(websiteRequirements?.deliveryPlatforms || {}).filter(([_, url]) => typeof url === 'string' && (url as string).trim()).map(([platform]) => platform).join(', ')}\nDelivery por WhatsApp/Teléfono: ${websiteRequirements?.deliveryPhoneWhatsapp || ''}\nRedes sociales: ${(websiteRequirements?.socialMedia || []).map((sm: any) => `${sm.platform}: ${sm.url}`).join(', ')}`;

      const { error: briefingsInvokeError } = await supabaseAdmin.functions.invoke('store-briefings', {
        body: {
          clientId: client.id, // pass UUID to avoid ambiguity
          contentBriefing,
          styleBriefing,
          contactDeliveryBriefing,
          signupData: {
            email,
            restaurantName,
            subdomain: subdomain.toLowerCase(),
            phone,
            address: address || null,
          },
          websiteRequirements,
          // IMPORTANT: avoid cascading failures during signup; branding can run later from dashboard
          skipBranding: true,
        },
      });

      if (briefingsInvokeError) {
        console.error('Error invoking store-briefings after signup:', briefingsInvokeError);
      } else {
        console.log('store-briefings invoked successfully after signup for client:', client.id);
      }
    } catch (postSignupBriefingError) {
      console.error('Failed to auto-store briefings after signup:', postSignupBriefingError);
    }

    // Auto-create Turnstile widget for the new client
    try {
      console.log('Creating Turnstile widget for client:', client.id);
      const { error: turnstileError } = await supabaseAdmin.functions.invoke('create-turnstile-widget', {
        body: { client_id: client.id },
      });

      if (turnstileError) {
        console.error('Error creating Turnstile widget after signup:', turnstileError);
      } else {
        console.log('Turnstile widget created successfully for client:', client.id);
      }
    } catch (turnstileCreateError) {
      console.error('Failed to create Turnstile widget after signup:', turnstileCreateError);
      // Don't fail the signup if Turnstile creation fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: newUser.user.id,
          email: newUser.user.email
        },
        client: {
          id: client.id,
          restaurant_name: client.restaurant_name,
          subdomain: client.subdomain
        },
        loginToken: loginToken // Include OTP token for auto-login
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Unexpected error in signup-client function:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Error interno del servidor', details: error.message }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};

serve(handler);