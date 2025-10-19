import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clientId, pageType, fieldType } = await req.json();
    
    console.log(`Regenerating ${fieldType} for ${pageType} page of client ${clientId}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (!lovableApiKey) {
      console.error('Lovable API key not found in environment');
      throw new Error('Lovable API key not configured');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch client data
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('restaurant_name, address, subdomain')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      throw new Error(`Failed to fetch client: ${clientError?.message}`);
    }

    // Fetch existing admin_content for context
    const { data: adminContent } = await supabase
      .from('admin_content')
      .select('*')
      .eq('client_id', clientId)
      .maybeSingle();

    // Create page-specific context
    const pageContext = getPageContext(pageType, client, adminContent);

    let prompt = '';
    if (fieldType === 'title') {
      prompt = `Generate an SEO-optimized meta title for the ${pageType} page of ${client.restaurant_name}.

Context: ${pageContext}

Requirements:
- Maximum 57 characters (hard limit: 60)
- Include: type of cuisine, location, restaurant name (where it makes sense)
- Keyword-rich and descriptive
- Natural and compelling
- Example structure: "Best [Cuisine] in [Location] | [Restaurant Name]"

Return ONLY the meta title, no explanations.`;
    } else {
      prompt = `Generate an SEO-optimized meta description for the ${pageType} page of ${client.restaurant_name}.

Context: ${pageContext}

Requirements:
- Maximum 155 characters (strict limit)
- Include main keyword naturally
- Use ALL CAPS or emojis (✓, ➤, ★) to highlight benefits
- Add urgency or curiosity: "See why thousands choose...", "Limited spots available"
- Compelling call-to-action
- Example: "★ AUTHENTIC Indian Cuisine ★ Fresh ingredients daily. Experience flavors that transport you. Reserve your table NOW!"

Return ONLY the meta description, no explanations.`;
    }

    // Call Lovable AI Gateway (Gemini) to regenerate
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert SEO copywriter specializing in restaurant marketing. Generate compelling, keyword-rich metadata that drives clicks while staying within character limits.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI Gateway full response:', JSON.stringify(data, null, 2));
    
    const generatedText = data.choices?.[0]?.message?.content?.trim();
    
    if (!generatedText) {
      console.error('Empty or invalid response from AI Gateway');
      throw new Error('Generated text is empty');
    }
    
    console.log(`Successfully generated ${fieldType}:`, generatedText);

    const responseData = fieldType === 'title' 
      ? { success: true, title: generatedText }
      : { success: true, description: generatedText };
    
    console.log('Sending response:', responseData);

    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in regenerate-page-metadata:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function getPageContext(pageType: string, client: any, adminContent: any): string {
  const baseContext = `Restaurant: ${client.restaurant_name}, Location: ${client.address || 'Peru'}`;
  
  switch (pageType) {
    case 'home':
      return `${baseContext}. This is the main landing page showcasing the restaurant's unique value proposition and main offerings.`;
    case 'about':
      return `${baseContext}. Page about the restaurant's story, mission, and team. ${adminContent?.about_story || ''}`;
    case 'menu':
      return `${baseContext}. Full menu page displaying all dishes and categories. Culinary offerings and specialties.`;
    case 'contact':
      return `${baseContext}. Contact and reservation page. Location: ${client.address}, Website: ${client.subdomain}.mirestauranteonline.com`;
    case 'reviews':
      return `${baseContext}. Customer testimonials and reviews page showing social proof and customer satisfaction.`;
    default:
      return baseContext;
  }
}
