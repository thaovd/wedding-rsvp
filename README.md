
## Yêu cầu hệ thống
- PHP 7.4+ 
- MySQL 5.7+ hoặc MariaDB 10.2+
- Apache/Nginx web server
- Extension PHP: PDO, PDO_MySQL

## Cài đặt bước 1: Thiết lập Database

### 1. Tạo database MySQL
```sql
-- Đăng nhập MySQL và chạy lệnh:
mysql -u root -p
source database/setup.sql
```

### 2. Hoặc import thủ công:
- Mở phpMyAdmin
- Tạo database mới tên `wedding_website`
- Import file `database/setup.sql`

## Bước 2: Cấu hình kết nối Database

Chỉnh sửa file `config/database.php`:

```php
$host = 'localhost';        // Host MySQL
$dbname = 'wedding_website'; // Tên database
$username = 'root';         // Username MySQL
$password = '';             // Password MySQL (để trống nếu dùng XAMPP)
```

## Bước 3: Cấu hình Web Server

### Với XAMPP:
1. Copy toàn bộ thư mục project vào `htdocs/`
2. Truy cập: `http://localhost/wedding-website/`

### Với WAMP:
1. Copy project vào `www/`
2. Truy cập: `http://localhost/wedding-website/`

### Với server thật:
1. Upload files lên hosting
2. Cấu hình virtual host hoặc subdomain

## Bước 4: Truy cập Admin Panel

1. Truy cập: `http://your-domain/admin/`
2. Đăng nhập với thông tin mặc định:
   - **Username**: admin
   - **Password**: admin123

**⚠️ Quan trọng**: Đổi mật khẩu admin ngay sau khi đăng nhập lần đầu!

## Cấu trúc thư mục

```
wedding-website/
├── index.html              # Trang chính
├── style.css              # CSS styles
├── script.js              # JavaScript
├── .htaccess              # Apache config
├── config/
│   └── database.php       # Cấu hình DB
├── api/
│   ├── submit_wish.php    # API gửi lời chúc
│   └── submit_rsvp.php    # API xác nhận tham dự
├── admin/
│   ├── index.php          # Trang admin chính
│   └── login.php          # Đăng nhập admin
└── database/
    └── setup.sql          # Script tạo database
```

## Tính năng chính

### Frontend (Website cưới):
- ✅ Thiết kế responsive đẹp mắt
- ✅ Slideshow ảnh cưới
- ✅ Timeline câu chuyện tình yêu
- ✅ Gallery ảnh với lightbox
- ✅ Form gửi lời chúc
- ✅ Form xác nhận tham dự (RSVP)
- ✅ Đếm ngược đến ngày cưới
- ✅ Thông tin địa điểm & mừng cưới

### Backend (Admin Panel):
- ✅ Quản lý lời chúc (duyệt/từ chối)
- ✅ Quản lý RSVP (xác nhận)
- ✅ Thống kê số liệu
- ✅ Dashboard trực quan
- ✅ Bảo mật đăng nhập
- ✅ Auto-refresh dữ liệu

### Database:
- ✅ Lưu trữ lời chúc
- ✅ Lưu trữ RSVP
- ✅ Chống spam (rate limiting)
- ✅ Lọc XSS và SQL injection

## Bảo mật

### Các biện pháp đã áp dụng:
- ✅ Prepared statements (chống SQL injection)
- ✅ Htmlspecialchars (chống XSS)
- ✅ Rate limiting (chống spam)
- ✅ Password hashing
- ✅ Session security
- ✅ Input validation

