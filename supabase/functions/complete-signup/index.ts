import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

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

    // Mark signup completed
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