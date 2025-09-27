import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreatePlansRequest {
  action: 'create_plans' | 'get_plans';
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Rebill plans management function called');

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
    const { action }: CreatePlansRequest = await req.json();

    // Get Rebill API key from environment
    const rebillApiKey = Deno.env.get('REBILL_API_KEY');
    
    if (!rebillApiKey) {
      return new Response(
        JSON.stringify({ error: 'Rebill API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'create_plans') {
      console.log('Creating Rebill subscription plans...');

      // Plan Básico - S/297/mes
      const basicPlanResponse = await fetch('https://api.rebill.com/v1/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${rebillApiKey}`,
        },
        body: JSON.stringify({
          name: 'Plan Básico - Mi Restaurante Online',
          description: 'Sitio web profesional para restaurantes - Plan Básico',
          amount: 29700, // S/297 in centavos
          currency: 'PEN', // Peruvian Sol
          interval: 'month',
          interval_count: 1,
          trial_period_days: 0,
          metadata: {
            plan_type: 'basic',
            features: JSON.stringify([
              'Sitio profesional en 72 horas',
              'Hosting + SSL incluido',
              'SEO básico optimizado',
              'Botón WhatsApp integrado',
              'Menú descargable en PDF',
              'Cambios auto-gestionables (PIN)',
              'Soporte por WhatsApp',
              'Hasta 3,000 visitas/mes o 6 GB'
            ])
          }
        }),
      });

      // Plan Avanzado - S/497/mes  
      const advancedPlanResponse = await fetch('https://api.rebill.com/v1/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${rebillApiKey}`,
        },
        body: JSON.stringify({
          name: 'Plan Avanzado - Mi Restaurante Online',
          description: 'Sitio web profesional para restaurantes - Plan Avanzado',
          amount: 49700, // S/497 in centavos
          currency: 'PEN', // Peruvian Sol
          interval: 'month',
          interval_count: 1,
          trial_period_days: 0,
          metadata: {
            plan_type: 'advanced',
            features: JSON.stringify([
              'Todo lo del Plan Básico',
              '1 hora/mes de cambios extendidos',
              'Cambios de textos e imágenes',
              'Nuevas secciones personalizadas',
              'Soporte prioritario'
            ])
          }
        }),
      });

      if (!basicPlanResponse.ok || !advancedPlanResponse.ok) {
        const basicError = await basicPlanResponse.text();
        const advancedError = await advancedPlanResponse.text();
        console.error('Rebill API errors:', { basicError, advancedError });
        
        return new Response(
          JSON.stringify({ 
            error: 'Failed to create plans', 
            details: { basicError, advancedError }
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const basicPlan = await basicPlanResponse.json();
      const advancedPlan = await advancedPlanResponse.json();

      console.log('Plans created successfully:', {
        basic: basicPlan.id,
        advanced: advancedPlan.id
      });

      return new Response(
        JSON.stringify({
          success: true,
          plans: {
            basic: {
              id: basicPlan.id,
              name: basicPlan.name,
              amount: basicPlan.amount,
              currency: basicPlan.currency
            },
            advanced: {
              id: advancedPlan.id,
              name: advancedPlan.name,
              amount: advancedPlan.amount,
              currency: advancedPlan.currency
            }
          }
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );

    } else if (action === 'get_plans') {
      // Get existing plans
      const plansResponse = await fetch('https://api.rebill.com/v1/plans', {
        headers: {
          'Authorization': `Bearer ${rebillApiKey}`,
        },
      });

      if (!plansResponse.ok) {
        const errorData = await plansResponse.text();
        console.error('Rebill API error:', errorData);
        return new Response(
          JSON.stringify({ error: 'Failed to get plans', details: errorData }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const plans = await plansResponse.json();
      
      return new Response(
        JSON.stringify({
          success: true,
          plans: plans.data || plans
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Unexpected error in rebill-plans function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};

serve(handler);