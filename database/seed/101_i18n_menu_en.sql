-- seed/101_i18n_menu_en.sql — BẢN DỊCH DỰ THẢO, cần chủ nhà hàng duyệt
-- Idempotent: chỉ INSERT nếu chưa có bản dịch
USE RestaurantDB;
GO

-- ── Danh mục ──
INSERT INTO dbo.menu_category_translations (category_id, lang_code, name)
SELECT c.id, 'en', v.en_name
FROM (VALUES
    (N'Khai vị',         N'Starters'),
    (N'Món chính',       N'Main Courses'),
    (N'Tráng miệng',    N'Desserts'),
    (N'Đồ uống',        N'Drinks'),
    (N'Thực đơn trưa',  N'Lunch Menu'),
    (N'Thực đơn tối',   N'Dinner Menu')
) v(vi_name, en_name)
JOIN dbo.menu_categories c ON c.name = v.vi_name
WHERE NOT EXISTS (SELECT 1 FROM dbo.menu_category_translations t WHERE t.category_id = c.id AND t.lang_code = 'en');
GO

-- ── Món ăn (demo + website) ──
INSERT INTO dbo.menu_item_translations (menu_item_id, lang_code, name, description)
SELECT m.id, 'en', v.en_name, v.en_desc
FROM (VALUES
    -- Món demo (mục 11+12 restaurant_db.sql)
    (N'Gỏi cuốn tôm thịt',       N'Fresh spring rolls',              N'Herbs, vermicelli, special dipping sauce'),
    (N'Bò lúc lắc',               N'Shaking beef',                    N'Beef tenderloin, bell peppers, potatoes'),
    (N'Chè hạt sen',              N'Lotus seed sweet soup',           N'Lotus seeds, longan'),
    (N'Trà đào cam sả',           N'Peach lemongrass iced tea',       N'Blended ice optional'),
    (N'Chả giò hải sản',          N'Seafood spring rolls',            N'Deep fried, shrimp & squid, fresh greens'),
    (N'Súp cua',                   N'Crab soup',                       N'Crab, quail eggs, mushrooms'),
    (N'Cá hồi áp chảo',           N'Pan-seared salmon',               N'Passion fruit sauce, asparagus'),
    (N'Gà nướng mật ong',         N'Honey-roasted chicken',           N'Half chicken, roasted potatoes'),
    (N'Cơm chiên dương châu',     N'Yangzhou fried rice',             N'Shrimp, sausage, egg'),
    (N'Lẩu thái hải sản',         N'Thai seafood hotpot',             N'Serves 3–4 people'),
    (N'Bánh flan caramel',        N'Crème caramel',                   N'Smooth custard, light bitter caramel'),
    (N'Kem dừa',                   N'Coconut ice cream',               N'Ben Tre coconut, shredded coconut'),
    (N'Cà phê sữa đá',            N'Vietnamese iced coffee',          N'Traditional drip coffee'),
    (N'Nước ép cam',              N'Fresh orange juice',              N'Freshly squeezed, low sugar'),
    (N'Bia lon',                   N'Canned beer',                     N'330ml can, served cold'),
    -- Món website starters
    (N'Salad hạt thông sốt chanh leo', N'Pine nut salad with passion fruit dressing', N'Micro greens, toasted pine nuts, passion fruit vinaigrette'),
    (N'Tôm chiên giòn sốt me',        N'Crispy fried prawns with tamarind sauce',    N'Fresh prawns, deep-fried, sweet & sour tamarind'),
    (N'Bánh mì nướng bơ tỏi',         N'Garlic butter toast',                        N'Crispy, served with cheese sauce'),
    (N'Nghêu hấp sả ớt',              N'Steamed clams with lemongrass & chili',      N'Fresh clams steamed with lemongrass, chili & kaffir lime'),
    -- Món website drinks
    (N'Rượu vang đỏ tuyển chọn',      N'Selected red wine',                          N'Imported red wine, smooth finish'),
    (N'Sinh tố bơ dừa',               N'Avocado coconut smoothie',                   N'Creamy avocado blended with coconut milk'),
    (N'Trà vải hoa hồng',             N'Lychee rose tea',                             N'Refreshing tea with lychee and rose petals'),
    (N'Soda chanh bạc hà',            N'Mint lemonade soda',                          N'Fresh lemon, mint and sparkling soda'),
    -- Món website desserts
    (N'Bánh su kem vani',              N'Vanilla cream puff',                         N'Crispy shell, fragrant vanilla cream filling'),
    (N'Panna cotta dâu',              N'Strawberry panna cotta',                     N'Silky milk cream, topped with fresh strawberry sauce'),
    (N'Chè khúc bạch',                N'Khúc bạch dessert',                          N'Chilled almond jelly, longan and basil seeds'),
    (N'Bánh chuối nướng',             N'Baked banana cake',                           N'Banana baked in coconut milk, served with ice cream'),
    -- Món website mains
    (N'Sườn cừu nướng thảo mộc',      N'Herb-roasted lamb chops',                    N'Slow-roasted lamb chops with herbs'),
    (N'Bò thượng hạng áp chảo',       N'Premium pan-seared beef',                    N'Tender beef, black pepper sauce and mashed potato'),
    (N'Vịt quay sốt cam',             N'Roast duck with orange sauce',               N'Crispy skin duck, sweet & sour orange glaze'),
    (N'Mì Ý hải sản',                 N'Seafood spaghetti',                           N'Spaghetti, shrimp, squid and tomato sauce'),
    -- Món website lunch
    (N'Cá hồi sốt chanh dây',         N'Salmon with passion fruit sauce',            N'Pan-seared salmon, tangy passion fruit sauce'),
    (N'Lẩu gà lá é',                  N'Chicken hotpot with basil',                  N'Free-range chicken, fragrant basil broth, serves a group'),
    (N'Bò nướng lá lốt',              N'Grilled beef in betel leaf',                 N'Charcoal-grilled beef wrapped in betel leaf, fish sauce dip'),
    (N'Gỏi ngó sen tôm thịt',         N'Lotus stem salad with shrimp & pork',       N'Crunchy lotus stem, shrimp, pork and herbs'),
    (N'Cháo hải sản nóng',            N'Hot seafood congee',                          N'Silky congee with shrimp, squid and clams'),
    (N'Đậu hũ sốt nấm',              N'Tofu with mushroom sauce',                   N'Crispy fried tofu, shiitake mushroom sauce'),
    -- Món website dinner
    (N'Tôm nướng bơ tỏi',             N'Garlic butter grilled prawns',               N'Fresh prawns grilled with garlic butter'),
    (N'Sườn heo nướng sốt BBQ',       N'BBQ pork ribs',                              N'Slow-grilled ribs, smoky BBQ glaze'),
    (N'Cá nướng giấy bạc',            N'Foil-baked fish',                             N'Fresh fish baked in foil with herbs and lemongrass'),
    (N'Rau củ nướng thảo mộc',        N'Herb-roasted seasonal vegetables',           N'Seasonal vegetables roasted with herbs'),
    (N'Khoai tây nghiền bơ',          N'Buttery mashed potatoes',                    N'Smooth mashed potatoes with butter and scallions'),
    (N'Canh bí đỏ kem tươi',          N'Creamy pumpkin soup',                        N'Pureed pumpkin, fresh cream and cashew nuts')
) v(vi_name, en_name, en_desc)
JOIN dbo.menu_items m ON m.name = v.vi_name
WHERE NOT EXISTS (SELECT 1 FROM dbo.menu_item_translations t WHERE t.menu_item_id = m.id AND t.lang_code = 'en');
GO
