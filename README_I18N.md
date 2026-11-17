## 0. Yêu cầu (chỉ gồm hai việc)

**A. Giao diện:** thêm **một ô chọn (`<select>`) Tiếng Việt / English**. Mọi chữ cố định của giao diện
(menu điều hướng, tiêu đề section, nhãn form, nút, thông báo) lấy từ các biến trong
`src/i18n/locales/vi.json` và `en.json` qua hàm `t('key')`.

**B. Dữ liệu từ database:** tạo **script SQL** theo phương thức **bảng dịch riêng cho từng thực thể**
(mỗi bảng gốc có đúng một bảng `*_translations`), và cho backend nhận tham số `?lang=` để trả đúng ngôn ngữ.

**Quy tắc phân định (áp dụng xuyên suốt):**

| Nội dung                                              | Nơi lưu               | Ví dụ                                                    |
| ----------------------------------------------------- | --------------------- | -------------------------------------------------------- |
| Chữ cố định của giao diện                             | JSON (`t('key')`)     | "Đặt bàn", "Đang tải...", nhãn form, tiêu đề section     |
| Nội dung nhân viên nhà hàng nhập/sửa, đã nằm trong DB | Bảng `*_translations` | tên món, bài blog, sự kiện, giới thiệu                   |
| Nội dung khách nhập                                   | **Không dịch**        | `reviews.content`, `blog_comments.content`, tên, ghi chú |
| Dữ liệu lịch sử, mã nội bộ                            | **Không dịch**        | đơn hàng, hóa đơn, `status`, `role`                      |

**Tiền tệ:** giá luôn lưu VND. Đổi sang English chỉ đổi cách hiển thị, **không quy đổi USD**.

---

## 1. Ràng buộc bắt buộc

1. Giữ nguyên stack: React 19 + Vite + `react-router-dom` + Bootstrap 4; backend **Node.js thuần** (không Express/NestJS/Fastify/Koa); SQL Server + `mssql`.
2. Mọi truy vấn SQL dùng tham số `.input(...)`. **Không nối chuỗi từ dữ liệu người dùng** vào SQL.
3. **Không sửa/xóa/truncate dữ liệu hiện có.** Chỉ thêm bảng mới. Mọi script phải chạy lại được nhiều lần (`IF OBJECT_ID(...) IS NULL`) và có script rollback.
4. Không bịa file, bảng, API. Trước khi viết SQL phải đọc lại `restaurant_db.sql`.
5. Không thêm dependency nếu không cần (frontend đã có `axios`).
6. Không tuyên bố build/test/lint "đã pass" nếu chưa chạy. Báo kết quả thật.
7. Không đưa secret vào frontend hoặc Git.
8. `GET` không có `?lang=` phải **giữ nguyên hành vi hiện tại** (trả tiếng Việt) để không phá chức năng đang chạy.

---

## 2. Hiện trạng

### 2.1. Những gì có và chưa có

- **Backend đã tồn tại** (`backend/`, Node thuần, 4 tầng routes → controllers → services → repositories). Phản hồi thành công có dạng `{ "success": true, "data": ... }`;
  lỗi có dạng `{ "success": false, "error": { "code", "message" } }` (`message` tiếng Việt, `code` ổn định).
- **API menu thật:** `GET /api/menu-items?page&pageSize&categoryId` và `GET /api/menu-categories`
  (không có `/api/menu`). Mỗi món trả về cả `category_name` và `section`
  (`starters|drinks|desserts|mains|lunch|dinner`, lấy từ bảng `website_menu_items`).
- **Frontend mới chỉ nối API cho trang Menu** (`src/services/menuService.js`, dùng `axios`, `VITE_API_URL` mặc định `http://localhost:3000/api`).
  Blog, sự kiện, gallery, đánh giá vẫn dùng `src/data/*.js`.
- **`src/i18n/` và hai file `vi.json`/`en.json` CHƯA nằm trong repo** (commit chỉ có `README_I18N.md`). Phải tạo ở Bước A1 (mã nguồn ở mục 3; hai file JSON đính kèm cùng README này, **130 key**).
- Bảng DB có nội dung hiển thị (theo `restaurant_db.sql`): `menu_categories(name)`, `menu_items(name, description)`,
  `site_settings(setting_key, setting_value)`, `blog_categories(name)`, `blog_posts(title, excerpt, content, tags)`,
  `events(title, description)`, `gallery_images(title)`, `gallery_categories(name)`, `dining_tables(area)`, `blog_popular_posts(title)`.
- **Backend chưa có route cho `events`.** Bảng `blog_popular_posts` hiện **không được backend dùng** (`/blog-posts/most-viewed` đọc từ `blog_posts`).

### 2.2. Lỗi nền phải sửa trước (Bước 0) — không liên quan i18n nhưng chặn việc kiểm tra

