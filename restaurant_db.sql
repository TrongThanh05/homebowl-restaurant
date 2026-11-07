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

/* ================= PHẦN 1: BẢNG MỚI ================= */
IF OBJECT_ID(N'dbo.blog_categories', N'U') IS NULL
CREATE TABLE blog_categories (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    name        NVARCHAR(100) NOT NULL UNIQUE,
    slug        VARCHAR(120)  NOT NULL UNIQUE,
    sort_order  INT NOT NULL DEFAULT 0
);
GO

IF OBJECT_ID(N'dbo.blog_posts', N'U') IS NULL
CREATE TABLE blog_posts (
    id            INT IDENTITY(1,1) PRIMARY KEY,
    author_id     INT NULL REFERENCES users(id),
    title         NVARCHAR(200)  NOT NULL,
    slug          VARCHAR(200)   NOT NULL UNIQUE,
    excerpt       NVARCHAR(500)  NULL,                 -- đoạn trích ở trang danh sách
    content       NVARCHAR(MAX)  NOT NULL,             -- đoạn văn cách nhau bằng dòng trống
    image_url     NVARCHAR(500)  NULL,
    view_count    INT NOT NULL DEFAULT 0,              -- dùng cho mục "Đọc nhiều nhất"
    is_published  BIT NOT NULL DEFAULT 1,
    published_at  DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    created_at    DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO

IF OBJECT_ID(N'dbo.blog_post_categories', N'U') IS NULL
CREATE TABLE blog_post_categories (                    -- 1 bài thuộc nhiều danh mục
    post_id      INT NOT NULL REFERENCES blog_posts(id),
    category_id  INT NOT NULL REFERENCES blog_categories(id),
    PRIMARY KEY (post_id, category_id)
);
GO

IF OBJECT_ID(N'dbo.blog_comments', N'U') IS NULL
CREATE TABLE blog_comments (
    id           INT IDENTITY(1,1) PRIMARY KEY,
    post_id      INT NOT NULL REFERENCES blog_posts(id),
    customer_id  INT NULL REFERENCES customers(id),    -- NULL = khách không đăng nhập
    author_name  NVARCHAR(150) NOT NULL,
    content      NVARCHAR(1000) NOT NULL,
    is_approved  BIT NOT NULL DEFAULT 0,               -- duyệt trước khi hiển thị
    created_at   DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO

IF OBJECT_ID(N'dbo.gallery_images', N'U') IS NULL
CREATE TABLE gallery_images (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    title       NVARCHAR(150) NOT NULL,
    thumb_url   NVARCHAR(500) NOT NULL,
    image_url   NVARCHAR(500) NOT NULL,
    sort_order  INT NOT NULL DEFAULT 0,
    is_visible  BIT NOT NULL DEFAULT 1
);
GO

IF OBJECT_ID(N'dbo.site_settings', N'U') IS NULL
CREATE TABLE site_settings (                           -- thông tin chung: liên hệ, giờ mở cửa, giới thiệu
    setting_key    VARCHAR(100)   NOT NULL PRIMARY KEY,
    setting_value  NVARCHAR(2000) NOT NULL,
    updated_at     DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO

/* ================= PHẦN 2: DỮ LIỆU ================= */
SET NOCOUNT ON;
SET XACT_ABORT ON;

IF EXISTS (SELECT 1 FROM blog_categories) OR EXISTS (SELECT 1 FROM site_settings)
BEGIN
    PRINT N'Nội dung website đã tồn tại, bỏ qua.';
    RETURN;
END;

BEGIN TRY
BEGIN TRAN;

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

/* ---- Danh mục blog ---- */
INSERT INTO blog_categories(name, slug, sort_order) VALUES
 (N'Công thức nấu ăn',     'cong-thuc-nau-an',     1),
 (N'Món ngon',             'mon-ngon',             2),
 (N'Sự kiện & Tiệc',       'su-kien-tiec',         3),
 (N'Không gian nhà hàng',  'khong-gian-nha-hang',  4),
 (N'Tin tức & Khuyến mãi', 'tin-tuc-khuyen-mai',   5);

/* ---- Bài viết (8 bài: trang 1 hiện 5 bài, trang 2 hiện 3 bài) ---- */
DECLARE @admin INT = (SELECT id FROM users WHERE email = N'admin@restaurant.demo');

INSERT INTO blog_posts(author_id, title, slug, excerpt, content, image_url, view_count, is_published, published_at)
SELECT @admin, v.title, v.slug, v.excerpt, v.content, v.image_url, v.view_count, 1,
       DATEADD(DAY, v.d, SYSDATETIME())
FROM (VALUES
 (N'Bí quyết nấu bò lúc lắc mềm thơm tại nhà', 'bi-quyet-nau-bo-luc-lac-mem-thom',
  N'Thịt bò mềm, vỏ ngoài xém cạnh và nước sốt đậm đà là điều làm nên một đĩa bò lúc lắc đúng điệu.',
  N'Bò lúc lắc là món ăn quen thuộc nhưng để thịt mềm, giữ được độ ngọt và không bị dai thì cần chú ý vài điều nhỏ. Đầu tiên là chọn phần thăn nội hoặc thăn ngoại, cắt miếng vuông vừa ăn khoảng 2 cm.

Ướp thịt với tỏi băm, chút dầu hào, tiêu và một ít đường trong ít nhất 20 phút. Khi xào, hãy làm nóng chảo thật lâu, cho thịt vào từng đợt nhỏ và lắc đều tay để mặt ngoài xém cạnh mà bên trong vẫn hồng mềm.

Bí quyết cuối cùng là cho hành tây, ớt chuông vào sau cùng để rau vẫn giòn và giữ màu đẹp. Dọn kèm khoai tây chiên vàng và rau xà lách, bạn sẽ có một đĩa bò lúc lắc chuẩn vị nhà hàng.',
  N'/images/blog/blog-01.jpg', 1280, -1),

 (N'Gỏi cuốn tôm thịt: nét thanh mát của ẩm thực Việt', 'goi-cuon-tom-thit-thanh-mat-ngay-he',
  N'Rau thơm, bún tươi, tôm và thịt luộc cuốn trong lớp bánh tráng mỏng, chấm cùng nước chấm đậm đà.',
  N'Gỏi cuốn là món khai vị được nhiều thực khách yêu thích nhờ vị thanh mát, ít dầu mỡ. Nguyên liệu gồm tôm luộc bóc vỏ, thịt ba chỉ luộc thái mỏng, bún tươi, xà lách và các loại rau thơm.

Điều làm nên sự khác biệt của gỏi cuốn tại nhà hàng là nước chấm. Chúng tôi pha từ tương đậu, đậu phộng rang giã nhỏ và một chút tương ớt, cho vị béo bùi cân bằng với vị tươi của rau.

Gỏi cuốn đặc biệt hợp để mở đầu bữa ăn, nhất là trong những ngày hè nóng nực.',
  N'/images/blog/blog-02.jpg', 940, -3),

 (N'Tổ chức tiệc cưới trọn vẹn tại nhà hàng', 'to-chuc-tiec-cuoi-tron-ven',
  N'Từ bố trí bàn tiệc, thực đơn cho đến trang trí, những lưu ý giúp ngày trọng đại của bạn diễn ra suôn sẻ.',
  N'Một buổi tiệc cưới thành công bắt đầu từ việc lên kế hoạch sớm. Bạn nên chốt số lượng khách dự kiến, ngân sách và phong cách trang trí ít nhất một tháng trước ngày cưới.

Nhà hàng có sảnh tiệc sức chứa đến 200 khách, hệ thống âm thanh ánh sáng và đội ngũ phục vụ chuyên nghiệp. Thực đơn có thể tùy chỉnh theo khẩu vị hai họ, từ món khai vị, món chính đến tráng miệng.

Hãy liên hệ để được tư vấn trực tiếp và tham quan không gian trước khi quyết định.',
  N'/images/blog/blog-03.jpg', 760, -6),

 (N'Không gian sân vườn lý tưởng cho buổi tối cuối tuần', 'san-vuon-cuoi-tuan',
  N'Ánh đèn vàng, tiếng nhạc nhẹ và gió trời, khu sân vườn là nơi hoàn hảo để thư giãn sau một tuần làm việc.',
  N'Khu sân vườn của nhà hàng được thiết kế với nhiều cây xanh, bàn gỗ và ánh đèn vàng ấm áp. Đây là lựa chọn được nhiều nhóm bạn và gia đình yêu thích vào các buổi tối cuối tuần.

Bạn có thể đặt bàn 4 đến 6 người ở khu vực này. Vào những hôm trời đẹp, không gian thoáng đãng cùng món nướng và đồ uống lạnh sẽ khiến buổi tối thêm trọn vẹn.

Lưu ý nên đặt bàn trước vì khu sân vườn thường kín chỗ vào tối thứ Sáu và thứ Bảy.',
  N'/images/blog/blog-04.jpg', 655, -9),

 (N'Gợi ý thực đơn cho buổi họp mặt công ty', 'thuc-don-hop-mat-cong-ty',
  N'Chọn món sao cho vừa ngon vừa dễ chia sẻ là điều quan trọng với những buổi tiệc đông người.',
  N'Với nhóm 8 đến 10 người, thực đơn nên có sự cân bằng giữa món nguội, món nóng và món lẩu để mọi người cùng trò chuyện và chia sẻ.

Chúng tôi gợi ý bắt đầu bằng chả giò hải sản, tiếp theo là cá hồi áp chảo và bò lúc lắc, sau đó là nồi lẩu thái hải sản nóng hổi. Kết thúc bằng kem dừa hoặc bánh flan để bữa tiệc thêm ngọt ngào.

Phòng VIP trên tầng 2 có máy chiếu và cách âm tốt, rất phù hợp cho các buổi họp mặt, tổng kết cuối năm.',
  N'/images/blog/blog-05.jpg', 590, -13),

 (N'Trà đào cam sả: công thức giải nhiệt ngày hè', 'cong-thuc-tra-dao-cam-sa',
  N'Chỉ với vài nguyên liệu quen thuộc, bạn đã có ly trà đào cam sả thơm mát ngay tại nhà.',
  N'Để pha trà đào cam sả, bạn cần trà đen, đào ngâm, cam tươi và vài cây sả đập dập. Nấu sả cùng nước khoảng 10 phút cho dậy mùi rồi ngâm trà thêm 5 phút.

Cho vài lát đào, nước cam vắt và chút siro đào vào ly, rót trà đã lọc lên trên cùng nhiều đá. Khuấy nhẹ và trang trí bằng lát cam, bạn sẽ có ly trà thơm mát, chua ngọt hài hòa.

Món đồ uống này cũng là một trong những thức uống được gọi nhiều nhất tại nhà hàng.',
  N'/images/blog/blog-06.jpg', 480, -20),

 (N'Câu chuyện của bếp trưởng và món lẩu thái hải sản', 'cau-chuyen-lau-thai-hai-san',
  N'Nồi lẩu chua cay đậm đà là kết quả của nhiều lần thử nghiệm công thức của bếp trưởng Phạm Đức Phúc.',
  N'Bếp trưởng của chúng tôi mất gần một tháng để hoàn thiện nồi nước lẩu thái. Mục tiêu là giữ được vị chua thanh của sả, lá chanh và vị cay vừa phải mà vẫn đậm đà.

Hải sản được lấy mỗi sáng, gồm tôm, mực và nghêu, nhúng vào nước lẩu đang sôi để giữ độ ngọt tự nhiên. Rau ăn kèm cũng được chọn kỹ để cân bằng vị.

Lẩu thái hải sản hiện là món được gọi nhiều nhất trong các bữa tiệc nhóm của nhà hàng.',
  N'/images/blog/blog-07.jpg', 410, -35),

 (N'Ưu đãi sinh nhật: giảm 15% cho cả nhóm', 'uu-dai-sinh-nhat-thang-nay',
  N'Đặt bàn sinh nhật tại nhà hàng, nhận ngay ưu đãi giảm 15% hóa đơn và bánh kem tặng kèm.',
  N'Trong tháng này, mọi khách đặt bàn tổ chức sinh nhật cho nhóm từ 6 người trở lên sẽ được giảm 15% tổng hóa đơn và tặng kèm một chiếc bánh kem nhỏ.

Để nhận ưu đãi, vui lòng đặt bàn trước ít nhất 24 giờ và cho nhân viên biết thông tin người có sinh nhật. Ưu đãi không áp dụng đồng thời với các chương trình khuyến mãi khác.

Hãy đặt bàn ngay hôm nay để có một buổi tiệc sinh nhật đáng nhớ.',
  N'/images/blog/blog-08.jpg', 330, -60)
) v(title, slug, excerpt, content, image_url, view_count, d);

/* ---- Gắn danh mục cho bài viết ---- */
INSERT INTO blog_post_categories(post_id, category_id)
SELECT p.id, c.id
FROM (VALUES
 ('bi-quyet-nau-bo-luc-lac-mem-thom',        'cong-thuc-nau-an'),
 ('bi-quyet-nau-bo-luc-lac-mem-thom',        'mon-ngon'),
 ('goi-cuon-tom-thit-thanh-mat-ngay-he',     'mon-ngon'),
 ('to-chuc-tiec-cuoi-tron-ven',              'su-kien-tiec'),
 ('san-vuon-cuoi-tuan',                      'khong-gian-nha-hang'),
 ('thuc-don-hop-mat-cong-ty',                'su-kien-tiec'),
 ('thuc-don-hop-mat-cong-ty',                'mon-ngon'),
 ('cong-thuc-tra-dao-cam-sa',                'cong-thuc-nau-an'),
 ('cau-chuyen-lau-thai-hai-san',             'mon-ngon'),
 ('uu-dai-sinh-nhat-thang-nay',              'tin-tuc-khuyen-mai'),
 ('uu-dai-sinh-nhat-thang-nay',              'su-kien-tiec')
) v(post_slug, category_slug)
JOIN blog_posts      p ON p.slug = v.post_slug
JOIN blog_categories c ON c.slug = v.category_slug;

/* ---- Bình luận (một số chờ duyệt) ---- */
INSERT INTO blog_comments(post_id, customer_id, author_name, content, is_approved, created_at)
SELECT p.id, c.id, v.author_name, v.content, v.is_approved, DATEADD(HOUR, v.h, SYSDATETIME())
FROM (VALUES
 ('bi-quyet-nau-bo-luc-lac-mem-thom', '0901000001', N'Nguyễn Văn An',   N'Mình làm theo công thức này, thịt mềm và thơm hơn hẳn mọi lần. Cảm ơn nhà hàng đã chia sẻ!', 1, -20),
 ('bi-quyet-nau-bo-luc-lac-mem-thom', NULL,         N'Thu Hằng',        N'Bạn có thể chia sẻ thêm loại dầu hào nào là ngon nhất không?', 1, -12),
 ('bi-quyet-nau-bo-luc-lac-mem-thom', NULL,         N'Quang Minh',      N'Đã thử và cả nhà đều khen ngon.', 1, -5),
 ('goi-cuon-tom-thit-thanh-mat-ngay-he', '0901000002', N'Trần Thị Bình', N'Nước chấm ở nhà hàng ăn rất vừa miệng, mình rất thích.', 1, -50),
 ('goi-cuon-tom-thit-thanh-mat-ngay-he', NULL,      N'Lan Anh',         N'Cuối tuần này mình sẽ ghé thử món này.', 1, -30),
 ('to-chuc-tiec-cuoi-tron-ven',       NULL,         N'Hồng Nhung',      N'Cho mình hỏi sảnh tiệc còn trống ngày cuối tháng sau không ạ?', 1, -100),
 ('to-chuc-tiec-cuoi-tron-ven',       '0901000003', N'Lê Hoàng Cường',  N'Công ty mình từng tổ chức tiệc ở đây, phục vụ rất chuyên nghiệp.', 1, -80),
 ('san-vuon-cuoi-tuan',               NULL,         N'Đức Anh',         N'Không gian rất đẹp, buổi tối nhiều gió và mát.', 1, -150),
 ('san-vuon-cuoi-tuan',               '0901000005', N'Võ Thị Hà',       N'Nhớ đặt bàn trước vì tối thứ Bảy đông lắm nhé mọi người.', 1, -120),
 ('thuc-don-hop-mat-cong-ty',         NULL,         N'Phương Thảo',     N'Thực đơn gợi ý rất hợp lý, mình sẽ tham khảo cho buổi họp mặt.', 1, -200),
 ('cong-thuc-tra-dao-cam-sa',         NULL,         N'Gia Bảo',         N'Công thức dễ làm, ly trà thơm lắm.', 1, -300),
 ('cau-chuyen-lau-thai-hai-san',      '0901000004', N'Phạm Minh Dũng',  N'Nước lẩu đậm đà, hải sản tươi. Rất đáng thử!', 1, -400),
 ('uu-dai-sinh-nhat-thang-nay',       NULL,         N'Ngọc Mai',        N'Ưu đãi này áp dụng đến hết ngày nào vậy ạ?', 0, -2),
 ('uu-dai-sinh-nhat-thang-nay',       NULL,         N'Người dùng ẩn danh', N'Quảng cáo spam, mua hàng giá rẻ tại website abc.example', 0, -1)
) v(post_slug, phone, author_name, content, is_approved, h)
JOIN blog_posts p ON p.slug = v.post_slug
LEFT JOIN customers c ON c.phone = v.phone;

/* ---- Thư viện ảnh (12 ảnh, dùng ở trang Gallery và footer) ---- */
INSERT INTO gallery_images(title, thumb_url, image_url, sort_order) VALUES
 (N'Gỏi cuốn tôm thịt',        N'/images/gallery/thumb-01.jpg', N'/images/gallery/photo-01.jpg', 1),
 (N'Bò lúc lắc',               N'/images/gallery/thumb-02.jpg', N'/images/gallery/photo-02.jpg', 2),
 (N'Cá hồi áp chảo',           N'/images/gallery/thumb-03.jpg', N'/images/gallery/photo-03.jpg', 3),
 (N'Lẩu thái hải sản',         N'/images/gallery/thumb-04.jpg', N'/images/gallery/photo-04.jpg', 4),
 (N'Không gian tầng 1',        N'/images/gallery/thumb-05.jpg', N'/images/gallery/photo-05.jpg', 5),
 (N'Khu sân vườn buổi tối',    N'/images/gallery/thumb-06.jpg', N'/images/gallery/photo-06.jpg', 6),
 (N'Phòng VIP tầng 2',         N'/images/gallery/thumb-07.jpg', N'/images/gallery/photo-07.jpg', 7),
 (N'Sảnh tiệc cưới',           N'/images/gallery/thumb-08.jpg', N'/images/gallery/photo-08.jpg', 8),
 (N'Trà đào cam sả',           N'/images/gallery/thumb-09.jpg', N'/images/gallery/photo-09.jpg', 9),
 (N'Chè hạt sen',              N'/images/gallery/thumb-10.jpg', N'/images/gallery/photo-10.jpg', 10),
 (N'Đội ngũ bếp',              N'/images/gallery/thumb-11.jpg', N'/images/gallery/photo-11.jpg', 11),
 (N'Tiệc sinh nhật tại nhà hàng', N'/images/gallery/thumb-12.jpg', N'/images/gallery/photo-12.jpg', 12);

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
PRINT N'Đã thêm nội dung website thành công.';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRAN;
    THROW;
END CATCH;
GO

/* ================= TRUY VẤN MẪU CHO CÁC KHỐI TRÊN TRANG BLOG ================= */
-- Danh sách bài viết (trang 1, 5 bài/trang) kèm tác giả, danh mục, số bình luận
SELECT p.id, p.title, p.slug, p.excerpt, p.image_url, p.published_at,
       e.full_name AS author,
       (SELECT STRING_AGG(c.name, N', ') FROM blog_post_categories pc
          JOIN blog_categories c ON c.id = pc.category_id WHERE pc.post_id = p.id) AS categories,
       (SELECT COUNT(*) FROM blog_comments bc WHERE bc.post_id = p.id AND bc.is_approved = 1) AS comment_count
FROM blog_posts p
LEFT JOIN employees e ON e.user_id = p.author_id
WHERE p.is_published = 1
ORDER BY p.published_at DESC
OFFSET 0 ROWS FETCH NEXT 5 ROWS ONLY;

-- Danh mục kèm số bài
SELECT c.name, c.slug, COUNT(pc.post_id) AS post_count
FROM blog_categories c
LEFT JOIN blog_post_categories pc ON pc.category_id = c.id
GROUP BY c.name, c.slug, c.sort_order
ORDER BY c.sort_order;

-- Đọc nhiều nhất
SELECT TOP 5 title, slug, image_url, published_at, view_count
FROM blog_posts WHERE is_published = 1 ORDER BY view_count DESC;

-- Lưu trữ theo tháng
SELECT YEAR(published_at) AS [year], MONTH(published_at) AS [month], COUNT(*) AS post_count
FROM blog_posts WHERE is_published = 1
GROUP BY YEAR(published_at), MONTH(published_at)
ORDER BY [year] DESC, [month] DESC;

-- Thông tin liên hệ / giờ mở cửa
SELECT setting_key, setting_value FROM site_settings;
GO