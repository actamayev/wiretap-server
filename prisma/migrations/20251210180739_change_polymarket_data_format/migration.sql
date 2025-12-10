/*
  Warnings:

  - You are about to drop the column `last_trade_price` on the `polymarket_market` table. All the data in the column will be lost.
  - You are about to drop the column `current_price` on the `polymarket_outcome` table. All the data in the column will be lost.
  - You are about to drop the column `payout_per_share` on the `polymarket_outcome` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "email_update_subscriber" ADD COLUMN     "ip_address" TEXT;

-- AlterTable
ALTER TABLE "polymarket_market" DROP COLUMN "last_trade_price";

-- AlterTable
ALTER TABLE "polymarket_outcome" DROP COLUMN "current_price",
DROP COLUMN "payout_per_share",
ADD COLUMN     "best_ask" DOUBLE PRECISION,
ADD COLUMN     "best_bid" DOUBLE PRECISION,
ADD COLUMN     "last_trade_price" DOUBLE PRECISION,
ADD COLUMN     "spread" DOUBLE PRECISION;