| #   | Lỗi                                                                                                                                                                                                                           | Cách sửa                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `npx vite build` **thất bại trên Linux/CI**: `src/App.jsx` import `'./components/layout/layout'` nhưng file là `Layout.jsx` (chạy được trên Windows/macOS vì không phân biệt hoa thường)                                      | Đổi thành `'./components/layout/Layout'`. Đã thử: sau khi sửa, build thành công                                                                                                                                                                                                                                                                                                                                                                                                |
| 2   | `npm run lint` báo ~27 lỗi vì ESLint gốc áp quy tắc **trình duyệt** lên `backend/` (không biết `process`...)                                                                                                                  | Trong `eslint.config.js`: giới hạn khối hiện tại cho `files: ['src/**/*.{js,jsx}']` và thêm khối `{ files: ['backend/**/*.js', '*.config.js'], extends: [js.configs.recommended], languageOptions: { globals: globals.node } }` trước `prettier`. Đã thử: còn 7 lỗi `no-unused-vars` thật (`menu.controller.js` import `parse`, `auth.js` biến `err`, `orders.service.js` import `listEmployees`, 4 chỗ trong `tests/app.test.js`) — xóa import/biến thừa, **không đổi logic** |
| 3   | `backend/package.json` có `"test": "node --env-file=.env.example ..."` nhưng **`backend/.env.example` không có trong repo** (README nói có) → `npm test` lỗi. Test thứ 3 (CORS) cũng cần `CORS_ORIGINS=http://localhost:5173` | Tạo `backend/.env.example` chỉ chứa giá trị giả: `PORT=3000`, `CORS_ORIGINS=http://localhost:5173`, `DB_SERVER=localhost`, `DB_PORT=1433`, `DB_NAME=RestaurantDB`, `DB_USER=sa`, `DB_PASSWORD=change_me`, `DB_ENCRYPT=false`, `DB_TRUST_SERVER_CERT=true`, `JWT_SECRET=change_me`, `JWT_EXPIRES_IN=8h`, `MAX_BODY_BYTES=102400`. Đã thử: với `CORS_ORIGINS` đặt đúng, 5/5 test pass                                                                                            |

Commit riêng: `chore: fix build case, lint scope, backend .env.example`.

### 2.3. Kiểm tra bắt buộc sau mỗi bước

```bash
npm run lint && npx vite build          # tại thư mục gốc (frontend)
cd backend && npm test                  # sau khi có .env.example; thêm test mới vào tests/
```

Kiểm tra thủ công bằng `npm run dev` (frontend) + `npm run dev` trong `backend/`: đổi ngôn ngữ, tải lại trang, xem lại lựa chọn được nhớ.

### 2.4. Quy ước i18n

- Key dạng `nhóm.tênKey` (camelCase). **Mọi key mới phải thêm vào cả `vi.json` và `en.json`**, cùng placeholder (`{count}`, `{year}`, `{n}`).
- Số nhiều dùng cặp `.one` / `.other`, chọn trong component: `t(count === 1 ? 'blog.comments.one' : 'blog.comments.other', { count })`.
- Không để chuỗi hiển thị trong file hằng/`utils`; lưu key hoặc giá trị thô, tạo nhãn bằng `t()` trong component.
- `alt`, `aria-label`, `title`, `placeholder` cũng đi qua `t()`.
- Tên thương hiệu và dữ liệu liên hệ (địa chỉ, điện thoại, email) **không** nằm trong JSON.
- Script kiểm tra đồng bộ key (chạy sau mỗi lần sửa JSON):
  ```bash
  node -e "const v=require('./src/i18n/locales/vi.json'),e=require('./src/i18n/locales/en.json');
  const a=Object.keys(v).filter(k=>!(k in e)),b=Object.keys(e).filter(k=>!(k in v));
  console.log({thieuTrongEn:a,thieuTrongVi:b});process.exit(a.length||b.length?1:0)"
  ```
  (Dự án đặt `"type": "module"` nên nếu `require` lỗi, đổi sang `JSON.parse(fs.readFileSync(...))`.)

---

## 3. PHẦN A — Giao diện: ô chọn ngôn ngữ + file JSON

### Bước A1 — Nền tảng i18n (tạo mới `src/i18n/`)

```text
src/i18n/
├── languageContext.js     # createContext + hook useLanguage + SUPPORTED_LANGS
├── LanguageProvider.jsx   # state lang, t(), lưu localStorage
├── LanguageSelect.jsx     # <select> chọn ngôn ngữ
├── format.js              # pickText, formatPrice, formatDate
└── locales/{vi.json,en.json}   # copy hai file đính kèm (130 key)
```

Tách hook và hằng khỏi file provider để không vi phạm `react-refresh/only-export-components`.

**`languageContext.js`**

