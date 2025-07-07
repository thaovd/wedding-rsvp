<?php
session_start();

// Set proper encoding
mb_internal_encoding('UTF-8');
mb_http_output('UTF-8');

require_once '../config/database.php';

// Kiểm tra đăng nhập
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: login.php');
    exit;
}

// Xử lý logout
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: login.php');
    exit;
}

// Xử lý cập nhật trạng thái
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    if ($_POST['action'] === 'update_wish_status') {
        $id = intval($_POST['id']);
        $status = $_POST['status'];
        
        if (in_array($status, ['pending', 'approved', 'rejected'])) {
            $stmt = $pdo->prepare("UPDATE wishes SET status = ? WHERE id = ?");
            $stmt->execute([$status, $id]);
        }
    }
    
    if ($_POST['action'] === 'update_rsvp_status') {
        $id = intval($_POST['id']);
        $status = $_POST['status'];
        
        if (in_array($status, ['pending', 'confirmed'])) {
            $stmt = $pdo->prepare("UPDATE rsvps SET status = ? WHERE id = ?");
            $stmt->execute([$status, $id]);
        }
    }
    
    header('Location: index.php');
    exit;
}

// Lấy thống kê
$stats = [];

// Tổng số lời chúc
$stmt = $pdo->query("SELECT COUNT(*) as total, status FROM wishes GROUP BY status");
$stats['wishes'] = [];
while ($row = $stmt->fetch()) {
    $stats['wishes'][$row['status']] = $row['total'];
}
$stats['wishes']['total'] = array_sum($stats['wishes']);

// Tổng số RSVP
$stmt = $pdo->query("SELECT COUNT(*) as total, attendance FROM rsvps GROUP BY attendance");
$stats['rsvps'] = [];
while ($row = $stmt->fetch()) {
    $stats['rsvps'][$row['attendance']] = $row['total'];
}
$stats['rsvps']['total'] = array_sum($stats['rsvps']);

// Tổng số khách dự kiến
$stmt = $pdo->query("SELECT SUM(guests) as total_guests FROM rsvps WHERE attendance = 'yes'");
$stats['total_guests'] = $stmt->fetchColumn() ?: 0;

// Lấy dữ liệu cho bảng
$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
$limit = 20;
$offset = ($page - 1) * $limit;

// Lời chúc mới nhất
$wishes_stmt = $pdo->prepare("SELECT * FROM wishes ORDER BY created_at DESC LIMIT $limit OFFSET $offset");
$wishes_stmt->execute();
$wishes = $wishes_stmt->fetchAll();

// RSVP mới nhất
$rsvps_stmt = $pdo->prepare("SELECT * FROM rsvps ORDER BY created_at DESC LIMIT $limit OFFSET $offset");
$rsvps_stmt->execute();
$rsvps = $rsvps_stmt->fetchAll();

