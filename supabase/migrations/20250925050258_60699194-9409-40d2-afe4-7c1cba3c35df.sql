-- Create a function to link a user to a client by email
CREATE OR REPLACE FUNCTION public.link_user_to_client(
  user_email TEXT,
  client_uuid UUID,
  user_role TEXT DEFAULT 'owner'
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
  existing_link_count INT;
BEGIN
  -- Find the user by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;
  
  -- Check if user exists
  IF target_user_id IS NULL THEN
    RETURN 'ERROR: User with email ' || user_email || ' not found';
  END IF;
  
  -- Check if client exists
  IF NOT EXISTS (SELECT 1 FROM public.clients WHERE id = client_uuid) THEN
    RETURN 'ERROR: Client with ID ' || client_uuid || ' not found';
  END IF;
  
  -- Check if link already exists
  SELECT COUNT(*) INTO existing_link_count
  FROM public.user_clients
  WHERE user_id = target_user_id AND client_id = client_uuid;
  
  IF existing_link_count > 0 THEN
    RETURN 'INFO: User is already linked to this client';
  END IF;
  
  -- Create the link
  INSERT INTO public.user_clients (user_id, client_id, role)
  VALUES (target_user_id, client_uuid, user_role);
  
  RETURN 'SUCCESS: User ' || user_email || ' linked to client ' || client_uuid;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.link_user_to_client(TEXT, UUID, TEXT) TO authenticated;