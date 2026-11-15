# README_I18N — Kế hoạch đa ngôn ngữ (Việt ↔ Anh) cho Homebowl Restaurant

> Tài liệu này dành cho **AI agent** (hoặc lập trình viên) tự thực hiện từng bước.
> Đọc hết mục 0–3 trước khi sửa bất kỳ file nào. Làm **tuần tự**, mỗi bước xong phải
> chạy kiểm tra (mục 2.4) và commit riêng.

---

## 0. Mục tiêu và phạm vi

Website nhà hàng hiện hiển thị hoàn toàn tiếng Anh
**chuyển linh hoạt Việt ↔ Anh** bằng nút `VI | EN`, không tải lại trang.

Có **hai loại nội dung**, xử lý khác nhau:

| Loại                       | Ví dụ                                                           | Nguồn                                 | Cơ chế                                                     |
| -------------------------- | --------------------------------------------------------------- | ------------------------------------- | ---------------------------------------------------------- |
| **A. Giao diện (UI)**      | Menu điều hướng, nhãn form, nút, tiêu đề section, thông báo lỗi | `src/i18n/locales/vi.json`, `en.json` | Hàm `t('key')`                                             |
| **B. Nội dung động từ DB** | Tên danh mục, tên và mô tả món ăn, (sau này) blog, sự kiện      | SQL Server                            | Bảng dịch riêng cho từng thực thể + tham số `?lang=` ở API |

**Không dịch:**

- Dữ liệu khách tự nhập (họ tên, ghi chú, bình luận, nội dung `reviews`).
- Dữ liệu lịch sử: đơn hàng, hóa đơn (giữ nguyên như lúc tạo).
- Mã nội bộ: tên role, mã trạng thái (`OPEN`, `SERVING`...). Frontend ánh xạ mã → chữ bằng file JSON.
- Thông tin cố định của nhà hàng (địa chỉ, số điện thoại, email, giờ mở cửa) → để trong
  `src/config/siteInfo.js`, không đưa vào JSON bản dịch (chỉ nhãn như "Mỗi ngày" mới dịch).

**Tiền tệ:** giá luôn lưu bằng **VND**. Đổi sang English chỉ đổi cách hiển thị, **không quy đổi USD**.

---

## 1. Ràng buộc bắt buộc (không được vi phạm)

1. **Không đổi stack.** Frontend: React 19 + Vite + `react-router-dom` + Bootstrap. Backend: **vanilla Node.js**
   (module `http`, `url`, `fs`, `path`, `crypto`). **Cấm** Express, NestJS, Fastify, Koa.
2. **Database là Microsoft SQL Server**, driver `mssql`. Mọi truy vấn dùng **tham số** (`.input(...)`),
   tuyệt đối không nối chuỗi người dùng vào SQL.
3. **Không sửa, xóa, truncate dữ liệu hiện có.** Chỉ thêm bảng mới. Mọi migration phải:
   idempotent (`IF OBJECT_ID(...) IS NULL`) và có đoạn ROLLBACK trong comment.
4. **Không bịa file, bảng, API, cột không tồn tại.** Trước khi viết SQL phải đọc lại `restaurant_db.sql`.
5. **Không thêm dependency** nếu không cần. Frontend dùng `fetch` nếu `axios` chưa có trong `package.json`.
6. **Không tuyên bố test/build đã pass nếu chưa chạy.** Báo cáo kết quả thật.
7. **Không đưa secret** (mật khẩu DB, khóa) vào frontend, Git hay log. Dùng `.env`, commit `.env.example`.
8. **Không dùng `localStorage` để lưu dữ liệu nhạy cảm**; chỉ lưu lựa chọn ngôn ngữ (`app_lang`).

---

## 2. Bối cảnh dự án hiện tại

### 2.1. Cấu trúc dự án đã tách biệt rõ backend và frontend

### 2.2. Đã hoàn thành (Giai đoạn 1.1) — không làm lại

