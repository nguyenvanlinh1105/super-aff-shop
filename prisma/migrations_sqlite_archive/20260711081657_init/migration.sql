-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "customer_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customer_code" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT,
    "zalo_user_id" TEXT,
    "zalo_display_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "note" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "platforms" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "affiliate_channels" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "platform_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "metadata" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "affiliate_channels_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "platforms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tracking_links" (
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
    "short_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_by_user_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tracking_links_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tracking_links_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "platforms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tracking_links_affiliate_channel_id_fkey" FOREIGN KEY ("affiliate_channel_id") REFERENCES "affiliate_channels" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "tracking_links_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "vouchers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "platform_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "voucher_code" TEXT,
    "voucher_url" TEXT,
    "benefit_text" TEXT,
    "conditions_text" TEXT,
    "starts_at" DATETIME,
    "ends_at" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "metadata" TEXT,
    "created_by_user_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "vouchers_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "platforms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "vouchers_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "link_voucher_matches" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tracking_link_id" TEXT NOT NULL,
    "voucher_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "link_voucher_matches_tracking_link_id_fkey" FOREIGN KEY ("tracking_link_id") REFERENCES "tracking_links" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "link_voucher_matches_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "vouchers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "import_batches" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source_name" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_storage_key" TEXT,
    "imported_by_user_id" TEXT,
    "total_rows" INTEGER NOT NULL DEFAULT 0,
    "success_rows" INTEGER NOT NULL DEFAULT 0,
    "duplicate_rows" INTEGER NOT NULL DEFAULT 0,
    "unmapped_rows" INTEGER NOT NULL DEFAULT 0,
    "error_rows" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'uploaded',
    "column_mapping" TEXT,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "import_batches_imported_by_user_id_fkey" FOREIGN KEY ("imported_by_user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "import_batch_rows" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "batch_id" TEXT NOT NULL,
    "row_number" INTEGER NOT NULL,
    "order_external_id" TEXT,
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
    "commission_amount" DECIMAL,
    "gross_commission_amount" DECIMAL,
    "net_commission_amount" DECIMAL,
    "order_amount" DECIMAL,
    "order_status" TEXT,
    "product_affiliate_status" TEXT,
    "sub_id1" TEXT,
    "sub_id2" TEXT,
    "sub_id3" TEXT,
    "sub_id4" TEXT,
    "sub_id5" TEXT,
    "payment_status" TEXT,
    "raw_data" TEXT NOT NULL,
    "processing_status" TEXT NOT NULL DEFAULT 'pending',
    "error_message" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "import_batch_rows_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "import_batches" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "orders" (
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
    "raw_data" TEXT,
    "approved_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "orders_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "platforms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "orders_tracking_link_id_fkey" FOREIGN KEY ("tracking_link_id") REFERENCES "tracking_links" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "orders_import_batch_id_fkey" FOREIGN KEY ("import_batch_id") REFERENCES "import_batches" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "commission_rules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "customer_rate" DECIMAL NOT NULL,
    "system_rate" DECIMAL NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "starts_at" DATETIME,
    "ends_at" DATETIME,
    "created_by_user_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "commission_rules_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payment_batches" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "payment_code" TEXT NOT NULL,
    "period_label" TEXT,
    "customer_id" TEXT NOT NULL,
    "total_amount" DECIMAL NOT NULL,
    "transfer_reference" TEXT,
    "transfer_note" TEXT,
    "bill_storage_key" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paid_by_user_id" TEXT,
    "paid_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payment_batches_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "payment_batches_paid_by_user_id_fkey" FOREIGN KEY ("paid_by_user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payment_batch_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "payment_batch_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payment_batch_items_payment_batch_id_fkey" FOREIGN KEY ("payment_batch_id") REFERENCES "payment_batches" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "payment_batch_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "zalo_accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "oa_name" TEXT NOT NULL,
    "oa_id" TEXT,
    "app_id" TEXT,
    "webhook_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'inactive',
    "metadata" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "zalo_message_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "zalo_account_id" TEXT,
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
    CONSTRAINT "zalo_message_logs_zalo_account_id_fkey" FOREIGN KEY ("zalo_account_id") REFERENCES "zalo_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "zalo_message_logs_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actor_user_id" TEXT,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "before_data" TEXT,
    "after_data" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_customer_id_key" ON "users"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "customers_customer_code_key" ON "customers"("customer_code");

-- CreateIndex
CREATE INDEX "customers_phone_idx" ON "customers"("phone");

-- CreateIndex
CREATE INDEX "customers_zalo_user_id_idx" ON "customers"("zalo_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "platforms_code_key" ON "platforms"("code");

-- CreateIndex
CREATE UNIQUE INDEX "affiliate_channels_code_key" ON "affiliate_channels"("code");

-- CreateIndex
CREATE UNIQUE INDEX "tracking_links_tracking_code_key" ON "tracking_links"("tracking_code");

-- CreateIndex
CREATE INDEX "tracking_links_customer_id_idx" ON "tracking_links"("customer_id");

-- CreateIndex
CREATE INDEX "tracking_links_platform_id_idx" ON "tracking_links"("platform_id");

-- CreateIndex
CREATE INDEX "tracking_links_channel_source_idx" ON "tracking_links"("channel_source");

-- CreateIndex
CREATE INDEX "tracking_links_created_at_idx" ON "tracking_links"("created_at");

-- CreateIndex
CREATE INDEX "vouchers_platform_id_idx" ON "vouchers"("platform_id");

-- CreateIndex
CREATE INDEX "vouchers_status_idx" ON "vouchers"("status");

-- CreateIndex
CREATE INDEX "vouchers_ends_at_idx" ON "vouchers"("ends_at");

-- CreateIndex
CREATE UNIQUE INDEX "link_voucher_matches_tracking_link_id_voucher_id_key" ON "link_voucher_matches"("tracking_link_id", "voucher_id");

-- CreateIndex
CREATE INDEX "import_batch_rows_batch_id_idx" ON "import_batch_rows"("batch_id");

-- CreateIndex
CREATE INDEX "import_batch_rows_tracking_code_idx" ON "import_batch_rows"("tracking_code");

-- CreateIndex
CREATE INDEX "orders_customer_id_idx" ON "orders"("customer_id");

-- CreateIndex
CREATE INDEX "orders_tracking_code_idx" ON "orders"("tracking_code");

-- CreateIndex
CREATE INDEX "orders_order_status_idx" ON "orders"("order_status");

-- CreateIndex
CREATE INDEX "orders_payout_status_idx" ON "orders"("payout_status");

-- CreateIndex
CREATE UNIQUE INDEX "orders_platform_id_order_external_id_key" ON "orders"("platform_id", "order_external_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_batches_payment_code_key" ON "payment_batches"("payment_code");

-- CreateIndex
CREATE INDEX "payment_batches_customer_id_idx" ON "payment_batches"("customer_id");

-- CreateIndex
CREATE INDEX "payment_batches_status_idx" ON "payment_batches"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payment_batch_items_payment_batch_id_order_id_key" ON "payment_batch_items"("payment_batch_id", "order_id");

-- CreateIndex
CREATE INDEX "zalo_message_logs_customer_id_idx" ON "zalo_message_logs"("customer_id");

-- CreateIndex
CREATE INDEX "zalo_message_logs_direction_idx" ON "zalo_message_logs"("direction");

-- CreateIndex
CREATE INDEX "zalo_message_logs_created_at_idx" ON "zalo_message_logs"("created_at");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");
