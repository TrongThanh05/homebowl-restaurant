-- seed/102_i18n_site_settings_en.sql — BẢN DỊCH DỰ THẢO
-- Chỉ dịch các khóa cần thiết, KHÔNG dịch: site_name, phone, email, *_url, opening_hours
USE RestaurantDB;
GO

INSERT INTO dbo.site_setting_translations (setting_key, lang_code, setting_value)
SELECT v.setting_key, 'en', v.en_value
FROM (VALUES
    ('slogan',           N'The essence of Vietnamese cuisine in a cozy setting'),
    ('opening_days',     N'Open every day'),
    ('about_title',      N'About Us'),
    ('about_content',    N'Hương Việt was born with the desire to bring meals rich in the flavors of home. Every dish is made from daily fresh ingredients and prepared by our experienced culinary team.

From cozy family dinners to weddings and corporate events, we are always ready to serve with an elegant space and meticulous attention to every detail.'),
    ('reservation_note', N'Please book at least 2 hours in advance. Groups of more than 10 guests, please contact us by phone.'),
    ('address',          N'8th Floor, 123 Le Loi Street, District 1, Ho Chi Minh City')
) v(setting_key, en_value)
WHERE EXISTS (SELECT 1 FROM dbo.site_settings s WHERE s.setting_key = v.setting_key)
  AND NOT EXISTS (SELECT 1 FROM dbo.site_setting_translations t WHERE t.setting_key = v.setting_key AND t.lang_code = 'en');
GO