- `src/i18n/languageContext.js` — `LanguageContext` + hook `useLanguage()` (tách file để tránh cảnh báo `react-refresh`).
- `src/i18n/LanguageProvider.jsx` — state `lang` (`vi` mặc định), lưu `localStorage['app_lang']`, set `document.documentElement.lang`, hàm `t(key, params)`
  (fallback: ngôn ngữ hiện tại → tiếng Việt → chính key; nội suy `{name}`).
- `src/i18n/LanguageSwitcher.jsx` — nút `VI | EN` (Bootstrap).
- `src/i18n/format.js` — `pickText(field, lang)`, `formatPrice(value, lang)`, `formatDate(iso, lang)`.
- `src/i18n/locales/vi.json`, `en.json` — **119 key**, hai file có cùng bộ key và cùng placeholder.
- `main.jsx` đã bọc `LanguageProvider`; `Header.jsx` đã dùng `t()` + `LanguageSwitcher`; `pages/Menu.jsx` đã dùng `t()`, `pickText`, `formatPrice`.
- `App.jsx`: đã sửa import `layout` → `Layout` (lỗi hoa/thường khi build trên Linux).
- `src/data/menu.js`: giá đổi từ chuỗi `'$29.79'` sang **số** (giá trị tạm, ví dụ `29790`) — **cần thay bằng giá VND thật**.

`npm run lint` và `vite build` đã chạy thành công ở trạng thái này. Chưa kiểm thử bằng trình duyệt.

### 2.3. Quy ước bắt buộc khi viết code i18n

- **Tên key:** `nhóm.tênKey` bằng camelCase, ví dụ `booking.submit`, `blog.comments.one`.
- **Mọi key mới phải thêm vào cả `vi.json` và `en.json`**, cùng placeholder. Không để một file thiếu key.
- **Số nhiều:** `t()` không hỗ trợ plural. Dùng cặp `.one` / `.other` và chọn trong component:
  ```jsx
  t(count === 1 ? 'blog.comments.one' : 'blog.comments.other', { count });
  ```
- **Không để chuỗi hiển thị trong file hằng/`utils`.** Lưu _key_ hoặc _giá trị số_, tạo nhãn bằng `t()` trong component
  (dùng `useMemo` nếu danh sách lớn).
- **Dữ liệu tĩnh đa ngôn ngữ:** trường chữ có thể là chuỗi hoặc `{ vi: '...', en: '...' }`; luôn đọc qua `pickText(field, lang)`.
- **Giá:** lưu số (VND), hiển thị bằng `formatPrice(value, lang)`. **Ngày:** lưu ISO `YYYY-MM-DD`, hiển thị bằng `formatDate`.
- **Thuộc tính truy cập:** `alt`, `aria-label`, `title`, `placeholder` cũng phải đi qua `t()`.
- **Tên thương hiệu** (`brand.name`) và địa chỉ/điện thoại không dịch.

### 2.4. Kiểm tra bắt buộc sau mỗi bước

```bash
npm run lint
npx vite build
```

Cả hai phải thành công. Ngoài ra kiểm tra thủ công bằng `npm run dev`: bấm `VI`/`EN`, xem trang vừa sửa ở cả hai ngôn ngữ,
và tải lại trang để chắc ngôn ngữ được nhớ.

Script kiểm tra đồng bộ key (chạy sau khi sửa JSON):

```bash
node -e "const v=require('./src/i18n/locales/vi.json'),e=require('./src/i18n/locales/en.json');
const a=Object.keys(v).filter(k=>!(k in e)),b=Object.keys(e).filter(k=>!(k in v));
console.log({thieuTrongEn:a,thieuTrongVi:b}); process.exit(a.length||b.length?1:0)"
```

---

## 3. GIAI ĐOẠN 1 — Chuyển toàn bộ giao diện sang `t()` (frontend thuần)

