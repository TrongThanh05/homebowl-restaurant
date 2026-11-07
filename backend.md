# Cấu trúc dự án và backend

Tài liệu này mô tả cách tổ chức mã nguồn, ranh giới giữa **backend** (Node.js thuần + SQL Server) và **frontend** (React + Vite), cùng quy ước để thêm module mới.

> Ký hiệu: ✅ đã có trong bộ khung backend hiện tại · 🔲 kế hoạch, chưa tạo.

---

## 1. Tổng quan kiến trúc

```
Trình duyệt (React, Vite :5173)
        │  HTTP + JSON (REST)
        ▼
Backend (Node.js thuần, http :3000)
        │  mssql (truy vấn có tham số)
        ▼
SQL Server (RestaurantDB)
```

Nguyên tắc tách biệt:

1. **Frontend không bao giờ kết nối trực tiếp với database.** Mọi dữ liệu đi qua API của backend.
2. **Hai bên chỉ giao tiếp qua hợp đồng API** (đường dẫn, phương thức, cấu trúc JSON). Không import code của nhau.
3. **Bí mật nằm ở backend** (mật khẩu DB, khóa ký token). Frontend chỉ biết địa chỉ API.
4. **Mỗi bên có `package.json`, `node_modules` và `.env` riêng.**
5. **Quyền hạn do backend quyết định.** Frontend chỉ ẩn/hiện giao diện, không dùng làm căn cứ phân quyền.

---

## 2. Cấu trúc thư mục gốc (monorepo)

```text
restaurant-project/
├── backend/            # API Node.js thuần  (mục 3)
├── frontend/           # Ứng dụng React + Vite  (mục 5)
├── database/           # Script SQL, dùng chung cho cả nhóm
│   ├── 01_restaurant_db.sql            # Schema + dữ liệu mẫu gốc
│   ├── 02_restaurant_demo_data.sql     # Dữ liệu demo (tài khoản, đơn hàng, kho...)
│   └── 03_restaurant_website_content.sql  # Blog, gallery, site_settings
├── docs/
│   └── backend.md      # Tài liệu này
├── .gitignore
└── README.md
```

Thứ tự chạy script SQL: `01` → `02` → `03`.

---

## 3. Cấu trúc backend

```text
backend/
├── src/
│   ├── server.js                   ✅ Khởi động http server, tắt server an toàn
│   ├── app.js                      ✅ Xử lý request: bảo mật, CORS, định tuyến, bắt lỗi
│   │
│   ├── config/
│   │   ├── env.js                  ✅ Đọc và kiểm tra biến môi trường
│   │   └── database.js             ✅ Connection pool SQL Server dùng chung
│   │
│   ├── routes/
│   │   ├── index.js                ✅ Gom route của mọi module
│   │   └── <module>.routes.js      🔲 Mỗi module một file
│   │
│   ├── controllers/
│   │   ├── health.controller.js    ✅
│   │   └── <module>.controller.js  🔲
│   │
│   ├── services/
│   │   ├── health.service.js       ✅
│   │   └── <module>.service.js     🔲 Luật nghiệp vụ
│   │
│   ├── repositories/
│   │   ├── health.repository.js    ✅
│   │   └── <module>.repository.js  🔲 Chỉ nơi này viết SQL
│   │
│   ├── middlewares/
│   │   ├── security.js             ✅ Header bảo mật + CORS
│   │   ├── auth.js                 🔲 Xác thực token
│   │   └── requireRole.js          🔲 Phân quyền theo vai trò
│   │
│   ├── dtos/                       🔲 Kiểm tra dữ liệu request/response
│   └── utils/
│       ├── router.js               ✅ Router tự viết (method + path + :param)
│       ├── http.js                 ✅ sendJson, sendSuccess, sendError, readJsonBody
│       └── errors.js               ✅ HttpError, badRequest, notFound...
│
├── tests/
│   └── app.test.js                 ✅ node:test
├── .env                            # KHÔNG commit
├── .env.example                    ✅ Mẫu cấu hình, chỉ có giá trị giả
├── .gitignore                      ✅
└── package.json                    ✅
```

### Trách nhiệm từng lớp

| Lớp              | Được làm                                                                                | Không được làm                |
| ---------------- | --------------------------------------------------------------------------------------- | ----------------------------- |
| **routes**       | Ánh xạ `METHOD + path` tới controller; gắn middleware                                   | Chứa logic, SQL               |
| **controllers**  | Lấy `params`, `query`, `body`; gọi service; trả JSON                                    | Viết SQL, tính toán nghiệp vụ |
| **services**     | Kiểm tra dữ liệu, luật nghiệp vụ, tính tiền, kiểm tra trạng thái, điều phối transaction | Đọc `req`/`res`, biết về HTTP |
| **repositories** | Truy vấn SQL có tham số (`.input()`), trả dữ liệu thô                                   | Chứa luật nghiệp vụ           |
| **middlewares**  | Xử lý dùng chung: xác thực, phân quyền, CORS                                            | Logic của riêng một module    |
| **utils**        | Hàm nhỏ, dùng lại được, không phụ thuộc module                                          | Gọi database                  |

Luồng một request:

```
router → controller → service → repository → SQL Server
                          ↑
              (kiểm tra, tính toán, transaction)
```

---

## 4. Các module dự kiến (ánh xạ với database)

