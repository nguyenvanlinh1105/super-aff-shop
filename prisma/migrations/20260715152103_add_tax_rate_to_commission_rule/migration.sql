-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_commission_rules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "tax_rate" DECIMAL NOT NULL DEFAULT 10.98,
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
INSERT INTO "new_commission_rules" ("active", "created_at", "created_by_user_id", "customer_rate", "ends_at", "id", "max_referral_orders", "name", "referral_rate", "referral_validity_months", "starts_at", "system_rate") SELECT "active", "created_at", "created_by_user_id", "customer_rate", "ends_at", "id", "max_referral_orders", "name", "referral_rate", "referral_validity_months", "starts_at", "system_rate" FROM "commission_rules";
DROP TABLE "commission_rules";
ALTER TABLE "new_commission_rules" RENAME TO "commission_rules";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
