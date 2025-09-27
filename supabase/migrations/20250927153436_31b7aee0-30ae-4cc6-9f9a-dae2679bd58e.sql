-- Allow anyone to upload to client-assets bucket during registration
-- This is needed because users aren't authenticated during the signup process
CREATE POLICY "Allow uploads during registration"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'client-assets');

-- Also allow anyone to upload (not just authenticated users)
-- This updates the existing restrictive policy
DROP POLICY IF EXISTS "Authenticated users can upload client assets" ON storage.objects;

CREATE POLICY "Anyone can upload client assets"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'client-assets');