import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyticsEvent {
  id: string;
  client_id: string;
  event_type: string;
  event_data: any;
  session_id: string;
  device_type: string;
  created_at: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting daily analytics processing...');

    // Get yesterday's date (we process the previous day's data)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    console.log(`Processing analytics for date: ${dateStr}`);

    // Get all events from yesterday
    const { data: events, error: eventsError } = await supabase
      .from('analytics_events')
      .select('*')
      .gte('created_at', `${dateStr}T00:00:00.000Z`)
      .lt('created_at', `${dateStr}T23:59:59.999Z`);

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      throw eventsError;
    }

    console.log(`Found ${events?.length || 0} events to process`);

    if (!events || events.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No events to process for yesterday' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Group events by client_id
    const clientGroups = events.reduce((groups: { [key: string]: AnalyticsEvent[] }, event) => {
      if (!groups[event.client_id]) {
        groups[event.client_id] = [];
      }
      groups[event.client_id].push(event);
      return groups;
    }, {});

    console.log(`Processing analytics for ${Object.keys(clientGroups).length} clients`);

    // Process each client's data
    for (const [clientId, clientEvents] of Object.entries(clientGroups)) {
      console.log(`Processing client ${clientId} with ${clientEvents.length} events`);

      // Calculate metrics
      const uniqueSessions = new Set(clientEvents.map(e => e.session_id)).size;
      const totalPageViews = clientEvents.filter(e => e.event_type === 'page_view').length;
      
      // Calculate average time on page (if we have time_on_page events)
      const timeEvents = clientEvents.filter(e => e.event_type === 'time_on_page');
      const avgTimeOnPage = timeEvents.length > 0 
        ? Math.round(timeEvents.reduce((sum, e) => sum + (e.event_data?.duration || 0), 0) / timeEvents.length)
        : 0;

      // Calculate bounce rate (sessions with only one page view)
      const sessionPageViews = clientEvents
        .filter(e => e.event_type === 'page_view')
        .reduce((acc: { [key: string]: number }, e) => {
          acc[e.session_id] = (acc[e.session_id] || 0) + 1;
          return acc;
        }, {});
      
      const bouncedSessions = Object.values(sessionPageViews).filter(count => count === 1).length;
      const bounceRate = uniqueSessions > 0 ? Math.round((bouncedSessions / uniqueSessions) * 100) : 0;

      // Count interaction events
      const whatsappClicks = clientEvents.filter(e => e.event_type === 'whatsapp_click').length;
      const phoneClicks = clientEvents.filter(e => e.event_type === 'phone_click').length;
      const menuDownloads = clientEvents.filter(e => e.event_type === 'menu_download').length;
      const reservationClicks = clientEvents.filter(e => e.event_type === 'reservation_click').length;

      // Device breakdown
      const deviceBreakdown = clientEvents.reduce((acc: { [key: string]: number }, e) => {
        const device = e.device_type || 'unknown';
        acc[device] = (acc[device] || 0) + 1;
        return acc;
      }, {});

      // Menu section data (if available)
      const menuSectionEvents = clientEvents.filter(e => e.event_type === 'menu_section_view');
      const menuSectionData = menuSectionEvents.reduce((acc: { [key: string]: any }, e) => {
        const section = e.event_data?.section || 'unknown';
        if (!acc[section]) {
          acc[section] = { views: 0, total_time: 0, avg_time: 0 };
        }
        acc[section].views += 1;
        acc[section].total_time += e.event_data?.time || 0;
        acc[section].avg_time = Math.round(acc[section].total_time / acc[section].views);
        return acc;
      }, {});

      // Upsert daily analytics
      const { error: upsertError } = await supabase
        .from('daily_analytics')
        .upsert({
          client_id: clientId,
          date: dateStr,
          total_page_views: totalPageViews,
          unique_sessions: uniqueSessions,
          avg_time_on_page: avgTimeOnPage,
          bounce_rate: bounceRate,
          whatsapp_clicks: whatsappClicks,
          phone_clicks: phoneClicks,
          menu_downloads: menuDownloads,
          reservation_clicks: reservationClicks,
          device_breakdown: deviceBreakdown,
          menu_section_data: menuSectionData,
        }, {
          onConflict: 'client_id,date'
        });

      if (upsertError) {
        console.error(`Error upserting analytics for client ${clientId}:`, upsertError);
        throw upsertError;
      }

      console.log(`Successfully processed analytics for client ${clientId}`);
    }

    // Delete processed events to keep database clean
    const eventIds = events.map(e => e.id);
    const { error: deleteError } = await supabase
      .from('analytics_events')
      .delete()
      .in('id', eventIds);

    if (deleteError) {
      console.error('Error deleting processed events:', deleteError);
      throw deleteError;
    }

    console.log(`Deleted ${eventIds.length} processed events`);
    console.log('Daily analytics processing completed successfully');

    return new Response(
      JSON.stringify({ 
        message: 'Daily analytics processed successfully',
        processed_events: events.length,
        processed_clients: Object.keys(clientGroups).length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-daily-analytics:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
