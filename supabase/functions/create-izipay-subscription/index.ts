import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const IZIPAY_API_URL = "https://api.micuentaweb.pe/api-payment/V4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubscriptionRequest {
  amount: number; // Monthly amount in cents
  currency: string; // ISO currency code (e.g., "PEN")
  subscriptionId: string; // Unique subscription identifier
  effectDate: string; // Start date in ISO 8601 format
  rrule: string; // Recurrence rule (e.g., "RRULE:FREQ=MONTHLY;COUNT=12")
  paymentMethodToken: string; // Payment method token from initial payment
  customer: {
    email: string;
    reference?: string;
  };
  metadata?: Record<string, any>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Create Izipay subscription function called");

    const {
      amount,
      currency,
      subscriptionId,
      effectDate,
      rrule,
      paymentMethodToken,
      customer,
      metadata,
    }: SubscriptionRequest = await req.json();

    // Get credentials from environment
    const shopId = Deno.env.get("IZIPAY_SHOP_ID");
    const testPassword = Deno.env.get("IZIPAY_TEST_PASSWORD");
    
    if (!shopId || !testPassword) {
      throw new Error("Missing Izipay credentials");
    }

    // Create Basic Auth header
    const auth = btoa(`${shopId}:${testPassword}`);

    // Prepare subscription request
    const subscriptionData = {
      amount,
      currency,
      subscriptionId,
      effectDate,
      rrule,
      paymentMethodToken,
      customer,
      metadata: metadata || {},
    };

    console.log("Creating subscription:", subscriptionData);

    // Call Izipay API to create subscription
    const response = await fetch(`${IZIPAY_API_URL}/Charge/CreateSubscription`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscriptionData),
    });

    const responseText = await response.text();
    console.log("Izipay API response:", responseText);

    if (!response.ok) {
      throw new Error(`Izipay API error: ${response.status} - ${responseText}`);
    }

    const result = JSON.parse(responseText);

    return new Response(
      JSON.stringify({
        success: true,
        subscription: result.answer,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in create-izipay-subscription function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
