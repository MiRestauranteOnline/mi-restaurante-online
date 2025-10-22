
-- Clear ALL foreign key references before deleting articles
UPDATE content_gaps 
SET article_id = NULL
WHERE article_id IN (
  'e3e5b164-c3d8-4e06-907c-313c5d22ac23',
  'c968f0db-1be9-4ec5-b59b-2581399b7e10',
  '2d94ae68-7add-41ca-81dd-c9d800149ff3',
  '1fca66f3-8684-46b1-a37e-c11d1ba29609'
);

UPDATE generation_logs
SET article_id = NULL
WHERE article_id IN (
  'e3e5b164-c3d8-4e06-907c-313c5d22ac23',
  'c968f0db-1be9-4ec5-b59b-2581399b7e10',
  '2d94ae68-7add-41ca-81dd-c9d800149ff3',
  '1fca66f3-8684-46b1-a37e-c11d1ba29609'
);

UPDATE target_keywords
SET covered_by_article_id = NULL
WHERE covered_by_article_id IN (
  'e3e5b164-c3d8-4e06-907c-313c5d22ac23',
  'c968f0db-1be9-4ec5-b59b-2581399b7e10',
  '2d94ae68-7add-41ca-81dd-c9d800149ff3',
  '1fca66f3-8684-46b1-a37e-c11d1ba29609'
);

-- Delete the duplicate articles
DELETE FROM generated_articles 
WHERE id IN (
  'e3e5b164-c3d8-4e06-907c-313c5d22ac23',
  'c968f0db-1be9-4ec5-b59b-2581399b7e10',
  '2d94ae68-7add-41ca-81dd-c9d800149ff3',
  '1fca66f3-8684-46b1-a37e-c11d1ba29609'
);

-- Delete duplicate content_gaps  
DELETE FROM content_gaps
WHERE id IN (
  'd0a9c3bb-f04d-4e56-bd23-3b748a08c345',
  'ccd79886-ece5-4e04-b27f-e166557f2ae0',
  '1005647f-79b8-40b3-af32-4f2a8dea403a',
  '31b5f76e-efb0-4842-8d57-17823c6a353e',
  '1421b3cc-4963-405d-9ab7-60f20181e838',
  'be9353c8-5f4e-401c-8466-d3935cfcb4c0',
  '71a7b7ac-79b7-4dc0-be74-13beb2fba2e4',
  '3e499880-88c0-465c-bebc-18f0e43a47af',
  '8691c581-c72f-4460-a87d-755f167062a6',
  'd7f0b54b-858e-488d-bacc-c894615ce5cb',
  '3e06af50-cd90-4fbc-89b3-e8e5c888fc5f',
  '52597efa-b873-4012-aec4-d023d56ece5f',
  'a80d3a93-0a46-43b0-94e2-2d2123dec9d4',
  'b33cfa0a-5ac8-48a9-9f3b-8c4ae0e5ce28',
  'ad8547b6-c9f3-45bd-a95b-b78b8df01ada',
  'db1bdc7e-e28b-4010-a293-9281a79a3666',
  '6857629d-beb8-4efa-873f-08c01856a76b',
  '4d469788-133c-4094-a17f-a8e3ee279b06',
  '1fbf6ba9-7287-40b7-a216-0143487d61ca',
  '89e31ea8-39d2-4b2e-a8bf-318fd68cebe0',
  'f32cc6a2-19b0-42ea-a1d9-9f2ac5e240c6',
  '0fb1d54f-666c-4af2-b89c-696385259d42',
  '2e955be9-c1e1-4683-b575-12c636bfb03b'
);
