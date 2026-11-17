USE RestaurantDB;
GO
-- Migration 004: Translation tables for gallery_images, gallery_categories, events
-- Idempotent: safe to run multiple times

IF OBJECT_ID('dbo.gallery_image_translations', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.gallery_image_translations (
        image_id    INT           NOT NULL,
        lang_code   VARCHAR(5)    NOT NULL,
        title       NVARCHAR(150) NOT NULL,
        updated_at  DATETIME2     NOT NULL CONSTRAINT df_git_updated DEFAULT SYSDATETIME(),
        CONSTRAINT pk_gallery_image_translations PRIMARY KEY (image_id, lang_code),
        CONSTRAINT fk_git_image FOREIGN KEY (image_id) REFERENCES dbo.gallery_images(id),
        CONSTRAINT ck_git_lang CHECK (lang_code <> 'vi')
    );
END;
GO
IF OBJECT_ID('dbo.gallery_category_translations', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.gallery_category_translations (
        category_id INT           NOT NULL,
        lang_code   VARCHAR(5)    NOT NULL,
        name        NVARCHAR(100) NOT NULL,
        updated_at  DATETIME2     NOT NULL CONSTRAINT df_gct_updated DEFAULT SYSDATETIME(),
        CONSTRAINT pk_gallery_category_translations PRIMARY KEY (category_id, lang_code),
        CONSTRAINT fk_gct_category FOREIGN KEY (category_id) REFERENCES dbo.gallery_categories(id),
        CONSTRAINT ck_gct_lang CHECK (lang_code <> 'vi')
    );
END;
GO
IF OBJECT_ID('dbo.event_translations', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.event_translations (
        event_id    INT           NOT NULL,
        lang_code   VARCHAR(5)    NOT NULL,
        title       NVARCHAR(200) NOT NULL,
        description NVARCHAR(500) NULL,
        updated_at  DATETIME2     NOT NULL CONSTRAINT df_et_updated DEFAULT SYSDATETIME(),
        CONSTRAINT pk_event_translations PRIMARY KEY (event_id, lang_code),
        CONSTRAINT fk_et_event FOREIGN KEY (event_id) REFERENCES dbo.events(id),
        CONSTRAINT ck_et_lang CHECK (lang_code <> 'vi')
    );
END;
GO
