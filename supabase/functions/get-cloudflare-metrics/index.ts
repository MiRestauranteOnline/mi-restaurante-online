import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CloudflareMetrics {
  current_plan: string;
  total_projects: number;
  total_domains: number;
  builds_this_month: number;
  builds_limit: number;
  projects_limit: number;
  domains_limit: number;
  worker_requests_today: number;
  worker_requests_limit: number;
  upgrade_recommendations: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const CLOUDFLARE_API_TOKEN = Deno.env.get('CLOUDFLARE_API_TOKEN');
    const CLOUDFLARE_ACCOUNT_ID = Deno.env.get('CLOUDFLARE_ACCOUNT_ID');

    if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ACCOUNT_ID) {
      throw new Error('Missing Cloudflare credentials');
    }

    const headers = {
      'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json',
    };

    // Get all Pages projects
    const projectsResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects`,
      { headers }
    );
    const projectsData = await projectsResponse.json();
    const projects = projectsData.result || [];
    const totalProjects = projects.length;

    // Count total custom domains across all projects
    let totalDomains = 0;
    for (const project of projects) {
      if (project.domains && Array.isArray(project.domains)) {
        totalDomains += project.domains.length;
      }
    }

    // Get deployments for the current month to count builds
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    let totalBuilds = 0;

    for (const project of projects) {
      const deploymentsResponse = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects/${project.name}/deployments`,
        { headers }
      );
      const deploymentsData = await deploymentsResponse.json();
      const deployments = deploymentsData.result || [];
      
      // Count deployments this month
      const buildsThisMonth = deployments.filter((d: any) => {
        const createdAt = new Date(d.created_on);
        return createdAt >= firstDayOfMonth;
      }).length;
      
      totalBuilds += buildsThisMonth;
    }

    // Get Workers analytics for today (Pages Functions requests)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();
    
    let workerRequests = 0;
    try {
      const graphqlQuery = {
        query: `
          query GetWorkerAnalytics($accountTag: string!, $datetimeStart: Time!) {
            viewer {
              accounts(filter: { accountTag: $accountTag }) {
                workersInvocationsAdaptive(
                  limit: 1
                  filter: { datetime_geq: $datetimeStart }
                ) {
                  sum {
                    requests
                  }
                }
              }
            }
          }
        `,
        variables: {
          accountTag: CLOUDFLARE_ACCOUNT_ID,
          datetimeStart: todayISO
        }
      };

      const analyticsResponse = await fetch(
        'https://api.cloudflare.com/client/v4/graphql',
        {
          method: 'POST',
          headers,
          body: JSON.stringify(graphqlQuery)
        }
      );
      const analyticsData = await analyticsResponse.json();
      
      if (analyticsData.data?.viewer?.accounts?.[0]?.workersInvocationsAdaptive?.[0]?.sum?.requests) {
        workerRequests = analyticsData.data.viewer.accounts[0].workersInvocationsAdaptive[0].sum.requests;
      }
    } catch (error) {
      console.error('Error fetching worker analytics:', error);
    }

    // Determine current plan and limits (Free plan defaults)
    const currentPlan = 'Free';
    const projectsLimit = 100;
    const domainsLimit = 100;
    const buildsLimit = 500;
    const workerRequestsLimit = 100000;

    // Generate upgrade recommendations
    const upgradeRecommendations: string[] = [];
    
    if (totalProjects >= projectsLimit * 0.8) {
      upgradeRecommendations.push(`Proyectos: ${totalProjects}/${projectsLimit} (${((totalProjects/projectsLimit)*100).toFixed(0)}%) - Considera actualizar pronto`);
    }
    
    if (totalDomains >= domainsLimit * 0.8) {
      upgradeRecommendations.push(`Dominios: ${totalDomains}/${domainsLimit} (${((totalDomains/domainsLimit)*100).toFixed(0)}%) - Considera actualizar pronto`);
    }
    
    if (totalBuilds >= buildsLimit * 0.8) {
      upgradeRecommendations.push(`Builds este mes: ${totalBuilds}/${buildsLimit} (${((totalBuilds/buildsLimit)*100).toFixed(0)}%) - Considera actualizar pronto`);
    }
    
    if (workerRequests >= workerRequestsLimit * 0.8) {
      upgradeRecommendations.push(`Requests de Functions hoy: ${workerRequests.toLocaleString()}/${workerRequestsLimit.toLocaleString()} (${((workerRequests/workerRequestsLimit)*100).toFixed(0)}%) - Considera Workers Paid ($5/mes)`);
    }

    const metrics: CloudflareMetrics = {
      current_plan: currentPlan,
      total_projects: totalProjects,
      total_domains: totalDomains,
      builds_this_month: totalBuilds,
      builds_limit: buildsLimit,
      projects_limit: projectsLimit,
      domains_limit: domainsLimit,
      worker_requests_today: workerRequests,
      worker_requests_limit: workerRequestsLimit,
      upgrade_recommendations: upgradeRecommendations,
    };

    return new Response(JSON.stringify(metrics), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
