import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { sourceClientId, targetClientIds } = await req.json();

    if (!sourceClientId || !targetClientIds || !Array.isArray(targetClientIds)) {
      throw new Error('sourceClientId and targetClientIds array are required');
    }

    console.log(`Copying data from ${sourceClientId} to ${targetClientIds.join(', ')}`);

    const results: any = {};

    for (const targetClientId of targetClientIds) {
      console.log(`\nCopying to client: ${targetClientId}`);

      // Copy admin_content
      const { data: adminContent } = await supabase
        .from('admin_content')
        .select('*')
        .eq('client_id', sourceClientId)
        .single();

      if (adminContent) {
        const { client_id, id, created_at, updated_at, ...contentData } = adminContent;
        await supabase.from('admin_content').upsert({
          ...contentData,
          client_id: targetClientId,
        });
        console.log('✓ Copied admin_content');
      }

      // Copy client_settings
      const { data: settings } = await supabase
        .from('client_settings')
        .select('*')
        .eq('client_id', sourceClientId)
        .single();

      if (settings) {
        const { client_id, id, created_at, updated_at, ...settingsData } = settings;
        await supabase.from('client_settings').upsert({
          ...settingsData,
          client_id: targetClientId,
        });
        console.log('✓ Copied client_settings');
      }

      // Copy menu_categories
      const { data: categories } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('client_id', sourceClientId);

      const categoryMapping: Record<string, string> = {};
      if (categories) {
        for (const category of categories) {
          const { client_id, id, created_at, updated_at, ...catData } = category;
          const { data: newCat } = await supabase.from('menu_categories').insert({
            ...catData,
            client_id: targetClientId,
          }).select().single();
          if (newCat) {
            categoryMapping[id] = newCat.id;
          }
        }
        console.log(`✓ Copied ${categories.length} menu_categories`);
      }

      // Copy menu_items
      const { data: menuItems } = await supabase
        .from('menu_items')
        .select('*')
        .eq('client_id', sourceClientId);

      if (menuItems) {
        for (const item of menuItems) {
          const { client_id, id, created_at, updated_at, category_id, ...itemData } = item;
          await supabase.from('menu_items').insert({
            ...itemData,
            client_id: targetClientId,
            category_id: categoryMapping[category_id] || category_id,
          });
        }
        console.log(`✓ Copied ${menuItems.length} menu_items`);
      }

      // Copy team_members
      const { data: teamMembers } = await supabase
        .from('team_members')
        .select('*')
        .eq('client_id', sourceClientId);

      if (teamMembers) {
        for (const member of teamMembers) {
          const { client_id, id, created_at, updated_at, ...memberData } = member;
          await supabase.from('team_members').insert({
            ...memberData,
            client_id: targetClientId,
          });
        }
        console.log(`✓ Copied ${teamMembers.length} team_members`);
      }

      // Copy reviews
      const { data: reviews } = await supabase
        .from('reviews')
        .select('*')
        .eq('client_id', sourceClientId);

      if (reviews) {
        for (const review of reviews) {
          const { client_id, id, created_at, updated_at, ...reviewData } = review;
          await supabase.from('reviews').insert({
            ...reviewData,
            client_id: targetClientId,
          });
        }
        console.log(`✓ Copied ${reviews.length} reviews`);
      }

      // Copy faqs
      const { data: faqs } = await supabase
        .from('faqs')
        .select('*')
        .eq('client_id', sourceClientId);

      if (faqs) {
        for (const faq of faqs) {
          const { client_id, id, created_at, updated_at, ...faqData } = faq;
          await supabase.from('faqs').insert({
            ...faqData,
            client_id: targetClientId,
          });
        }
        console.log(`✓ Copied ${faqs.length} faqs`);
      }

      // Copy carousel_images
      const { data: carouselImages } = await supabase
        .from('carousel_images')
        .select('*')
        .eq('client_id', sourceClientId);

      if (carouselImages) {
        for (const image of carouselImages) {
          const { client_id, id, created_at, updated_at, ...imageData } = image;
          await supabase.from('carousel_images').insert({
            ...imageData,
            client_id: targetClientId,
          });
        }
        console.log(`✓ Copied ${carouselImages.length} carousel_images`);
      }

      // Copy client_images
      const { data: clientImages } = await supabase
        .from('client_images')
        .select('*')
        .eq('client_id', sourceClientId);

      if (clientImages) {
        for (const image of clientImages) {
          const { client_id, id, created_at, updated_at, uploaded_at, ...imageData } = image;
          await supabase.from('client_images').insert({
            ...imageData,
            client_id: targetClientId,
          });
        }
        console.log(`✓ Copied ${clientImages.length} client_images`);
      }

      results[targetClientId] = 'success';
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Data copied successfully from ${sourceClientId}`,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error copying client data:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
