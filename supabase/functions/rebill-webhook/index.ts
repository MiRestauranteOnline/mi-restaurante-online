import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RebillWebhookPayload {
  event_type: string;
  data: {
    id: string;
    status: string;
    amount: number;
    currency: string;
    customer: {
      email: string;
      name: string;
    };
    metadata: {
      signup_data: string;
      website_requirements: string;
    };
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Rebill webhook called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Verify webhook signature (implement Rebill signature verification)
    // const signature = req.headers.get('x-rebill-signature');
    // if (!verifyRebillSignature(signature, body)) {
    //   return new Response('Unauthorized', { status: 401 });
    // }

    const payload: RebillWebhookPayload = await req.json();
    console.log('Webhook payload:', payload);

    // Only process successful payments
    if (payload.event_type !== 'payment.success') {
      return new Response(
        JSON.stringify({ message: 'Event not processed' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse signup data from metadata
    const signupData = JSON.parse(payload.data.metadata.signup_data);
    const websiteRequirements = JSON.parse(payload.data.metadata.website_requirements);

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Create user using admin API
    const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: signupData.email,
      password: signupData.password,
      email_confirm: true,
    });

    if (createUserError || !newUser.user) {
      console.error('Error creating user:', createUserError);
      return new Response(
        JSON.stringify({ error: 'Failed to create user' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse plan type from metadata or default to basic
    const planType = websiteRequirements.plan_type || 'basic';
    const currentDate = new Date().toISOString();
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

    // Create client record with subscription information
    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .insert({
        restaurant_name: signupData.restaurantName,
        subdomain: signupData.subdomain.toLowerCase(),
        phone: signupData.phone,
        whatsapp: signupData.phone,
        email: signupData.email,
        payment_id: payload.data.id,
        website_requirements: websiteRequirements,
        plan_type: planType,
        subscription_status: 'active',
        payment_status: 'paid',
        subscription_start_date: currentDate,
        subscription_end_date: subscriptionEndDate.toISOString(),
        next_billing_date: subscriptionEndDate.toISOString(),
        rebill_subscription_id: payload.data.id,
        rebill_customer_id: payload.data.customer.email,
      })
      .select()
      .single();

    if (clientError) {
      console.error('Error creating client:', clientError);
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      return new Response(
        JSON.stringify({ error: 'Failed to create client' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Link user to client
    const { error: linkError } = await supabaseAdmin
      .from('user_clients')
      .insert({
        user_id: newUser.user.id,
        client_id: client.id,
        role: 'owner'
      });

    if (linkError) {
      console.error('Error linking user to client:', linkError);
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      await supabaseAdmin.from('clients').delete().eq('id', client.id);
      return new Response(
        JSON.stringify({ error: 'Failed to link user to client' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Add client_owner role
    await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: newUser.user.id,
        role: 'client_owner'
      });

    console.log('Client account created successfully via webhook');

    return new Response(
      JSON.stringify({ 
        success: true,
        client_id: client.id,
        user_id: newUser.user.id 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);