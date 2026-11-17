USE RestaurantDB;
GO
-- Migration 002: Translation table for site_settings
-- Idempotent: safe to run multiple times

IF OBJECT_ID('dbo.site_setting_translations', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.site_setting_translations (
        setting_key VARCHAR(100)   NOT NULL,
        lang_code   VARCHAR(5)     NOT NULL,
        setting_value NVARCHAR(2000) NOT NULL,
        updated_at  DATETIME2      NOT NULL CONSTRAINT df_sst_updated DEFAULT SYSDATETIME(),
        CONSTRAINT pk_site_setting_translations PRIMARY KEY (setting_key, lang_code),
        CONSTRAINT fk_sst_setting FOREIGN KEY (setting_key) REFERENCES dbo.site_settings(setting_key),
        CONSTRAINT ck_sst_lang CHECK (lang_code <> 'vi')
    );
END;
GO
