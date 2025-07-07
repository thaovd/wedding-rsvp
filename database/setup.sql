-- Tạo database
CREATE DATABASE IF NOT EXISTS hvfgmywl_wedding CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE hvfgmywl_wedding;

-- Bảng lưu lời chúc
CREATE TABLE IF NOT EXISTS wishes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'
);

-- Bảng lưu xác nhận tham dự
CREATE TABLE IF NOT EXISTS rsvps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    guests INT DEFAULT 1,
    attendance ENUM('yes', 'no') NOT NULL,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    status ENUM('pending', 'confirmed') DEFAULT 'pending'
);

-- Bảng admin users
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- Thêm admin mặc định (username: admin, password: admin123)
INSERT INTO admin_users (username, password, email) 
VALUES ('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@wedding.com')
ON DUPLICATE KEY UPDATE username = username;

-- Thêm index để tối ưu truy vấn
CREATE INDEX idx_wishes_created_at ON wishes(created_at);
CREATE INDEX idx_rsvps_created_at ON rsvps(created_at);
CREATE INDEX idx_wishes_status ON wishes(status);
CREATE INDEX idx_rsvps_status ON rsvps(status);
