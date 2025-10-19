import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const defaultFaviconUrl = 'https://storage.googleapis.com/gpt-engineer-file-uploads/OiOFvHbbnNe6vX3A3rn8oURdWx83/uploads/1759266175780-Mi Restaurante Online Favicon.png';

    console.log('Updating clients with NULL favicon_url...');

    // Update all clients where favicon_url is NULL
    const { data, error } = await supabase
      .from('clients')
      .update({ favicon_url: defaultFaviconUrl })
      .is('favicon_url', null);

    if (error) {
      console.error('Error updating clients:', error);
      throw error;
    }

    console.log('Successfully updated clients with default favicon');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Default favicon updated successfully',
        data
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in update-default-favicon function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