```js
import { createContext, useContext } from 'react';

export const SUPPORTED_LANGS = ['vi', 'en'];
export const LanguageContext = createContext(null);

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
```

**`LanguageProvider.jsx`**

```jsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import { LanguageContext, SUPPORTED_LANGS } from './languageContext';
import vi from './locales/vi.json';
import en from './locales/en.json';

const DICTIONARIES = { vi, en };
const DEFAULT_LANG = 'vi';
const STORAGE_KEY = 'app_lang';

function getInitialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return SUPPORTED_LANGS.includes(saved) ? saved : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(getInitialLang);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* bỏ qua */
    }
    document.documentElement.lang = lang;
  }, [lang]);

  // thiếu key -> lùi về tiếng Việt -> cuối cùng trả về chính key
  const t = useCallback(
    (key, params = {}) => {
      const text =
        DICTIONARIES[lang][key] ?? DICTIONARIES[DEFAULT_LANG][key] ?? key;
      return text.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? `{${k}}`);
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
```

**`LanguageSelect.jsx`** — ô chọn (`<select>` gốc, truy cập tốt trên mobile)

```jsx
import { useLanguage, SUPPORTED_LANGS } from './languageContext';

export default function LanguageSelect({ className = '' }) {
  const { lang, setLang, t } = useLanguage();
  return (
    <select
      className={`lang-select ${className}`}
      value={lang}
      onChange={(e) => setLang(e.target.value)}
      aria-label={t('language.label')}
    >
      {SUPPORTED_LANGS.map((code) => (
        <option key={code} value={code}>
          {t(`language.${code}`)}
        </option>
      ))}
    </select>
  );
}
```

Thêm CSS vào `src/styles/main.css` (header nền gradient, chữ trắng; **kiểm tra bằng mắt**):

```css
.lang-select {
  background: transparent;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 13px;
  cursor: pointer;
}
.lang-select option {
  color: #222;
}
```

**`format.js`**

```js
const LOCALES = { vi: 'vi-VN', en: 'en-US' };

export const pickText = (field, lang) =>
  typeof field === 'string' ? field : (field?.[lang] ?? field?.vi ?? '');

export const formatPrice = (value, lang) =>
  new Intl.NumberFormat(LOCALES[lang] ?? LOCALES.vi, {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);

export const formatDate = (iso, lang) =>
  new Intl.DateTimeFormat(LOCALES[lang] ?? LOCALES.vi, {
    dateStyle: 'long',
  }).format(new Date(iso));
```

**Gắn vào ứng dụng**

- `src/main.jsx`: bọc `<App />` bằng `<LanguageProvider>` (bên trong `BrowserRouter`).
- `src/components/layout/Header.jsx`: đổi mảng `links` sang `labelKey` (`nav.home|menu|reservation|gallery|about|blog|contact`),
  render `{t(labelKey)}`; đặt `<LanguageSelect />` trong khối `.social`, ngay trước nút `btn-show-sidebar`; `aria-label="Open Sidebar"` → `t('common.openSidebar')`.
- Kiểm tra màn hình ≤ 991px: nếu khối `.social` bị ẩn, đặt thêm `<LanguageSelect />` trong `Sidebar.jsx`.

**Hoàn thành khi:** chọn "English" thì menu điều hướng đổi chữ ngay, tải lại trang vẫn giữ lựa chọn, `<html lang>` đổi theo; lint và build pass.

### Bước A2 — Trang Menu (đã nối API) ⚠ có thay đổi logic

`Menu.jsx` hiện **phân loại món bằng từ khóa trong tên danh mục** (`'khai vị'`, `'starter'`...). Khi API trả tên danh mục đã dịch,
cách này sẽ vỡ. Phải đổi sang **mã `section` ổn định** (không đổi theo ngôn ngữ):

```jsx
const bySection = (code) => menuItems.filter((item) => item.section === code);
const starters = bySection('starters'); // drinks, desserts, mains, lunch, dinner tương tự
```

Các việc cần làm:

1. Xóa `filterByCategory` và hàm `formatPrice` cục bộ; dùng `formatPrice(price, lang)` từ `i18n/format.js` (giá luôn VND, bỏ nhánh USD).
2. Tiêu đề (`Pato Menu`, `STARTERS`, `DRINKS`, `DESSERT`, `MAIN`, `Lunch`, `Dinner`) → `menu.pageTitle|starters|drinks|desserts|mains|lunch|dinner`.
3. Chuỗi tiếng Việt cứng ("Đang tải dữ liệu từ database...", "Chưa có món khai vị nào.", thông báo lỗi) → `menu.loading`, `menu.empty.*`, `menu.error`.
   Không hiển thị `err.message` thô cho khách (hiện đang làm vậy); ghi lỗi vào `console.error`.
