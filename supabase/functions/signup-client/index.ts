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
  paymentId?: string;
  customDomain?: string;
  referralSource?: string;
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
    const {
      email,
      password,
      restaurantName,
      subdomain,
      phone,
      paymentId,
      customDomain,
      referralSource
    }: SignupRequest = await req.json();

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
        JSON.stringify({ error: 'El subdominio ya está en uso' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if email is already registered
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const emailExists = existingUser.users.some(user => user.email === email);

    if (emailExists) {
      return new Response(
        JSON.stringify({ error: 'El email ya está registrado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        JSON.stringify({ error: 'Error al crear el usuario', details: createUserError?.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        email: email,
        domain: customDomain || null,
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
        JSON.stringify({ error: 'Error al crear el cliente', details: clientError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        JSON.stringify({ error: 'Error al vincular usuario con cliente', details: linkError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
      JSON.stringify({ error: 'Error interno del servidor', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};

serve(handler);