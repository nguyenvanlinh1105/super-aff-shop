-- CreateTable
CREATE TABLE "deal_posts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "original_price" DECIMAL,
    "sale_price" DECIMAL,
    "discount_percent" INTEGER,
    "tags" TEXT,
    "platform_code" TEXT NOT NULL DEFAULT 'SHOPEE',
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

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_commission_rules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "customer_rate" DECIMAL NOT NULL,
    "system_rate" DECIMAL NOT NULL,
    "referral_rate" DECIMAL NOT NULL DEFAULT 0.05,
    "max_referral_orders" INTEGER NOT NULL DEFAULT 5,
    "referral_validity_months" INTEGER NOT NULL DEFAULT 6,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "starts_at" DATETIME,
    "ends_at" DATETIME,
    "created_by_user_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "commission_rules_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_commission_rules" ("active", "created_at", "created_by_user_id", "customer_rate", "ends_at", "id", "name", "starts_at", "system_rate") SELECT "active", "created_at", "created_by_user_id", "customer_rate", "ends_at", "id", "name", "starts_at", "system_rate" FROM "commission_rules";
DROP TABLE "commission_rules";
ALTER TABLE "new_commission_rules" RENAME TO "commission_rules";
CREATE TABLE "new_customers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customer_code" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT,
    "zalo_user_id" TEXT,
    "zalo_display_name" TEXT,
    "telegram_user_id" TEXT,
    "telegram_username" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "note" TEXT,
    "bank_name" TEXT,
    "bank_account_number" TEXT,
    "bank_account_name" TEXT,
    "momo_number" TEXT,
    "momo_name" TEXT,
    "referred_by_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "customers_referred_by_id_fkey" FOREIGN KEY ("referred_by_id") REFERENCES "customers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_customers" ("bank_account_name", "bank_account_number", "bank_name", "created_at", "customer_code", "full_name", "id", "momo_name", "momo_number", "note", "phone", "status", "telegram_user_id", "telegram_username", "updated_at", "zalo_display_name", "zalo_user_id") SELECT "bank_account_name", "bank_account_number", "bank_name", "created_at", "customer_code", "full_name", "id", "momo_name", "momo_number", "note", "phone", "status", "telegram_user_id", "telegram_username", "updated_at", "zalo_display_name", "zalo_user_id" FROM "customers";
DROP TABLE "customers";
ALTER TABLE "new_customers" RENAME TO "customers";
CREATE UNIQUE INDEX "customers_customer_code_key" ON "customers"("customer_code");
CREATE INDEX "customers_phone_idx" ON "customers"("phone");
CREATE INDEX "customers_zalo_user_id_idx" ON "customers"("zalo_user_id");
CREATE INDEX "customers_telegram_user_id_idx" ON "customers"("telegram_user_id");
CREATE INDEX "customers_referred_by_id_idx" ON "customers"("referred_by_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "deal_posts_short_code_key" ON "deal_posts"("short_code");

-- CreateIndex
CREATE INDEX "deal_posts_status_idx" ON "deal_posts"("status");

-- CreateIndex
CREATE INDEX "deal_posts_created_at_idx" ON "deal_posts"("created_at");

