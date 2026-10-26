/* ============================================================
   RESTAURANT MANAGEMENT SYSTEM - SQL SERVER SAMPLE SCHEMA
   Dùng cho CSDL MỚI. Script không chứa DROP/DELETE.
   ============================================================ */
IF DB_ID(N'RestaurantDB') IS NULL
    CREATE DATABASE RestaurantDB COLLATE Vietnamese_100_CI_AS;
GO
USE RestaurantDB;
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

/* ---------- 9. DỮ LIỆU MẪU ---------- */
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
