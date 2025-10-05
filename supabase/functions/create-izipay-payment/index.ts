import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const IZIPAY_API_URL = "https://api.micuentaweb.pe/api-payment/V4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  amount: number; // Amount in cents (e.g., 10000 = 100.00 PEN)
  currency: string; // ISO currency code (e.g., "PEN")
  orderId: string; // Unique order identifier
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
    console.log("Create Izipay payment function called");

    const { amount, currency, orderId, customer, metadata }: PaymentRequest = await req.json();

    // Get credentials from environment
    const shopId = Deno.env.get("IZIPAY_SHOP_ID");
    const testPassword = Deno.env.get("IZIPAY_TEST_PASSWORD");
    
    if (!shopId || !testPassword) {
      throw new Error("Missing Izipay credentials");
    }

    // Create Basic Auth header
    const auth = btoa(`${shopId}:${testPassword}`);

    // Prepare payment request
    const paymentData = {
      amount,
      currency,
      orderId,
      customer,
      metadata: metadata || {},
    };

    console.log("Creating payment session:", paymentData);

    // Call Izipay API to create payment session
    const response = await fetch(`${IZIPAY_API_URL}/Charge/CreatePayment`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    });

    const responseText = await response.text();
    console.log("Izipay API response:", responseText);

    if (!response.ok) {
      throw new Error(`Izipay API error: ${response.status} - ${responseText}`);
    }

    const result = JSON.parse(responseText);

    // Izipay returns 200 with an internal status. Validate it.
    if (result.status !== "SUCCESS" || !result?.answer?.formToken) {
      console.error("Izipay reported error:", result?.answer);
      return new Response(
        JSON.stringify({
          success: false,
          errorCode: result?.answer?.errorCode,
          errorMessage: result?.answer?.errorMessage,
          detailedErrorMessage: result?.answer?.detailedErrorMessage,
          ticket: result?.ticket,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        formToken: result.answer.formToken,
        orderId: result.answer.orderId,
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
    console.error("Error in create-izipay-payment function:", error);
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
