-- DropForeignKey
ALTER TABLE "affiliate_channels" DROP CONSTRAINT "affiliate_channels_platform_id_fkey";

-- DropForeignKey
ALTER TABLE "tracking_links" DROP CONSTRAINT "tracking_links_affiliate_channel_id_fkey";

-- DropForeignKey
ALTER TABLE "zalo_message_logs" DROP CONSTRAINT "zalo_message_logs_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "zalo_message_logs" DROP CONSTRAINT "zalo_message_logs_zalo_account_id_fkey";

-- AlterTable
ALTER TABLE "tracking_links" DROP COLUMN "affiliate_channel_id";

-- DropTable
DROP TABLE "affiliate_channels";

-- DropTable
DROP TABLE "zalo_accounts";

-- DropTable
DROP TABLE "zalo_message_logs";
