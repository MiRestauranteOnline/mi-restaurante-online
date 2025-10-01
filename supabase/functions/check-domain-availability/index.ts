// Domain availability checker edge function
// Public (no JWT). Uses service role to safely check the database without exposing data.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function cleanDomain(raw: string) {
  return (raw || '')
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .trim();
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain } = await req.json().catch(() => ({ domain: '' }));
    const cleaned = cleanDomain(domain);

    console.log('[check-domain-availability] Input:', domain, '→ Cleaned:', cleaned);

    if (!cleaned || !cleaned.includes('.')) {
      console.log('[check-domain-availability] Invalid domain (too short or no dot)');
      return new Response(
        JSON.stringify({ error: 'Invalid domain', exists: false }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    console.log('[check-domain-availability] Querying DB for domain:', cleaned);

    // Query with select to actually get the data
    const { data: existingDomains, error } = await supabase
      .from('clients')
      .select('id, domain')
      .eq('domain', cleaned);

    if (error) {
      console.error('[check-domain-availability] DB error:', error.message, error.code);
      return new Response(
        JSON.stringify({ error: 'db_error', exists: false }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const exists = existingDomains && existingDomains.length > 0;
    console.log('[check-domain-availability] Result: data =', existingDomains, '→ exists =', exists);

    return new Response(
      JSON.stringify({ exists, domain: cleaned }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (e) {
    console.error('[check-domain-availability] Unexpected error:', e);
    return new Response(
      JSON.stringify({ error: 'unexpected_error', exists: false }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});