-- AlterTable
ALTER TABLE "customers" ADD COLUMN "telegram_user_id" TEXT;
ALTER TABLE "customers" ADD COLUMN "telegram_username" TEXT;

-- CreateTable
CREATE TABLE "telegram_link_codes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "expires_at" DATETIME NOT NULL,
    "used_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "telegram_link_codes_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "telegram_accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bot_name" TEXT NOT NULL,
    "bot_username" TEXT,
    "bot_token_hint" TEXT,
    "webhook_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'inactive',
    "metadata" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "telegram_message_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "telegram_account_id" TEXT,
    "customer_id" TEXT,
    "direction" TEXT NOT NULL,
    "external_message_id" TEXT,
    "sender_id" TEXT,
    "receiver_id" TEXT,
    "message_type" TEXT,
    "message_text" TEXT,
    "payload" TEXT,
    "processing_status" TEXT NOT NULL DEFAULT 'received',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "telegram_message_logs_telegram_account_id_fkey" FOREIGN KEY ("telegram_account_id") REFERENCES "telegram_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "telegram_message_logs_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_tracking_links" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customer_id" TEXT NOT NULL,
    "platform_id" TEXT NOT NULL,
    "affiliate_channel_id" TEXT,
    "channel_source" TEXT NOT NULL,
    "tracking_code" TEXT NOT NULL,
    "original_url" TEXT NOT NULL,
    "normalized_url" TEXT,
    "affiliate_url" TEXT NOT NULL,
    "sub_id1" TEXT,
    "sub_id2" TEXT,
    "sub_id3" TEXT,
    "sub_id4" TEXT,
    "sub_id5" TEXT,
    "short_code" TEXT,
    "short_url" TEXT,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "last_clicked_at" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_by_user_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tracking_links_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tracking_links_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "platforms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tracking_links_affiliate_channel_id_fkey" FOREIGN KEY ("affiliate_channel_id") REFERENCES "affiliate_channels" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "tracking_links_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_tracking_links" ("affiliate_channel_id", "affiliate_url", "channel_source", "created_at", "created_by_user_id", "customer_id", "id", "normalized_url", "original_url", "platform_id", "short_url", "status", "sub_id1", "sub_id2", "sub_id3", "sub_id4", "sub_id5", "tracking_code", "updated_at") SELECT "affiliate_channel_id", "affiliate_url", "channel_source", "created_at", "created_by_user_id", "customer_id", "id", "normalized_url", "original_url", "platform_id", "short_url", "status", "sub_id1", "sub_id2", "sub_id3", "sub_id4", "sub_id5", "tracking_code", "updated_at" FROM "tracking_links";
DROP TABLE "tracking_links";
ALTER TABLE "new_tracking_links" RENAME TO "tracking_links";
CREATE UNIQUE INDEX "tracking_links_tracking_code_key" ON "tracking_links"("tracking_code");
CREATE UNIQUE INDEX "tracking_links_short_code_key" ON "tracking_links"("short_code");
CREATE INDEX "tracking_links_customer_id_idx" ON "tracking_links"("customer_id");
CREATE INDEX "tracking_links_platform_id_idx" ON "tracking_links"("platform_id");
CREATE INDEX "tracking_links_channel_source_idx" ON "tracking_links"("channel_source");
CREATE INDEX "tracking_links_created_at_idx" ON "tracking_links"("created_at");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "telegram_link_codes_code_key" ON "telegram_link_codes"("code");

-- CreateIndex
CREATE INDEX "telegram_link_codes_customer_id_idx" ON "telegram_link_codes"("customer_id");

-- CreateIndex
CREATE INDEX "telegram_message_logs_customer_id_idx" ON "telegram_message_logs"("customer_id");

-- CreateIndex
CREATE INDEX "telegram_message_logs_direction_idx" ON "telegram_message_logs"("direction");

-- CreateIndex
CREATE INDEX "telegram_message_logs_created_at_idx" ON "telegram_message_logs"("created_at");

-- CreateIndex
CREATE INDEX "customers_telegram_user_id_idx" ON "customers"("telegram_user_id");
