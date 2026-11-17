USE RestaurantDB;
GO
-- Migration 003: Translation tables for blog_categories and blog_posts
-- Idempotent: safe to run multiple times

IF OBJECT_ID('dbo.blog_category_translations', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.blog_category_translations (
        category_id INT           NOT NULL,
        lang_code   VARCHAR(5)    NOT NULL,
        name        NVARCHAR(100) NOT NULL,
        updated_at  DATETIME2     NOT NULL CONSTRAINT df_bct_updated DEFAULT SYSDATETIME(),
        CONSTRAINT pk_blog_category_translations PRIMARY KEY (category_id, lang_code),
        CONSTRAINT fk_bct_category FOREIGN KEY (category_id) REFERENCES dbo.blog_categories(id),
        CONSTRAINT ck_bct_lang CHECK (lang_code <> 'vi')
    );
END;
GO
IF OBJECT_ID('dbo.blog_post_translations', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.blog_post_translations (
        post_id     INT            NOT NULL,
        lang_code   VARCHAR(5)     NOT NULL,
        title       NVARCHAR(200)  NOT NULL,
        excerpt     NVARCHAR(500)  NULL,
        content     NVARCHAR(MAX)  NULL,
        tags        NVARCHAR(200)  NULL,
        updated_at  DATETIME2      NOT NULL CONSTRAINT df_bpt_updated DEFAULT SYSDATETIME(),
        CONSTRAINT pk_blog_post_translations PRIMARY KEY (post_id, lang_code),
        CONSTRAINT fk_bpt_post FOREIGN KEY (post_id) REFERENCES dbo.blog_posts(id),
        CONSTRAINT ck_bpt_lang CHECK (lang_code <> 'vi')
    );
END;
GO
