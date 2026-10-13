-- H2 (MODE=MySQL) copy of the tables the API uses, adapted from services/db/schema.sql:
-- no DROP/CREATE DATABASE, no ENGINE clauses, UNSIGNED dropped, MySQL ENUMs become
-- VARCHAR + CHECK and TINYINT(1) becomes BOOLEAN (H2 reports ENUM as Types#OTHER, MariaDB reports it as CHAR/VARCHAR).
-- Only used by the 'test' profile - the real app validates against MySQL/MariaDB.

CREATE TABLE users (
  id                BIGINT AUTO_INCREMENT PRIMARY KEY,
  name              VARCHAR(120) NOT NULL,
  email             VARCHAR(190) NOT NULL UNIQUE,
  phone             VARCHAR(20)  NULL,
  email_verified_at TIMESTAMP NULL,
  password          VARCHAR(255) NOT NULL,
  role              VARCHAR(20) DEFAULT 'customer' NOT NULL CHECK (role IN ('admin','staff','customer')),
  remember_token    VARCHAR(100) NULL,
  created_at        TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE machines (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  slug        VARCHAR(80)  NOT NULL UNIQUE,
  name        VARCHAR(160) NOT NULL,
  short_name  VARCHAR(80)  NOT NULL,
  category    VARCHAR(60)  NOT NULL,
  specs       TEXT         NOT NULL,
  image       VARCHAR(255) NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE services (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  slug        VARCHAR(80)  NOT NULL UNIQUE,
  title       VARCHAR(160) NOT NULL,
  description TEXT         NOT NULL,
  image       VARCHAR(255) NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE materials (
  id               BIGINT AUTO_INCREMENT PRIMARY KEY,
  code             VARCHAR(10)  NOT NULL UNIQUE,
  name             VARCHAR(60)  NOT NULL,
  max_thickness_mm DECIMAL(5,2) NOT NULL,
  density_g_cm3    DECIMAL(5,2) NOT NULL
);

CREATE TABLE rates (
  id                   BIGINT AUTO_INCREMENT PRIMARY KEY,
  material_code        VARCHAR(10)  NOT NULL,
  thickness_from_mm    DECIMAL(5,2) NOT NULL,
  thickness_to_mm      DECIMAL(5,2) NOT NULL,
  cut_rate_per_m       DECIMAL(10,2) NOT NULL,
  pierce_rate          DECIMAL(10,2) NOT NULL,
  material_rate_per_kg DECIMAL(10,2) NOT NULL,
  is_sample            BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at           TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE settings (
  `key`   VARCHAR(80) PRIMARY KEY,
  `value` VARCHAR(255) NOT NULL
);

CREATE TABLE enquiries (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  phone         VARCHAR(20)  NOT NULL,
  email         VARCHAR(190) NULL,
  service_slug  VARCHAR(80)  NULL,
  machine_slug  VARCHAR(80)  NULL,
  message       TEXT         NOT NULL,
  source        VARCHAR(20) DEFAULT 'next' NOT NULL CHECK (source IN ('next','react','php','laravel','jsp','spring','node')),
  status        VARCHAR(20) DEFAULT 'new' NOT NULL CHECK (status IN ('new','contacted','quoted','won','lost')),
  created_at    TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quotes (
  id             BIGINT AUTO_INCREMENT PRIMARY KEY,
  quote_no       VARCHAR(30)  NOT NULL UNIQUE,
  enquiry_id     BIGINT NULL,
  customer_name  VARCHAR(120) NULL,
  customer_phone VARCHAR(20)  NULL,
  material_code  VARCHAR(10)  NOT NULL,
  thickness_mm   DECIMAL(5,2) NOT NULL,
  length_mm      DECIMAL(8,2) NOT NULL,
  width_mm       DECIMAL(8,2) NOT NULL,
  cut_length_mm  DECIMAL(10,2) NOT NULL,
  pierces        INT NOT NULL DEFAULT 1,
  bends          INT NOT NULL DEFAULT 0,
  powder_coat    BOOLEAN NOT NULL DEFAULT FALSE,
  quantity       INT NOT NULL DEFAULT 1,
  amount_inr     DECIMAL(12,2) NOT NULL,
  is_estimate    BOOLEAN NOT NULL DEFAULT TRUE,
  source         VARCHAR(20) NOT NULL DEFAULT 'php',
  created_at     TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE work_orders (
  id             BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_no       VARCHAR(30)  NOT NULL UNIQUE,
  customer_name  VARCHAR(120) NOT NULL,
  customer_phone VARCHAR(20)  NOT NULL,
  description    VARCHAR(255) NOT NULL,
  machine_slug   VARCHAR(80)  NULL,
  quantity       INT NOT NULL DEFAULT 1,
  status         VARCHAR(20) DEFAULT 'received' NOT NULL CHECK (status IN ('received','cutting','bending','welding','coating','inspection','dispatched')),
  due_date       DATE NULL,
  created_at     TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE work_order_events (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  work_order_id BIGINT NOT NULL,
  status        VARCHAR(20) NOT NULL,
  note          VARCHAR(255) NULL,
  created_at    TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_events_order FOREIGN KEY (work_order_id) REFERENCES work_orders(id) ON DELETE CASCADE
);
