INSERT INTO public.premium_features (client_id, unique_support_pin, premium_support_enabled, analytics_enabled)
VALUES ('c2f12b71-4054-40a4-9afb-d99b85583dd8', '47382615', true, true)
ON CONFLICT (client_id) DO UPDATE SET
  unique_support_pin = EXCLUDED.unique_support_pin,
  premium_support_enabled = EXCLUDED.premium_support_enabled,
  analytics_enabled = EXCLUDED.analytics_enabled;