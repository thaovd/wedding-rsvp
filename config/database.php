<?php
// Cấu hình database
$host = 'localhost';
$dbname = 'hvfgmywl_wedding';
$username = 'hvfgmywl_thaolee1605';
$password = 'Vuthao1605.';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->exec("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
} catch(PDOException $e) {
    die("Lỗi kết nối database: " . $e->getMessage());
}
?>
