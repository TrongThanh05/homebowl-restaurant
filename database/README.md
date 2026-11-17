# Database i18n Migrations

## Thứ tự chạy

1. `restaurant_db.sql` (gốc, đã chạy trước đó)
2. `database/migrations/001_i18n_menu.sql`
3. `database/migrations/002_i18n_site_settings.sql`
4. `database/migrations/003_i18n_blog.sql`
5. `database/migrations/004_i18n_gallery_events.sql`
6. `database/seed/101_i18n_menu_en.sql`
7. `database/seed/102_i18n_site_settings_en.sql`
8. `database/seed/103_i18n_blog_en.sql`

## Rollback

Chạy theo thứ tự ngược: `004_down.sql` → `003_down.sql` → `002_down.sql` → `001_down.sql`

## Kiểm tra

Mỗi migration có thể chạy lại 2 lần liên tiếp không lỗi (`IF OBJECT_ID(...) IS NULL`).

Seed dùng `WHERE NOT EXISTS (...)` nên cũng an toàn khi chạy lại.

## Lưu ý

- Bản dịch tiếng Anh trong `seed/` là **DỰ THẢO**, cần chủ nhà hàng duyệt.
- Tên món Việt đặc trưng (gỏi cuốn, bò lúc lắc, phở...) nên giữ tên gốc kèm mô tả tiếng Anh.
- Bảng `*_translations` có `CHECK (lang_code <> 'vi')` — tiếng Việt luôn lấy từ bảng gốc.
