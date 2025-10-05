import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { createHmac } from "node:crypto";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const handler = async (req: Request): Promise<Response> => {
  try {
    console.log("Izipay webhook received");

    // Get the raw body for signature verification
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);

    console.log("Webhook body:", JSON.stringify(body, null, 2));

    // Verify webhook signature using HMAC-SHA-256
    const signature = req.headers.get("kr-hash");
    const hmacKey = Deno.env.get("IZIPAY_HMAC_SHA_256_TEST");

    if (!hmacKey) {
      throw new Error("Missing HMAC key");
    }

    // Calculate expected signature
    const expectedSignature = createHmac("sha256", hmacKey)
      .update(rawBody)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("Invalid webhook signature");
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 401 }
      );
    }

    console.log("Webhook signature verified");

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract payment information
    const orderDetails = body.orderDetails;
    const orderId = orderDetails?.orderId;
    const transactionStatus = body.orderStatus;
    const amount = orderDetails?.orderTotalAmount;
    const currency = orderDetails?.orderCurrency;

    console.log("Payment details:", {
      orderId,
      transactionStatus,
      amount,
      currency,
    });

    // Update subscription status based on payment status
    if (transactionStatus === "PAID") {
      // Extract client_id from order metadata
      const clientId = orderDetails?.metadata?.client_id;

      if (clientId) {
        // Update client subscription status
        const { error: updateError } = await supabase
          .from("clients")
          .update({
            subscription_status: "active",
            payment_status: "paid",
            subscription_start_date: new Date().toISOString(),
            subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", clientId);

        if (updateError) {
          console.error("Error updating client:", updateError);
          throw updateError;
        }

        console.log("Client subscription activated:", clientId);
      }
    } else if (transactionStatus === "REFUSED" || transactionStatus === "CANCELLED") {
      const clientId = orderDetails?.metadata?.client_id;

      if (clientId) {
        const { error: updateError } = await supabase
          .from("clients")
          .update({
            payment_status: "failed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", clientId);

        if (updateError) {
          console.error("Error updating client:", updateError);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in izipay-webhook function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
