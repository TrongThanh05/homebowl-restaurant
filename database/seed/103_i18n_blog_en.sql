-- seed/103_i18n_blog_en.sql — BẢN DỊCH DỰ THẢO
USE RestaurantDB;
GO

-- ── Danh mục blog ──
INSERT INTO dbo.blog_category_translations (category_id, lang_code, name)
SELECT c.id, 'en', v.en_name
FROM (VALUES
    (N'Công thức nấu ăn',  N'Cooking Recipes'),
    (N'Món ăn ngon',       N'Delicious Food'),
    (N'Thiết kế sự kiện',  N'Event Design'),
    (N'Địa điểm nhà hàng', N'Restaurant Locations'),
    (N'WordPress',         N'WordPress')
) v(vi_name, en_name)
JOIN dbo.blog_categories c ON c.name = v.vi_name
WHERE NOT EXISTS (SELECT 1 FROM dbo.blog_category_translations t WHERE t.category_id = c.id AND t.lang_code = 'en');
GO

-- ── Bài blog ──
INSERT INTO dbo.blog_post_translations (post_id, lang_code, title, excerpt, tags)
SELECT p.id, 'en', v.en_title, v.en_excerpt, v.en_tags
FROM (VALUES
    (N'cong-thuc-nau-an-thom-ngon',
     N'Delicious Cooking Recipes',
     N'Learn how to choose fresh ingredients and season just right so every dish tastes as good as a restaurant meal, right in your own kitchen.',
     N'Cooking, Food'),
    (N'pizza-duoc-che-bien-tuoi-moi',
     N'Freshly Made Pizza',
     N'Dough is proofed daily, stretchy cheese paired with carefully selected fresh toppings create piping hot, fragrant pizzas.',
     N'Cooking, Food'),
    (N'trang-tri-tiec-cuoi',
     N'Wedding Decoration Ideas',
     N'From table arrangements and floral decorations to lighting, these tips will make your wedding reception even more complete and cozy.',
     N'Events, Weddings'),
    (N'dia-diem-thuong-thuc-ruou-vang',
     N'Best Wine Tasting Spots',
     N'Suggestions for ideal spaces to enjoy wine with friends and family, from elegant bars to peaceful gardens.',
     N'Wine, Dining'),
    (N'dia-diem-thuong-thuc-ruou-vang-2',
     N'Wine Pairing Guide',
     N'A guide to choosing the right wine for each dish and the best places to fully enjoy every glass.',
     N'Wine, Dining')
) v(slug, en_title, en_excerpt, en_tags)
JOIN dbo.blog_posts p ON p.slug = v.slug
WHERE NOT EXISTS (SELECT 1 FROM dbo.blog_post_translations t WHERE t.post_id = p.id AND t.lang_code = 'en');
GO

-- ── Gallery categories ──
INSERT INTO dbo.gallery_category_translations (category_id, lang_code, name)
SELECT c.id, 'en', v.en_name
FROM (VALUES
    (N'Tất cả ảnh', N'All Photos'),
    (N'Nội thất',   N'Interior'),
    (N'Món ăn',     N'Food'),
    (N'Sự kiện',    N'Events'),
    (N'Khách VIP',  N'VIP Guests')
) v(vi_name, en_name)
JOIN dbo.gallery_categories c ON c.name = v.vi_name
WHERE NOT EXISTS (SELECT 1 FROM dbo.gallery_category_translations t WHERE t.category_id = c.id AND t.lang_code = 'en');
GO

-- ── Events ──
INSERT INTO dbo.event_translations (event_id, lang_code, title, description)
SELECT e.id, 'en',
       N'Special Wine Tasting Nights',
       N'Enjoy carefully selected wines in a cozy atmosphere, paired with a menu specially curated by our chef for each evening.'
FROM dbo.events e
WHERE NOT EXISTS (SELECT 1 FROM dbo.event_translations t WHERE t.event_id = e.id AND t.lang_code = 'en');
GO

-- ── Gallery images ──
INSERT INTO dbo.gallery_image_translations (image_id, lang_code, title)
SELECT g.id, 'en', v.en_title
FROM (VALUES
    (N'Khoảnh khắc nhà hàng 01', N'Restaurant moment 01'),
    (N'Khoảnh khắc nhà hàng 02', N'Restaurant moment 02'),
    (N'Khoảnh khắc nhà hàng 03', N'Restaurant moment 03'),
    (N'Khoảnh khắc nhà hàng 04', N'Restaurant moment 04'),
    (N'Khoảnh khắc nhà hàng 05', N'Restaurant moment 05'),
    (N'Khoảnh khắc nhà hàng 06', N'Restaurant moment 06'),
    (N'Khoảnh khắc nhà hàng 07', N'Restaurant moment 07'),
    (N'Khoảnh khắc nhà hàng 08', N'Restaurant moment 08'),
    (N'Khoảnh khắc nhà hàng 09', N'Restaurant moment 09'),
    (N'Tiệc tối cùng khách VIP', N'VIP dinner party'),
    (N'Gỏi cuốn tôm thịt',       N'Fresh spring rolls'),
    (N'Đêm nhạc acoustic',       N'Acoustic music night'),
    (N'Bò lúc lắc',              N'Shaking beef'),
    (N'Cá hồi áp chảo',          N'Pan-seared salmon'),
    (N'Phòng VIP tầng 2',        N'VIP room, 2nd floor'),
    (N'Không gian tầng 1',       N'1st floor dining area'),
    (N'Khu sân vườn',            N'Garden area'),
    (N'Tiệc sinh nhật',          N'Birthday party')
) v(vi_title, en_title)
JOIN dbo.gallery_images g ON g.title = v.vi_title
WHERE NOT EXISTS (SELECT 1 FROM dbo.gallery_image_translations t WHERE t.image_id = g.id AND t.lang_code = 'en');
GO
