/*
  Warnings:

  - You are about to drop the column `enable_order_book` on the `polymarket_event` table. All the data in the column will be lost.
  - You are about to drop the column `liquidity` on the `polymarket_event` table. All the data in the column will be lost.
  - You are about to drop the column `restricted` on the `polymarket_event` table. All the data in the column will be lost.
  - You are about to drop the column `volume` on the `polymarket_event` table. All the data in the column will be lost.
  - You are about to drop the column `volume_1mo` on the `polymarket_event` table. All the data in the column will be lost.
  - You are about to drop the column `volume_1wk` on the `polymarket_event` table. All the data in the column will be lost.
  - You are about to drop the column `volume_24hr` on the `polymarket_event` table. All the data in the column will be lost.
  - You are about to drop the column `price_change_1mo` on the `polymarket_outcome` table. All the data in the column will be lost.
  - You are about to drop the column `price_change_1wk` on the `polymarket_outcome` table. All the data in the column will be lost.
  - You are about to drop the column `price_change_24hr` on the `polymarket_outcome` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "polymarket_event" DROP COLUMN "enable_order_book",
DROP COLUMN "liquidity",
DROP COLUMN "restricted",
DROP COLUMN "volume",
DROP COLUMN "volume_1mo",
DROP COLUMN "volume_1wk",
DROP COLUMN "volume_24hr",
ADD COLUMN     "total_volume" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "polymarket_outcome" DROP COLUMN "price_change_1mo",
DROP COLUMN "price_change_1wk",
DROP COLUMN "price_change_24hr";
