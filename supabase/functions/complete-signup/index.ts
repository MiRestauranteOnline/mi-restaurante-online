import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Complete signup function called');

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role to bypass RLS for validation
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Initialize regular client to verify user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      console.error('User authentication failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated user:', user.id);

    // Get the client associated with this user
    const { data: userClient, error: clientLinkError } = await supabaseAdmin
      .from('user_clients')
      .select('client_id')
      .eq('user_id', user.id)
      .single();

    if (clientLinkError || !userClient) {
      console.error('Client link not found:', clientLinkError);
      return new Response(
        JSON.stringify({ error: 'Client not found for user' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const clientId = userClient.client_id;
    console.log('Found client:', clientId);

    // Fetch the client with all necessary data
    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      console.error('Client fetch failed:', clientError);
      return new Response(
        JSON.stringify({ error: 'Client data not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate all required steps are completed
    const validationErrors: string[] = [];

    // Step 1: Account created (implicit - user exists)
    // Step 2: Payment completed
    if (client.subscription_status !== 'active') {
      validationErrors.push('Payment not completed - subscription is not active');
    }

    // Step 3: Opening hours configured
    if (!client.opening_hours || Object.keys(client.opening_hours).length === 0) {
      validationErrors.push('Opening hours not configured');
    }

    // Step 4: Images uploaded (check carousel_images)
    const { data: images, error: imagesError } = await supabaseAdmin
      .from('carousel_images')
      .select('id')
      .eq('client_id', clientId)
      .eq('is_active', true);

    if (imagesError || !images || images.length === 0) {
      validationErrors.push('No carousel images uploaded');
    }

    // Step 5: FAQs added
    const { data: faqs, error: faqsError } = await supabaseAdmin
      .from('faqs')
      .select('id')
      .eq('client_id', clientId)
      .eq('is_active', true);

    if (faqsError || !faqs || faqs.length === 0) {
      validationErrors.push('No FAQs added');
    }

    // If there are validation errors, return them
    if (validationErrors.length > 0) {
      console.error('Signup validation failed:', validationErrors);
      return new Response(
        JSON.stringify({
          error: 'Signup not complete',
          validation_errors: validationErrors,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // All validations passed - mark signup as completed
    console.log('All validations passed, marking signup as completed');

    const { error: updateError } = await supabaseAdmin
      .from('clients')
      .update({ signup_completed: true })
      .eq('id', clientId);

    if (updateError) {
      console.error('Failed to update signup_completed:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to complete signup' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Signup completed successfully for client:', clientId);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Signup completed successfully',
      }),
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
