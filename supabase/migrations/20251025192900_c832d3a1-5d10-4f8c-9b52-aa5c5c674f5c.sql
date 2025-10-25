-- Add decline_reason field to reservations table
-- This preserves the customer's original special_requests while storing the restaurant's decline reason separately

ALTER TABLE public.reservations 
ADD COLUMN decline_reason text;

COMMENT ON COLUMN public.reservations.decline_reason IS 'Reason provided by restaurant when declining/canceling a reservation. Keeps special_requests intact for customer notes.';