Mỗi bước: sửa → chạy mục 2.4 → kiểm tra thủ công hai ngôn ngữ → commit
(`feat(i18n): <tên bước>`). **Không refactor ngoài phạm vi** (không đổi class, bố cục, thư viện).

### Bước 1.2 — Layout: Footer, Sidebar, SignUpSection

| File                       | Chữ cứng → key                                                                                                                                                                                                                                                                                         |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `layout/Footer.jsx`        | "Contact Us" → `footer.contactUs`; "Opening Times" → `footer.openingTimes`; "Every Day" → `common.everyDay`; "Latest twitter" → `footer.latestTwitter`; "Gallery" → `footer.gallery`; dòng copyright → `footer.copyright` với `{ year: new Date().getFullYear() }`; `alt="GALLERY"` → `footer.gallery` |
| `common/Sidebar.jsx`       | Link điều hướng → `nav.*`; `aria-label="Close Sidebar"` → `common.closeSidebar`; "Gallery" → `footer.gallery`                                                                                                                                                                                          |
| `layout/Header.jsx`        | `aria-label="Open Sidebar"` → `common.openSidebar` (phần điều hướng đã xong)                                                                                                                                                                                                                           |
| `common/SignUpSection.jsx` | "Specials Sign up" → `signup.title`; "Sign-up" → `signup.button`; placeholder → `signup.placeholder`                                                                                                                                                                                                   |

Địa chỉ, điện thoại, email, giờ mở cửa: chuyển sang `src/config/siteInfo.js` (export object), Footer và Contact import từ đó.
Các câu "Latest twitter" là nội dung mẫu của template — chỉ dịch nhãn, **không** dịch nội dung tweet; hỏi chủ dự án có giữ khối này không.

**Hoàn thành khi:** Footer và Sidebar đổi ngôn ngữ đúng; không còn chữ tiếng Anh cứng trong các file này.

### Bước 1.3 — Các section trang chủ

| File                                 | Key                                                                                                                                                                                                                                         |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `HeroSlider.jsx`                     | `hero.welcomeTo`, `brand.name`, `hero.cta`; `aria-label` → `common.nextSlide`, `common.prevSlide`; `Slide ${i+1}` → `t('common.slideN', { n: i + 1 })`. Chuyển `caption1/caption2/btnText` trong mảng slide thành **key**, dịch khi render. |
| `IntroSection.jsx`                   | `common.discover`, `brand.name`, `intro.romantic.*`, `intro.food.*`, `intro.wine.*`, `common.learnMore`                                                                                                                                     |
| `WelcomeSection.jsx`                 | `welcome.subtitle`, `welcome.title`, `welcome.text`, `welcome.story`                                                                                                                                                                        |
| `MenuSection.jsx`                    | `common.discover`, `menuSection.title`, `menu.lunch`, `menu.dinner`, `menuSection.happyHour`, `menuSection.drink`, `menuSection.starters`, `menuSection.dessert`                                                                            |
| `VideoSection.jsx`, `VideoModal.jsx` | `common.discover`, `video.title`, `video.modalTitle`, `common.close`                                                                                                                                                                        |
| `EventSection.jsx`                   | `events.subtitle`, `events.title`, `events.days/hours/minutes/seconds`, `common.viewDetails`, `common.nextSlide/prevSlide`                                                                                                                  |
| `ReviewSection.jsx`                  | `reviews.subtitle`, `reviews.title`                                                                                                                                                                                                         |
| `BlogSection.jsx`                    | `blogSection.subtitle`, `blogSection.title`, `common.readMore`                                                                                                                                                                              |

Các đoạn lorem ipsum ở section này (`*.text`) trong JSON hiện là **bản nháp trung tính**; ghi chú cho chủ dự án thay bằng nội dung thật.
Nội dung bài viết, sự kiện, đánh giá (tiêu đề, tên khách, nội dung) thuộc **dữ liệu động** → xử lý ở Giai đoạn 5, tạm thời để nguyên.

