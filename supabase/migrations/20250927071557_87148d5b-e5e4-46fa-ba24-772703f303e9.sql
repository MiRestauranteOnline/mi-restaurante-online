-- Create RLS policies for storage.objects to allow file uploads

-- Allow authenticated users to upload files to client-assets bucket
CREATE POLICY "Users can upload files to client-assets bucket" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'client-assets');

-- Allow authenticated users to update their own files
CREATE POLICY "Users can update their own files in client-assets bucket" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (bucket_id = 'client-assets' AND (auth.uid()::text = owner_id OR owner_id IS NULL));

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete their own files in client-assets bucket" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (bucket_id = 'client-assets' AND (auth.uid()::text = owner_id OR owner_id IS NULL));

-- Allow public read access to client-assets bucket files
CREATE POLICY "Public can view files in client-assets bucket" 
ON storage.objects 
FOR SELECT 
TO public
USING (bucket_id = 'client-assets');