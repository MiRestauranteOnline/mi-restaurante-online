-- Create client_discounts table for global discount templates
CREATE TABLE public.client_discounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('recurring', 'one_time')),
  percentage NUMERIC NOT NULL CHECK (percentage > 0 AND percentage <= 100),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create client_discount_assignments table to track which discounts are assigned to which clients
CREATE TABLE public.client_discount_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  discount_id UUID NOT NULL REFERENCES public.client_discounts(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT false,
  applied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, discount_id)
);

-- Enable RLS
ALTER TABLE public.client_discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_discount_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_discounts
CREATE POLICY "Admins can manage all client discounts"
  ON public.client_discounts
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view active client discounts"
  ON public.client_discounts
  FOR SELECT
  USING (is_active = true);

-- RLS Policies for client_discount_assignments
CREATE POLICY "Admins can manage all discount assignments"
  ON public.client_discount_assignments
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their client discount assignments"
  ON public.client_discount_assignments
  FOR SELECT
  USING (client_id IN (
    SELECT client_id FROM public.user_clients WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update their client discount assignments"
  ON public.client_discount_assignments
  FOR UPDATE
  USING (client_id IN (
    SELECT client_id FROM public.user_clients WHERE user_id = auth.uid()
  ));

-- Indexes for performance
CREATE INDEX idx_client_discount_assignments_client_id ON public.client_discount_assignments(client_id);
CREATE INDEX idx_client_discount_assignments_discount_id ON public.client_discount_assignments(discount_id);
CREATE INDEX idx_client_discount_assignments_active ON public.client_discount_assignments(is_active) WHERE is_active = true;

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_client_discounts_updated_at
  BEFORE UPDATE ON public.client_discounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_discount_assignments_updated_at
  BEFORE UPDATE ON public.client_discount_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();