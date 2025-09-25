-- Link the admin user to all existing clients
INSERT INTO user_clients (user_id, client_id, role)
SELECT '71928d10-ca8b-4445-9630-094de813769f', id, 'owner'
FROM clients
ON CONFLICT (user_id, client_id) DO NOTHING;