### Bước 1.4 — Đặt bàn (`Reservation.jsx`, `BookingSection.jsx`, `utils/reservationConstants.jsx`)

1. Nhãn và placeholder → `booking.subtitle|title|date|time|guests|name|phone|email|submit`.
2. `peopleOptions` hiện là chuỗi như `'1 Person'`. Đổi thành `value` **số** (1…n); nhãn tạo trong component:
   `t(n === 1 ? 'booking.people.one' : 'booking.people.other', { count: n })`.
3. `react-datepicker`: đăng ký locale tiếng Việt và truyền theo ngôn ngữ hiện tại:
   ```jsx
   import { registerLocale } from 'react-datepicker';
   import { vi } from 'date-fns/locale/vi';
   import { enUS } from 'date-fns/locale/en-US';
   registerLocale('vi', vi);
   registerLocale('en', enUS);
   // <DatePicker locale={lang} ... />
   ```
   Kiểm tra `renderCustomDatePickerHeader` (cuối `reservationConstants.jsx`): nếu tự gõ tên tháng tiếng Anh thì thay bằng
   `Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-US', { month: 'long', year: 'numeric' })`.
4. `handleSubmit` hiện dùng `alert('Booking Details: ...')` (chữ cứng). Tạm thời đổi nội dung `alert` sang `t()`; sẽ thay bằng gọi API ở Bước 5.3.
5. Thêm kiểm tra form cơ bản dùng `validation.required|email|phone` (chỉ khi form chưa có validate; không thêm thư viện).

**Hoàn thành khi:** form đặt bàn, lịch chọn ngày hiển thị đúng tiếng Việt/Anh; giá trị gửi đi (số khách, ngày) **không phụ thuộc ngôn ngữ**.

### Bước 1.5 — Các trang còn lại

| Trang            | Key                                                                                                                                                                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `About.jsx`      | `about.pageTitle`, `welcome.subtitle`, `welcome.story`, `common.discover`, `video.title`, `about.recipes.*`, `about.romantic.*`, `about.chef.title`, `common.playVideo`. Tên đầu bếp và lời giới thiệu là nội dung riêng → để nguyên (xem Giai đoạn 5). |
| `Contact.jsx`    | `contact.*`, `common.everyDay`; `title` của iframe → `contact.mapTitle`; địa chỉ/điện thoại lấy từ `siteInfo`                                                                                                                                           |
| `Gallery.jsx`    | `gallery.pageTitle`, `common.viewPhoto`                                                                                                                                                                                                                 |
| `Blog.jsx`       | `blog.pageTitle`, `nav.home`, `common.readMore`, `blog.categories                                                                                                                                                                                       | popular | archive`, `common.search`, `blog.noResults` (hiển thị khi lọc không có kết quả) |
| `BlogDetail.jsx` | `blog.*` (nhóm bình luận), `nav.home`, `nav.blog`                                                                                                                                                                                                       |

`blog.js`: đổi `day: '28'`, `monthYear: 'Dec, 2018'`, `comments: '8 Comments'` thành `date: '2018-12-28'` và `commentCount: 8`;
hiển thị bằng `formatDate` và `blog.comments.one|other`.

### Bước 1.6 — Rà soát và hoàn thiện giao diện

- [ ] Quét chữ cứng còn sót: tìm văn bản tiếng Anh trong JSX và thuộc tính (`placeholder|alt|title|aria-label`).
- [ ] Tiếng Việt thường dài hơn: kiểm tra nút, menu, tab, tiêu đề không bị tràn hoặc xuống dòng xấu ở mobile (≤576px).
- [ ] **Font:** `main.css` import Montserrat, Poppins, Courgette, Noto Sans. Courgette có thể **không có glyph tiếng Việt** →
      mở trang với "Đặt bàn", "Thực đơn", "Tráng miệng" và kiểm tra bằng mắt; nếu lỗi thì chọn font có subset `vietnamese`
      (ví dụ Dancing Script, Pacifico) hoặc đặt `font-family` dự phòng cho các class dùng Courgette.
