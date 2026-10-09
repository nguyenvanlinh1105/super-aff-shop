-- CreateTable
CREATE TABLE IF NOT EXISTS "partner_rate_periods" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "rate" DECIMAL(65,30) NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3),
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partner_rate_periods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "partner_rate_periods_customer_id_idx" ON "partner_rate_periods"("customer_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "partner_rate_periods_starts_at_ends_at_idx" ON "partner_rate_periods"("starts_at", "ends_at");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'partner_rate_periods_customer_id_fkey'
    ) THEN
        ALTER TABLE "partner_rate_periods" ADD CONSTRAINT "partner_rate_periods_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
