/*
  Warnings:

  - You are about to drop the column `best_ask` on the `polymarket_outcome` table. All the data in the column will be lost.
  - You are about to drop the column `best_bid` on the `polymarket_outcome` table. All the data in the column will be lost.
  - You are about to drop the column `last_trade_price` on the `polymarket_outcome` table. All the data in the column will be lost.
  - You are about to drop the column `spread` on the `polymarket_outcome` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "polymarket_market" ADD COLUMN     "best_ask" DOUBLE PRECISION,
ADD COLUMN     "best_bid" DOUBLE PRECISION,
ADD COLUMN     "last_trade_price" DOUBLE PRECISION,
ADD COLUMN     "spread" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "polymarket_outcome" DROP COLUMN "best_ask",
DROP COLUMN "best_bid",
DROP COLUMN "last_trade_price",
DROP COLUMN "spread";
