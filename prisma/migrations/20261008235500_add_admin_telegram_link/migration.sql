-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "telegram_username" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "admin_telegram_link_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_telegram_link_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "admin_telegram_link_codes_code_key" ON "admin_telegram_link_codes"("code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "admin_telegram_link_codes_user_id_idx" ON "admin_telegram_link_codes"("user_id");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'admin_telegram_link_codes_user_id_fkey'
    ) THEN
        ALTER TABLE "admin_telegram_link_codes" ADD CONSTRAINT "admin_telegram_link_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
