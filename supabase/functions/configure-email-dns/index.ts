import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailDNSRequest {
  requestId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const cloudflareApiToken = Deno.env.get("CLOUDFLARE_API_TOKEN")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { requestId }: EmailDNSRequest = await req.json();

    console.log("Processing email DNS configuration request:", requestId);

    // Get the request details
    const { data: request, error: requestError } = await supabase
      .from("email_dns_requests")
      .select(`
        *,
        clients (
          custom_domain,
          cloudflare_zone_id
        )
      `)
      .eq("id", requestId)
      .single();

    if (requestError || !request) {
      console.error("Request not found:", requestError);
      return new Response(
        JSON.stringify({ error: "Request not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const client = request.clients;
    
    if (!client.cloudflare_zone_id) {
      await supabase
        .from("email_dns_requests")
        .update({
          status: "failed",
          error_message: "Cloudflare Zone ID not configured for this domain",
          processed_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      return new Response(
        JSON.stringify({ error: "Cloudflare Zone ID not configured" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Update status to processing
    await supabase
      .from("email_dns_requests")
      .update({ status: "processing" })
      .eq("id", requestId);

    console.log("Creating DNS records for zone:", client.cloudflare_zone_id);

    // Create DNS records in Cloudflare
    const zoneId = client.cloudflare_zone_id;
    const cfHeaders = {
      "Authorization": `Bearer ${cloudflareApiToken}`,
      "Content-Type": "application/json",
    };

    const dnsRecords = [
      // MX Record 1
      {
        type: "MX",
        name: "@",
        content: request.mx1_record,
        priority: request.mx1_priority,
        ttl: 1, // Auto
      },
      // MX Record 2
      {
        type: "MX",
        name: "@",
        content: request.mx2_record,
        priority: request.mx2_priority,
        ttl: 1, // Auto
      },
      // SPF Record
      {
        type: "TXT",
        name: "@",
        content: request.spf_record,
        ttl: 1,
      },
      // DKIM Record
      {
        type: "TXT",
        name: request.dkim_selector,
        content: request.dkim_value,
        ttl: 1,
      },
    ];

    const errors: string[] = [];

    for (const record of dnsRecords) {
      try {
        const response = await fetch(
          `https://api.cloudflare.com/v4/zones/${zoneId}/dns_records`,
          {
            method: "POST",
            headers: cfHeaders,
            body: JSON.stringify(record),
          }
        );

        const result = await response.json();

        if (!result.success) {
          console.error("Failed to create DNS record:", record.type, result.errors);
          errors.push(`${record.type} (${record.name}): ${result.errors[0]?.message || "Unknown error"}`);
        } else {
          console.log("Successfully created DNS record:", record.type, record.name);
        }
      } catch (error) {
        console.error("Error creating DNS record:", record.type, error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        errors.push(`${record.type} (${record.name}): ${errorMessage}`);
      }
    }

    // Update request status
    if (errors.length > 0) {
      await supabase
        .from("email_dns_requests")
        .update({
          status: "failed",
          error_message: errors.join("; "),
          processed_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      return new Response(
        JSON.stringify({ error: "Some DNS records failed to create", details: errors }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Success
    await supabase
      .from("email_dns_requests")
      .update({
        status: "completed",
        error_message: null,
        processed_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    console.log("Email DNS configuration completed successfully");

    return new Response(
      JSON.stringify({ success: true, message: "DNS records configured successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in configure-email-dns function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
