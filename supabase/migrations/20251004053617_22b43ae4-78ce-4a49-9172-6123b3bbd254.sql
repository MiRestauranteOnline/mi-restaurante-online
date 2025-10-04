-- Create table_configurations table
CREATE TABLE public.table_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  seats INTEGER NOT NULL CHECK (seats > 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  min_party_size INTEGER NOT NULL CHECK (min_party_size > 0),
  max_party_size INTEGER NOT NULL CHECK (max_party_size > 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_party_size_range CHECK (min_party_size <= max_party_size),
  CONSTRAINT max_not_exceed_seats CHECK (max_party_size <= seats)
);

-- Add table_config_id to reservations
ALTER TABLE public.reservations
ADD COLUMN table_config_id UUID REFERENCES public.table_configurations(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.table_configurations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for table_configurations
CREATE POLICY "Admins can manage all table configurations"
ON public.table_configurations
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can manage their client table configurations"
ON public.table_configurations
FOR ALL
USING (client_id IN (
  SELECT uc.client_id FROM user_clients uc WHERE uc.user_id = auth.uid()
))
WITH CHECK (client_id IN (
  SELECT uc.client_id FROM user_clients uc WHERE uc.user_id = auth.uid()
));

CREATE POLICY "Public can view active table configurations"
ON public.table_configurations
FOR SELECT
USING (is_active = true);

-- Create index for performance
CREATE INDEX idx_table_configurations_client_id ON public.table_configurations(client_id);
CREATE INDEX idx_reservations_table_config_id ON public.reservations(table_config_id);

-- Trigger for updated_at
CREATE TRIGGER update_table_configurations_updated_at
BEFORE UPDATE ON public.table_configurations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();