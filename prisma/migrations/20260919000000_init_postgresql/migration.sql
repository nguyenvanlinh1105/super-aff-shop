-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "customer_id" TEXT,
    "mfa_enabled" BOOLEAN NOT NULL DEFAULT false,
    "mfa_secret" TEXT,
    "mfa_method" TEXT DEFAULT 'totp',
    "mfa_backup_codes" TEXT,
    "mfa_reset_token" TEXT,
    "mfa_reset_expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "customer_code" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
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
    "telegram_flow_step" TEXT,
    "telegram_flow_data" TEXT,
    "payment_pin" TEXT,
    "pin_failed_attempts" INTEGER NOT NULL DEFAULT 0,
    "pin_lock_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "withdraw_requests" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "withdraw_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telegram_link_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "telegram_link_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platforms" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platforms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliate_channels" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "platform_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "metadata" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "affiliate_channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracking_links" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "platform_id" TEXT NOT NULL,
    "affiliate_channel_id" TEXT,
    "channel_source" TEXT NOT NULL,
    "tracking_code" TEXT NOT NULL,
    "original_url" TEXT NOT NULL,
    "normalized_url" TEXT,
    "affiliate_url" TEXT NOT NULL,
    "product_title" TEXT,
    "product_image" TEXT,
    "product_price" DECIMAL(65,30),
    "product_sold" INTEGER,
    "estimated_cashback" DECIMAL(65,30),
    "sub_id1" TEXT,
    "sub_id2" TEXT,
    "sub_id3" TEXT,
    "sub_id4" TEXT,
    "sub_id5" TEXT,
    "short_code" TEXT,
    "short_url" TEXT,
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "last_clicked_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tracking_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vouchers" (
    "id" TEXT NOT NULL,
    "platform_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "voucher_code" TEXT,
    "voucher_url" TEXT,
    "product_image" TEXT,
    "benefit_text" TEXT,
    "conditions_text" TEXT,
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'draft',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "metadata" TEXT,
    "created_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "link_voucher_matches" (
    "id" TEXT NOT NULL,
    "tracking_link_id" TEXT NOT NULL,
    "voucher_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "link_voucher_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_batches" (
    "id" TEXT NOT NULL,
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
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "import_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_batch_rows" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "row_number" INTEGER NOT NULL,
    "order_external_id" TEXT,
    "checkout_id" TEXT,
    "tracking_code" TEXT,
    "channel" TEXT,
    "ordered_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "clicked_at" TIMESTAMP(3),
    "shop_name" TEXT,
    "shop_id" TEXT,
    "item_id" TEXT,
    "item_name" TEXT,
    "commission_amount" DECIMAL(65,30),
    "gross_commission_amount" DECIMAL(65,30),
    "net_commission_amount" DECIMAL(65,30),
    "order_amount" DECIMAL(65,30),
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
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "import_batch_rows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "platform_id" TEXT NOT NULL,
    "customer_id" TEXT,
    "tracking_link_id" TEXT,
    "import_batch_id" TEXT,
    "order_external_id" TEXT NOT NULL,
    "checkout_id" TEXT,
    "tracking_code" TEXT,
    "channel" TEXT,
    "ordered_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "clicked_at" TIMESTAMP(3),
    "shop_name" TEXT,
    "shop_id" TEXT,
    "item_id" TEXT,
    "item_name" TEXT,
    "order_amount" DECIMAL(65,30),
    "gross_commission_amount" DECIMAL(65,30),
    "net_commission_amount" DECIMAL(65,30),
    "commission_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "customer_reward_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "system_profit_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
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
    "referral_bonus_deducted" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "raw_data" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commission_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tax_rate" DECIMAL(65,30) NOT NULL DEFAULT 10.98,
    "customer_rate" DECIMAL(65,30) NOT NULL,
    "system_rate" DECIMAL(65,30) NOT NULL,
    "referral_rate" DECIMAL(65,30) NOT NULL DEFAULT 0.05,
    "max_referral_orders" INTEGER NOT NULL DEFAULT 5,
    "referral_validity_months" INTEGER NOT NULL DEFAULT 6,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "created_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commission_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_commission_rates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keywords" TEXT NOT NULL,
    "rate" DECIMAL(65,30) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "category_commission_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_batches" (
    "id" TEXT NOT NULL,
    "payment_code" TEXT NOT NULL,
    "period_label" TEXT,
    "customer_id" TEXT NOT NULL,
    "total_amount" DECIMAL(65,30) NOT NULL,
    "transfer_reference" TEXT,
    "transfer_note" TEXT,
    "bill_storage_key" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paid_by_user_id" TEXT,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_batch_items" (
    "id" TEXT NOT NULL,
    "payment_batch_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_batch_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zalo_accounts" (
    "id" TEXT NOT NULL,
    "oa_name" TEXT NOT NULL,
    "oa_id" TEXT,
    "app_id" TEXT,
    "webhook_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'inactive',
    "metadata" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "zalo_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zalo_message_logs" (
    "id" TEXT NOT NULL,
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
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "zalo_message_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telegram_accounts" (
    "id" TEXT NOT NULL,
    "bot_name" TEXT NOT NULL,
    "bot_username" TEXT,
    "bot_token_hint" TEXT,
    "webhook_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'inactive',
    "metadata" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "telegram_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telegram_message_logs" (
    "id" TEXT NOT NULL,
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
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "telegram_message_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telegram_bot_commands" (
    "id" TEXT NOT NULL,
    "command" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reply_text" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "telegram_bot_commands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actor_user_id" TEXT,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "before_data" TEXT,
    "after_data" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deal_posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "original_price" DECIMAL(65,30),
    "sale_price" DECIMAL(65,30),
    "discount_percent" INTEGER,
    "tags" TEXT,
    "platform_code" TEXT NOT NULL DEFAULT 'SHOPEE',
    "category" TEXT,
    "expires_at" TIMESTAMP(3),
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
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deal_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
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
CREATE INDEX "customers_telegram_user_id_idx" ON "customers"("telegram_user_id");

-- CreateIndex
CREATE INDEX "customers_referred_by_id_idx" ON "customers"("referred_by_id");

-- CreateIndex
CREATE INDEX "withdraw_requests_customer_id_idx" ON "withdraw_requests"("customer_id");

-- CreateIndex
CREATE INDEX "withdraw_requests_status_idx" ON "withdraw_requests"("status");

-- CreateIndex
CREATE UNIQUE INDEX "telegram_link_codes_code_key" ON "telegram_link_codes"("code");

-- CreateIndex
CREATE INDEX "telegram_link_codes_customer_id_idx" ON "telegram_link_codes"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "platforms_code_key" ON "platforms"("code");

-- CreateIndex
CREATE UNIQUE INDEX "affiliate_channels_code_key" ON "affiliate_channels"("code");

-- CreateIndex
CREATE UNIQUE INDEX "tracking_links_tracking_code_key" ON "tracking_links"("tracking_code");

-- CreateIndex
CREATE UNIQUE INDEX "tracking_links_short_code_key" ON "tracking_links"("short_code");

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
CREATE INDEX "orders_referral_source_customer_id_idx" ON "orders"("referral_source_customer_id");

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
CREATE INDEX "telegram_message_logs_customer_id_idx" ON "telegram_message_logs"("customer_id");

-- CreateIndex
CREATE INDEX "telegram_message_logs_direction_idx" ON "telegram_message_logs"("direction");

-- CreateIndex
CREATE INDEX "telegram_message_logs_created_at_idx" ON "telegram_message_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "telegram_bot_commands_command_key" ON "telegram_bot_commands"("command");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateIndex
CREATE INDEX "chat_messages_created_at_idx" ON "chat_messages"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "deal_posts_short_code_key" ON "deal_posts"("short_code");

-- CreateIndex
CREATE INDEX "deal_posts_status_idx" ON "deal_posts"("status");

-- CreateIndex
CREATE INDEX "deal_posts_created_at_idx" ON "deal_posts"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_referred_by_id_fkey" FOREIGN KEY ("referred_by_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdraw_requests" ADD CONSTRAINT "withdraw_requests_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telegram_link_codes" ADD CONSTRAINT "telegram_link_codes_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_channels" ADD CONSTRAINT "affiliate_channels_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "platforms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_links" ADD CONSTRAINT "tracking_links_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_links" ADD CONSTRAINT "tracking_links_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "platforms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_links" ADD CONSTRAINT "tracking_links_affiliate_channel_id_fkey" FOREIGN KEY ("affiliate_channel_id") REFERENCES "affiliate_channels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_links" ADD CONSTRAINT "tracking_links_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "platforms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "link_voucher_matches" ADD CONSTRAINT "link_voucher_matches_tracking_link_id_fkey" FOREIGN KEY ("tracking_link_id") REFERENCES "tracking_links"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "link_voucher_matches" ADD CONSTRAINT "link_voucher_matches_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "vouchers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_batches" ADD CONSTRAINT "import_batches_imported_by_user_id_fkey" FOREIGN KEY ("imported_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_batch_rows" ADD CONSTRAINT "import_batch_rows_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "import_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "platforms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_tracking_link_id_fkey" FOREIGN KEY ("tracking_link_id") REFERENCES "tracking_links"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_import_batch_id_fkey" FOREIGN KEY ("import_batch_id") REFERENCES "import_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_rules" ADD CONSTRAINT "commission_rules_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_batches" ADD CONSTRAINT "payment_batches_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_batches" ADD CONSTRAINT "payment_batches_paid_by_user_id_fkey" FOREIGN KEY ("paid_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_batch_items" ADD CONSTRAINT "payment_batch_items_payment_batch_id_fkey" FOREIGN KEY ("payment_batch_id") REFERENCES "payment_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_batch_items" ADD CONSTRAINT "payment_batch_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zalo_message_logs" ADD CONSTRAINT "zalo_message_logs_zalo_account_id_fkey" FOREIGN KEY ("zalo_account_id") REFERENCES "zalo_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zalo_message_logs" ADD CONSTRAINT "zalo_message_logs_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telegram_message_logs" ADD CONSTRAINT "telegram_message_logs_telegram_account_id_fkey" FOREIGN KEY ("telegram_account_id") REFERENCES "telegram_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telegram_message_logs" ADD CONSTRAINT "telegram_message_logs_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

