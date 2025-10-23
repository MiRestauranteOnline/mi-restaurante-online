-- Update plan popularity: Basic is now most popular, Advanced is for professionals
UPDATE subscription_plans 
SET is_popular = true
WHERE plan_key = 'basic';

UPDATE subscription_plans 
SET is_popular = false
WHERE plan_key = 'advanced';