-- Insertar datos mínimos para tests
INSERT INTO users (id, username, email, password_hash, created_at, updated_at) 
VALUES (1, 'testuser', 'test@test.com', '$2a$10$dummyhashfortest', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
ON CONFLICT (id) DO NOTHING;

INSERT INTO companies (id, name, owner_id, created_at, updated_at) 
VALUES (1, 'Test Company', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
ON CONFLICT (id) DO NOTHING;

INSERT INTO districts (id, name, slug, created_at, updated_at) 
VALUES (1, 'Test District', 'test-district', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
ON CONFLICT (id) DO NOTHING;

INSERT INTO offices (id, company_id, district_id, name, created_at, updated_at) 
VALUES (1, 1, 1, 'Test Office', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
ON CONFLICT (id) DO NOTHING;

SELECT 'Users:' as info, COUNT(*) as count FROM users;
SELECT 'Companies:' as info, COUNT(*) as count FROM companies;
SELECT 'Districts:' as info, COUNT(*) as count FROM districts;
SELECT 'Offices:' as info, COUNT(*) as count FROM offices;
