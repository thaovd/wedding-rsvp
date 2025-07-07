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
$name = trim($input['name'] ?? '');
$phone = trim($input['phone'] ?? '');
$guests = intval($input['guests'] ?? 1);
$attendance = $input['attendance'] ?? 'yes';
$message = trim($input['message'] ?? '');

// Ensure UTF-8 encoding
$name = mb_convert_encoding($name, 'UTF-8', 'auto');
$phone = mb_convert_encoding($phone, 'UTF-8', 'auto');
$message = mb_convert_encoding($message, 'UTF-8', 'auto');

if (empty($name)) {
    echo json_encode(['success' => false, 'message' => 'Vui lòng nhập họ tên']);
    exit;
}

if (strlen($name) > 255) {
    echo json_encode(['success' => false, 'message' => 'Tên quá dài (tối đa 255 ký tự)']);
    exit;
}

if (!in_array($attendance, ['yes', 'no'])) {
    echo json_encode(['success' => false, 'message' => 'Thông tin tham dự không hợp lệ']);
    exit;
}

if ($guests < 1 || $guests > 20) {
    echo json_encode(['success' => false, 'message' => 'Số lượng khách không hợp lệ']);
    exit;
}

// Lọc HTML tags và ký tự đặc biệt
$name = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$phone = htmlspecialchars($phone, ENT_QUOTES, 'UTF-8');
$message = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');

try {
    // Kiểm tra spam (giới hạn 2 RSVP/IP trong 1 ngày)
    $ip = $_SERVER['REMOTE_ADDR'];
    $checkSpam = $pdo->prepare("SELECT COUNT(*) FROM rsvps WHERE ip_address = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)");
    $checkSpam->execute([$ip]);
    
    if ($checkSpam->fetchColumn() >= 2) {
        echo json_encode(['success' => false, 'message' => 'Bạn đã xác nhận tham dự. Vui lòng liên hệ trực tiếp nếu cần thay đổi.']);
        exit;
    }
    
    // Lưu vào database
    $stmt = $pdo->prepare("INSERT INTO rsvps (name, phone, guests, attendance, message, ip_address) VALUES (?, ?, ?, ?, ?, ?)");
    $result = $stmt->execute([$name, $phone, $guests, $attendance, $message, $ip]);
    
    if ($result) {
        $attendanceText = $attendance === 'yes' ? 'tham dự' : 'không thể tham dự';
        echo json_encode([
            'success' => true, 
            'message' => "Cảm ơn bạn đã xác nhận {$attendanceText}! 💕",
            'id' => $pdo->lastInsertId()
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Có lỗi xảy ra, vui lòng thử lại']);
    }
    
} catch(Exception $e) {
    error_log("RSVP submission error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Có lỗi hệ thống, vui lòng thử lại sau']);
}
?>
