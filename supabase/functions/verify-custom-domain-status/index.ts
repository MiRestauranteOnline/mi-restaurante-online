import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { Resend } from 'https://esm.sh/resend@4.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { clientId } = await req.json();

    if (!clientId) {
      throw new Error('Missing required field: clientId');
    }

    // Get client's custom domain and details
    const { data: client, error: clientError } = await supabaseClient
      .from('clients')
      .select('custom_domain, restaurant_name, email, subdomain, domain_verified')
      .eq('id', clientId)
      .single();

    if (clientError || !client?.custom_domain) {
      throw new Error('No custom domain found for this client');
    }

    const customDomain = client.custom_domain;
    console.log(`Checking status for domain ${customDomain}`);

    // Check domain status in Cloudflare Pages
    const cfAccountId = Deno.env.get('CLOUDFLARE_ACCOUNT_ID');
    const cfApiToken = Deno.env.get('CLOUDFLARE_API_TOKEN');
    const cfProjectName = Deno.env.get('CLOUDFLARE_PAGES_PROJECT_NAME') || 'mi-restaurante-online';

    const cfResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/pages/projects/${cfProjectName}/domains/${customDomain}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${cfApiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const cfData = await cfResponse.json();
    console.log('Cloudflare domain status:', cfData);

    if (!cfResponse.ok) {
      throw new Error(`Cloudflare API error: ${cfData.errors?.[0]?.message || 'Unknown error'}`);
    }

    const domain = cfData.result;
    const isVerified = domain?.status === 'active';
    const sslStatus = domain?.ssl_status || 'pending';
    const wasVerified = client.domain_verified;

    // Update client record
    const { error: updateError } = await supabaseClient
      .from('clients')
      .update({
        domain_verified: isVerified,
        ssl_status: sslStatus,
        domain_verification_date: isVerified ? new Date().toISOString() : null,
        ssl_issued_date: sslStatus === 'active' ? new Date().toISOString() : null,
        last_domain_check: new Date().toISOString(),
      })
      .eq('id', clientId);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw updateError;
    }

    console.log(`Domain ${customDomain} - Verified: ${isVerified}, SSL: ${sslStatus}`);

    // Send email notification if status changed
    if (isVerified && !wasVerified) {
      // Domain just got verified - send success email
      try {
        const html = `<!DOCTYPE html><html><body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><h1>¡Tu Dominio Está Listo! 🎉</h1><p>Hola ${client.restaurant_name},</p><p>¡Excelentes noticias! Tu dominio personalizado <strong>${customDomain}</strong> ha sido verificado exitosamente.</p><p>Tu sitio web está disponible en: <a href="https://${customDomain}">${customDomain}</a></p><p><a href="https://mirestaurante.online/client/dashboard" style="background: #e11d48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Ver mi Panel</a></p></body></html>`;

        await resend.emails.send({
          from: 'MiRestaurante <info@mirestaurante.online>',
          to: [client.email],
          subject: `¡Tu dominio ${customDomain} está activo! 🎉`,
          html,
        });

        console.log('Domain verified email sent successfully');
      } catch (emailError) {
        console.error('Error sending domain verified email:', emailError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        domain: customDomain,
        verified: isVerified,
        ssl_status: sslStatus,
        status: domain?.status || 'pending',
        verification_errors: domain?.verification_errors || [],
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in verify-custom-domain-status:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
