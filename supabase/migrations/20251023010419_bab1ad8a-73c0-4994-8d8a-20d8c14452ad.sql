
-- Update demo-2 to advanced plan
UPDATE public.clients
SET plan_type = 'advanced'
WHERE subdomain = 'demo-2';

-- Verify the changes
SELECT subdomain, restaurant_name, plan_type 
FROM public.clients 
WHERE subdomain IN ('demo-1', 'demo-2')
ORDER BY subdomain;
