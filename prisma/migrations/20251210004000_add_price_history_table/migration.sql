/*
  Warnings:

  - You are about to drop the column `market_best_ask` on the `purchase_order` table. All the data in the column will be lost.
  - You are about to drop the column `market_best_bid` on the `purchase_order` table. All the data in the column will be lost.
  - You are about to drop the column `market_best_ask` on the `sale_order` table. All the data in the column will be lost.
  - You are about to drop the column `market_best_bid` on the `sale_order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "purchase_order" DROP COLUMN "market_best_ask",
DROP COLUMN "market_best_bid";

-- AlterTable
ALTER TABLE "sale_order" DROP COLUMN "market_best_ask",
DROP COLUMN "market_best_bid";

-- CreateTable
CREATE TABLE "polymarket_price_history" (
    "price_history_id" SERIAL NOT NULL,
    "clob_token_id" TEXT NOT NULL,
    "best_bid" DOUBLE PRECISION,
    "best_ask" DOUBLE PRECISION,
    "midpoint" DOUBLE PRECISION,
    "last_trade_price" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "polymarket_price_history_pkey" PRIMARY KEY ("price_history_id")
);

-- CreateIndex
CREATE INDEX "polymarket_price_history_clob_token_id_idx" ON "polymarket_price_history"("clob_token_id");

-- CreateIndex
CREATE INDEX "polymarket_price_history_timestamp_idx" ON "polymarket_price_history"("timestamp");

-- CreateIndex
CREATE INDEX "polymarket_price_history_clob_token_id_timestamp_idx" ON "polymarket_price_history"("clob_token_id", "timestamp");

-- AddForeignKey
ALTER TABLE "polymarket_price_history" ADD CONSTRAINT "polymarket_price_history_clob_token_id_fkey" FOREIGN KEY ("clob_token_id") REFERENCES "polymarket_outcome"("clob_token_id") ON DELETE CASCADE ON UPDATE CASCADE;