4. `getMenuItems({ lang })` thêm `lang` vào `params`; `useEffect` phụ thuộc `[lang]` để tự tải lại khi đổi ngôn ngữ; dùng `AbortController` (truyền `signal` cho `axios`) và bỏ qua lỗi hủy.
   Bước này chỉ hoàn chỉnh khi backend đã hỗ trợ `?lang=` (B2); trước đó thêm `lang` vào request là vô hại (backend bỏ qua tham số lạ).
5. **Trước khi bỏ bộ lọc theo tên**, chạy kiểm tra: món nào chỉ khớp theo tên danh mục mà **chưa có dòng trong `website_menu_items`** sẽ biến mất khỏi trang.
   ```sql
   SELECT mi.id, mi.name FROM menu_items mi
   WHERE mi.is_available = 1
     AND NOT EXISTS (SELECT 1 FROM website_menu_items w WHERE w.menu_item_id = mi.id);
   ```
   Có kết quả thì báo chủ dự án (thêm vào `website_menu_items` hoặc chấp nhận không hiển thị). Seed hiện tại (`@web_menu`) gán section cho mọi món web.

### Bước A3 — Các trang còn lại: thay chữ cứng bằng `t()`

Mỗi nhóm một commit; **không đổi class, bố cục, thư viện**.

| Nhóm       | File                                                                                                                                        | Key chính                                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Layout     | `Footer.jsx`, `Sidebar.jsx`, `SignUpSection.jsx`                                                                                            | `footer.*`, `common.closeSidebar`, `common.everyDay`, `signup.*`; copyright: `t('footer.copyright', { year: new Date().getFullYear() })`        |
| Trang chủ  | `HeroSlider`, `IntroSection`, `WelcomeSection`, `MenuSection`, `VideoSection`, `VideoModal`, `EventSection`, `ReviewSection`, `BlogSection` | `hero.*`, `intro.*`, `welcome.*`, `menuSection.*`, `video.*`, `events.*` (days/hours/minutes/seconds), `reviews.*`, `blogSection.*`, `common.*` |
| Đặt bàn    | `Reservation.jsx`, `BookingSection.jsx`, `utils/reservationConstants.jsx`                                                                   | `booking.*`, `validation.*`                                                                                                                     |
| Trang khác | `About`, `Contact`, `Gallery`, `Blog`, `BlogDetail`                                                                                         | `about.*`, `contact.*`, `gallery.*`, `blog.*`                                                                                                   |

Lưu ý kỹ thuật:

- `HeroSlider`: chuyển `caption1/caption2/btnText` trong mảng slide thành key; `Slide ${i+1}` → `t('common.slideN', { n: i + 1 })`.
- `reservationConstants.jsx`: `peopleOptions` đang là chuỗi `'1 Person'`; đổi `value` thành **số**, nhãn tạo trong component bằng `booking.people.one|other`.
  `alert(...)` trong `handleSubmit` đang chứa chữ cứng → dùng `t()` (sẽ thay bằng gọi API khi nối endpoint đặt bàn vào frontend).
- `react-datepicker`: `registerLocale('vi', vi)` với `import { vi } from 'date-fns/locale/vi'` (và `enUS`), truyền `locale={lang}`.
  Nếu `renderCustomDatePickerHeader` tự gõ tên tháng tiếng Anh, thay bằng `Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-US', { month: 'long', year: 'numeric' })`.
- `blog.js` đang lưu `day`, `monthYear`, `comments` dạng chuỗi tiếng Anh → đổi thành `date` (ISO) và `commentCount` (số) rồi dùng `formatDate` và `blog.comments.*`.
- Địa chỉ/điện thoại/email/giờ mở cửa ở Footer và Contact hiện là dữ liệu mẫu New York. **Không đưa vào JSON.** Khi nối `GET /api/settings` (Bước B6) sẽ lấy từ DB; tạm thời để nguyên.
- Các đoạn văn mô tả trong JSON (`welcome.text`, `intro.*.text`, `about.*.text`) là **bản nháp**; nếu nội dung đó thuộc `site_settings` (vd `about_content`) thì dùng DB, không nhân đôi.

### Bước A4 — Rà soát

- [ ] Tìm chữ cứng còn sót (văn bản trong JSX và thuộc tính `placeholder|alt|title|aria-label`).
- [ ] Tiếng Việt thường dài hơn: kiểm tra nút/menu/tab không tràn ở ≤ 576px.
- [ ] **Font:** `main.css` dùng Montserrat, Poppins, Courgette, Noto Sans. Courgette có thể **không có glyph tiếng Việt** → xem bằng mắt "Đặt bàn", "Tráng miệng"; nếu lỗi thì thêm font dự phòng/đổi font cho class dùng Courgette.
- [ ] Chạy script đồng bộ key (mục 2.4); lint + build pass.

---

