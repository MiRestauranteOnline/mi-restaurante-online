import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResendMetrics {
  current_plan: string;
  daily_limit: number;
  monthly_limit: number;
  emails_sent_today: number;
  emails_sent_this_month: number;
  daily_usage_percentage: number;
  monthly_usage_percentage: number;
  emails_by_type: {
    support_requests: number;
    support_responses: number;
    reclamaciones: number;
  };
  failed_emails_count: number;
  upgrade_recommendations: string[];
  usage_resets_on: string;
  billing_cycle_day: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current date info
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(todayStart);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Billing cycle starts on the 29th of each month
    const billingCycleDay = 29;
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const currentDay = now.getDate();
    
    // Calculate billing cycle start
    let billingCycleStart: Date;
    if (currentDay >= billingCycleDay) {
      // We're in the current billing cycle (29th of this month to 28th of next month)
      billingCycleStart = new Date(currentYear, currentMonth, billingCycleDay);
    } else {
      // We're still in the previous billing cycle (29th of last month to 28th of this month)
      billingCycleStart = new Date(currentYear, currentMonth - 1, billingCycleDay);
    }
    
    // Calculate next reset date
    let nextResetDate: Date;
    if (currentDay >= billingCycleDay) {
      // Next reset is 29th of next month
      nextResetDate = new Date(currentYear, currentMonth + 1, billingCycleDay);
    } else {
      // Next reset is 29th of this month
      nextResetDate = new Date(currentYear, currentMonth, billingCycleDay);
    }

    // Query today's emails
    const { data: todayEmails, error: todayError } = await supabase
      .from("resend_email_logs")
      .select("*")
      .gte("created_at", todayStart.toISOString())
      .lt("created_at", tomorrow.toISOString());

    if (todayError) throw todayError;

    // Query emails sent this billing cycle
    const { data: monthEmails, error: monthError } = await supabase
      .from("resend_email_logs")
      .select("*")
      .gte("created_at", billingCycleStart.toISOString());

    if (monthError) throw monthError;

    // Calculate metrics
    const dailyLimit = 100; // Resend free plan limit
    const monthlyLimit = 3000; // Resend free plan limit

    const emailsSentToday = todayEmails?.length || 0;
    const emailsSentThisMonth = monthEmails?.length || 0;

    const dailyUsagePercentage = (emailsSentToday / dailyLimit) * 100;
    const monthlyUsagePercentage = (emailsSentThisMonth / monthlyLimit) * 100;

    // Count by type
    const supportRequests = monthEmails?.filter(e => e.email_type === 'support_request').length || 0;
    const supportResponses = monthEmails?.filter(e => e.email_type === 'support_response').length || 0;
    const reclamaciones = monthEmails?.filter(e => 
      e.email_type === 'reclamacion_customer' || e.email_type === 'reclamacion_admin'
    ).length || 0;

    // Count failed emails
    const failedEmailsCount = monthEmails?.filter(e => e.status === 'failed').length || 0;

    // Generate upgrade recommendations
    const upgradeRecommendations: string[] = [];
    
    if (dailyUsagePercentage > 90) {
      upgradeRecommendations.push("⚠️ Daily limit almost reached. Consider upgrading to avoid service interruption.");
    } else if (dailyUsagePercentage > 80) {
      upgradeRecommendations.push("📊 Daily usage is high. Monitor closely or consider upgrading.");
    }

    if (monthlyUsagePercentage > 90) {
      upgradeRecommendations.push("⚠️ Monthly limit almost reached. Upgrade recommended before month end.");
    } else if (monthlyUsagePercentage > 80) {
      upgradeRecommendations.push("📊 Monthly usage is high. Plan for potential upgrade.");
    }

    if (failedEmailsCount > 10) {
      upgradeRecommendations.push("⚠️ High number of failed emails detected. Review error logs.");
    }

    const metrics: ResendMetrics = {
      current_plan: "Free",
      daily_limit: dailyLimit,
      monthly_limit: monthlyLimit,
      emails_sent_today: emailsSentToday,
      emails_sent_this_month: emailsSentThisMonth,
      daily_usage_percentage: Math.round(dailyUsagePercentage * 100) / 100,
      monthly_usage_percentage: Math.round(monthlyUsagePercentage * 100) / 100,
      emails_by_type: {
        support_requests: supportRequests,
        support_responses: supportResponses,
        reclamaciones: reclamaciones,
      },
      failed_emails_count: failedEmailsCount,
      upgrade_recommendations: upgradeRecommendations,
      usage_resets_on: nextResetDate.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      billing_cycle_day: billingCycleDay,
    };

    return new Response(JSON.stringify(metrics), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in get-resend-metrics function:", error);
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
