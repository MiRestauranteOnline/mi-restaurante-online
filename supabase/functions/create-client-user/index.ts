import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateClientUserRequest {
  email: string;
  password: string;
  restaurantName: string;
  subdomain: string;
  phone?: string;
  address?: string;
  whatsapp?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Create client user function called');

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
    // Check if user is admin
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has admin role using security definer function to bypass RLS safely
    const { data: isAdmin, error: roleCheckError } = await supabaseClient.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (roleCheckError) {
      console.error('Role check error:', roleCheckError);
      return new Response(
        JSON.stringify({ error: 'Role check failed' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!isAdmin) {
      console.error('User is not admin');
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const {
      email,
      password,
      restaurantName,
      subdomain,
      phone,
      address,
      whatsapp
    }: CreateClientUserRequest = await req.json();

    console.log('Creating user for:', email);

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

    // Create user using admin API (bypasses email confirmation)
    const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // This bypasses email confirmation
    });

    if (createUserError) {
      console.error('Error creating user:', createUserError);
      return new Response(
        JSON.stringify({ error: 'Failed to create user', details: createUserError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!newUser.user) {
      return new Response(
        JSON.stringify({ error: 'Failed to create user - no user returned' }),
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
        phone,
        address,
        whatsapp,
        email
      })
      .select()
      .single();

    if (clientError) {
      console.error('Error creating client:', clientError);
      
      // Clean up created user if client creation fails
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      
      return new Response(
        JSON.stringify({ error: 'Failed to create client', details: clientError.message }),
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
        JSON.stringify({ error: 'Failed to link user to client', details: linkError.message }),
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

    console.log('Client user created successfully');

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
        credentials: {
          email,
          password // In production, you might want to send this via secure channel
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Unexpected error in create-client-user function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};

serve(handler);