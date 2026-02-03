-- ========================================
-- Database creation
-- ========================================
CREATE DATABASE IF NOT EXISTS demo
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

-- ========================================
-- User creation
-- ========================================
CREATE USER IF NOT EXISTS 'demo'@'localhost'
  IDENTIFIED BY 'demo_pass';

GRANT ALL PRIVILEGES ON demo.* TO 'demo'@'localhost';
FLUSH PRIVILEGES;

-- ========================================
-- Use database
-- ========================================
USE demo;

-- ========================================
-- Table creation
-- ========================================
CREATE TABLE IF NOT EXISTS product (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price INT NOT NULL,
  note VARCHAR(255)
);

-- ========================================
-- Initial data
-- ========================================
INSERT INTO product (name, price, note) VALUES
('Laptop', 1200, '13-inch display'),
('Mouse', 30, 'Wireless'),
('Keyboard', 50, 'US layout'),
('Monitor', 300, '27-inch 4K');
