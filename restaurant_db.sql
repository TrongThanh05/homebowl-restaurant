/* ============================================================
   RESTAURANT MANAGEMENT SYSTEM - FILE TỔNG HỢP (SQL SERVER)
   Gộp: restaurant_db_1.sql (schema + nội dung website cũ), dữ liệu demo vận hành,
        và dữ liệu import từ 4 file frontend (menu.js, blog.js, events.js, gallery.js).
   Dùng cho CSDL MỚI. Chạy MỘT LẦN, từ trên xuống. Không có DROP/DELETE/UPDATE.

   Nếu CSDL RestaurantDB đã có bảng, file tự dừng (không ghi đè), xem phần GUARD.
   Cần SQL Server 2017+ (STRING_AGG ở phần truy vấn mẫu). Dùng SSMS hoặc Azure Data Studio.

   Mục lục: 1-8 bảng lõi, index, view (từ restaurant_db_1.sql) | 9-10 bảng + index website
            11 dữ liệu nền | 12 dữ liệu demo vận hành | 13 dữ liệu website/template | 14 kiểm tra

   Tài khoản demo (mật khẩu chung Demo@123, băm bcrypt):
     admin@restaurant.demo, manager@restaurant.demo, waiter1@..., waiter2@...,
     chef@..., cashier@..., an.nguyen@example.com, ...
     => XÓA hoặc đổi mật khẩu các tài khoản này trước khi đưa lên môi trường thật.
   ============================================================ */
IF DB_ID(N'RestaurantDB') IS NULL
    CREATE DATABASE RestaurantDB COLLATE Vietnamese_100_CI_AS;
GO
USE RestaurantDB;
GO
SET QUOTED_IDENTIFIER ON;   -- bắt buộc: có filtered index trên orders, menu_items, blog_posts...
SET ANSI_NULLS ON;
GO

/* ---------- GUARD: không chạy đè lên CSDL đã có dữ liệu ---------- */
IF OBJECT_ID(N'dbo.roles', N'U') IS NOT NULL
BEGIN
    PRINT N'RestaurantDB đã có bảng. File tổng hợp chỉ dùng cho CSDL MỚI, đã bỏ qua toàn bộ.';
    SET NOEXEC ON;          -- bỏ qua mọi batch phía sau cho đến khi gặp SET NOEXEC OFF ở cuối file
END
GO

/* ---------- 1. TÀI KHOẢN & PHÂN QUYỀN ---------- */
CREATE TABLE roles (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    name        NVARCHAR(50)  NOT NULL UNIQUE      -- ADMIN, MANAGER, WAITER, CHEF, CASHIER, CUSTOMER
);

CREATE TABLE users (
    id             INT IDENTITY(1,1) PRIMARY KEY,
    email          NVARCHAR(150) NOT NULL UNIQUE,
    password_hash  NVARCHAR(255) NOT NULL,          -- BCrypt, không lưu mật khẩu thô
    role_id        INT NOT NULL REFERENCES roles(id),
    is_active      BIT NOT NULL DEFAULT 1,
    created_at     DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at     DATETIME2 NULL
);

CREATE TABLE employees (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    user_id     INT NOT NULL UNIQUE REFERENCES users(id),
    full_name   NVARCHAR(150) NOT NULL,
    phone       VARCHAR(20)   NULL,
    position    NVARCHAR(80)  NULL,
    hired_date  DATE NULL,
    is_active   BIT NOT NULL DEFAULT 1
);

