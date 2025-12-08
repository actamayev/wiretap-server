/*
  Warnings:

  - You are about to drop the column `best_ask` on the `polymarket_market` table. All the data in the column will be lost.
  - You are about to drop the column `best_bid` on the `polymarket_market` table. All the data in the column will be lost.
  - You are about to drop the column `enable_order_book` on the `polymarket_market` table. All the data in the column will be lost.
  - You are about to drop the column `liquidity` on the `polymarket_market` table. All the data in the column will be lost.
  - You are about to drop the column `order_min_size` on the `polymarket_market` table. All the data in the column will be lost.
  - You are about to drop the column `order_min_tick_size` on the `polymarket_market` table. All the data in the column will be lost.
  - You are about to drop the column `restricted` on the `polymarket_market` table. All the data in the column will be lost.
  - You are about to drop the column `spread` on the `polymarket_market` table. All the data in the column will be lost.
  - You are about to drop the column `volume_1mo` on the `polymarket_market` table. All the data in the column will be lost.
  - You are about to drop the column `volume_1wk` on the `polymarket_market` table. All the data in the column will be lost.
  - You are about to drop the column `volume_24hr` on the `polymarket_market` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "polymarket_market" DROP COLUMN "best_ask",
DROP COLUMN "best_bid",
DROP COLUMN "enable_order_book",
DROP COLUMN "liquidity",
DROP COLUMN "order_min_size",
DROP COLUMN "order_min_tick_size",
DROP COLUMN "restricted",
DROP COLUMN "spread",
DROP COLUMN "volume_1mo",
DROP COLUMN "volume_1wk",
DROP COLUMN "volume_24hr",
ADD COLUMN     "volume_total" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "portfolio_snapshot" (
    "snapshot_id" SERIAL NOT NULL,
    "wiretap_fund_uuid" TEXT NOT NULL,
    "total_value" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portfolio_snapshot_pkey" PRIMARY KEY ("snapshot_id")
);

-- CreateIndex
CREATE INDEX "portfolio_snapshot_wiretap_fund_uuid_idx" ON "portfolio_snapshot"("wiretap_fund_uuid");

-- CreateIndex
CREATE INDEX "portfolio_snapshot_timestamp_idx" ON "portfolio_snapshot"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "portfolio_snapshot_wiretap_fund_uuid_timestamp_key" ON "portfolio_snapshot"("wiretap_fund_uuid", "timestamp");

-- AddForeignKey
ALTER TABLE "portfolio_snapshot" ADD CONSTRAINT "portfolio_snapshot_wiretap_fund_uuid_fkey" FOREIGN KEY ("wiretap_fund_uuid") REFERENCES "wiretap_fund"("wiretap_fund_uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