- [ ] `document.title` đổi theo ngôn ngữ (tùy chọn): thêm key `meta.title` và cập nhật trong `LanguageProvider`.
- [ ] Chạy script đồng bộ key (mục 2.4).

---

## 4. GIAI ĐOẠN 2 — Chốt phạm vi nội dung DB (cần xác nhận của chủ dự án)

Trước khi viết SQL, **hỏi và ghi lại quyết định**:

1. Thực thể nào dịch? Mặc định: `menu_categories`, `menu_items`. Thêm `dining_tables.area` **chỉ khi** khách nhìn thấy trường này.
   Blog, sự kiện, đầu bếp **chưa có bảng** trong `restaurant_db.sql`; chỉ tạo bảng dịch cho chúng **sau khi** bảng gốc được tạo.
2. Ai nhập bản dịch tiếng Anh: SQL thủ công / trang admin / dịch máy rồi người duyệt. (Không dịch tự động lúc khách xem trang.)
3. Có thêm ngôn ngữ thứ ba trong tương lai không? (Kế hoạch này dùng bảng riêng nên đã sẵn sàng.)

---

## 5. GIAI ĐOẠN 3 — Bảng dịch riêng cho từng thực thể

**Trước khi viết:** đọc `restaurant_db.sql`, ghi lại tên bảng, tên khóa chính, **độ dài thật** của các cột `name`, `description`
(dùng đúng độ dài hoặc lớn hơn cho bảng dịch). Tên bên dưới là tên đã thấy trong schema; **xác minh lại**.

Quy ước bảng dịch: `<bảng>_translations`, khóa chính gộp `(<id>, lang_code)`, `lang_code VARCHAR(5)`,
chuỗi dùng `NVARCHAR`, khóa ngoại tới bảng gốc, **không** `ON DELETE CASCADE` (hệ thống dùng `is_available` để ngừng bán, không xóa).
Bản gốc tiếng Việt vẫn ở bảng gốc; bảng dịch chỉ chứa ngôn ngữ khác (`'en'`).

```sql
-- 001_menu_translations.sql  (idempotent)
IF OBJECT_ID('dbo.menu_category_translations', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.menu_category_translations (
        category_id INT           NOT NULL,
        lang_code   VARCHAR(5)    NOT NULL,
        name        NVARCHAR(100) NOT NULL,
        CONSTRAINT pk_menu_category_translations PRIMARY KEY (category_id, lang_code),
        CONSTRAINT fk_mct_category FOREIGN KEY (category_id) REFERENCES dbo.menu_categories(id)
    );
END;

IF OBJECT_ID('dbo.menu_item_translations', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.menu_item_translations (
        menu_item_id INT           NOT NULL,
        lang_code    VARCHAR(5)    NOT NULL,
        name         NVARCHAR(150) NOT NULL,
        description  NVARCHAR(500) NULL,
        CONSTRAINT pk_menu_item_translations PRIMARY KEY (menu_item_id, lang_code),
        CONSTRAINT fk_mit_menu_item FOREIGN KEY (menu_item_id) REFERENCES dbo.menu_items(id)
    );
END;

-- ROLLBACK:
-- DROP TABLE dbo.menu_item_translations;
-- DROP TABLE dbo.menu_category_translations;
```

Dữ liệu dịch (luôn dùng tiền tố `N'...'` cho Unicode). Viết file riêng `002_seed_menu_translations_en.sql`,
**chỉ INSERT** bản dịch cho các id đã tồn tại; không `UPDATE`/`DELETE` bảng gốc.

Đặt các file trong `backend/database/migrations/` đánh số tăng dần, kèm hướng dẫn chạy trong README của backend.

