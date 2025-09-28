import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      clientId, 
      contentBriefing, 
      styleBriefing, 
      contactDeliveryBriefing,
      signupData,
      websiteRequirements,
      menuData,
      reviewsData,
      teamData,
      openingHoursData,
      imagesData
    } = await req.json();

    if (!clientId || !contentBriefing) {
      throw new Error('Missing required briefing data');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Storing briefings for client:', clientId);
    console.log('Images data received:', JSON.stringify(imagesData, null, 2));

    // Resolve client by UUID or subdomain
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(clientId);
    let actualClientId = clientId;

    if (isUUID) {
      console.log('Looking up client by UUID');
      const { data: cById, error: eById } = await supabase
        .from('clients')
        .select('id')
        .eq('id', clientId)
        .single();
      if (eById || !cById) {
        console.error('Client not found by id:', eById);
        throw new Error('Client not found');
      }
      actualClientId = cById.id;
    } else {
      console.log('Looking up client by subdomain');
      const { data: cBySub, error: eBySub } = await supabase
        .from('clients')
        .select('id')
        .eq('subdomain', clientId)
        .single();
      if (eBySub || !cBySub) {
        console.error('Client not found by subdomain:', eBySub);
        throw new Error('Client not found');
      }
      actualClientId = cBySub.id;
    }

    // Store the briefings in admin_content
    const { error: briefingError } = await supabase
      .from('admin_content')
      .upsert({
        client_id: actualClientId,
        content_briefing: contentBriefing,
        style_briefing: styleBriefing || '',
        contact_delivery_briefing: contactDeliveryBriefing || ''
      }, {
        onConflict: 'client_id'
      });

    if (briefingError) {
      console.error('Error storing briefings:', briefingError);
      throw briefingError;
    }

    // Process and store client data if websiteRequirements and signupData are provided
    if (websiteRequirements && signupData) {
      console.log('Processing social media and delivery data for client:', actualClientId);
      
      // Process social media links
      const socialMediaLinks: Record<string, string> = {};
      if (websiteRequirements.socialMedia) {
        websiteRequirements.socialMedia.forEach((sm: any) => {
          if (sm.platform && sm.url) {
            const platform = sm.platform.toLowerCase().replace(/\s+/g, '').replace('(twitter)', '');
            let platformKey = platform;
            
            // Map platform names to expected keys
            if (platform === 'facebook') platformKey = 'facebook';
            else if (platform === 'instagram') platformKey = 'instagram';
            else if (platform === 'tiktok') platformKey = 'tiktok';
            else if (platform === 'x' || platform === 'twitter') platformKey = 'x';
            
            socialMediaLinks[platformKey] = sm.url;
          }
        });
      }

      // Process delivery platforms
      const deliveryData: Record<string, any> = {};
      if (websiteRequirements.deliveryPlatforms) {
        Object.entries(websiteRequirements.deliveryPlatforms).forEach(([platform, url]) => {
          if (url && typeof url === 'string' && url.trim()) {
            // Map platform names to match what the dashboard expects
            let platformKey = platform;
            if (platform === 'didifood') platformKey = 'didi_food';
            else if (platform === 'pedidosya') platformKey = 'pedidos_ya';
            else if (platform === 'rappi') platformKey = 'rappi';
            
            deliveryData[platformKey] = url.trim();
          }
        });
      }

      // Get existing client data to preserve current social media and delivery info
      const { data: existingClient } = await supabase
        .from('clients')
        .select('social_media_links, delivery')
        .eq('id', actualClientId)
        .single();

      // Update client with social media and delivery data only if not already set
      const clientUpdateData: any = {};
      if (Object.keys(socialMediaLinks).length > 0 && (!existingClient?.social_media_links || Object.keys(existingClient.social_media_links).length === 0)) {
        clientUpdateData.social_media_links = socialMediaLinks;
      }
      if (Object.keys(deliveryData).length > 0 && (!existingClient?.delivery || Object.keys(existingClient.delivery).length === 0)) {
        clientUpdateData.delivery = deliveryData;
      }
      
      // Also update address if provided
      if (signupData.address) {
        clientUpdateData.address = signupData.address;
      }

      if (Object.keys(clientUpdateData).length > 0) {
        const { error: clientUpdateError } = await supabase
          .from('clients')
          .update(clientUpdateData)
          .eq('id', actualClientId);

        if (clientUpdateError) {
          console.error('Error updating client data:', clientUpdateError);
          // Don't throw here, briefings were already stored successfully
        } else {
          console.log('Successfully updated client with social media and delivery data');
        }
      }

      // Store logo URL in admin_content if provided
      if (websiteRequirements.logoUrl) {
        const { error: logoUpdateError } = await supabase
          .from('admin_content')
          .upsert({
            client_id: actualClientId,
            header_logo_url: websiteRequirements.logoUrl,
            footer_logo_url: websiteRequirements.logoUrl,
            content_briefing: contentBriefing,
            style_briefing: styleBriefing || '',
            contact_delivery_briefing: contactDeliveryBriefing || ''
          }, {
            onConflict: 'client_id'
          });

        if (logoUpdateError) {
          console.error('Error updating admin_content with logo:', logoUpdateError);
        } else {
          console.log('Successfully updated admin_content with logo URL');
        }
      }
    }

    // Generate branding based on the style briefing
    if (styleBriefing) {
      console.log('Generating branding for client:', actualClientId);
      try {
        const brandingResponse = await supabase.functions.invoke('generate-branding', {
          body: {
            briefing: styleBriefing,
            clientId: actualClientId,
            restaurantName: signupData?.restaurantName || ''
          }
        });

        if (brandingResponse.error) {
          console.error('Error generating branding:', brandingResponse.error);
        } else {
          console.log('Successfully generated branding for client:', actualClientId);
        }
      } catch (brandingError) {
        console.error('Error calling generate-branding function:', brandingError);
        // Don't throw here, briefings were already stored successfully
      }
    }

    // Store menu categories and items if provided
    if (menuData?.categories?.length > 0) {
      console.log('Processing menu data for client:', actualClientId);
      
      for (const category of menuData.categories) {
        if (category.name?.trim()) {
          // Check if category already exists
          const { data: existingCategory } = await supabase
            .from('menu_categories')
            .select('id')
            .eq('client_id', actualClientId)
            .eq('name', category.name.trim())
            .single();

          if (existingCategory) {
            console.log('Category already exists:', category.name);
            continue;
          }

          const { data: categoryData, error: categoryError } = await supabase
            .from('menu_categories')
            .insert({
              client_id: actualClientId,
              name: category.name.trim(),
              is_active: true,
              display_order: 0
            })
            .select()
            .single();

          if (categoryError) {
            console.error('Error inserting category:', categoryError);
            continue;
          }

          console.log('Successfully created category:', categoryData.name);
        }
      }

      // Store menu items
      if (menuData.items?.length > 0) {
        for (const item of menuData.items) {
          if (item.name?.trim() && item.category?.trim()) {
            // Check if menu item already exists
            const { data: existingItem } = await supabase
              .from('menu_items')
              .select('id')
              .eq('client_id', actualClientId)
              .eq('name', item.name.trim())
              .single();

            if (existingItem) {
              console.log('Menu item already exists:', item.name);
              continue;
            }

            const { error: itemError } = await supabase
              .from('menu_items')
              .insert({
                client_id: actualClientId,
                name: item.name.trim(),
                description: item.description || '',
                price: parseFloat(item.price) || 0,
                category: item.category.trim(),
                image_url: item.imageUrl || null,
                is_active: true,
                show_on_homepage: false,
                show_image_menu: true,
                show_image_home: false
              });

            if (itemError) {
              console.error('Error inserting menu item:', itemError);
            } else {
              console.log('Successfully created menu item:', item.name);
            }
          }
        }
      }
    }

    // Store reviews if provided
    if (reviewsData?.reviews?.length > 0) {
      console.log('Processing reviews data for client:', actualClientId);
      
      for (let i = 0; i < reviewsData.reviews.length; i++) {
        const review = reviewsData.reviews[i];
        if (review.reviewerName?.trim() && review.reviewText?.trim()) {
          // Check if review already exists
          const { data: existingReview } = await supabase
            .from('reviews')
            .select('id')
            .eq('client_id', actualClientId)
            .eq('reviewer_name', review.reviewerName.trim())
            .eq('review_text', review.reviewText.trim())
            .single();

          if (existingReview) {
            console.log('Review already exists by:', review.reviewerName);
            continue;
          }

          const { error: reviewError } = await supabase
            .from('reviews')
            .insert({
              client_id: actualClientId,
              reviewer_name: review.reviewerName.trim(),
              review_text: review.reviewText.trim(),
              star_rating: review.starRating || 5,
              review_date: review.reviewDate ? new Date(review.reviewDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              display_order: i,
              is_active: true
            });

          if (reviewError) {
            console.error('Error inserting review:', reviewError);
          } else {
            console.log('Successfully created review by:', review.reviewerName);
          }
        }
      }
    }

    // Store team members if provided
    if (teamData?.teamMembers?.length > 0) {
      console.log('Processing team data for client:', actualClientId);
      
      for (let i = 0; i < teamData.teamMembers.length; i++) {
        const member = teamData.teamMembers[i];
        if (member.name?.trim() && member.title?.trim()) {
          // Check if team member already exists
          const { data: existingMember } = await supabase
            .from('team_members')
            .select('id')
            .eq('client_id', actualClientId)
            .eq('name', member.name.trim())
            .single();

          if (existingMember) {
            console.log('Team member already exists:', member.name);
            continue;
          }

          const { error: memberError } = await supabase
            .from('team_members')
            .insert({
              client_id: actualClientId,
              name: member.name.trim(),
              title: member.title.trim(),
              bio: member.bio || '',
              image_url: member.imageUrl || null,
              display_order: i,
              is_active: true
            });

          if (memberError) {
            console.error('Error inserting team member:', memberError);
          } else {
            console.log('Successfully created team member:', member.name);
          }
        }
      }
    }

    // Process opening hours if provided
    if (openingHoursData && openingHoursData.opening_hours) {
      console.log('Processing opening hours data for client:', actualClientId);
      
      const { error: hoursError } = await supabase
        .from('clients')
        .update({
          opening_hours: openingHoursData.opening_hours
        })
        .eq('id', actualClientId);

      if (hoursError) {
        console.error('Error storing opening hours:', hoursError);
      } else {
        console.log('Successfully stored opening hours');
      }
    }

    // Process images data if provided
    if (imagesData) {
      console.log('Processing images data for client:', actualClientId);
      
      // Update carousel settings in admin_content
      const { error: carouselError } = await supabase
        .from('admin_content')
        .upsert({
          client_id: actualClientId,
          carousel_enabled: imagesData.carousel_enabled,
          carousel_display_order: 2, // Default position
          content_briefing: contentBriefing,
          style_briefing: styleBriefing || '',
          contact_delivery_briefing: contactDeliveryBriefing || ''
        }, {
          onConflict: 'client_id'
        });

      if (carouselError) {
        console.error('Error updating carousel settings:', carouselError);
      } else {
        console.log('Successfully updated carousel settings');
      }

      // Store carousel images if provided
      if (imagesData.carousel_enabled && imagesData.carousel_images?.length > 0) {
        // Check for existing carousel images first
        const { data: existingCarouselImages } = await supabase
          .from('carousel_images')
          .select('image_url')
          .eq('client_id', actualClientId);

        const existingUrls = new Set(existingCarouselImages?.map(img => img.image_url) || []);

        // Normalize, dedupe and filter out invalid/empty URLs before insert
        const seen = new Set<string>();
        const sanitized = imagesData.carousel_images
          .map((img: any) => ({
            imageUrl: (img?.imageUrl || '').trim(),
            altText: (img?.altText || '').trim(),
          }))
          .filter((img: any) => img.imageUrl && /^https?:\/\//i.test(img.imageUrl))
          .filter((img: any) => !existingUrls.has(img.imageUrl))
          .filter((img: any) => {
            if (seen.has(img.imageUrl)) return false;
            seen.add(img.imageUrl);
            return true;
          });

        const carouselImagesToInsert = sanitized.map((image: any, index: number) => ({
          client_id: actualClientId,
          image_url: image.imageUrl,
          alt_text: image.altText || `Carousel image ${index + 1}`,
          display_order: index,
          is_active: true
        }));

        if (carouselImagesToInsert.length > 0) {
          const { error: carouselImagesError } = await supabase
            .from('carousel_images')
            .insert(carouselImagesToInsert);

          if (carouselImagesError) {
            console.error('Error storing carousel images:', carouselImagesError);
          } else {
            console.log('Successfully stored carousel images');
          }
        } else {
          console.log('No new valid carousel images to insert (deduped/filtered)');
        }
      }

      // Store custom images if provided
      if (imagesData.custom_images_enabled && imagesData.custom_images?.length > 0) {
        console.log('Processing custom images for client:', actualClientId);
        
        // First, check for temp images stored in generation_logs
        const { data: tempImages } = await supabase
          .from('generation_logs')
          .select('*')
          .eq('type', 'temp_signup_image')
          .eq('status', 'pending_client_assignment');
        
        // Process temp images from generation_logs
        if (tempImages && tempImages.length > 0) {
          console.log('Found', tempImages.length, 'temp images to process');
          
          for (const tempImage of tempImages) {
            const details = tempImage.details;
            if (!details?.image_url) continue;
            
            try {
              // Check if this image URL matches any of the custom images being processed
              const matchingCustomImage = imagesData.custom_images.find((img: any) => 
                img.imageUrl === details.image_url
              );
              
              if (matchingCustomImage) {
                // Insert into client_images table with the actual client ID
                await supabase
                  .from('client_images')
                  .insert({
                    client_id: actualClientId,
                    image_url: details.image_url,
                    alt_text: details.alt_text,
                    original_filename: details.original_filename,
                    upload_context: 'signup_custom_upload',
                    file_size_kb: details.file_size_kb
                  });
                
                // Mark the temp image as processed
                await supabase
                  .from('generation_logs')
                  .update({ status: 'completed' })
                  .eq('id', tempImage.id);
                
                console.log('Successfully processed temp image:', details.image_url);
              }
            } catch (error) {
              console.error('Error processing temp image:', error);
            }
          }
        }
        
        // Deduplicate incoming images by URL
        const uniqueByUrlMap = new Map<string, any>();
        for (const img of imagesData.custom_images) {
          if (img?.imageUrl && !uniqueByUrlMap.has(img.imageUrl)) {
            uniqueByUrlMap.set(img.imageUrl, img);
          }
        }
        const uniqueCustomImages = Array.from(uniqueByUrlMap.values());
        
        for (let index = 0; index < uniqueCustomImages.length; index++) {
          const image = uniqueCustomImages[index];
          if (!image?.imageUrl) continue;

          const altText = image.altText || `Custom image ${index + 1}`;
          const originalFilename = image.originalFilename || `custom-image-${index + 1}`;

          try {
            // If already exists for this client, skip
            const { data: existingForClient } = await supabase
              .from('client_images')
              .select('id')
              .eq('client_id', actualClientId)
              .eq('image_url', image.imageUrl)
              .maybeSingle();

            if (existingForClient) {
              console.log('Custom image already exists for client, skipping insert:', image.imageUrl);
              continue;
            }

            // Insert new image record if not already processed above
            const { data: alreadyExists } = await supabase
              .from('client_images')
              .select('id')
              .eq('image_url', image.imageUrl)
              .maybeSingle();

            if (!alreadyExists) {
              await supabase
                .from('client_images')
                .insert({
                  client_id: actualClientId,
                  image_url: image.imageUrl,
                  alt_text: altText,
                  upload_context: 'signup_custom_upload',
                  original_filename: originalFilename,
                  file_size_kb: null
                });
              console.log('Inserted new custom image for client:', actualClientId);
            }
          } catch (error) {
            console.error('Error processing custom image:', error);
          }
        }

        console.log('Successfully processed', uniqueCustomImages.length, 'custom images (deduplicated)');
      }
    }

    console.log('Successfully stored briefings for client:', actualClientId);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Briefings stored successfully',
      clientId: actualClientId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in store-briefings function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});