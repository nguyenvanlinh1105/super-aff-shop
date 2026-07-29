-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_deal_posts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "original_price" DECIMAL,
    "sale_price" DECIMAL,
    "discount_percent" INTEGER,
    "tags" TEXT,
    "platform_code" TEXT NOT NULL DEFAULT 'SHOPEE',
    "category" TEXT,
    "expires_at" DATETIME,
    "link_type" TEXT NOT NULL DEFAULT 'product',
    "raw_input_link" TEXT NOT NULL,
    "clean_link" TEXT NOT NULL,
    "affiliate_url" TEXT NOT NULL,
    "short_code" TEXT,
    "short_url" TEXT,
    "uploaded_image_url" TEXT,
    "shopee_image_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "created_by_user_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_deal_posts" ("affiliate_url", "category", "clean_link", "clicks", "created_at", "created_by_user_id", "description", "discount_percent", "expires_at", "id", "original_price", "platform_code", "raw_input_link", "sale_price", "shopee_image_url", "short_code", "short_url", "status", "tags", "title", "updated_at", "uploaded_image_url") SELECT "affiliate_url", "category", "clean_link", "clicks", "created_at", "created_by_user_id", "description", "discount_percent", "expires_at", "id", "original_price", "platform_code", "raw_input_link", "sale_price", "shopee_image_url", "short_code", "short_url", "status", "tags", "title", "updated_at", "uploaded_image_url" FROM "deal_posts";
DROP TABLE "deal_posts";
ALTER TABLE "new_deal_posts" RENAME TO "deal_posts";
CREATE UNIQUE INDEX "deal_posts_short_code_key" ON "deal_posts"("short_code");
CREATE INDEX "deal_posts_status_idx" ON "deal_posts"("status");
CREATE INDEX "deal_posts_created_at_idx" ON "deal_posts"("created_at");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
