-- Minimal fixture data for the integration test (subset of services/db/seed.sql).
-- Users are created by the test itself with the application's PasswordEncoder.
INSERT INTO machines (slug, name, short_name, category, specs, image, sort_order) VALUES
  ('hsg-3kw-fiber-laser', 'HSG 3 kW Fiber Laser Cutting Machine', '3 kW Fiber Laser', 'Laser Cutting',
   '3 kW fiber laser' || CHAR(10) || 'Bed 3 m x 1.5 m', '/sites/pslaser/machines/hsg.jpg', 1);

INSERT INTO materials (code, name, max_thickness_mm, density_g_cm3) VALUES ('MS', 'Mild Steel', 16, 7.85);
INSERT INTO rates (material_code, thickness_from_mm, thickness_to_mm, cut_rate_per_m, pierce_rate, material_rate_per_kg)
  VALUES ('MS', 0.5, 3, 10, 1, 75), ('MS', 3.01, 8, 22, 2, 72);
INSERT INTO settings (`key`, `value`) VALUES
  ('bend_rate_inr', '8'), ('powder_coat_rate_per_sqm', '120'), ('gst_percent', '18'), ('rates_are_sample', '1');

INSERT INTO work_orders (order_no, customer_name, customer_phone, description, machine_slug, quantity, status) VALUES
  ('PSL-DEMO-001', 'Demo Customer A', '9000000001', 'MS 2 mm panel brackets', 'hsg-3kw-fiber-laser', 120, 'bending');
INSERT INTO work_order_events (work_order_id, status, note) VALUES
  (1, 'received', 'Drawing received'), (1, 'cutting', 'Cut on 3 kW'), (1, 'bending', 'On press brake');
