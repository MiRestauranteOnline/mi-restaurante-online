-- Enable RLS on reservations (safe if already enabled)
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Allow authenticated client users to delete reservations for their own clients
CREATE POLICY "Users can delete their client reservations"
ON public.reservations
FOR DELETE
USING (
  client_id IN (
    SELECT uc.client_id
    FROM public.user_clients uc
    WHERE uc.user_id = auth.uid()
  )
);