## 4. PHẦN B — Database: bảng dịch riêng cho từng thực thể

### 4.1. Nguyên tắc thiết kế

- Bản gốc **tiếng Việt** giữ nguyên ở bảng gốc. Bảng `*_translations` chỉ chứa ngôn ngữ khác (`'en'`).
- Tên bảng: `<bảng_gốc_số_ít>_translations`; khóa chính gộp `(<khóa_gốc>, lang_code)`; khóa ngoại tới bảng gốc;
  `CHECK (lang_code <> 'vi')`; `updated_at` để theo dõi.
- Cột dịch chính (`name`/`title`) `NOT NULL`; cột phụ cho phép `NULL`. **Dịch từng trường, thiếu trường nào thì lùi về tiếng Việt trường đó** (`COALESCE(NULLIF(t.col, N''), base.col)`).
- Không dịch khóa/định danh: `slug`, `code`, `section`, `setting_key` giữ nguyên để URL và mã ổn định.
- Độ dài cột dịch **bằng hoặc lớn hơn** cột gốc (đã đối chiếu `restaurant_db.sql`).
- Không `ON DELETE CASCADE` (hệ thống ẩn bằng cờ `is_available`/`is_published`, không xóa); xóa bản ghi gốc phải xử lý bản dịch tường minh.

### 4.2. Danh sách thực thể và thứ tự thực hiện

| Ưu tiên | Bảng gốc             | Bảng dịch (mới)                 | Cột dịch                              | Backend hiện có                                             |
| ------- | -------------------- | ------------------------------- | ------------------------------------- | ----------------------------------------------------------- |
| 1       | `menu_categories`    | `menu_category_translations`    | `name`                                | `GET /menu-categories`, `/menu-items` (kèm `category_name`) |
| 1       | `menu_items`         | `menu_item_translations`        | `name`, `description`                 | `GET /menu-items`, `/menu-items/:id`                        |
| 2       | `site_settings`      | `site_setting_translations`     | `setting_value` (chỉ khóa cần dịch)   | `GET /settings`, `/settings/:key`                           |
| 3       | `blog_categories`    | `blog_category_translations`    | `name`                                | `GET /blog-categories`                                      |
| 3       | `blog_posts`         | `blog_post_translations`        | `title`, `excerpt`, `content`, `tags` | `GET /blog-posts`, `/:slug`, `/most-viewed`                 |
| 4       | `gallery_images`     | `gallery_image_translations`    | `title`                               | `GET /gallery`                                              |
| 4       | `gallery_categories` | `gallery_category_translations` | `name`                                | (chưa có route)                                             |
| 4       | `events`             | `event_translations`            | `title`, `description`                | **chưa có route**                                           |

Không tạo bảng dịch cho: `dining_tables.area` (chỉ nội bộ, trừ khi khách thấy), `blog_popular_posts` (backend không dùng),
`reviews`, `blog_comments`, `orders`... Khi một bảng chưa có route thì **chỉ tạo bảng dịch**, tạo endpoint khi module đó được xây.

### 4.3. Cấu trúc script (thư mục `database/`, giữ `restaurant_db.sql` ở vị trí cũ)

```text
database/
├── migrations/
│   ├── 001_i18n_menu.sql            # menu_category_translations, menu_item_translations
│   ├── 002_i18n_site_settings.sql
│   ├── 003_i18n_blog.sql
│   └── 004_i18n_gallery_events.sql
├── seed/
│   ├── 101_i18n_menu_en.sql         # bản dịch tiếng Anh DỰ THẢO — cần người duyệt
│   ├── 102_i18n_site_settings_en.sql
│   └── 103_i18n_blog_en.sql
├── rollback/
│   └── 001_down.sql ... 004_down.sql
└── README.md                        # thứ tự chạy, cách kiểm tra
```

Thứ tự chạy: `restaurant_db.sql` → `migrations/*` → `seed/*`. Mỗi migration chạy lại hai lần liên tiếp **không lỗi**.

### 4.4. Mẫu migration (đầy đủ cho nhóm menu; các nhóm khác theo đúng mẫu)

`database/migrations/001_i18n_menu.sql`

