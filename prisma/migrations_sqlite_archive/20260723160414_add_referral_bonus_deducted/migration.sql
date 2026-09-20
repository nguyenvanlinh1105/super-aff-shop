-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "platform_id" TEXT NOT NULL,
    "customer_id" TEXT,
    "tracking_link_id" TEXT,
    "import_batch_id" TEXT,
    "order_external_id" TEXT NOT NULL,
    "checkout_id" TEXT,
    "tracking_code" TEXT,
    "channel" TEXT,
    "ordered_at" DATETIME,
    "completed_at" DATETIME,
    "clicked_at" DATETIME,
    "shop_name" TEXT,
    "shop_id" TEXT,
    "item_id" TEXT,
    "item_name" TEXT,
    "order_amount" DECIMAL,
    "gross_commission_amount" DECIMAL,
    "net_commission_amount" DECIMAL,
    "commission_amount" DECIMAL NOT NULL DEFAULT 0,
    "customer_reward_amount" DECIMAL NOT NULL DEFAULT 0,
    "system_profit_amount" DECIMAL NOT NULL DEFAULT 0,
    "order_status" TEXT NOT NULL DEFAULT 'pending',
    "product_affiliate_status" TEXT,
    "sub_id1" TEXT,
    "sub_id2" TEXT,
    "sub_id3" TEXT,
    "sub_id4" TEXT,
    "sub_id5" TEXT,
    "payout_status" TEXT NOT NULL DEFAULT 'unpaid',
    "source_type" TEXT NOT NULL DEFAULT 'import',
    "referral_source_customer_id" TEXT,
    "referral_bonus_deducted" DECIMAL NOT NULL DEFAULT 0,
    "raw_data" TEXT,
    "approved_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "orders_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "platforms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "orders_tracking_link_id_fkey" FOREIGN KEY ("tracking_link_id") REFERENCES "tracking_links" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "orders_import_batch_id_fkey" FOREIGN KEY ("import_batch_id") REFERENCES "import_batches" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_orders" ("approved_at", "channel", "checkout_id", "clicked_at", "commission_amount", "completed_at", "created_at", "customer_id", "customer_reward_amount", "gross_commission_amount", "id", "import_batch_id", "item_id", "item_name", "net_commission_amount", "order_amount", "order_external_id", "order_status", "ordered_at", "payout_status", "platform_id", "product_affiliate_status", "raw_data", "referral_source_customer_id", "shop_id", "shop_name", "source_type", "sub_id1", "sub_id2", "sub_id3", "sub_id4", "sub_id5", "system_profit_amount", "tracking_code", "tracking_link_id", "updated_at") SELECT "approved_at", "channel", "checkout_id", "clicked_at", "commission_amount", "completed_at", "created_at", "customer_id", "customer_reward_amount", "gross_commission_amount", "id", "import_batch_id", "item_id", "item_name", "net_commission_amount", "order_amount", "order_external_id", "order_status", "ordered_at", "payout_status", "platform_id", "product_affiliate_status", "raw_data", "referral_source_customer_id", "shop_id", "shop_name", "source_type", "sub_id1", "sub_id2", "sub_id3", "sub_id4", "sub_id5", "system_profit_amount", "tracking_code", "tracking_link_id", "updated_at" FROM "orders";
DROP TABLE "orders";
ALTER TABLE "new_orders" RENAME TO "orders";
CREATE INDEX "orders_customer_id_idx" ON "orders"("customer_id");
CREATE INDEX "orders_tracking_code_idx" ON "orders"("tracking_code");
CREATE INDEX "orders_order_status_idx" ON "orders"("order_status");
CREATE INDEX "orders_payout_status_idx" ON "orders"("payout_status");
CREATE INDEX "orders_referral_source_customer_id_idx" ON "orders"("referral_source_customer_id");
CREATE UNIQUE INDEX "orders_platform_id_order_external_id_key" ON "orders"("platform_id", "order_external_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
