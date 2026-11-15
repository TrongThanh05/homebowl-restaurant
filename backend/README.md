# HomeBowl Restaurant API - Backend

Hệ thống API RESTful phục vụ quản lý và vận hành nhà hàng **HomeBowl**, được xây dựng bằng **Node.js thuần** kết nối trực tiếp với cơ sở dữ liệu **Microsoft SQL Server (RestaurantDB)**.

---

## 1. Nguyên tắc kiến trúc & Công nghệ

- **Không sử dụng framework bên thứ ba (No Express, NestJS, Fastify, Koa):** Toàn bộ pipeline HTTP, router và middleware được xây dựng bằng các module có sẵn của Node.js (`node:http`, `node:url`, `node:crypto`).
- **Phân tách trách nhiệm 4 tầng (Layered Architecture):**
  - **Routes (`src/routes/`):** Ánh xạ phương thức HTTP (`GET`, `POST`, `PATCH`, `DELETE`) và URL pattern (hỗ trợ path params `:id`, `:slug`) đến Controller; gắn middleware bảo vệ.
  - **Controllers (`src/controllers/`):** Trích xuất `params`, `query`, đọc `body` JSON, gọi Service tương ứng và trả JSON chuẩn hóa.
  - **Services (`src/services/`):** Xử lý toàn bộ logic nghiệp vụ, kiểm tra ràng buộc dữ liệu, tính toán tiền/tồn kho, điều phối quy trình và transaction.
  - **Repositories (`src/repositories/`):** Nơi duy nhất tương tác cơ sở dữ liệu. Sử dụng thư viện `mssql` với connection pooling, 100% câu truy vấn sử dụng tham số hóa (`.input(...)`), tuyệt đối không nối chuỗi để phòng chống SQL Injection.
