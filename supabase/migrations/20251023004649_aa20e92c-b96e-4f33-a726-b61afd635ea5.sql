-- Add trigger to regenerate fast-load data when premium_features (GA/GSC) are updated

CREATE TRIGGER regenerate_fast_load_on_premium_features_update
  AFTER UPDATE ON public.premium_features
  FOR EACH ROW
  WHEN (
    OLD.google_analytics_id IS DISTINCT FROM NEW.google_analytics_id OR
    OLD.google_search_console_verification IS DISTINCT FROM NEW.google_search_console_verification
  )
  EXECUTE FUNCTION public.debounced_fast_load_generation();