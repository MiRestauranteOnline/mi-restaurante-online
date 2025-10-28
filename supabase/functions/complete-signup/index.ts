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

    // Parse payload early (clientId, faqs)
    let payload: any = {};
    try {
      payload = await req.json();
    } catch {
      payload = {};
    }

    const authHeader = req.headers.get('Authorization');

    // Admin client (service role)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: { autoRefreshToken: false, persistSession: false },
      }
    );

    // Regular client (optional auth via Authorization header if present)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: { autoRefreshToken: false, persistSession: false },
        global: authHeader ? { headers: { Authorization: authHeader } } : undefined,
      }
    );

    // Resolve clientId: try authenticated user first, else require payload.clientId
    let resolvedClientId: string | null = null;

    if (authHeader) {
      const { data: userRes, error: userErr } = await supabaseClient.auth.getUser();
      if (!userErr && userRes?.user) {
        console.log('Authenticated user:', userRes.user.id);
        const { data: link, error: linkErr } = await supabaseAdmin
          .from('user_clients')
          .select('client_id')
          .eq('user_id', userRes.user.id)
          .maybeSingle();
        if (!linkErr && link?.client_id) {
          resolvedClientId = link.client_id;
        }
      } else if (userErr) {
        console.warn('Auth user not available, falling back to clientId from payload');
      }
    }

    if (!resolvedClientId) {
      if (payload?.clientId && typeof payload.clientId === 'string') {
        resolvedClientId = payload.clientId;
      } else {
        return new Response(
          JSON.stringify({ error: 'Missing client identifier' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const clientId = resolvedClientId;
    console.log('Using client:', clientId);

    // Fetch the client with all necessary data
    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .maybeSingle();

    if (clientError || !client) {
      console.error('Client fetch failed:', clientError);
      return new Response(
        JSON.stringify({ error: 'Client data not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate all required steps are completed
    const validationErrors: string[] = [];

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

    // Step 5: FAQs added (optionally insert from payload if not present)
    const incomingFaqs = Array.isArray(payload?.faqs) ? payload.faqs : [];

    if (incomingFaqs.length > 0) {
      const { data: existingFaqs } = await supabaseAdmin
        .from('faqs')
        .select('id')
        .eq('client_id', clientId)
        .eq('is_active', true);

      if (!existingFaqs || existingFaqs.length === 0) {
        const records = incomingFaqs
          .filter((f: any) => f?.question && f?.answer)
          .map((f: any) => ({
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