**Hoàn thành khi:** migration chạy hai lần liên tiếp không lỗi; `SELECT` bảng gốc cho kết quả y như trước;
rollback xóa sạch các bảng mới.

Các bảng sau tạo **khi và chỉ khi** bảng gốc đã tồn tại: `blog_post_translations`, `event_translations`,
`dining_table_translations` — theo đúng mẫu trên.

---

## 6. GIAI ĐOẠN 4 — Backend vanilla Node.js

Thư mục `backend/` (cùng repo, `package.json` riêng). Mặc định dùng **ESM** (`"type": "module"`) cho đồng nhất với frontend;
hỏi chủ dự án nếu muốn CommonJS.

```text
backend/
├── src/
│   ├── server.js            # http.createServer, lắng nghe PORT
│   ├── app.js               # bộ định tuyến chính + xử lý lỗi toàn cục
│   ├── config/{env.js,database.js}   # đọc/kiểm tra env khi khởi động; pool mssql dùng chung
│   ├── routes/menuRoutes.js
│   ├── controllers/menuController.js
│   ├── services/menuService.js
│   ├── repositories/menuRepository.js
│   ├── middlewares/{cors.js,errorHandler.js,bodyParser.js}
│   └── utils/{lang.js,http.js}
├── database/migrations/
├── tests/
├── .env.example
└── package.json             # dependency: mssql (+ dotenv hoặc --env-file của Node)
```

### 6.1. Khung server (chỉ module có sẵn của Node)

- Router tự viết: so khớp theo `method` + `pathname` (bảng route), trả `404` JSON cho route lạ, `405` cho sai method.
- `bodyParser`: đọc JSON an toàn, giới hạn kích thước (ví dụ 1 MB → `413`), JSON hỏng → `400`.
- **CORS tường minh:** chỉ cho phép origin trong biến `CORS_ORIGINS`; xử lý `OPTIONS`.
- Header bảo mật cơ bản (`X-Content-Type-Options: nosniff`...). Lỗi trả JSON, **không lộ stack trace**.
- Env bắt buộc kiểm tra lúc khởi động: `PORT`, `DB_SERVER`, `DB_DATABASE`, `DB_USER`, `DB_PASSWORD`, `CORS_ORIGINS`. Thiếu thì dừng với thông báo rõ.

### 6.2. `utils/lang.js`

```js
const SUPPORTED = ['vi', 'en'];
const DEFAULT_LANG = 'vi';

export function resolveLang(req, url) {
  const fromQuery = url.searchParams.get('lang');
  if (SUPPORTED.includes(fromQuery)) return fromQuery;
  const first = (req.headers['accept-language'] ?? '')
    .split(',')[0]
    ?.trim()
    .slice(0, 2)
    .toLowerCase();
  return SUPPORTED.includes(first) ? first : DEFAULT_LANG;
}
```

### 6.3. Repository (mẫu — xác minh tên cột theo `restaurant_db.sql`)

```js
import sql from 'mssql';

export async function findMenu(pool, lang) {
  const { recordset } = await pool.request().input('lang', sql.VarChar(5), lang)
    .query(`
      SELECT c.id AS categoryId,
             COALESCE(ct.name, c.name) AS categoryName,
             c.sort_order AS sortOrder,
             m.id, m.price, m.image_url AS imageUrl,
             COALESCE(mt.name, m.name)               AS name,
             COALESCE(mt.description, m.description) AS description
      FROM dbo.menu_categories c
      LEFT JOIN dbo.menu_category_translations ct ON ct.category_id = c.id AND ct.lang_code = @lang
      JOIN dbo.menu_items m ON m.category_id = c.id AND m.is_available = 1
      LEFT JOIN dbo.menu_item_translations mt ON mt.menu_item_id = m.id AND mt.lang_code = @lang
      ORDER BY c.sort_order, m.name
    `);
  return recordset;
}
```