- **Bảo mật & Phân quyền:**
  - Băm mật khẩu bằng `bcryptjs`.
  - Xác thực bằng token JWT (`jsonwebtoken`), lưu thông tin `id`, `email`, `roleId`, `roleName` trong payload.
  - Phân quyền theo vai trò (`requireRole`): `ADMIN`, `MANAGER`, `WAITER`, `CHEF`, `CASHIER`, `CUSTOMER`.
  - Cấu hình header bảo mật (CORS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 0`).
  - Giới hạn kích thước payload gửi lên (`MAX_BODY_BYTES`) trả về `413 Payload Too Large`.

---

## 2. Cấu trúc thư mục

```text
backend/
├── package.json                    # Cấu hình dự án & dependencies (mssql, bcryptjs, jsonwebtoken)
├── .env.example                    # Template biến môi trường
├── .env                            # Cấu hình cục bộ (chứa mật khẩu DB, khóa JWT - không commit)
├── .gitignore                      # Bỏ qua node_modules, .env, *.log
├── README.md                       # Tài liệu hướng dẫn này
├── tests/
│   └── app.test.js                 # Kiểm thử router, middlewares, định dạng lỗi và HTTP
└── src/
    ├── server.js                   # Khởi động server HTTP & graceful shutdown khi nhận SIGINT/SIGTERM
    ├── app.js                      # HTTP Request Pipeline (Security, CORS, Routing, 404, Error Handler)
    ├── config/
    │   ├── env.js                  # Đọc, kiểm tra và export các biến môi trường bắt buộc
    │   └── database.js             # Kết nối & quản trị Connection Pool SQL Server (getPool, closePool)
    ├── middlewares/
    │   ├── security.js             # Cấu hình bảo mật header & xử lý CORS preflight (OPTIONS)
    │   ├── auth.js                 # Middleware giải mã JWT và gán req.user
    │   └── requireRole.js          # Middleware chặn truy cập trái phép theo vai trò
    ├── utils/
    │   ├── router.js               # Router tùy biến hỗ trợ regex path, params, query và subrouter prefix
    │   ├── http.js                 # Helper gửi JSON: sendSuccess, sendError, sendJson, readJsonBody
    │   └── errors.js               # Class HttpError và các hàm tạo lỗi nhanh (badRequest, notFound, forbidden...)
    ├── routes/
    │   ├── index.js                # Tổng hợp và gắn tiền tố /api cho tất cả module
    │   └── *.routes.js             # Định nghĩa route riêng của từng module
    ├── controllers/
    │   └── *.controller.js         # Tiếp nhận request và trả response
    ├── services/
    │   └── *.service.js            # Nghiệp vụ và xử lý logic
    └── repositories/
        └── *.repository.js         # Truy vấn SQL Server có tham số
```

---

## 3. Phân định rõ trách nhiệm (Single Responsibility Principle)

Tầng | Vai trò | Trách nhiệm chính | Điều nó KHÔNG được biết
Controller Tiếp tân / Bồi bàn Nhận request HTTP (params, body), gọi Service, trả response JSON. Không biết logic tính toán, không biết SQL.
Service Đầu bếp trưởng Xử lý nghiệp vụ (tính tiền, check điều kiện, phân quyền, gửi mail, điều phối transaction). Không biết req, res HTTP; không quan tâm câu lệnh SQL viết như thế nào.
Repository Thủ kho Chỉ làm việc với CSDL (chạy lệnh SELECT, INSERT, UPDATE có tham số hóa). Không quan tâm dữ liệu dùng để làm gì, không quyết định đúng/sai về mặt kinh doanh.

## 4. Quy ước Hợp đồng API

### 4.1. Tiền tố & Đường dẫn

- Tiền tố chung: `/api`
- Danh từ số nhiều, viết thường: `/api/menu-items`, `/api/blog-posts`, `/api/dining-tables`
- Tài nguyên con / Hành động trạng thái:
  - `POST /api/orders/:id/items`: Thêm món vào đơn
  - `PATCH /api/orders/:id/status`: Chuyển trạng thái đơn
  - `PATCH /api/reviews/:id/publish`: Phê duyệt hiển thị đánh giá

### 4.2. Định dạng phản hồi chuẩn

- **Thành công (200 / 201):**
  ```json
  {
    "success": true,
    "data": { ... }
  }
  ```
- **Thành công có phân trang:**
  ```json
  {
    "success": true,
    "data": [ ... ],
    "meta": {
      "page": 1,
      "pageSize": 10,
      "total": 45
    }
  }
  ```
- **Lỗi (400 / 401 / 403 / 404 / 409 / 500):**
  ```json
  {
    "success": false,
    "error": {
      "code": "NOT_FOUND",
      "message": "Không tìm thấy tài nguyên yêu cầu"
    }
  }
  ```

---

## 5. Hướng dẫn cài đặt & Chạy ứng dụng

### 5.1. Yêu cầu môi trường

- **Node.js:** Phiên bản ≥ **20.6.0** (hỗ trợ cờ `--env-file`).
- **SQL Server:** Đã chạy khởi tạo cơ sở dữ liệu `RestaurantDB` từ file script `restaurant_db.sql`.

### 5.2. Cấu hình biến môi trường

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
# Hoặc trên Windows PowerShell:
copy .env.example .env
```

Nội dung cấu hình mẫu trong `.env`:

```env
PORT=3000
CORS_ORIGINS=http://localhost:5173
DB_SERVER=localhost
DB_PORT=1433
DB_NAME=RestaurantDB
DB_USER=sa
DB_PASSWORD=YourPassword123!
DB_ENCRYPT=false
DB_TRUST_SERVER_CERT=true
JWT_SECRET=homebowl_super_secret_jwt_key_2026
JWT_EXPIRES_IN=8h
MAX_BODY_BYTES=102400
```

### 5.3. Cài đặt thư viện

```bash
npm install
```

### 5.4. Chạy kiểm thử (Unit Testing)

Dự án sử dụng test runner chuẩn tích hợp sẵn trong Node.js (`node:test` và `node:assert`):

```bash
npm test
```

_Kết quả:_ Kiểm thử thành công 100% các thành phần định tuyến, middleware bảo mật, phản hồi HTTP chuẩn hóa và xử lý mã lỗi 404.

### 5.5. Khởi động máy chủ

- **Chế độ phát triển (Tự động tải lại khi code thay đổi):**
  ```bash
  npm run dev
  ```
- **Chế độ sản xuất (Production):**
  ```bash
  npm start
  ```

API sẽ lắng nghe tại: `http://localhost:3000/api`
Kiểm tra nhanh: `http://localhost:3000/api/health`
