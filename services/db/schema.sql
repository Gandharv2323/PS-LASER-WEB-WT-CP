SET NAMES utf8mb4;
-- PS Laser shared MySQL/MariaDB schema.
-- Used by: php-estimator (Unit I), laravel-admin (Unit I), servlet-jsp (Unit III),
-- spring-api (Unit IV), node-api (Unit VI). The Next.js site and React portal read
-- it through those APIs.
--
-- Load:  mysql -uroot < services/db/schema.sql && mysql -uroot pslaser < services/db/seed.sql
-- Re-running drops and recreates everything (dev only).

DROP DATABASE IF EXISTS pslaser;
CREATE DATABASE pslaser CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pslaser;

-- Laravel-compatible users table (name/email/password/remember_token/timestamps),
-- shared by every backend. Passwords are bcrypt ($2y$), which PHP password_verify,
-- Spring Security BCryptPasswordEncoder and Node bcryptjs all accept.
CREATE TABLE users (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name              VARCHAR(120) NOT NULL,
  email             VARCHAR(190) NOT NULL UNIQUE,
  phone             VARCHAR(20)  NULL,
  email_verified_at TIMESTAMP NULL,
  password          VARCHAR(255) NOT NULL,
  role              ENUM('admin','staff','customer') NOT NULL DEFAULT 'customer',
  remember_token    VARCHAR(100) NULL,
  created_at        TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE machines (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug        VARCHAR(80)  NOT NULL UNIQUE,
  name        VARCHAR(160) NOT NULL,
  short_name  VARCHAR(80)  NOT NULL,
  category    VARCHAR(60)  NOT NULL,
  specs       TEXT         NOT NULL COMMENT 'one spec per line',
  image       VARCHAR(255) NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE services (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug        VARCHAR(80)  NOT NULL UNIQUE,
  title       VARCHAR(160) NOT NULL,
  description TEXT         NOT NULL,
  image       VARCHAR(255) NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE materials (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code             VARCHAR(10)  NOT NULL UNIQUE,
  name             VARCHAR(60)  NOT NULL,
  max_thickness_mm DECIMAL(5,2) NOT NULL,
  density_g_cm3    DECIMAL(5,2) NOT NULL
) ENGINE=InnoDB;

-- Estimator rate card. SAMPLE values for development only — PS Laser must set
-- real prices (Laravel admin edits this table). Never shown to customers as final.
CREATE TABLE rates (
  id                 BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  material_code      VARCHAR(10)  NOT NULL,
  thickness_from_mm  DECIMAL(5,2) NOT NULL,
  thickness_to_mm    DECIMAL(5,2) NOT NULL,
  cut_rate_per_m     DECIMAL(10,2) NOT NULL COMMENT 'INR per metre of cut',
  pierce_rate        DECIMAL(10,2) NOT NULL COMMENT 'INR per pierce/start',
  material_rate_per_kg DECIMAL(10,2) NOT NULL,
  is_sample          TINYINT(1) NOT NULL DEFAULT 1,
  updated_at         TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_rates_material FOREIGN KEY (material_code) REFERENCES materials(code)
) ENGINE=InnoDB;

CREATE TABLE settings (
  `key`   VARCHAR(80) PRIMARY KEY,
  `value` VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE enquiries (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  phone         VARCHAR(20)  NOT NULL,
  email         VARCHAR(190) NULL,
  service_slug  VARCHAR(80)  NULL,
  machine_slug  VARCHAR(80)  NULL,
  message       TEXT         NOT NULL,
  source        ENUM('next','react','php','laravel','jsp','spring','node') NOT NULL DEFAULT 'next',
  status        ENUM('new','contacted','quoted','won','lost') NOT NULL DEFAULT 'new',
  created_at    TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_enquiries_status (status)
) ENGINE=InnoDB;

CREATE TABLE uploads (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  enquiry_id    BIGINT UNSIGNED NULL,
  original_name VARCHAR(255) NOT NULL,
  stored_path   VARCHAR(255) NOT NULL,
  mime          VARCHAR(100) NULL,
  size_bytes    INT UNSIGNED NOT NULL,
  created_at    TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_uploads_enquiry FOREIGN KEY (enquiry_id) REFERENCES enquiries(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE quotes (
  id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  quote_no       VARCHAR(30)  NOT NULL UNIQUE,
  enquiry_id     BIGINT UNSIGNED NULL,
  customer_name  VARCHAR(120) NULL,
  customer_phone VARCHAR(20)  NULL,
  material_code  VARCHAR(10)  NOT NULL,
  thickness_mm   DECIMAL(5,2) NOT NULL,
  length_mm      DECIMAL(8,2) NOT NULL,
  width_mm       DECIMAL(8,2) NOT NULL,
  cut_length_mm  DECIMAL(10,2) NOT NULL,
  pierces        INT NOT NULL DEFAULT 1,
  bends          INT NOT NULL DEFAULT 0,
  powder_coat    TINYINT(1) NOT NULL DEFAULT 0,
  quantity       INT NOT NULL DEFAULT 1,
  amount_inr     DECIMAL(12,2) NOT NULL,
  is_estimate    TINYINT(1) NOT NULL DEFAULT 1,
  source         VARCHAR(20) NOT NULL DEFAULT 'php',
  created_at     TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_quotes_enquiry FOREIGN KEY (enquiry_id) REFERENCES enquiries(id) ON DELETE SET NULL,
  CONSTRAINT fk_quotes_material FOREIGN KEY (material_code) REFERENCES materials(code)
) ENGINE=InnoDB;

-- Customer job tracking ("where is my order"). Named work_orders so it does not
-- clash with Laravel's own `jobs` queue table.
CREATE TABLE work_orders (
  id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_no       VARCHAR(30)  NOT NULL UNIQUE,
  customer_name  VARCHAR(120) NOT NULL,
  customer_phone VARCHAR(20)  NOT NULL,
  description    VARCHAR(255) NOT NULL,
  machine_slug   VARCHAR(80)  NULL,
  quantity       INT NOT NULL DEFAULT 1,
  status         ENUM('received','cutting','bending','welding','coating','inspection','dispatched') NOT NULL DEFAULT 'received',
  due_date       DATE NULL,
  created_at     TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE work_order_events (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  work_order_id BIGINT UNSIGNED NOT NULL,
  status        VARCHAR(20) NOT NULL,
  note          VARCHAR(255) NULL,
  created_at    TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_events_order FOREIGN KEY (work_order_id) REFERENCES work_orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;