```sql
USE RestaurantDB;
GO
IF OBJECT_ID('dbo.menu_category_translations', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.menu_category_translations (
        category_id INT           NOT NULL,
        lang_code   VARCHAR(5)    NOT NULL,
        name        NVARCHAR(100) NOT NULL,
        updated_at  DATETIME2     NOT NULL CONSTRAINT df_mct_updated DEFAULT SYSDATETIME(),
        CONSTRAINT pk_menu_category_translations PRIMARY KEY (category_id, lang_code),
        CONSTRAINT fk_mct_category FOREIGN KEY (category_id) REFERENCES dbo.menu_categories(id),
        CONSTRAINT ck_mct_lang CHECK (lang_code <> 'vi')
    );
END;
GO
IF OBJECT_ID('dbo.menu_item_translations', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.menu_item_translations (
        menu_item_id INT           NOT NULL,
        lang_code    VARCHAR(5)    NOT NULL,
        name         NVARCHAR(150) NOT NULL,
        description  NVARCHAR(500) NULL,
        updated_at   DATETIME2     NOT NULL CONSTRAINT df_mit_updated DEFAULT SYSDATETIME(),
        CONSTRAINT pk_menu_item_translations PRIMARY KEY (menu_item_id, lang_code),
        CONSTRAINT fk_mit_item FOREIGN KEY (menu_item_id) REFERENCES dbo.menu_items(id),
        CONSTRAINT ck_mit_lang CHECK (lang_code <> 'vi')
    );
END;
GO
```

`database/rollback/001_down.sql`

```sql
USE RestaurantDB;
GO
DROP TABLE IF EXISTS dbo.menu_item_translations;
DROP TABLE IF EXISTS dbo.menu_category_translations;
GO
```

Các bảng còn lại (cùng khuôn, đúng kiểu cột gốc):

| Bảng dịch                       | Khóa                                                    | Cột                                                                                                                   |
| ------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `site_setting_translations`     | `(setting_key VARCHAR(100) → site_settings, lang_code)` | `setting_value NVARCHAR(2000) NOT NULL`                                                                               |
| `blog_category_translations`    | `(category_id → blog_categories, lang_code)`            | `name NVARCHAR(100) NOT NULL`                                                                                         |
| `blog_post_translations`        | `(post_id → blog_posts, lang_code)`                     | `title NVARCHAR(200) NOT NULL`, `excerpt NVARCHAR(500) NULL`, `content NVARCHAR(MAX) NULL`, `tags NVARCHAR(200) NULL` |
| `gallery_image_translations`    | `(image_id → gallery_images, lang_code)`                | `title NVARCHAR(150) NOT NULL`                                                                                        |
| `gallery_category_translations` | `(category_id → gallery_categories, lang_code)`         | `name NVARCHAR(100) NOT NULL`                                                                                         |
| `event_translations`            | `(event_id → events, lang_code)`                        | `title NVARCHAR(200) NOT NULL`, `description NVARCHAR(500) NULL`                                                      |

### 4.5. Mẫu seed bản dịch (idempotent, khớp theo tên tiếng Việt, không phụ thuộc id)

```sql
-- seed/101_i18n_menu_en.sql  — BẢN DỊCH DỰ THẢO, cần chủ nhà hàng duyệt
USE RestaurantDB;
GO
INSERT INTO dbo.menu_category_translations (category_id, lang_code, name)
SELECT c.id, 'en', v.en_name
FROM (VALUES
    (N'Khai vị',     N'Starters'),
    (N'Đồ uống',     N'Drinks')
    -- ... đủ mọi danh mục trong restaurant_db.sql
) v(vi_name, en_name)
JOIN dbo.menu_categories c ON c.name = v.vi_name
WHERE NOT EXISTS (SELECT 1 FROM dbo.menu_category_translations t WHERE t.category_id = c.id AND t.lang_code = 'en');
GO
INSERT INTO dbo.menu_item_translations (menu_item_id, lang_code, name, description)
SELECT m.id, 'en', v.en_name, v.en_desc
FROM (VALUES
    (N'Canh bí đỏ kem tươi', N'Creamy pumpkin soup', N'Pureed pumpkin, fresh cream and cashew nuts')
    -- ... đủ mọi món trong restaurant_db.sql
) v(vi_name, en_name, en_desc)
JOIN dbo.menu_items m ON m.name = v.vi_name
WHERE NOT EXISTS (SELECT 1 FROM dbo.menu_item_translations t WHERE t.menu_item_id = m.id AND t.lang_code = 'en');
GO
```

Luôn dùng tiền tố `N'...'`. Agent đọc `restaurant_db.sql` để liệt kê **toàn bộ** danh mục/món/bài viết cần dịch; bản dịch là **dự thảo** — ghi rõ trong file và báo chủ dự án duyệt (đặc biệt tên món Việt như "gỏi cuốn", "bún chả": nên giữ tên gốc kèm mô tả).

Khóa `site_settings` nên dịch: `slogan`, `opening_days`, `about_title`, `about_content`, `reservation_note` (và `address` nếu muốn bản tiếng Anh). **Không dịch**: `site_name` (tên thương hiệu), `phone`, `email`, `*_url`, `opening_hours` (giờ giấc).

---

## 5. PHẦN B (tiếp) — Backend hỗ trợ `?lang=`

### 5.1. Tiện ích chọn ngôn ngữ — `backend/src/utils/lang.js`

