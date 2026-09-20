-- AlterTable
ALTER TABLE "orders" ADD COLUMN "referral_source_customer_id" TEXT;

-- CreateIndex
CREATE INDEX "orders_referral_source_customer_id_idx" ON "orders"("referral_source_customer_id");
