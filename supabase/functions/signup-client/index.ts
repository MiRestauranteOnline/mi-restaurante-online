import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

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
      address
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

    // Create client record
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
        }
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