```js
export const SUPPORTED_LANGS = ['vi', 'en'];
export const DEFAULT_LANG = 'vi';

// 1) ?lang=  2) Accept-Language  3) mặc định 'vi'. Danh sách trắng → an toàn khi đưa vào truy vấn.
export function resolveLang(req) {
  const fromQuery = new URL(req.url, 'http://localhost').searchParams.get(
    'lang',
  );
  if (SUPPORTED_LANGS.includes(fromQuery)) return fromQuery;
  const first = (req.headers['accept-language'] ?? '')
    .split(',')[0]
    ?.trim()
    .slice(0, 2)
    .toLowerCase();
  return SUPPORTED_LANGS.includes(first) ? first : DEFAULT_LANG;
}
```

Frontend **luôn gửi `?lang=`** nên không phụ thuộc `Accept-Language`; dự phòng này chỉ cho client khác.

### 5.2. Mẫu cho từng module (ví dụ menu)

- **Controller** (`menu.controller.js`): `const lang = resolveLang(req);` rồi truyền cho service; thêm header `Content-Language` và `Vary: Accept-Language`
  (mở rộng `sendSuccess(res, data, status = 200, headers = {})` để nhận header phụ, không đổi hành vi cũ).
- **Service:** truyền `lang` xuống repository (mặc định `'vi'`); không thêm luật nghiệp vụ mới.
- **Repository:** luôn truyền `@lang` bằng `.input('lang', sql.VarChar(5), lang)`:
  ```sql
  SELECT mi.id, mi.category_id,
         COALESCE(NULLIF(mit.name, N''), mi.name)               AS name,
         COALESCE(NULLIF(mit.description, N''), mi.description) AS description,
         mi.price, mi.image_url, mi.is_available, mi.created_at,
         COALESCE(NULLIF(mct.name, N''), mc.name)               AS category_name,
         wmi.section, COALESCE(wmi.sort_order, 999) AS sort_order
  FROM menu_items mi
  JOIN menu_categories mc ON mc.id = mi.category_id
  LEFT JOIN website_menu_items wmi ON wmi.menu_item_id = mi.id
  LEFT JOIN menu_item_translations mit     ON mit.menu_item_id = mi.id AND mit.lang_code = @lang
  LEFT JOIN menu_category_translations mct ON mct.category_id  = mc.id AND mct.lang_code = @lang
  WHERE (@categoryId IS NULL OR mi.category_id = @categoryId) AND mi.is_available = 1
  ORDER BY COALESCE(wmi.sort_order, 999) ASC, mi.created_at DESC
  OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
  ```
  Với `lang='vi'` không có dòng dịch nào (nhờ `CHECK`), kết quả y hệt hiện tại.
- Áp dụng cùng mẫu cho `listCategories`, `findItemById`, và (khi tới lượt) `settings`, `blog`, `gallery`.
- **Không dịch** các endpoint ghi (POST/PATCH hiện có) và dữ liệu trả về từ chúng; chúng thao tác trên bản gốc tiếng Việt.

### 5.3. Endpoint quản lý bản dịch (MANAGER/ADMIN)

CORS hiện chỉ cho `GET,POST,PATCH,DELETE,OPTIONS` → dùng **PATCH** (không thêm PUT).

| Endpoint                                                | Quyền          | Việc                                            |
| ------------------------------------------------------- | -------------- | ----------------------------------------------- |
| `GET /api/menu-items/:id/translations`                  | MANAGER, ADMIN | Liệt kê bản dịch của món (để form sửa hiển thị) |
| `PATCH /api/menu-items/:id/translations/:lang`          | MANAGER, ADMIN | Tạo/cập nhật bản dịch `{ name, description }`   |
| `PATCH /api/menu-categories/:id/translations/:lang`     | MANAGER, ADMIN | `{ name }`                                      |
| `PATCH /api/settings/:key/translations/:lang`           | ADMIN          | `{ value }`                                     |
| (tương tự cho blog, gallery, events khi module tồn tại) |                |                                                 |

Quy tắc: `:lang` phải thuộc danh sách trắng và **khác `vi`** (`400`, code `UNSUPPORTED_LANG`); bản ghi gốc không tồn tại → `404`;
chuỗi rỗng hoặc vượt độ dài cột → `400`. Ghi bằng **transaction**, `UPDATE` trước, nếu `rowsAffected = 0` thì `INSERT`
(tránh `MERGE`; dùng `UPDLOCK, HOLDLOCK` để an toàn khi đồng thời):