Cơ chế dự phòng: `COALESCE` → món/danh mục chưa có bản dịch vẫn hiện tiếng Việt, không bao giờ rỗng.

### 6.4. Hợp đồng API

`GET /api/menu?lang=vi|en` → `200`

```json
{
  "data": [
    {
      "categoryId": 1,
      "categoryName": "Khai vị",
      "items": [
        {
          "id": 1,
          "name": "Gỏi cuốn",
          "description": "…",
          "price": 55000,
          "imageUrl": "…"
        }
      ]
    }
  ]
}
```

Header: `Content-Type: application/json; charset=utf-8`, `Content-Language: <lang>`, `Vary: Accept-Language`.
`price` là **số VND**. Service gộp các dòng phẳng thành nhóm theo danh mục.

Lỗi (mọi endpoint): `{ "error": { "code": "VALIDATION_ERROR", "message": "…" } }` với mã HTTP phù hợp
(`400, 401, 403, 404, 405, 409, 413, 500`). **Backend trả `code`, không trả câu chữ theo ngôn ngữ**;
frontend ánh xạ `code` sang `t('error.<CODE>')` (thêm key khi cần). Giá và tổng tiền luôn tính ở backend.

### 6.5. Kiểm thử (`node:test` + `node:assert/strict`)

- `resolveLang`: ưu tiên `?lang=`; `lang` không hợp lệ → dùng `Accept-Language`; mặc định `vi`.
- Service gộp danh mục: đúng nhóm, đúng thứ tự, danh mục rỗng bị bỏ.
- Router: route lạ → 404; sai method → 405; JSON hỏng → 400; body quá lớn → 413.
- Repository: mock `pool`, kiểm tra truyền tham số `lang` và không có nối chuỗi.
- Chạy: `node --test`. Báo cáo kết quả thật.

**Hoàn thành khi:** `GET /api/menu?lang=en` và `?lang=vi` trả dữ liệu đúng; món chưa dịch vẫn hiện tiếng Việt;
`lang=fr` rơi về `vi`; không có truy vấn nối chuỗi.

### 6.6. (Tùy chọn, sau khi chốt Giai đoạn 2) Ghi bản dịch qua admin

`PUT /api/admin/menu-items/:id/translations/:lang` — yêu cầu role `ADMIN` hoặc `MANAGER` (kiểm tra ở backend, không tin frontend).
Dùng **transaction**, `UPDATE` trước, nếu `rowsAffected = 0` thì `INSERT` (tránh `MERGE`); kèm `UPDLOCK, HOLDLOCK` để an toàn khi chạy đồng thời.
Chỉ làm khi hệ thống xác thực/phân quyền đã có.

---

## 7. GIAI ĐOẠN 5 — Nối frontend với API

### Bước 5.1 — Cấu hình

- Thêm `VITE_API_URL` vào `.env` và `.env.example` (placeholder, không secret).

### Bước 5.2 — Menu từ API

- Tạo `src/hooks/useMenu.js`: gọi `GET {VITE_API_URL}/api/menu?lang=${lang}` bằng `fetch`
  (dùng `axios` chỉ khi đã có trong `package.json`), `AbortController`, `useEffect` phụ thuộc `[lang]`
  → **đổi ngôn ngữ tự tải lại**. Trả về `{ data, loading, error }`.
- `pages/Menu.jsx` và `MenuSection.jsx`: thay `src/data/menu.js` bằng `useMenu()`; hiển thị `common.loading`,
  `common.empty`, `error.network`. Giữ `formatPrice(price, lang)`.
- Giữ `data/menu.js` làm dữ liệu dự phòng khi dev chưa chạy backend (tùy chọn); xóa khi chủ dự án đồng ý.

### Bước 5.3 — Đặt bàn gọi API (chỉ khi có endpoint và bảng đặt bàn)

- Thay `alert(...)` bằng `POST`; gửi **giá trị thô** (ngày ISO, số khách, tên, điện thoại, email), không gửi chuỗi đã dịch.
- Hiển thị lỗi theo `error.code` → `t('error.<CODE>')`.

