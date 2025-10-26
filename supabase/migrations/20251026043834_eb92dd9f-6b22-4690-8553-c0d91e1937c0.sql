-- Add image preference and AI style detection columns to admin_content table
ALTER TABLE public.admin_content
ADD COLUMN IF NOT EXISTS image_preference TEXT CHECK (image_preference IN ('custom_only', 'custom_plus_ai', 'ai_only')),
ADD COLUMN IF NOT EXISTS ai_image_style TEXT,
ADD COLUMN IF NOT EXISTS ai_color_palette TEXT,
ADD COLUMN IF NOT EXISTS ai_image_mood TEXT,
ADD COLUMN IF NOT EXISTS detected_image_style JSONB;

COMMENT ON COLUMN public.admin_content.image_preference IS 'Client image preference: custom_only, custom_plus_ai, or ai_only';
COMMENT ON COLUMN public.admin_content.ai_image_style IS 'AI-generated image style preference or detected style';
COMMENT ON COLUMN public.admin_content.ai_color_palette IS 'Color palette for AI-generated images';
COMMENT ON COLUMN public.admin_content.ai_image_mood IS 'Mood/atmosphere for AI-generated images';
COMMENT ON COLUMN public.admin_content.detected_image_style IS 'Full AI analysis of uploaded images for style matching';