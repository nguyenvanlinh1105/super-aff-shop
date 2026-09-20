-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "is_partner" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "customers_referred_by_id_fkey" FOREIGN KEY ("referred_by_id") REFERENCES "customers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_customers" ("bank_account_name", "bank_account_number", "bank_name", "created_at", "customer_code", "full_name", "id", "momo_name", "momo_number", "note", "phone", "referred_by_id", "status", "telegram_user_id", "telegram_username", "updated_at", "zalo_display_name", "zalo_user_id") SELECT "bank_account_name", "bank_account_number", "bank_name", "created_at", "customer_code", "full_name", "id", "momo_name", "momo_number", "note", "phone", "referred_by_id", "status", "telegram_user_id", "telegram_username", "updated_at", "zalo_display_name", "zalo_user_id" FROM "customers";
DROP TABLE "customers";
ALTER TABLE "new_customers" RENAME TO "customers";
CREATE UNIQUE INDEX "customers_customer_code_key" ON "customers"("customer_code");
CREATE INDEX "customers_phone_idx" ON "customers"("phone");
CREATE INDEX "customers_zalo_user_id_idx" ON "customers"("zalo_user_id");
CREATE INDEX "customers_telegram_user_id_idx" ON "customers"("telegram_user_id");
CREATE INDEX "customers_referred_by_id_idx" ON "customers"("referred_by_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
