-- Runs once, right after services/db/seed.sql, when the production database is first created.
-- 1) Removes the fake demo orders used by the tracking-page demos.
-- 2) Removes the seeded LOCAL admin account (its credentials are in the repository), so the live site
--    starts with NO admin login. Create the real one with deploy/create-admin.sh.
-- Rates stay as SAMPLE data (rates.is_sample = 1) until the owner enters real rates in the admin panel.
USE pslaser;
DELETE FROM work_order_events WHERE work_order_id IN (SELECT id FROM work_orders WHERE order_no LIKE 'PSL-DEMO-%');
DELETE FROM work_orders WHERE order_no LIKE 'PSL-DEMO-%';
DELETE FROM users WHERE email = 'admin@pslaser.local';