// Tổng số trang
$total_wishes = $pdo->query("SELECT COUNT(*) FROM wishes")->fetchColumn();
$total_rsvps = $pdo->query("SELECT COUNT(*) FROM rsvps")->fetchColumn();
$total_pages_wishes = ceil($total_wishes / $limit);
$total_pages_rsvps = ceil($total_rsvps / $limit);
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>Admin Panel - Wedding Website</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f5f5;
            color: #333;
        }
        
        .header {
            background: linear-gradient(45deg, #4ecdc4, #44a08d);
            color: white;
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .header h1 {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .logout-btn {
            background: rgba(255,255,255,0.2);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 5px;
            text-decoration: none;
            transition: background 0.3s;
        }
        
        .logout-btn:hover {
            background: rgba(255,255,255,0.3);
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .stat-card {
            background: white;
            padding: 1.5rem;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .stat-card .icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }
        
        .stat-card.wishes .icon { color: #ff6b6b; }
        .stat-card.rsvps .icon { color: #4ecdc4; }
        .stat-card.guests .icon { color: #45b7d1; }
        
        .stat-card .number {
            font-size: 2rem;
            font-weight: bold;
            color: #333;
        }
        
        .stat-card .label {
            color: #666;
            font-size: 0.9rem;
        }
        
        .content-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
        }
        
        .section {
            background: white;
            border-radius: 10px;
            padding: 1.5rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .section h2 {
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .table th,
        .table td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        
        .table th {
            background: #f8f9fa;
            font-weight: 600;
        }
        
        .table tr:hover {
            background: #f8f9fa;
        }
        
        .status-badge {
            padding: 4px 8px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        .status-pending {
            background: #fff3cd;
            color: #856404;
        }
        
        .status-approved {
            background: #d4edda;
            color: #155724;
        }
        
        .status-rejected {
            background: #f8d7da;
            color: #721c24;
        }
        
        .status-confirmed {
            background: #d1ecf1;
            color: #0c5460;
        }
        
        .btn {
            padding: 4px 8px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.8rem;
            margin: 0 2px;
        }
        
        .btn-approve { background: #28a745; color: white; }
        .btn-reject { background: #dc3545; color: white; }
        .btn-pending { background: #ffc107; color: #333; }
        .btn-confirm { background: #17a2b8; color: white; }
        
        .message-cell {
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        
        .pagination {
            display: flex;
            justify-content: center;
            gap: 5px;
            margin-top: 1rem;
        }
        
        .pagination a {
            padding: 8px 12px;
            text-decoration: none;
            border: 1px solid #ddd;
            color: #333;
            border-radius: 4px;
        }
        
        .pagination a.active {
            background: #4ecdc4;
            color: white;
            border-color: #4ecdc4;
        }
        
        .pagination a:hover:not(.active) {
            background: #f5f5f5;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 1rem;
            }
            
            .content-grid {
                grid-template-columns: 1fr;
            }
            
            .stats-grid {
                grid-template-columns: 1fr;
            }
            
            .table {
                font-size: 0.85rem;
            }
            
            .message-cell {
                max-width: 150px;
            }
        }
        
        .refresh-btn {
            background: #4ecdc4;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 5px;
            cursor: pointer;
            margin-left: auto;
        }
        
        .refresh-btn:hover {
            background: #44a08d;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>
            <i class="fas fa-heart"></i>
            Wedding Admin Panel
        </h1>
        <div>
            <button class="refresh-btn" onclick="location.reload()">
                <i class="fas fa-sync-alt"></i> Refresh
            </button>
            <a href="?logout=1" class="logout-btn">
                <i class="fas fa-sign-out-alt"></i> Đăng xuất
            </a>
        </div>
    </div>
    
    <div class="container">
        <!-- Statistics Cards -->
        <div class="stats-grid">
            <div class="stat-card wishes">
                <div class="icon">
                    <i class="fas fa-heart"></i>
                </div>
                <div class="number"><?= $stats['wishes']['total'] ?? 0 ?></div>
                <div class="label">Tổng Lời Chúc</div>
            </div>
            
            <div class="stat-card rsvps">
                <div class="icon">
                    <i class="fas fa-calendar-check"></i>
                </div>
                <div class="number"><?= $stats['rsvps']['total'] ?? 0 ?></div>
                <div class="label">Tổng RSVP</div>
            </div>
            
            <div class="stat-card guests">
                <div class="icon">
                    <i class="fas fa-users"></i>
                </div>
                <div class="number"><?= $stats['total_guests'] ?></div>
                <div class="label">Khách Tham Dự</div>
            </div>
        </div>
        
        <!-- Data Tables -->
        <div class="content-grid">
            <!-- Wishes Section -->
            <div class="section">
                <h2>
                    <i class="fas fa-heart"></i>
                    Lời Chúc Mới Nhất
                </h2>
                
                <table class="table">
                    <thead>
                        <tr>
                            <th>Tên</th>
                            <th>Lời Chúc</th>
                            <th>Thời Gian</th>
                            <th>Trạng Thái</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>                        <?php foreach ($wishes as $wish): ?>
                        <tr>
                            <td><?= mb_convert_encoding(htmlspecialchars($wish['name'], ENT_QUOTES, 'UTF-8'), 'UTF-8', 'auto') ?></td>
                            <td class="message-cell" title="<?= mb_convert_encoding(htmlspecialchars($wish['message'], ENT_QUOTES, 'UTF-8'), 'UTF-8', 'auto') ?>">
                                <?= mb_convert_encoding(htmlspecialchars($wish['message'], ENT_QUOTES, 'UTF-8'), 'UTF-8', 'auto') ?>
                            </td>
                            <td><?= date('d/m/Y H:i', strtotime($wish['created_at'])) ?></td>
                            <td>
                                <span class="status-badge status-<?= $wish['status'] ?>">
                                    <?= ucfirst($wish['status']) ?>
                                </span>
                            </td>
                            <td>
                                <form method="POST" style="display: inline;">
                                    <input type="hidden" name="action" value="update_wish_status">
                                    <input type="hidden" name="id" value="<?= $wish['id'] ?>">
                                    
                                    <?php if ($wish['status'] !== 'approved'): ?>
                                    <button type="submit" name="status" value="approved" class="btn btn-approve">
                                        <i class="fas fa-check"></i>
                                    </button>
                                    <?php endif; ?>
                                    
                                    <?php if ($wish['status'] !== 'rejected'): ?>
                                    <button type="submit" name="status" value="rejected" class="btn btn-reject">
                                        <i class="fas fa-times"></i>
                                    </button>
                                    <?php endif; ?>
                                    
                                    <?php if ($wish['status'] !== 'pending'): ?>
                                    <button type="submit" name="status" value="pending" class="btn btn-pending">
                                        <i class="fas fa-clock"></i>
                                    </button>
                                    <?php endif; ?>
                                </form>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
            
            <!-- RSVP Section -->
            <div class="section">
                <h2>
                    <i class="fas fa-calendar-check"></i>
                    RSVP Mới Nhất
                </h2>
                  <table class="table">
                    <thead>
                        <tr>
                            <th>Tên</th>
                            <th>SĐT</th>
                            <th>Khách</th>
                            <th>Tham Dự</th>
                            <th>Lời Chúc</th>
                            <th>Thời Gian</th>
                            <th>Trạng Thái</th>
                        </tr>
                    </thead>
                    <tbody>                        <?php foreach ($rsvps as $rsvp): ?>
                        <tr>
                            <td><?= mb_convert_encoding(htmlspecialchars($rsvp['name'], ENT_QUOTES, 'UTF-8'), 'UTF-8', 'auto') ?></td>
                            <td><?= mb_convert_encoding(htmlspecialchars($rsvp['phone'], ENT_QUOTES, 'UTF-8'), 'UTF-8', 'auto') ?></td>
                            <td><?= $rsvp['guests'] ?></td>
                            <td>
                                <span class="status-badge <?= $rsvp['attendance'] === 'yes' ? 'status-approved' : 'status-rejected' ?>">
                                    <?= $rsvp['attendance'] === 'yes' ? 'Có' : 'Không' ?>
                                </span>
                            </td>
                            <td class="message-cell" title="<?= mb_convert_encoding(htmlspecialchars($rsvp['message'] ?? '', ENT_QUOTES, 'UTF-8'), 'UTF-8', 'auto') ?>">
                                <?= $rsvp['message'] ? mb_convert_encoding(htmlspecialchars($rsvp['message'], ENT_QUOTES, 'UTF-8'), 'UTF-8', 'auto') : '<em>Không có lời chúc</em>' ?>
                            </td>
                            <td><?= date('d/m/Y H:i', strtotime($rsvp['created_at'])) ?></td>
                            <td>
                                <form method="POST" style="display: inline;">
                                    <input type="hidden" name="action" value="update_rsvp_status">
                                    <input type="hidden" name="id" value="<?= $rsvp['id'] ?>">
                                    
                                    <?php if ($rsvp['status'] !== 'confirmed'): ?>
                                    <button type="submit" name="status" value="confirmed" class="btn btn-confirm">
                                        <i class="fas fa-check"></i>
                                    </button>
                                    <?php else: ?>
                                    <button type="submit" name="status" value="pending" class="btn btn-pending">
                                        <i class="fas fa-clock"></i>
                                    </button>
                                    <?php endif; ?>
                                </form>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    
    <script>
        // Auto refresh every 30 seconds
        setTimeout(() => {
            location.reload();
        }, 30000);
        
        // Confirm before status changes
        document.querySelectorAll('form button').forEach(button => {
            button.addEventListener('click', function(e) {
                if (!confirm('Bạn có chắc muốn thay đổi trạng thái?')) {
                    e.preventDefault();
                }
            });
        });
    </script>
</body>
</html>