| Module         | Bảng chính                                                                                         | Nhóm truy cập                                          |
| -------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `auth`         | `users`, `roles`                                                                                   | Công khai (đăng nhập)                                  |
| `tables`       | `dining_tables`                                                                                    | Nhân viên                                              |
| `reservations` | `reservations`, `customers`                                                                        | Công khai (tạo), nhân viên (quản lý)                   |
| `menu`         | `menu_categories`, `menu_items`                                                                    | Công khai (đọc), quản lý (ghi)                         |
| `orders`       | `orders`, `order_items`                                                                            | Nhân viên theo vai trò                                 |
| `payments`     | `payments`, view `vw_order_totals`                                                                 | Thu ngân, quản lý                                      |
| `employees`    | `employees`, `users`                                                                               | Quản lý, admin                                         |
| `inventory`    | `ingredients`, `stock_movements`, `suppliers`, `menu_item_ingredients`, view `vw_ingredient_stock` | Quản lý, bếp                                           |
| `reviews`      | `reviews`                                                                                          | Công khai (đọc bản đã duyệt, gửi mới), quản lý (duyệt) |
| `newsletter`   | `newsletter_subscribers`                                                                           | Công khai                                              |
| `blog`         | `blog_posts`, `blog_categories`, `blog_post_categories`, `blog_comments`                           | Công khai (đọc, bình luận), quản lý (ghi, duyệt)       |
| `gallery`      | `gallery_images`                                                                                   | Công khai (đọc), quản lý (ghi)                         |
| `settings`     | `site_settings`                                                                                    | Công khai (đọc), admin (ghi)                           |
| `reports`      | `orders`, `payments`, `order_items`                                                                | Quản lý                                                |

Mỗi module gồm 4 file cùng tên: `x.routes.js`, `x.controller.js`, `x.service.js`, `x.repository.js`.

Thứ tự triển khai gợi ý: `auth` → `menu` → `tables` → `orders` → `payments` → các module nội dung website.

---

## 6. Hợp đồng API

### Định dạng response

Thành công:

```json
{ "success": true, "data": {} }
```

Lỗi:

```json
{
  "success": false,
  "error": { "code": "NOT_FOUND", "message": "Không tìm thấy" }
}
```

### Mã trạng thái

| Mã              | Ý nghĩa                                 |
| --------------- | --------------------------------------- |
| 200 / 201 / 204 | Thành công / đã tạo / không có nội dung |
| 400             | Dữ liệu không hợp lệ                    |
| 401             | Chưa đăng nhập                          |
| 403             | Không đủ quyền                          |
| 404             | Không tìm thấy                          |
| 405             | Sai phương thức                         |
| 409             | Xung đột (ví dụ bàn đã có đơn đang mở)  |
| 413             | Dữ liệu gửi lên quá lớn                 |
| 500             | Lỗi hệ thống (không lộ chi tiết)        |

### Quy ước đường dẫn

- Tiền tố `/api`, danh từ số nhiều, chữ thường: `/api/menu-items`, `/api/blog-posts`.
- Lấy một bản ghi: `GET /api/orders/:id`. Tạo: `POST /api/orders`. Sửa: `PATCH /api/orders/:id`.
- Danh sách có phân trang: `?page=1&pageSize=5`, trả thêm `meta: { page, pageSize, total }`.
- Hiện có: `GET /api/health` ✅

---

## 7. Cấu hình và chạy dự án

|               | Backend                                          | Frontend                     |
| ------------- | ------------------------------------------------ | ---------------------------- |
| Cổng mặc định | `3000`                                           | `5173`                       |
| File cấu hình | `backend/.env`                                   | `frontend/.env`              |
| Biến chính    | `PORT`, `CORS_ORIGINS`, `DB_*`, `MAX_BODY_BYTES` | `VITE_API_BASE_URL`          |
| Cài đặt       | `cd backend && npm install`                      | `cd frontend && npm install` |
| Chạy dev      | `npm run dev`                                    | `npm run dev`                |
| Kiểm thử      | `npm test`                                       | `npm test`                   |

Yêu cầu: Node.js ≥ 20.6 cho backend (dùng `--env-file`).

**CORS:** `CORS_ORIGINS` ở backend phải chứa đúng địa chỉ frontend (mặc định `http://localhost:5173`). Khi triển khai thật, thay bằng tên miền chính thức.

---

## 8. Git

`.gitignore` ở gốc dự án:

```gitignore
node_modules/
.env
dist/
*.log
```

- Commit `.env.example`, không commit `.env`.
- Mỗi module một nhánh: `feature/backend-auth`, `feature/frontend-menu-page`.
- Thay đổi hợp đồng API cần cập nhật tài liệu này và báo phía frontend.

---

## 9. Quy ước cho backend

- Không dùng Express, NestJS, Fastify, Koa. Chỉ dùng module có sẵn của Node.js.
- Mọi truy vấn SQL dùng tham số (`.input(name, type, value)`), không nối chuỗi.
- Thao tác nhiều bước (tạo đơn, thanh toán, trừ kho) bắt buộc dùng transaction.
- Tính tổng tiền, giảm giá, kiểm tra chuyển trạng thái ở **backend**.
- Mật khẩu băm bằng `bcryptjs`, không lưu mật khẩu thô, không ghi mật khẩu hoặc token vào log.
- Không xóa cứng dữ liệu lịch sử (món ăn, nhân viên, hóa đơn). Dùng cờ `is_available`, `is_active` như thiết kế hiện tại.
- Thay đổi schema phải có script riêng, đánh số thứ tự trong `database/`, không sửa script cũ đã chạy.
- Mỗi service quan trọng có test bằng `node:test` và `node:assert`.
