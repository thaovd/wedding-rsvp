<?php
require_once '../config/database.php';

// Set proper encoding
mb_internal_encoding('UTF-8');
mb_http_output('UTF-8');

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Chỉ chấp nhận POST request']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    $input = $_POST;
}

// Validate dữ liệu
$name = trim($input['wishName'] ?? '');
$message = trim($input['wishMessage'] ?? '');

// Ensure UTF-8 encoding
$name = mb_convert_encoding($name, 'UTF-8', 'auto');
$message = mb_convert_encoding($message, 'UTF-8', 'auto');

if (empty($name) || empty($message)) {
    echo json_encode(['success' => false, 'message' => 'Vui lòng điền đầy đủ thông tin']);
    exit;
}

// Kiểm tra độ dài
if (strlen($name) > 255) {
    echo json_encode(['success' => false, 'message' => 'Tên quá dài (tối đa 255 ký tự)']);
    exit;
}

if (strlen($message) > 1000) {
    echo json_encode(['success' => false, 'message' => 'Lời chúc quá dài (tối đa 1000 ký tự)']);
    exit;
}

// Lọc HTML tags và ký tự đặc biệt
$name = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$message = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');

try {
    // Kiểm tra spam (giới hạn 3 lời chúc/IP trong 1 giờ)
    $ip = $_SERVER['REMOTE_ADDR'];
    $checkSpam = $pdo->prepare("SELECT COUNT(*) FROM wishes WHERE ip_address = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)");
    $checkSpam->execute([$ip]);
    
    if ($checkSpam->fetchColumn() >= 3) {
        echo json_encode(['success' => false, 'message' => 'Bạn đã gửi quá nhiều lời chúc. Vui lòng thử lại sau 1 giờ.']);
        exit;
    }
    
    // Lưu vào database
    $stmt = $pdo->prepare("INSERT INTO wishes (name, message, ip_address) VALUES (?, ?, ?)");
    $result = $stmt->execute([$name, $message, $ip]);
    
    if ($result) {
        echo json_encode([
            'success' => true, 
            'message' => 'Lời chúc của bạn đã được gửi thành công! 💕',
            'id' => $pdo->lastInsertId()
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Có lỗi xảy ra, vui lòng thử lại']);
    }
    
} catch(Exception $e) {
    error_log("Wish submission error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Có lỗi hệ thống, vui lòng thử lại sau']);
}
?>