```js
const upd = await new sql.Request(tx)
  .input('id', sql.Int, id)
  .input('lang', sql.VarChar(5), lang)
  .input('name', sql.NVarChar(150), name)
  .input('desc', sql.NVarChar(500), description ?? null)
  .query(`UPDATE menu_item_translations WITH (UPDLOCK, HOLDLOCK)
          SET name = @name, description = @desc, updated_at = SYSDATETIME()
          WHERE menu_item_id = @id AND lang_code = @lang`);
if (upd.rowsAffected[0] === 0) {
  await new sql.Request(tx)
    .input('id', sql.Int, id)
    .input('lang', sql.VarChar(5), lang)
    .input('name', sql.NVarChar(150), name)
    .input('desc', sql.NVarChar(500), description ?? null)
    .query(`INSERT INTO menu_item_translations (menu_item_id, lang_code, name, description)
            VALUES (@id, @lang, @name, @desc)`);
}
```

Tên bảng/cột trong mã ghi bản dịch là **hằng cố định trong code** (có thể gom vào một object cấu hình), tuyệt đối không lấy từ dữ liệu người dùng.

### 5.4. Kiểm thử backend (`node:test`, thêm vào `backend/tests/`, đổi script test thành `node --env-file=.env.example --test tests/`)

- `resolveLang`: ưu tiên `?lang=`; `lang=fr` → rơi về `Accept-Language`; không có gì → `vi`.
- Repository (mock `pool`): có truyền `@lang`, không nối chuỗi vào câu SQL.
- Controller: `?lang=en` có header `Content-Language: en`; không `?lang` → hành vi cũ, `Content-Language: vi`.
- Endpoint ghi bản dịch: `lang=vi` → 400 `UNSUPPORTED_LANG`; không có token → 401; sai vai trò → 403; món không tồn tại → 404.
- Kiểm thử tích hợp với SQL Server thật chỉ chạy khi có DB; nếu chưa có thì **ghi rõ "chưa chạy"**, không giả lập kết quả.

### 5.5. Nối frontend cho từng module khi trang đó dùng API

- Thêm `lang` vào hàm service tương ứng (vd `menuService.getMenuItems({ lang })`, `getMenuCategories({ lang })`), `useEffect` phụ thuộc `[lang]`.
- Chỉ nối trang nào **đã** dùng API. Blog/gallery/sự kiện/đánh giá hiện đang dùng `src/data/*.js`; chuyển sang API là việc riêng, ngoài phạm vi i18n (khi làm, áp dụng cùng mẫu, và hiển thị ngày bằng `formatDate`).

---

## 6. Thứ tự thực hiện (checklist)

- [ ] **0** Sửa lỗi nền (mục 2.2): build trên Linux, lint, `backend/.env.example`
- [ ] **A1** `src/i18n/*` + hai file JSON (130 key) + `LanguageSelect` trong Header
- [ ] **A2** Trang Menu: phân nhóm theo `section`, `formatPrice`, `t()`, `lang` trong API call
- [ ] **A3** Footer/Sidebar/SignUp → trang chủ → đặt bàn → About/Contact/Gallery/Blog
- [ ] **A4** Rà soát chữ cứng, font tiếng Việt, độ dài chữ, đồng bộ key
- [ ] **B1** `database/migrations/001` (menu) + rollback + seed dự thảo → chạy hai lần không lỗi
- [ ] **B2** `utils/lang.js` + menu: controller/service/repository + test
- [ ] **B3** Endpoint ghi bản dịch menu (PATCH) + test
- [ ] **B4** Kiểm tra end-to-end `Menu.jsx` đổi ngôn ngữ tải lại đúng (cần DB đã chạy B1)
- [ ] **B5** `002` (site_settings), `003` (blog), `004` (gallery, events): migration + seed + backend `lang` cho route đã tồn tại
- [ ] **B6** (tùy chọn) Footer/Contact đọc `GET /api/settings?lang=` thay cho dữ liệu mẫu

## 7. Việc cần hỏi chủ dự án (agent không tự quyết)

1. Ai duyệt bản dịch tiếng Anh dự thảo (tên món, mô tả, bài blog)? Tên món Việt giữ nguyên hay dịch?
2. Có đưa Footer/Contact sang đọc từ `site_settings` không (hiện là dữ liệu mẫu New York)?
3. Trang nào ưu tiên nối API tiếp theo (blog, gallery, sự kiện)? Có cần route `events` không?
4. Font tiêu đề Courgette không hỗ trợ tiếng Việt thì chọn font thay thế nào?
5. Có cần thêm ngôn ngữ thứ ba trong tương lai không? (Thiết kế bảng dịch đã sẵn sàng; chỉ cần thêm vào `SUPPORTED_LANGS`, JSON và dữ liệu dịch.)

## 8. Báo cáo sau mỗi bước

Trả về: (1) file đã tạo/sửa, (2) key hoặc bảng đã thêm, (3) **kết quả thật** của `npm run lint`, `npx vite build`, `npm test`
(chưa chạy thì ghi "chưa chạy"), (4) việc chưa làm hoặc rủi ro, (5) câu hỏi cần chủ dự án quyết.
