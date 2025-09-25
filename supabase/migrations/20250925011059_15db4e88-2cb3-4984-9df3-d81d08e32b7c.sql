-- Create articles table for generated content
CREATE TABLE public.generated_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  meta_description TEXT NOT NULL,
  reading_time INTEGER NOT NULL DEFAULT 5,
  author TEXT NOT NULL DEFAULT 'Mi Restaurante Online',
  featured BOOLEAN NOT NULL DEFAULT false,
  related_articles TEXT[] DEFAULT '{}',
  featured_image_url TEXT,
  featured_image_alt TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  publish_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create target keywords table for topical authority
CREATE TABLE public.target_keywords (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  search_volume INTEGER,
  difficulty INTEGER,
  priority INTEGER NOT NULL DEFAULT 5,
  is_covered BOOLEAN NOT NULL DEFAULT false,
  covered_by_article_id UUID REFERENCES public.generated_articles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create content gaps analysis table
CREATE TABLE public.content_gaps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic TEXT NOT NULL,
  category TEXT NOT NULL,
  target_keywords TEXT[] NOT NULL DEFAULT '{}',
  priority_score INTEGER NOT NULL DEFAULT 5,
  analysis_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'identified' CHECK (status IN ('identified', 'in_progress', 'completed')),
  article_id UUID REFERENCES public.generated_articles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create generation logs table for tracking
CREATE TABLE public.generation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('gap_analysis', 'article_generation', 'image_generation', 'quality_check', 'publish')),
  status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
  article_id UUID REFERENCES public.generated_articles(id),
  content_gap_id UUID REFERENCES public.content_gaps(id),
  details JSONB,
  error_message TEXT,
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.generated_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.target_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (since this is a blog)
CREATE POLICY "Articles are viewable by everyone" 
ON public.generated_articles 
FOR SELECT 
USING (status = 'published');

CREATE POLICY "Keywords are viewable by everyone" 
ON public.target_keywords 
FOR SELECT 
USING (true);

CREATE POLICY "Content gaps are viewable by everyone" 
ON public.content_gaps 
FOR SELECT 
USING (true);

CREATE POLICY "Generation logs are viewable by everyone" 
ON public.generation_logs 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_generated_articles_updated_at
  BEFORE UPDATE ON public.generated_articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_target_keywords_updated_at
  BEFORE UPDATE ON public.target_keywords
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_gaps_updated_at
  BEFORE UPDATE ON public.content_gaps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_generated_articles_category ON public.generated_articles(category);
CREATE INDEX idx_generated_articles_status ON public.generated_articles(status);
CREATE INDEX idx_generated_articles_publish_date ON public.generated_articles(publish_date);
CREATE INDEX idx_target_keywords_category ON public.target_keywords(category);
CREATE INDEX idx_target_keywords_is_covered ON public.target_keywords(is_covered);
CREATE INDEX idx_content_gaps_status ON public.content_gaps(status);
CREATE INDEX idx_content_gaps_priority_score ON public.content_gaps(priority_score);
CREATE INDEX idx_generation_logs_type ON public.generation_logs(type);
CREATE INDEX idx_generation_logs_status ON public.generation_logs(status);
CREATE INDEX idx_generation_logs_created_at ON public.generation_logs(created_at);