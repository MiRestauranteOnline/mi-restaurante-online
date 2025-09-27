-- Add missing briefing columns to admin_content so edge function store-briefings can upsert successfully
ALTER TABLE public.admin_content
  ADD COLUMN IF NOT EXISTS content_briefing text,
  ADD COLUMN IF NOT EXISTS style_briefing text,
  ADD COLUMN IF NOT EXISTS contact_delivery_briefing text;