### Bước 5.4 — Blog, sự kiện, đánh giá, đầu bếp

- Chỉ khi chủ dự án xác nhận đưa vào DB: tạo bảng gốc → bảng dịch → endpoint → hook, theo đúng mẫu của menu.
- `reviews`: **không dịch** nội dung khách viết.

---

## 8. Lưu ý chất lượng và bảo mật

- **Mã hóa:** luôn `NVARCHAR` và `N'...'`; header JSON có `charset=utf-8`; tránh `?` thay cho chữ có dấu.
- **Cache (nếu thêm sau này):** khóa cache phải gồm `lang`. Giữ `Vary: Accept-Language`.
- **Đơn hàng:** client chỉ gửi `menu_item_id` + số lượng; backend tự lấy giá/tên. Lịch sử đơn/hóa đơn dùng `unit_price` đã lưu;
  kiểm tra schema xem tên món có được snapshot chưa — nếu chưa, **báo chủ dự án**, không tự sửa dữ liệu cũ.
- **Xác thực/phân quyền** (khi cần): băm mật khẩu bằng `bcrypt`/`bcryptjs`, kiểm quyền ở backend, không log token/mật khẩu.
- **Truy cập:** `document.documentElement.lang` luôn khớp ngôn ngữ; nút chuyển ngôn ngữ có `aria-pressed`.
- **SEO (tùy chọn):** đổi ngôn ngữ bằng state không tạo URL riêng. Nếu SEO quan trọng, cân nhắc route `/vi/...`, `/en/...`.

---

## 9. Danh sách việc (checklist theo thứ tự)

- [x] 1.1 Nền tảng i18n + `vi.json`/`en.json` (119 key), Header, trang Menu
- [ ] 1.2 Footer, Sidebar, SignUpSection (+ `siteInfo.js`)
- [ ] 1.3 Section trang chủ
- [ ] 1.4 Đặt bàn + date picker + `reservationConstants`
- [ ] 1.5 About, Contact, Gallery, Blog, BlogDetail
- [ ] 1.6 Rà soát chữ cứng, font tiếng Việt, độ dài chữ, đồng bộ key
- [ ] 2 Chốt phạm vi nội dung DB và người nhập bản dịch
- [ ] 3 Migration bảng dịch menu + dữ liệu mẫu tiếng Anh (+ rollback)
- [ ] 4 Backend vanilla Node.js + `GET /api/menu?lang=` + test
- [ ] 5.1–5.2 Biến môi trường + `useMenu` + thay dữ liệu tĩnh bằng API
- [ ] 5.3 Đặt bàn gọi API (nếu có)
- [ ] 5.4 Blog / sự kiện / đánh giá (nếu chủ dự án xác nhận)

## 10. Việc cần hỏi chủ dự án (agent không tự quyết)

1. Thay giá trị tạm trong `src/data/menu.js` (giá VND thật) và nội dung lorem ipsum bằng nội dung thật?
2. Giữ khối "Latest twitter" của template hay bỏ?
3. "Italian Restaurant" (`welcome.subtitle`) có đúng với nhà hàng không?
4. Backend dùng ESM hay CommonJS? SQL Server chạy ở đâu (máy cục bộ/Docker/server) và thông tin kết nối?
5. Ai nhập bản dịch tiếng Anh cho thực đơn?
6. Blog, sự kiện, đầu bếp có đưa vào DB không?

## 11. Định dạng báo cáo sau mỗi bước

Agent phải trả: (1) danh sách file đã sửa/tạo, (2) key đã thêm, (3) **kết quả thật** của `npm run lint`, `vite build`, `node --test`
(nếu chưa chạy, ghi rõ "chưa chạy"), (4) những gì chưa làm hoặc còn rủi ro, (5) câu hỏi cần chủ dự án quyết định.