CREATE TABLE customers (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    user_id     INT NULL UNIQUE REFERENCES users(id),  -- NULL = khách đặt bàn không đăng ký
    full_name   NVARCHAR(150) NOT NULL,
    phone       VARCHAR(20)   NOT NULL,
    email       NVARCHAR(150) NULL,
    created_at  DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

/* ---------- 2. BÀN & ĐẶT BÀN ---------- */
CREATE TABLE dining_tables (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    code        NVARCHAR(20) NOT NULL UNIQUE,       -- A01, VIP-1
    area        NVARCHAR(50) NULL,                  -- Tầng 1, Sân vườn
    capacity    INT NOT NULL CHECK (capacity > 0),
    status      VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE'
                CHECK (status IN ('AVAILABLE','OCCUPIED','RESERVED','OUT_OF_SERVICE'))
);

CREATE TABLE reservations (
    id           INT IDENTITY(1,1) PRIMARY KEY,
    customer_id  INT NOT NULL REFERENCES customers(id),
    table_id     INT NULL REFERENCES dining_tables(id),   -- gán sau khi xác nhận
    reserved_at  DATETIME2 NOT NULL,
    guests       INT NOT NULL CHECK (guests > 0),
    note         NVARCHAR(500) NULL,
    status       VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                 CHECK (status IN ('PENDING','CONFIRMED','CANCELLED','NO_SHOW','COMPLETED')),
    created_at   DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

/* ---------- 3. THỰC ĐƠN ---------- */
CREATE TABLE menu_categories (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    name        NVARCHAR(100) NOT NULL UNIQUE,
    sort_order  INT NOT NULL DEFAULT 0
);

CREATE TABLE menu_items (
    id           INT IDENTITY(1,1) PRIMARY KEY,
    category_id  INT NOT NULL REFERENCES menu_categories(id),
    name         NVARCHAR(150) NOT NULL,
    description  NVARCHAR(500) NULL,
    price        DECIMAL(18,2) NOT NULL CHECK (price >= 0),
    image_url    NVARCHAR(500) NULL,
    is_available BIT NOT NULL DEFAULT 1,            -- hết món / ngừng bán, không xóa
    created_at   DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT uq_menu_item UNIQUE (category_id, name)
);

/* ---------- 4. ĐƠN HÀNG & THANH TOÁN ---------- */
CREATE TABLE orders (
    id             INT IDENTITY(1,1) PRIMARY KEY,
    table_id       INT NOT NULL REFERENCES dining_tables(id),
    employee_id    INT NULL REFERENCES employees(id),
    reservation_id INT NULL REFERENCES reservations(id),
    status         VARCHAR(20) NOT NULL DEFAULT 'OPEN'
                   CHECK (status IN ('OPEN','SERVING','PAID','CANCELLED')),
    note           NVARCHAR(500) NULL,
    created_at     DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    closed_at      DATETIME2 NULL
);

CREATE TABLE order_items (
    id           INT IDENTITY(1,1) PRIMARY KEY,
    order_id     INT NOT NULL REFERENCES orders(id),
    menu_item_id INT NOT NULL REFERENCES menu_items(id),
    quantity     INT NOT NULL CHECK (quantity > 0),
    unit_price   DECIMAL(18,2) NOT NULL CHECK (unit_price >= 0),  -- chụp giá tại thời điểm gọi
    note         NVARCHAR(300) NULL,
    status       VARCHAR(20) NOT NULL DEFAULT 'NEW'
                 CHECK (status IN ('NEW','COOKING','READY','SERVED','CANCELLED'))
);

CREATE TABLE payments (
    id        INT IDENTITY(1,1) PRIMARY KEY,
    order_id  INT NOT NULL REFERENCES orders(id),
    method    VARCHAR(20) NOT NULL CHECK (method IN ('CASH','CARD','TRANSFER','E_WALLET')),
    amount    DECIMAL(18,2) NOT NULL CHECK (amount > 0),
    paid_at   DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

/* ---------- 5. KHO ---------- */
CREATE TABLE suppliers (
    id     INT IDENTITY(1,1) PRIMARY KEY,
    name   NVARCHAR(150) NOT NULL,
    phone  VARCHAR(20) NULL,
    email  NVARCHAR(150) NULL
);

CREATE TABLE ingredients (
    id         INT IDENTITY(1,1) PRIMARY KEY,
    name       NVARCHAR(150) NOT NULL UNIQUE,
    unit       NVARCHAR(20)  NOT NULL,              -- kg, lít, cái
    min_stock  DECIMAL(18,3) NOT NULL DEFAULT 0     -- ngưỡng cảnh báo
);

CREATE TABLE menu_item_ingredients (               -- công thức món
    menu_item_id  INT NOT NULL REFERENCES menu_items(id),
    ingredient_id INT NOT NULL REFERENCES ingredients(id),
    quantity      DECIMAL(18,3) NOT NULL CHECK (quantity > 0),
    PRIMARY KEY (menu_item_id, ingredient_id)
);

CREATE TABLE stock_movements (                     -- sổ kho: tồn = SUM theo type
    id            INT IDENTITY(1,1) PRIMARY KEY,
    ingredient_id INT NOT NULL REFERENCES ingredients(id),
    supplier_id   INT NULL REFERENCES suppliers(id),
    type          VARCHAR(10) NOT NULL CHECK (type IN ('IN','OUT','ADJUST')),
    quantity      DECIMAL(18,3) NOT NULL,
    unit_cost     DECIMAL(18,2) NULL,
    created_at    DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    created_by    INT NULL REFERENCES employees(id)
);

/* ---------- 6. NỘI DUNG WEBSITE ---------- */
CREATE TABLE reviews (
    id           INT IDENTITY(1,1) PRIMARY KEY,
    customer_id  INT NOT NULL REFERENCES customers(id),
    rating       TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    content      NVARCHAR(1000) NULL,
    is_published BIT NOT NULL DEFAULT 0,            -- duyệt trước khi hiện ở testimonial
    created_at   DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

CREATE TABLE newsletter_subscribers (
    id            INT IDENTITY(1,1) PRIMARY KEY,
    email         NVARCHAR(150) NOT NULL UNIQUE,
    subscribed_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    is_active     BIT NOT NULL DEFAULT 1
);

/* ---------- 7. INDEX ---------- */
CREATE INDEX ix_reservations_time   ON reservations(reserved_at, status);
CREATE INDEX ix_reservations_table  ON reservations(table_id, reserved_at);
CREATE INDEX ix_orders_table_status ON orders(table_id, status);
CREATE INDEX ix_orders_created      ON orders(created_at);
CREATE INDEX ix_order_items_order   ON order_items(order_id);
CREATE INDEX ix_menu_items_category ON menu_items(category_id) WHERE is_available = 1;
CREATE INDEX ix_stock_ingredient    ON stock_movements(ingredient_id, created_at);
-- Mỗi bàn chỉ có 1 đơn đang mở tại một thời điểm
CREATE UNIQUE INDEX ux_orders_one_open_per_table
    ON orders(table_id) WHERE status IN ('OPEN','SERVING');
GO

/* ---------- 8. VIEW MẪU ---------- */
CREATE VIEW vw_order_totals AS
SELECT o.id AS order_id,
       SUM(oi.quantity * oi.unit_price) AS total_amount,
       ISNULL((SELECT SUM(p.amount) FROM payments p WHERE p.order_id = o.id), 0) AS paid_amount
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id AND oi.status <> 'CANCELLED'
GROUP BY o.id;
GO

CREATE VIEW vw_ingredient_stock AS
SELECT i.id, i.name, i.unit, i.min_stock,
       ISNULL(SUM(CASE WHEN m.type = 'OUT' THEN -m.quantity ELSE m.quantity END), 0) AS current_stock
FROM ingredients i
LEFT JOIN stock_movements m ON m.ingredient_id = i.id
GROUP BY i.id, i.name, i.unit, i.min_stock;
GO

/* ---------- 9. BẢNG NỘI DUNG WEBSITE (blog, sự kiện, gallery, thông tin chung) ---------- */
CREATE TABLE site_settings (                    -- liên hệ, giờ mở cửa, giới thiệu
    setting_key    VARCHAR(100)   NOT NULL PRIMARY KEY,
    setting_value  NVARCHAR(2000) NOT NULL,
    updated_at     DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

CREATE TABLE blog_categories (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    name        NVARCHAR(100) NOT NULL UNIQUE,
    slug        VARCHAR(120)  NOT NULL UNIQUE,
    sort_order  INT NOT NULL DEFAULT 0
);

CREATE TABLE blog_posts (
    id            INT IDENTITY(1,1) PRIMARY KEY,
    author_id     INT NULL REFERENCES users(id),
    title         NVARCHAR(200)  NOT NULL,
    slug          VARCHAR(200)   NOT NULL UNIQUE,
    excerpt       NVARCHAR(500)  NULL,                 -- đoạn trích ở trang danh sách
    content       NVARCHAR(MAX)  NOT NULL,             -- đoạn văn cách nhau bằng dòng trống
    image_url     NVARCHAR(500)  NULL,                 -- chỉ tên file, vd 'blog-05.jpg'
    tags          NVARCHAR(200)  NULL,                 -- chuỗi hiển thị, vd 'Nấu ăn, Món ăn'
    view_count    INT NOT NULL DEFAULT 0,
    is_published  BIT NOT NULL DEFAULT 1,
    published_at  DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    created_at    DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

CREATE TABLE blog_post_categories (             -- 1 bài thuộc nhiều danh mục (dành cho mở rộng, hiện chưa dùng)
    post_id      INT NOT NULL REFERENCES blog_posts(id),
    category_id  INT NOT NULL REFERENCES blog_categories(id),
    PRIMARY KEY (post_id, category_id)
);

CREATE TABLE blog_comments (
    id           INT IDENTITY(1,1) PRIMARY KEY,
    post_id      INT NOT NULL REFERENCES blog_posts(id),
    customer_id  INT NULL REFERENCES customers(id),    -- NULL = khách không đăng nhập
    author_name  NVARCHAR(150) NOT NULL,
    content      NVARCHAR(1000) NOT NULL,
    is_approved  BIT NOT NULL DEFAULT 0,               -- duyệt trước khi hiển thị
    created_at   DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

CREATE TABLE blog_popular_posts (               -- khối "Bài đọc nhiều" (popularPosts)
    id            INT IDENTITY(1,1) PRIMARY KEY,
    title         NVARCHAR(200) NOT NULL,
    image         NVARCHAR(500) NOT NULL,
    published_at  DATETIME2 NOT NULL,
    sort_order    INT NOT NULL DEFAULT 0
);

CREATE TABLE blog_archives (                    -- khối "Lưu trữ" (blogArchives), số liệu theo template
    id             INT IDENTITY(1,1) PRIMARY KEY,
    archive_month  DATE NOT NULL UNIQUE,        -- ngày đầu tháng
    post_count     INT  NOT NULL CHECK (post_count >= 0)
);

CREATE TABLE events (                           -- khối sự kiện có đồng hồ đếm ngược
    id            INT IDENTITY(1,1) PRIMARY KEY,
    title         NVARCHAR(200) NOT NULL,
    description   NVARCHAR(500) NULL,
    event_at      DATETIME2 NOT NULL,           -- frontend tự tính đếm ngược và định dạng giờ
    image         NVARCHAR(500) NULL,
    bg_image      NVARCHAR(500) NULL,
    link_url      NVARCHAR(500) NULL,
    sort_order    INT NOT NULL DEFAULT 0,
    is_published  BIT NOT NULL DEFAULT 1,
    created_at    DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

CREATE TABLE gallery_images (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    title           NVARCHAR(150) NOT NULL,
    thumb_url       NVARCHAR(500) NOT NULL,
    image_url       NVARCHAR(500) NOT NULL,
    sort_order      INT NOT NULL DEFAULT 0,
    is_visible      BIT NOT NULL DEFAULT 1,
    show_in_footer  BIT NOT NULL DEFAULT 0      -- 1 = ảnh lightbox ở footer, 0 = ảnh trang Gallery
);

CREATE TABLE gallery_categories (               -- bộ lọc: '*', interior, food, events, guests
    id          INT IDENTITY(1,1) PRIMARY KEY,
    slug        VARCHAR(50)   NOT NULL UNIQUE,  -- trùng khóa filter của frontend
    name        NVARCHAR(100) NOT NULL,
    sort_order  INT NOT NULL DEFAULT 0
);

CREATE TABLE gallery_image_categories (         -- 1 ảnh thuộc nhiều bộ lọc
    image_id     INT NOT NULL REFERENCES gallery_images(id),
    category_id  INT NOT NULL REFERENCES gallery_categories(id),
    PRIMARY KEY (image_id, category_id)
);

CREATE TABLE website_menu_items (               -- món nào hiện ở khối nào của trang Menu (menu.js)
    section       VARCHAR(20) NOT NULL
                  CHECK (section IN ('starters','drinks','desserts','mains','lunch','dinner')),
    menu_item_id  INT NOT NULL REFERENCES menu_items(id),
    sort_order    INT NOT NULL DEFAULT 0,
    PRIMARY KEY (section, menu_item_id)
);

/* ---------- 10. INDEX BỔ SUNG CHO BẢNG WEBSITE VÀ ĐÁNH GIÁ ---------- */
CREATE INDEX ix_blog_posts_published ON blog_posts(published_at DESC) WHERE is_published = 1;
CREATE INDEX ix_blog_posts_views     ON blog_posts(view_count DESC)   WHERE is_published = 1;
CREATE INDEX ix_blog_comments_post   ON blog_comments(post_id, is_approved);
CREATE INDEX ix_events_upcoming      ON events(event_at) WHERE is_published = 1;
CREATE INDEX ix_gallery_visible      ON gallery_images(show_in_footer, sort_order) WHERE is_visible = 1;
CREATE INDEX ix_website_menu_section ON website_menu_items(section, sort_order);
CREATE INDEX ix_reviews_published    ON reviews(created_at DESC) WHERE is_published = 1;
GO

/* ---------- 11. DỮ LIỆU NỀN (vai trò, bàn, danh mục, món và nguyên liệu mẫu ban đầu) ---------- */
INSERT INTO roles(name) VALUES (N'ADMIN'),(N'MANAGER'),(N'WAITER'),(N'CHEF'),(N'CASHIER'),(N'CUSTOMER');

INSERT INTO dining_tables(code, area, capacity) VALUES
 (N'A01', N'Tầng 1', 2), (N'A02', N'Tầng 1', 4),
 (N'B01', N'Sân vườn', 6), (N'VIP-1', N'Tầng 2', 10);

INSERT INTO menu_categories(name, sort_order) VALUES
 (N'Khai vị', 1), (N'Món chính', 2), (N'Tráng miệng', 3), (N'Đồ uống', 4);

INSERT INTO menu_items(category_id, name, description, price) VALUES
 (1, N'Gỏi cuốn tôm thịt', N'Rau thơm, bún, nước chấm đặc biệt', 55000),
 (2, N'Bò lúc lắc',        N'Thăn bò, ớt chuông, khoai tây',     165000),
 (3, N'Chè hạt sen',       N'Hạt sen, long nhãn',                 45000),
 (4, N'Trà đào cam sả',    N'Đá xay tuỳ chọn',                    49000);

INSERT INTO ingredients(name, unit, min_stock) VALUES
 (N'Thịt bò', N'kg', 5), (N'Tôm', N'kg', 3), (N'Hạt sen', N'kg', 2);
GO

/* ---------- 12. DỮ LIỆU DEMO VẬN HÀNH ----------
   Tài khoản, nhân viên, khách, bàn, đặt bàn, món bổ sung, kho, đơn hàng, thanh toán,
   đánh giá, newsletter. Mốc thời gian tính từ lúc chạy script (nên báo cáo luôn có số liệu). */
SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
BEGIN TRAN;

DECLARE @pwd NVARCHAR(255) = N'$2b$10$6V5DDjlXALfREPx3SiSdTOXMqGEtB0aFAXbe4joGS9MtaLzBMlWeS';

/* ---------- 12.1 TÀI KHOẢN & NHÂN VIÊN & KHÁCH ---------- */
INSERT INTO users(email, password_hash, role_id)
SELECT v.email, @pwd, r.id
FROM (VALUES
    (N'admin@restaurant.demo',   N'ADMIN'),
    (N'manager@restaurant.demo', N'MANAGER'),
    (N'waiter1@restaurant.demo', N'WAITER'),
    (N'waiter2@restaurant.demo', N'WAITER'),
    (N'chef@restaurant.demo',    N'CHEF'),
    (N'cashier@restaurant.demo', N'CASHIER'),
    (N'an.nguyen@example.com',   N'CUSTOMER'),
    (N'binh.tran@example.com',   N'CUSTOMER'),
    (N'cuong.le@example.com',    N'CUSTOMER')
) v(email, role_name)
JOIN roles r ON r.name = v.role_name;

INSERT INTO employees(user_id, full_name, phone, position, hired_date)
SELECT u.id, v.full_name, v.phone, v.position, v.hired_date
FROM (VALUES
    (N'admin@restaurant.demo',   N'Hoàng Quản Trị', '0912000001', N'Quản trị hệ thống', CAST('2022-01-10' AS DATE)),
    (N'manager@restaurant.demo', N'Nguyễn Thị Mai', '0912000002', N'Quản lý nhà hàng',  CAST('2022-03-01' AS DATE)),
    (N'waiter1@restaurant.demo', N'Trần Văn Nam',   '0912000003', N'Phục vụ bàn',       CAST('2023-05-15' AS DATE)),
    (N'waiter2@restaurant.demo', N'Lê Thị Oanh',    '0912000004', N'Phục vụ bàn',       CAST('2023-08-20' AS DATE)),
    (N'chef@restaurant.demo',    N'Phạm Đức Phúc',  '0912000005', N'Bếp trưởng',        CAST('2022-02-01' AS DATE)),
    (N'cashier@restaurant.demo', N'Vũ Thị Quỳnh',   '0912000006', N'Thu ngân',          CAST('2024-01-08' AS DATE))
) v(email, full_name, phone, position, hired_date)
JOIN users u ON u.email = v.email;

-- Khách có tài khoản
INSERT INTO customers(user_id, full_name, phone, email)
SELECT u.id, v.full_name, v.phone, v.email
FROM (VALUES
    (N'an.nguyen@example.com', N'Nguyễn Văn An',  '0901000001'),
    (N'binh.tran@example.com', N'Trần Thị Bình',  '0901000002'),
    (N'cuong.le@example.com',  N'Lê Hoàng Cường', '0901000003')
) v(email, full_name, phone)
JOIN users u ON u.email = v.email;

-- Khách vãng lai (đặt bàn không đăng ký, user_id = NULL)
INSERT INTO customers(user_id, full_name, phone, email) VALUES
 (NULL, N'Phạm Minh Dũng',  '0901000004', N'dung.pham@example.com'),
 (NULL, N'Võ Thị Hà',       '0901000005', N'ha.vo@example.com'),
 (NULL, N'Đặng Quốc Huy',   '0901000006', NULL),
 (NULL, N'Bùi Thanh Lan',   '0901000007', NULL);

/* ---------- 12.2 BÀN & ĐẶT BÀN ---------- */
-- (A01, A02, B01, VIP-1 đã có từ script gốc)
INSERT INTO dining_tables(code, area, capacity, status) VALUES
 (N'A03',   N'Tầng 1',   4, 'OCCUPIED'),
 (N'A04',   N'Tầng 1',   2, 'RESERVED'),
 (N'B02',   N'Sân vườn', 6, 'OCCUPIED'),
 (N'B03',   N'Sân vườn', 4, 'AVAILABLE'),
 (N'VIP-2', N'Tầng 2',   8, 'OUT_OF_SERVICE');

-- Mốc thời gian tính bằng giờ so với hiện tại (âm = quá khứ)
INSERT INTO reservations(customer_id, table_id, reserved_at, guests, note, status)
SELECT c.id, t.id, DATEADD(HOUR, v.h, SYSDATETIME()), v.guests, v.note, v.status
FROM (VALUES
    ('0901000001', N'B01',   -72, 6,  N'Tiệc gia đình',                 'COMPLETED'),
    ('0901000003', N'VIP-1', -48, 8,  N'Họp mặt công ty',               'COMPLETED'),
    ('0901000005', NULL,     -30, 2,  N'Khách báo hủy do bận đột xuất', 'CANCELLED'),
    ('0901000006', N'A02',   -26, 4,  N'Không đến, không báo trước',    'NO_SHOW'),
    ('0901000002', N'A03',    -1, 3,  N'Bàn 3 người, đã nhận bàn',      'CONFIRMED'),
    ('0901000007', N'A04',     3, 2,  N'Kỷ niệm ngày cưới, cần bàn yên tĩnh', 'CONFIRMED'),
    ('0901000004', NULL,      26, 10, N'Sinh nhật, chờ xếp bàn',        'PENDING'),
    ('0901000001', NULL,      50, 4,  N'Cần ghế trẻ em',                'PENDING')
) v(phone, table_code, h, guests, note, status)
JOIN customers c ON c.phone = v.phone
LEFT JOIN dining_tables t ON t.code = v.table_code;

/* ---------- 12.3 THỰC ĐƠN ---------- */
-- (4 danh mục và 4 món gốc đã có)
INSERT INTO menu_items(category_id, name, description, price, is_available)
SELECT c.id, v.name, v.description, v.price, v.is_available
FROM (VALUES
    (N'Khai vị',     N'Chả giò hải sản',      N'Chiên giòn, tôm mực, rau sống',          65000,  1),
    (N'Khai vị',     N'Súp cua',              N'Cua, trứng cút, nấm',                    59000,  0), -- tạm hết nguyên liệu
    (N'Món chính',   N'Cá hồi áp chảo',       N'Sốt chanh dây, măng tây',               215000,  1),
    (N'Món chính',   N'Gà nướng mật ong',     N'Nửa con, khoai nướng',                  189000,  1),
    (N'Món chính',   N'Cơm chiên dương châu', N'Tôm, xúc xích, trứng',                   79000,  1),
    (N'Món chính',   N'Lẩu thái hải sản',     N'Dành cho 3-4 người',                    349000,  1),
    (N'Tráng miệng', N'Bánh flan caramel',    N'Mềm mịn, caramel đắng nhẹ',              35000,  1),
    (N'Tráng miệng', N'Kem dừa',              N'Kem dừa Bến Tre, dừa nạo',               42000,  1),
    (N'Đồ uống',     N'Cà phê sữa đá',        N'Cà phê phin truyền thống',               39000,  1),
    (N'Đồ uống',     N'Nước ép cam',          N'Cam vắt tươi, ít đường',                 45000,  1),
    (N'Đồ uống',     N'Bia lon',              N'Lon 330ml, phục vụ lạnh',                25000,  1)
) v(category_name, name, description, price, is_available)
JOIN menu_categories c ON c.name = v.category_name;

/* ---------- 12.4 KHO ---------- */
INSERT INTO suppliers(name, phone, email) VALUES
 (N'Công ty Thực phẩm Sạch Việt', '0281000001', N'sales@thucphamsachviet.example'),
 (N'Hải sản Biển Xanh',           '0281000002', N'order@haisanbienxanh.example'),
 (N'Nông sản Đà Lạt',             '0263000003', NULL);

-- (Thịt bò, Tôm, Hạt sen đã có từ script gốc)
INSERT INTO ingredients(name, unit, min_stock) VALUES
 (N'Cá hồi',     N'kg',  3),
 (N'Thịt gà',    N'kg',  5),
 (N'Gạo',        N'kg',  10),
 (N'Rau thơm',   N'kg',  1),
 (N'Khoai tây',  N'kg',  5),
 (N'Ớt chuông',  N'kg',  2),
 (N'Bún tươi',   N'kg',  5),
 (N'Cam tươi',   N'kg',  5),
 (N'Đào',        N'kg',  3),
 (N'Sả',         N'kg',  1),
 (N'Long nhãn',  N'kg',  1),
 (N'Cà phê bột', N'kg',  2),
 (N'Bia lon',    N'lon', 48);

-- Công thức món (định lượng cho 1 phần)
INSERT INTO menu_item_ingredients(menu_item_id, ingredient_id, quantity)
SELECT m.id, i.id, v.qty
FROM (VALUES
    (N'Bò lúc lắc',          N'Thịt bò',    0.200),
    (N'Bò lúc lắc',          N'Khoai tây',  0.100),
    (N'Bò lúc lắc',          N'Ớt chuông',  0.050),
    (N'Gỏi cuốn tôm thịt',   N'Tôm',        0.050),
    (N'Gỏi cuốn tôm thịt',   N'Bún tươi',   0.080),
    (N'Gỏi cuốn tôm thịt',   N'Rau thơm',   0.030),
    (N'Chè hạt sen',         N'Hạt sen',    0.060),
    (N'Chè hạt sen',         N'Long nhãn',  0.030),
    (N'Trà đào cam sả',      N'Đào',        0.100),
    (N'Trà đào cam sả',      N'Cam tươi',   0.100),
    (N'Trà đào cam sả',      N'Sả',         0.020),
    (N'Cá hồi áp chảo',      N'Cá hồi',     0.250),
    (N'Gà nướng mật ong',    N'Thịt gà',    0.500),
    (N'Cơm chiên dương châu',N'Gạo',        0.150),
    (N'Cơm chiên dương châu',N'Tôm',        0.050),
    (N'Lẩu thái hải sản',    N'Tôm',        0.300),
    (N'Lẩu thái hải sản',    N'Rau thơm',   0.100),
    (N'Cà phê sữa đá',       N'Cà phê bột', 0.030),
    (N'Nước ép cam',         N'Cam tươi',   0.300),
    (N'Bia lon',             N'Bia lon',    1.000)
) v(item_name, ingredient_name, qty)
JOIN menu_items m  ON m.name = v.item_name
JOIN ingredients i ON i.name = v.ingredient_name;

-- Nhập kho đợt đầu (10 ngày trước)
INSERT INTO stock_movements(ingredient_id, supplier_id, type, quantity, unit_cost, created_at, created_by)
SELECT i.id, s.id, 'IN', v.qty, v.cost, DATEADD(HOUR, -240, SYSDATETIME()), e.id
FROM (VALUES
    (N'Thịt bò',    N'Công ty Thực phẩm Sạch Việt', 20,  230000),
    (N'Tôm',        N'Hải sản Biển Xanh',           10,  280000),
    (N'Hạt sen',    N'Nông sản Đà Lạt',              5,  150000),
    (N'Cá hồi',     N'Hải sản Biển Xanh',            8,  450000),
    (N'Thịt gà',    N'Công ty Thực phẩm Sạch Việt', 15,   95000),
    (N'Gạo',        N'Công ty Thực phẩm Sạch Việt', 50,   22000),
    (N'Rau thơm',   N'Nông sản Đà Lạt',              3,   60000),
    (N'Khoai tây',  N'Nông sản Đà Lạt',             20,   25000),
    (N'Ớt chuông',  N'Nông sản Đà Lạt',              6,   55000),
    (N'Bún tươi',   N'Công ty Thực phẩm Sạch Việt', 15,   18000),
    (N'Cam tươi',   N'Nông sản Đà Lạt',             20,   30000),
    (N'Đào',        N'Nông sản Đà Lạt',              8,   70000),
    (N'Sả',         N'Nông sản Đà Lạt',              2,   20000),
    (N'Long nhãn',  N'Nông sản Đà Lạt',              3,   85000),
    (N'Cà phê bột', N'Công ty Thực phẩm Sạch Việt',  5,  180000),
    (N'Bia lon',    N'Công ty Thực phẩm Sạch Việt', 240,  12000)
) v(ingredient_name, supplier_name, qty, cost)
JOIN ingredients i ON i.name = v.ingredient_name
JOIN suppliers   s ON s.name = v.supplier_name
CROSS JOIN (SELECT e.id FROM employees e JOIN users u ON u.id = e.user_id
            WHERE u.email = N'manager@restaurant.demo') e;

-- Xuất kho phục vụ bếp (tồn cuối: Tôm 2.5kg và Cá hồi 1.5kg < ngưỡng => có cảnh báo)
INSERT INTO stock_movements(ingredient_id, supplier_id, type, quantity, unit_cost, created_at, created_by)
SELECT i.id, NULL, 'OUT', v.qty, NULL, DATEADD(HOUR, v.h, SYSDATETIME()), e.id
FROM (VALUES
    (N'Thịt bò',    9.0,  -120),
    (N'Tôm',        7.5,  -100),
    (N'Hạt sen',    1.2,   -96),
    (N'Cá hồi',     6.0,   -90),
    (N'Thịt gà',    5.0,   -80),
    (N'Gạo',       12.0,   -72),
    (N'Rau thơm',   1.5,   -60),
    (N'Khoai tây',  4.0,   -60),
    (N'Ớt chuông',  1.0,   -48),
    (N'Bún tươi',   4.0,   -48),
    (N'Cam tươi',   8.0,   -36),
    (N'Đào',        4.5,   -36),
    (N'Sả',         0.8,   -24),
    (N'Long nhãn',  0.4,   -24),
    (N'Cà phê bột', 1.5,   -12),
    (N'Bia lon',   16.0,   -12)
) v(ingredient_name, qty, h)
JOIN ingredients i ON i.name = v.ingredient_name
CROSS JOIN (SELECT e.id FROM employees e JOIN users u ON u.id = e.user_id
            WHERE u.email = N'chef@restaurant.demo') e;

-- Điều chỉnh sau kiểm kê (số âm = hao hụt)
INSERT INTO stock_movements(ingredient_id, supplier_id, type, quantity, unit_cost, created_at, created_by)
SELECT i.id, NULL, 'ADJUST', v.qty, NULL, DATEADD(HOUR, -6, SYSDATETIME()), e.id
FROM (VALUES
    (N'Thịt bò', -1.0),
    (N'Cá hồi',  -0.5)
) v(ingredient_name, qty)
JOIN ingredients i ON i.name = v.ingredient_name
CROSS JOIN (SELECT e.id FROM employees e JOIN users u ON u.id = e.user_id
            WHERE u.email = N'manager@restaurant.demo') e;

/* ---------- 12.5 ĐƠN HÀNG ---------- */
-- Mỗi bàn chỉ có tối đa 1 đơn OPEN/SERVING (A03 và B02 dưới đây)
INSERT INTO orders(table_id, employee_id, reservation_id, status, note, created_at, closed_at)
SELECT t.id, emp.id, r.id, v.status, v.note,
       DATEADD(MINUTE, v.created_min, SYSDATETIME()),
       DATEADD(MINUTE, v.closed_min,  SYSDATETIME())
FROM (VALUES
    (N'B01',   N'waiter1@restaurant.demo', N'Tiệc gia đình',          'PAID',      N'[DEMO] Tiệc gia đình',        -4320, -4200),
    (N'VIP-1', N'waiter2@restaurant.demo', N'Họp mặt công ty',        'PAID',      N'[DEMO] Họp mặt công ty',      -2880, -2760),
    (N'A01',   N'waiter1@restaurant.demo', NULL,                      'PAID',      N'[DEMO] Khách lẻ buổi tối',    -1440, -1380),
    (N'A02',   N'waiter2@restaurant.demo', NULL,                      'PAID',      N'[DEMO] Bữa trưa gia đình',     -300,  -240),
    (N'A01',   N'waiter1@restaurant.demo', NULL,                      'CANCELLED', N'[DEMO] Khách đổi ý',          -1200, -1190),
    (N'A03',   N'waiter1@restaurant.demo', N'Bàn 3 người, đã nhận bàn','SERVING',  N'[DEMO] Đang phục vụ',           -60,  NULL),
    (N'B02',   N'waiter2@restaurant.demo', NULL,                      'OPEN',      N'[DEMO] Vừa mở bàn',             -20,  NULL)
) v(table_code, emp_email, res_note, status, note, created_min, closed_min)
JOIN dining_tables t ON t.code = v.table_code
LEFT JOIN (SELECT e.id, u.email FROM employees e JOIN users u ON u.id = e.user_id) emp
       ON emp.email = v.emp_email
LEFT JOIN reservations r ON r.note = v.res_note;

-- Chi tiết đơn (unit_price chụp từ giá hiện tại của món)
INSERT INTO order_items(order_id, menu_item_id, quantity, unit_price, note, status)
SELECT o.id, m.id, v.qty, m.price, v.note, v.status
FROM (VALUES
    -- Tiệc gia đình (B01)
    (N'[DEMO] Tiệc gia đình',      N'Gỏi cuốn tôm thịt',    3, NULL,                 'SERVED'),
    (N'[DEMO] Tiệc gia đình',      N'Bò lúc lắc',           2, N'Chín vừa',          'SERVED'),
    (N'[DEMO] Tiệc gia đình',      N'Gà nướng mật ong',     1, NULL,                 'SERVED'),
    (N'[DEMO] Tiệc gia đình',      N'Cơm chiên dương châu', 2, NULL,                 'SERVED'),
    (N'[DEMO] Tiệc gia đình',      N'Chè hạt sen',          6, NULL,                 'SERVED'),
    (N'[DEMO] Tiệc gia đình',      N'Trà đào cam sả',       6, N'Ít đá',             'SERVED'),
    -- Họp mặt công ty (VIP-1)
    (N'[DEMO] Họp mặt công ty',    N'Chả giò hải sản',      4, NULL,                 'SERVED'),
    (N'[DEMO] Họp mặt công ty',    N'Lẩu thái hải sản',     2, N'Cay vừa',           'SERVED'),
    (N'[DEMO] Họp mặt công ty',    N'Cá hồi áp chảo',       2, NULL,                 'SERVED'),
    (N'[DEMO] Họp mặt công ty',    N'Bò lúc lắc',           2, NULL,                 'SERVED'),
    (N'[DEMO] Họp mặt công ty',    N'Bia lon',             12, NULL,                 'SERVED'),
    (N'[DEMO] Họp mặt công ty',    N'Nước ép cam',          4, NULL,                 'SERVED'),
    (N'[DEMO] Họp mặt công ty',    N'Kem dừa',              8, NULL,                 'SERVED'),
    -- Khách lẻ buổi tối (A01)
    (N'[DEMO] Khách lẻ buổi tối',  N'Gỏi cuốn tôm thịt',    1, NULL,                 'SERVED'),
    (N'[DEMO] Khách lẻ buổi tối',  N'Cá hồi áp chảo',       1, NULL,                 'SERVED'),
    (N'[DEMO] Khách lẻ buổi tối',  N'Bò lúc lắc',           1, NULL,                 'SERVED'),
    (N'[DEMO] Khách lẻ buổi tối',  N'Trà đào cam sả',       2, NULL,                 'SERVED'),
    (N'[DEMO] Khách lẻ buổi tối',  N'Bánh flan caramel',    2, NULL,                 'SERVED'),
    -- Bữa trưa gia đình (A02), có 1 món bị hủy (không tính vào tổng tiền)
    (N'[DEMO] Bữa trưa gia đình',  N'Chả giò hải sản',      1, NULL,                 'SERVED'),
    (N'[DEMO] Bữa trưa gia đình',  N'Cơm chiên dương châu', 2, NULL,                 'SERVED'),
    (N'[DEMO] Bữa trưa gia đình',  N'Gà nướng mật ong',     1, NULL,                 'SERVED'),
    (N'[DEMO] Bữa trưa gia đình',  N'Cà phê sữa đá',        2, NULL,                 'SERVED'),
    (N'[DEMO] Bữa trưa gia đình',  N'Nước ép cam',          1, N'Khách đổi món',     'CANCELLED'),
    -- Đơn bị hủy
    (N'[DEMO] Khách đổi ý',        N'Bò lúc lắc',           1, N'Khách đổi ý',       'CANCELLED'),
    -- Đang phục vụ (A03)
    (N'[DEMO] Đang phục vụ',       N'Gỏi cuốn tôm thịt',    2, NULL,                 'SERVED'),
    (N'[DEMO] Đang phục vụ',       N'Lẩu thái hải sản',     1, NULL,                 'COOKING'),
    (N'[DEMO] Đang phục vụ',       N'Trà đào cam sả',       3, NULL,                 'READY'),
    (N'[DEMO] Đang phục vụ',       N'Cơm chiên dương châu', 2, N'Không hành',        'NEW'),
    -- Vừa mở bàn (B02)
    (N'[DEMO] Vừa mở bàn',         N'Chả giò hải sản',      2, NULL,                 'NEW'),
    (N'[DEMO] Vừa mở bàn',         N'Gà nướng mật ong',     1, NULL,                 'NEW'),
    (N'[DEMO] Vừa mở bàn',         N'Nước ép cam',          2, NULL,                 'NEW')
) v(order_note, item_name, qty, note, status)
JOIN orders     o ON o.note = v.order_note
JOIN menu_items m ON m.name = v.item_name;

/* ---------- 12.6 THANH TOÁN ---------- */
-- Số tiền lấy từ view vw_order_totals nên luôn khớp tổng đơn
INSERT INTO payments(order_id, method, amount, paid_at)
SELECT o.id, 'TRANSFER', t.total_amount, o.closed_at
FROM orders o JOIN vw_order_totals t ON t.order_id = o.id
WHERE o.note = N'[DEMO] Tiệc gia đình';

INSERT INTO payments(order_id, method, amount, paid_at)
SELECT o.id, 'CARD', t.total_amount, o.closed_at
FROM orders o JOIN vw_order_totals t ON t.order_id = o.id
WHERE o.note = N'[DEMO] Họp mặt công ty';

INSERT INTO payments(order_id, method, amount, paid_at)
SELECT o.id, 'CASH', t.total_amount, o.closed_at
FROM orders o JOIN vw_order_totals t ON t.order_id = o.id
WHERE o.note = N'[DEMO] Khách lẻ buổi tối';

-- Thanh toán chia 2 phương thức: 100.000đ tiền mặt + phần còn lại bằng ví điện tử
INSERT INTO payments(order_id, method, amount, paid_at)
SELECT o.id, 'CASH', 100000, o.closed_at
FROM orders o WHERE o.note = N'[DEMO] Bữa trưa gia đình';

INSERT INTO payments(order_id, method, amount, paid_at)
SELECT o.id, 'E_WALLET', t.total_amount - 100000, o.closed_at
FROM orders o JOIN vw_order_totals t ON t.order_id = o.id
WHERE o.note = N'[DEMO] Bữa trưa gia đình';

/* ---------- 12.7 NỘI DUNG WEBSITE ---------- */
INSERT INTO reviews(customer_id, rating, content, is_published, created_at)
SELECT c.id, v.rating, v.content, v.is_published, DATEADD(HOUR, v.h, SYSDATETIME())
FROM (VALUES
    ('0901000001', 5, N'Món ăn ngon, nhân viên thân thiện. Bò lúc lắc mềm và đậm vị, cả nhà đều hài lòng!', 1, -66),
    ('0901000003', 5, N'Không gian VIP sang trọng, phục vụ chu đáo. Công ty mình sẽ quay lại cho buổi họp mặt sau.', 1, -44),
    ('0901000002', 4, N'Đồ ăn ngon, giá hợp lý. Cuối tuần hơi đông nên lên món chậm một chút.', 1, -20),
    ('0901000005', 3, N'Món ăn ổn nhưng bàn hơi ồn vào giờ cao điểm.', 0, -10),
    ('0901000004', 5, N'Lẩu thái hải sản rất đáng thử, nước dùng đậm đà.', 0, -5),
    ('0901000006', 2, N'Đợi khá lâu mới được xếp bàn, mong nhà hàng cải thiện.', 0, -3)
) v(phone, rating, content, is_published, h)
JOIN customers c ON c.phone = v.phone;

INSERT INTO newsletter_subscribers(email, subscribed_at, is_active)
SELECT v.email, DATEADD(HOUR, v.h, SYSDATETIME()), v.is_active
FROM (VALUES
    (N'an.nguyen@example.com',   -500, 1),
    (N'binh.tran@example.com',   -400, 1),
    (N'dung.pham@example.com',   -300, 1),
    (N'ha.vo@example.com',       -250, 1),
    (N'khachhang01@example.com', -200, 1),
    (N'khachhang02@example.com', -150, 1),
    (N'foodie.hanoi@example.com',-100, 1),
    (N'da.huy.dang.ky@example.com', -80, 0)   -- đã hủy đăng ký
) v(email, h, is_active);

COMMIT TRAN;
PRINT N'  - Đã thêm dữ liệu demo vận hành.';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRAN;
    THROW;
END CATCH;
GO

/* ---------- 13. DỮ LIỆU WEBSITE (khớp menu.js, blog.js, events.js, gallery.js) ----------
   Ảnh: chỉ tên file (frontend dùng getImage). Giá: USD gốc quy đổi VND theo @usd_vnd, làm tròn nghìn đồng.
   Phải chạy SAU mục 12 vì cần tài khoản admin và khách demo. */
SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
BEGIN TRAN;

DECLARE @usd_vnd DECIMAL(18,2) = 26000;   -- tỷ giá quy đổi, đổi tại đây nếu muốn
DECLARE @admin INT = (SELECT id FROM users WHERE email = N'admin@restaurant.demo');

/* ---- Thông tin chung (footer, trang liên hệ, giới thiệu) ---- */
INSERT INTO site_settings(setting_key, setting_value) VALUES
 ('site_name',      N'Nhà hàng Hương Việt'),
 ('slogan',         N'Tinh hoa ẩm thực Việt trong không gian ấm cúng'),
 ('address',        N'Tầng 8, 123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh'),
 ('phone',          N'(+84) 28 7300 1234'),
 ('email',          N'lienhe@huongviet.example'),
 ('opening_hours',  N'09:30 – 23:00'),
 ('opening_days',   N'Mở cửa mỗi ngày'),
 ('about_title',    N'Về chúng tôi'),
 ('about_content',  N'Hương Việt ra đời với mong muốn mang đến những bữa ăn đậm đà hương vị quê nhà. Mỗi món ăn đều được chọn lọc từ nguồn nguyên liệu tươi mỗi ngày và chế biến bởi đội ngũ bếp giàu kinh nghiệm.

Từ bữa cơm gia đình ấm cúng đến tiệc cưới, họp mặt công ty, chúng tôi luôn sẵn sàng phục vụ với không gian sang trọng và sự tận tâm trong từng chi tiết.'),
 ('facebook_url',   N'https://facebook.com/huongviet.demo'),
 ('instagram_url',  N'https://instagram.com/huongviet.demo'),
 ('reservation_note', N'Vui lòng đặt bàn trước ít nhất 2 giờ. Nhóm trên 10 khách xin liên hệ trực tiếp qua điện thoại.');

/* ============ BLOG (blog.js) ============ */
-- blogCategories: 5 mục (mục 1 đã có từ script 03 nên được dùng lại)
INSERT INTO blog_categories(name, slug, sort_order)
SELECT v.name, v.slug, v.sort_order
FROM (VALUES
    (N'Công thức nấu ăn', 'cong-thuc-nau-an',  1),
    (N'Món ăn ngon',      'mon-an-ngon',       2),
    (N'Thiết kế sự kiện', 'thiet-ke-su-kien',  3),
    (N'Địa điểm nhà hàng','dia-diem-nha-hang', 4),
    (N'WordPress',        'wordpress',         5)
) v(name, slug, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM blog_categories c WHERE c.slug = v.slug OR c.name = v.name);

-- blogPosts: 5 bài, đúng ngày, ảnh, tags. (bản gốc không có nội dung chi tiết nên content = excerpt)
INSERT INTO blog_posts(author_id, title, slug, excerpt, content, image_url, tags, view_count, is_published, published_at)
SELECT @admin, v.title, v.slug, v.excerpt, v.excerpt, v.image, N'Nấu ăn, Món ăn', v.views, 1,
       CAST(v.published AS DATETIME2)
FROM (VALUES
    (N'Công thức nấu ăn thơm ngon',
     'cong-thuc-nau-an-thom-ngon', N'blog-05.jpg', '2018-12-28', 320,
     N'Học cách chọn nguyên liệu tươi và nêm nếm vừa vặn để mỗi món ăn trở nên thơm ngon, đậm đà như nhà hàng ngay trong căn bếp của bạn.'),
    (N'Pizza được chế biến tươi mới',
     'pizza-duoc-che-bien-tuoi-moi', N'blog-06.jpg', '2018-12-20', 280,
     N'Bột bánh được ủ mỗi ngày, phô mai kéo sợi cùng nguyên liệu tươi chọn lọc tạo nên những chiếc pizza nóng hổi, thơm lừng.'),
    (N'Trang trí tiệc cưới',
     'trang-tri-tiec-cuoi', N'blog-04.jpg', '2018-12-16', 190,
     N'Từ cách bố trí bàn tiệc, hoa trang trí đến ánh sáng, những gợi ý giúp buổi tiệc cưới của bạn thêm trọn vẹn và ấm cúng.'),
    (N'Những địa điểm thưởng thức rượu vang tuyệt nhất',
     'dia-diem-thuong-thuc-ruou-vang', N'blog-07.jpg', '2018-12-15', 150,
     N'Gợi ý những không gian lý tưởng để thưởng thức rượu vang cùng bạn bè và người thân, từ quầy bar sang trọng đến sân vườn yên tĩnh.'),
    (N'Những địa điểm thưởng thức rượu vang tuyệt nhất',
     'dia-diem-thuong-thuc-ruou-vang-2', N'blog-10.jpg', '2018-12-12', 90,
     N'Hướng dẫn chọn rượu vang phù hợp với từng món ăn và những nơi giúp bạn tận hưởng trọn vẹn hương vị của từng ly vang.')
) v(title, slug, image, published, views, excerpt);

-- comments: '8 Comments', '5', '2', '3', '6' -> tạo đúng số bình luận đã duyệt cho từng bài
;WITH nums AS (
    SELECT TOP (8) ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS i FROM sys.all_objects
),
pool AS (
    SELECT idx, author, content FROM (VALUES
        (1, N'Nguyễn Thu Hà',    N'Bài viết rất hữu ích, mình sẽ thử làm theo vào cuối tuần này.'),
        (2, N'Trần Minh Quân',   N'Hình ảnh đẹp quá, nhìn là muốn ghé nhà hàng ngay.'),
        (3, N'Lê Phương Anh',    N'Cảm ơn nhà hàng đã chia sẻ, mong có thêm nhiều bài như thế này.'),
        (4, N'Phạm Gia Bảo',     N'Lần trước mình đến thử và rất hài lòng với món ăn.'),
        (5, N'Võ Ngọc Mai',      N'Cho mình hỏi nhà hàng có nhận đặt tiệc theo yêu cầu không ạ?'),
        (6, N'Đặng Hoàng Long',  N'Nội dung hay, trình bày dễ hiểu.'),
        (7, N'Bùi Khánh Linh',   N'Mình đã giới thiệu cho bạn bè cùng đọc.'),
        (8, N'Hoàng Anh Tuấn',   N'Mong nhà hàng sớm có thêm các chương trình ưu đãi.')
    ) p(idx, author, content)
)
INSERT INTO blog_comments(post_id, customer_id, author_name, content, is_approved, created_at)
SELECT p.id, NULL, pool.author, pool.content, 1, DATEADD(HOUR, n.i * 6, p.published_at)
FROM (VALUES
    ('cong-thuc-nau-an-thom-ngon', 8),
    ('pizza-duoc-che-bien-tuoi-moi', 5),
    ('trang-tri-tiec-cuoi', 2),
    ('dia-diem-thuong-thuc-ruou-vang', 3),
    ('dia-diem-thuong-thuc-ruou-vang-2', 6)
) v(slug, cnt)
JOIN blog_posts p ON p.slug = v.slug
JOIN nums n       ON n.i <= v.cnt
JOIN pool         ON pool.idx = n.i;

-- popularPosts: 5 mục ("3 days ago" = 3 ngày trước thời điểm import)
INSERT INTO blog_popular_posts(title, image, published_at, sort_order)
SELECT v.title, v.image,
       COALESCE(CAST(v.published AS DATETIME2), DATEADD(DAY, -3, SYSDATETIME())), v.sort_order
FROM (VALUES
    (N'Những địa điểm thưởng thức rượu vang tuyệt nhất', N'blog-11.jpg', NULL,         1),
    (N'Trứng và phô mai',                                N'blog-12.jpg', '2017-07-02', 2),
    (N'Trang trí tiệc cưới',                             N'blog-13.jpg', '2017-05-28', 3),
    (N'Công thức nấu ăn thơm ngon',                      N'blog-14.jpg', '2017-05-25', 4),
    (N'Pizza được chế biến tươi mới',                    N'blog-15.jpg', '2017-05-02', 5)
) v(title, image, published, sort_order);

-- blogArchives: 8 tháng với số bài đúng theo template
INSERT INTO blog_archives(archive_month, post_count)
SELECT CAST(v.m AS DATE), v.cnt
FROM (VALUES
    ('2018-07-01',  9), ('2018-06-01', 39), ('2018-05-01', 29), ('2018-04-01', 35),
    ('2018-03-01', 22), ('2018-02-01', 32), ('2018-01-01', 21), ('2017-12-01', 26)
) v(m, cnt);

/* ============ MENU (menu.js) ============ */
INSERT INTO menu_categories(name, sort_order)
SELECT v.name, v.sort_order
FROM (VALUES (N'Thực đơn trưa', 5), (N'Thực đơn tối', 6)) v(name, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM menu_categories c WHERE c.name = v.name);

-- Giá gốc bằng USD đúng như file .js; quy đổi VND khi ghi vào menu_items
DECLARE @web_menu TABLE (
    section VARCHAR(20), sort_order INT, category_name NVARCHAR(100),
    name NVARCHAR(150), description NVARCHAR(500), usd DECIMAL(10,2), image NVARCHAR(500)
);
INSERT INTO @web_menu(section, sort_order, category_name, name, description, usd, image) VALUES
 -- mainMenuData.starters
 ('starters', 1, N'Khai vị',     N'Salad hạt thông sốt chanh leo', N'Rau mầm, hạt thông rang giòn, sốt chanh leo',     29.79, NULL),
 ('starters', 2, N'Khai vị',     N'Tôm chiên giòn sốt me',         N'Tôm tươi chiên giòn, sốt me chua ngọt',           19.35, NULL),
 ('starters', 3, N'Khai vị',     N'Bánh mì nướng bơ tỏi',          N'Giòn thơm, dùng kèm sốt phô mai',                 12.19, NULL),
 ('starters', 4, N'Khai vị',     N'Nghêu hấp sả ớt',               N'Nghêu tươi hấp cùng sả, ớt và lá chanh',          21.89, NULL),
 -- mainMenuData.drinks
 ('drinks',   1, N'Đồ uống',     N'Rượu vang đỏ tuyển chọn',       N'Vang đỏ nhập khẩu, hậu vị mượt mà',               43.97, NULL),
 ('drinks',   2, N'Đồ uống',     N'Sinh tố bơ dừa',                N'Bơ sáp xay cùng nước cốt dừa béo mịn',            19.25, NULL),
 ('drinks',   3, N'Đồ uống',     N'Trà vải hoa hồng',              N'Trà thanh mát, vải ngâm và cánh hoa hồng',        10.79, NULL),
 ('drinks',   4, N'Đồ uống',     N'Soda chanh bạc hà',             N'Chanh tươi, bạc hà và soda sủi nhẹ',              15.79, NULL),
 -- mainMenuData.desserts
 ('desserts', 1, N'Tráng miệng', N'Bánh su kem vani',              N'Vỏ giòn, nhân kem vani thơm béo',                  9.79, NULL),
 ('desserts', 2, N'Tráng miệng', N'Panna cotta dâu',               N'Kem sữa mềm mịn, phủ sốt dâu tươi',               19.35, NULL),
 ('desserts', 3, N'Tráng miệng', N'Chè khúc bạch',                 N'Khúc bạch mát lạnh, nhãn và hạt é',                5.79, NULL),
 ('desserts', 4, N'Tráng miệng', N'Bánh chuối nướng',              N'Chuối nướng nước cốt dừa, dùng kèm kem lạnh',     12.19, NULL),
 -- mainMenuData.mains
 ('mains',    1, N'Món chính',   N'Sườn cừu nướng thảo mộc',       N'Sườn cừu nướng chậm cùng thảo mộc',               31.18, NULL),
 ('mains',    2, N'Món chính',   N'Bò thượng hạng áp chảo',        N'Thăn bò mềm, sốt tiêu đen và khoai nghiền',       70.25, NULL),
 ('mains',    3, N'Món chính',   N'Vịt quay sốt cam',              N'Vịt quay da giòn, sốt cam chua ngọt',             29.79, NULL),
 ('mains',    4, N'Món chính',   N'Mì Ý hải sản',                  N'Mì Ý, tôm, mực và sốt cà chua',                   15.19, NULL),
 -- lunchData
 ('lunch',    1, N'Thực đơn trưa', N'Cá hồi sốt chanh dây',        N'Cá hồi áp chảo, sốt chanh dây chua ngọt',         29.79, N'lunch-01.jpg'),
 ('lunch',    2, N'Thực đơn trưa', N'Lẩu gà lá é',                 N'Gà ta nấu lẩu với lá é thơm nồng, dành cho nhóm', 63.79, N'lunch-02.jpg'),
 ('lunch',    3, N'Thực đơn trưa', N'Bò nướng lá lốt',             N'Bò cuốn lá lốt nướng than, chấm mắm nêm',         45.09, N'lunch-03.jpg'),
 ('lunch',    4, N'Thực đơn trưa', N'Gỏi ngó sen tôm thịt',        N'Ngó sen giòn, tôm, thịt và rau thơm',             15.35, N'lunch-04.jpg'),
 ('lunch',    5, N'Thực đơn trưa', N'Cháo hải sản nóng',           N'Cháo nấu nhuyễn cùng tôm, mực và nghêu',          12.75, N'lunch-05.jpg'),
 ('lunch',    6, N'Thực đơn trưa', N'Đậu hũ sốt nấm',              N'Đậu hũ chiên giòn, sốt nấm đông cô',              15.35, N'lunch-06.jpg'),
 -- dinnerData
 ('dinner',   1, N'Thực đơn tối',  N'Tôm nướng bơ tỏi',            N'Tôm tươi nướng bơ tỏi thơm lừng',                 29.79, N'dinner-01.jpg'),
 ('dinner',   2, N'Thực đơn tối',  N'Sườn heo nướng sốt BBQ',      N'Sườn nướng chậm, phết sốt BBQ khói',              31.18, N'dinner-02.jpg'),
 ('dinner',   3, N'Thực đơn tối',  N'Cá nướng giấy bạc',           N'Cá tươi nướng giấy bạc cùng rau thơm và sả',      45.09, N'dinner-03.jpg'),
 ('dinner',   4, N'Thực đơn tối',  N'Rau củ nướng thảo mộc',       N'Rau củ theo mùa nướng cùng thảo mộc',             15.35, N'dinner-04.jpg'),
 ('dinner',   5, N'Thực đơn tối',  N'Khoai tây nghiền bơ',         N'Khoai tây nghiền mịn, bơ và hành lá',             12.75, N'dinner-05.jpg'),
 ('dinner',   6, N'Thực đơn tối',  N'Canh bí đỏ kem tươi',         N'Bí đỏ nấu nhuyễn, kem tươi và hạt điều',          15.35, N'dinner-06.jpg');

INSERT INTO menu_items(category_id, name, description, price, image_url, is_available)
SELECT c.id, w.name, w.description, ROUND(w.usd * @usd_vnd, -3), w.image, 1
FROM @web_menu w
JOIN menu_categories c ON c.name = w.category_name
WHERE NOT EXISTS (SELECT 1 FROM menu_items m WHERE m.category_id = c.id AND m.name = w.name);

INSERT INTO website_menu_items(section, menu_item_id, sort_order)
SELECT w.section, m.id, w.sort_order
FROM @web_menu w
JOIN menu_categories c ON c.name = w.category_name
JOIN menu_items m      ON m.category_id = c.id AND m.name = w.name;

/* ============ EVENTS (events.js) ============ */
-- Bản gốc: 3 sự kiện cùng tiêu đề, đếm ngược ~25 ngày, 08:00 PM.
-- event_at = 20:00 của ngày (hôm nay + 26) => đồng hồ hiển thị khoảng 25 ngày.
INSERT INTO events(title, description, event_at, image, bg_image, link_url, sort_order)
SELECT N'Những đêm thưởng thức rượu vang đặc biệt',
       N'Cùng thưởng thức những chai vang tuyển chọn trong không gian ấm cúng, kết hợp với thực đơn do bếp trưởng gợi ý riêng cho từng đêm.',
       DATEADD(HOUR, 20, DATEADD(DAY, 26, CAST(CAST(SYSDATETIME() AS DATE) AS DATETIME2))),
       v.image, v.bg_image, N'#', v.sort_order
FROM (VALUES
    (N'event-02.jpg', N'bg-event-01.jpg', 1),
    (N'event-06.jpg', N'bg-event-02.jpg', 2),
    (N'event-01.jpg', N'bg-event-04.jpg', 3)
) v(image, bg_image, sort_order);

/* ============ GALLERY (gallery.js) ============ */
-- galleryCategories: 5 nút lọc ('*' = Tất cả ảnh)
INSERT INTO gallery_categories(slug, name, sort_order)
SELECT v.slug, v.name, v.sort_order
FROM (VALUES
    ('*',        N'Tất cả ảnh', 0),
    ('interior', N'Nội thất',   1),
    ('food',     N'Món ăn',     2),
    ('events',   N'Sự kiện',    3),
    ('guests',   N'Khách VIP',  4)
) v(slug, name, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM gallery_categories c WHERE c.slug = v.slug);

-- galleryThumbnails: 9 ảnh (ảnh lớn + ảnh nhỏ) cho lightbox ở footer
INSERT INTO gallery_images(title, thumb_url, image_url, sort_order, is_visible, show_in_footer)
SELECT v.title, v.thumb, v.full_img, v.sort_order, 1, 1
FROM (VALUES
    (N'Khoảnh khắc nhà hàng 01', N'photo-gallery-thumb-01.jpg', N'photo-gallery-01.jpg', 1),
    (N'Khoảnh khắc nhà hàng 02', N'photo-gallery-thumb-02.jpg', N'photo-gallery-02.jpg', 2),
    (N'Khoảnh khắc nhà hàng 03', N'photo-gallery-thumb-03.jpg', N'photo-gallery-03.jpg', 3),
    (N'Khoảnh khắc nhà hàng 04', N'photo-gallery-thumb-05.jpg', N'photo-gallery-05.jpg', 4),
    (N'Khoảnh khắc nhà hàng 05', N'photo-gallery-thumb-06.jpg', N'photo-gallery-06.jpg', 5),
    (N'Khoảnh khắc nhà hàng 06', N'photo-gallery-thumb-07.jpg', N'photo-gallery-07.jpg', 6),
    (N'Khoảnh khắc nhà hàng 07', N'photo-gallery-thumb-09.jpg', N'photo-gallery-09.jpg', 7),
    (N'Khoảnh khắc nhà hàng 08', N'photo-gallery-thumb-10.jpg', N'photo-gallery-10.jpg', 8),
    (N'Khoảnh khắc nhà hàng 09', N'photo-gallery-thumb-11.jpg', N'photo-gallery-11.jpg', 9)
) v(title, thumb, full_img, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM gallery_images g WHERE g.image_url = v.full_img AND g.show_in_footer = 1);

-- galleryItems: 9 ảnh trang Gallery
INSERT INTO gallery_images(title, thumb_url, image_url, sort_order, is_visible, show_in_footer)
SELECT v.title, v.img, v.img, v.sort_order, 1, 0
FROM (VALUES
    (N'Tiệc tối cùng khách VIP', N'photo-gallery-13.jpg', 1),
    (N'Gỏi cuốn tôm thịt',       N'photo-gallery-14.jpg', 2),
    (N'Đêm nhạc acoustic',       N'photo-gallery-15.jpg', 3),
    (N'Bò lúc lắc',              N'photo-gallery-16.jpg', 4),
    (N'Cá hồi áp chảo',          N'photo-gallery-17.jpg', 5),
    (N'Phòng VIP tầng 2',        N'photo-gallery-18.jpg', 6),
    (N'Không gian tầng 1',       N'photo-gallery-19.jpg', 7),
    (N'Khu sân vườn',            N'photo-gallery-20.jpg', 8),
    (N'Tiệc sinh nhật',          N'photo-gallery-21.jpg', 9)
) v(title, img, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM gallery_images g WHERE g.image_url = v.img AND g.show_in_footer = 0);

-- categories của từng ảnh, đúng như mảng categories trong gallery.js
INSERT INTO gallery_image_categories(image_id, category_id)
SELECT g.id, c.id
FROM (VALUES
    (N'photo-gallery-13.jpg', 'events'),   (N'photo-gallery-13.jpg', 'guests'),
    (N'photo-gallery-14.jpg', 'food'),
    (N'photo-gallery-15.jpg', 'events'),
    (N'photo-gallery-16.jpg', 'food'),
    (N'photo-gallery-17.jpg', 'food'),
    (N'photo-gallery-18.jpg', 'interior'), (N'photo-gallery-18.jpg', 'guests'),
    (N'photo-gallery-19.jpg', 'interior'),
    (N'photo-gallery-20.jpg', 'interior'),
    (N'photo-gallery-21.jpg', 'events')
) v(img, category_slug)
JOIN gallery_images     g ON g.image_url = v.img AND g.show_in_footer = 0
JOIN gallery_categories c ON c.slug = v.category_slug
WHERE NOT EXISTS (SELECT 1 FROM gallery_image_categories x WHERE x.image_id = g.id AND x.category_id = c.id);

/* ---- Thêm đánh giá đã duyệt cho carousel "Khách hàng nói gì" ---- */
INSERT INTO reviews(customer_id, rating, content, is_published, created_at)
SELECT c.id, v.rating, v.content, 1, DATEADD(HOUR, v.h, SYSDATETIME())
FROM (VALUES
 ('0901000007', 5, N'Tối kỷ niệm ngày cưới ở đây rất lãng mạn. Nhân viên chuẩn bị sẵn hoa và nến, chúng mình rất cảm động.', -40),
 ('0901000004', 5, N'Gia đình mình thường xuyên đến đây vào cuối tuần. Món ăn luôn ổn định, giá cả hợp lý.', -30),
 ('0901000002', 5, N'Lẩu thái hải sản đậm vị, hải sản rất tươi. Chắc chắn sẽ quay lại cùng bạn bè.', -15)
) v(phone, rating, content, h)
JOIN customers c ON c.phone = v.phone;

COMMIT TRAN;
PRINT N'  - Đã thêm dữ liệu website/template.';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRAN;
    THROW;
END CATCH;
GO

/* ---------- 14. KIỂM TRA SAU KHI CHẠY ---------- */
-- Số dòng của từng bảng
SELECT t.name AS table_name, SUM(p.rows) AS row_count
FROM sys.tables t
JOIN sys.partitions p ON p.object_id = t.object_id AND p.index_id IN (0, 1)
GROUP BY t.name
ORDER BY t.name;

-- Số món mỗi khối menu: starters/drinks/desserts/mains = 4, lunch/dinner = 6
SELECT section, COUNT(*) AS items FROM website_menu_items GROUP BY section ORDER BY section;

-- 5 bài blog đang hiển thị, kèm số bình luận đã duyệt (8, 5, 2, 3, 6)
SELECT p.title, p.published_at, p.tags,
       (SELECT COUNT(*) FROM blog_comments c WHERE c.post_id = p.id AND c.is_approved = 1) AS comment_count
FROM blog_posts p WHERE p.is_published = 1 ORDER BY p.published_at DESC;

-- Mỗi đơn đã thanh toán phải có paid_amount = total_amount
SELECT o.id, o.note, o.status, t.total_amount, t.paid_amount
FROM orders o JOIN vw_order_totals t ON t.order_id = o.id
WHERE o.note LIKE N'[[]DEMO]%'
ORDER BY o.id;

-- Nguyên liệu dưới ngưỡng tồn tối thiểu (Tôm, Cá hồi)
SELECT name, unit, min_stock, current_stock FROM vw_ingredient_stock WHERE current_stock < min_stock;

PRINT N'Hoàn tất tạo RestaurantDB.';
GO
SET NOEXEC OFF;   -- kết thúc GUARD (an toàn khi chạy bình thường)
GO