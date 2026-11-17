USE RestaurantDB;
GO
-- Migration 001: Translation tables for menu_categories and menu_items
-- Idempotent: safe to run multiple times

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
