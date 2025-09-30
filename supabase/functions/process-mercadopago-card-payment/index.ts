import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

interface PaymentRequest {
  token: string;
  payment_method_id?: string;
  issuer_id?: string;
  installments?: number;
  amount: number;
  description: string;
  payer: {
    email: string;
    first_name?: string;
    identification?: { type?: string; number?: string };
  };
  metadata?: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!accessToken) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN not configured');
    }

    const body: PaymentRequest = await req.json();

    if (!body?.token || !body?.amount || !body?.payer?.email) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const payload: any = {
      transaction_amount: Number(body.amount),
      token: body.token,
      description: body.description || 'Pago Mi Restaurante Online',
      installments: body.installments || 1,
      payment_method_id: body.payment_method_id,
      issuer_id: body.issuer_id,
      payer: {
        email: body.payer.email,
        first_name: body.payer.first_name || 'Cliente',
        identification: body.payer.identification || undefined,
      },
      metadata: body.metadata || {},
    };

    const resp = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify(payload),
    });

    const data = await resp.json();

    if (!resp.ok) {
      console.error('Mercado Pago payment error:', data);
      return new Response(JSON.stringify({ success: false, error: data?.message || 'Payment failed', details: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ success: true, payment: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('process-mercadopago-card-payment error:', error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
});