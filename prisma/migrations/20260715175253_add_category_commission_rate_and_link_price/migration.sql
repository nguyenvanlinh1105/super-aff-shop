-- AlterTable
ALTER TABLE "tracking_links" ADD COLUMN "estimated_cashback" DECIMAL;
ALTER TABLE "tracking_links" ADD COLUMN "product_price" DECIMAL;
ALTER TABLE "tracking_links" ADD COLUMN "product_sold" INTEGER;

-- CreateTable
CREATE TABLE "category_commission_rates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "keywords" TEXT NOT NULL,
    "rate" DECIMAL NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
