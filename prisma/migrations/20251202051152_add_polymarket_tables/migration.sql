/*
  Warnings:

  - You are about to drop the column `contract_uuid` on the `position` table. All the data in the column will be lost.
  - You are about to drop the column `contract_uuid` on the `purchase_order` table. All the data in the column will be lost.
  - You are about to drop the column `contract_uuid` on the `sale_order` table. All the data in the column will be lost.
  - You are about to drop the `contract` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[wiretap_brokerage_account_id,outcome_id]` on the table `position` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `average_cost_per_contract` to the `position` table without a default value. This is not possible if the table is not empty.
  - Added the required column `outcome_id` to the `position` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_cost` to the `position` table without a default value. This is not possible if the table is not empty.
  - Added the required column `outcome_id` to the `purchase_order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price_per_contract` to the `purchase_order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_cost` to the `purchase_order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `outcome_id` to the `sale_order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price_per_contract` to the `sale_order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `realized_pnl` to the `sale_order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_proceeds` to the `sale_order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "position" DROP CONSTRAINT "position_contract_uuid_fkey";

-- DropForeignKey
ALTER TABLE "purchase_order" DROP CONSTRAINT "purchase_order_contract_uuid_fkey";

-- DropForeignKey
ALTER TABLE "sale_order" DROP CONSTRAINT "sale_order_contract_uuid_fkey";

-- AlterTable
ALTER TABLE "position" DROP COLUMN "contract_uuid",
ADD COLUMN     "average_cost_per_contract" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "outcome_id" INTEGER NOT NULL,
ADD COLUMN     "total_cost" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "number_contracts_held" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "purchase_order" DROP COLUMN "contract_uuid",
ADD COLUMN     "market_best_ask" DOUBLE PRECISION,
ADD COLUMN     "market_best_bid" DOUBLE PRECISION,
ADD COLUMN     "outcome_id" INTEGER NOT NULL,
ADD COLUMN     "price_per_contract" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "total_cost" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "number_of_contracts" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "sale_order" DROP COLUMN "contract_uuid",
ADD COLUMN     "market_best_ask" DOUBLE PRECISION,
ADD COLUMN     "market_best_bid" DOUBLE PRECISION,
ADD COLUMN     "outcome_id" INTEGER NOT NULL,
ADD COLUMN     "price_per_contract" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "realized_pnl" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "total_proceeds" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "number_of_contracts" SET DATA TYPE DOUBLE PRECISION;

-- DropTable
DROP TABLE "contract";

-- CreateTable
CREATE TABLE "polymarket_event" (
    "event_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "closed" BOOLEAN NOT NULL DEFAULT false,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolution_time" TIMESTAMP(3),
    "category" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "liquidity" DOUBLE PRECISION,
    "volume" DOUBLE PRECISION,
    "volume_24hr" DOUBLE PRECISION,
    "volume_1wk" DOUBLE PRECISION,
    "volume_1mo" DOUBLE PRECISION,
    "polymarket_url" TEXT NOT NULL,
    "image_url" TEXT,
    "icon_url" TEXT,
    "enable_order_book" BOOLEAN NOT NULL DEFAULT true,
    "restricted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "polymarket_event_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "polymarket_market" (
    "market_id" SERIAL NOT NULL,
    "condition_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "closed" BOOLEAN NOT NULL DEFAULT false,
    "accepting_orders" BOOLEAN NOT NULL DEFAULT true,
    "best_bid" DOUBLE PRECISION,
    "best_ask" DOUBLE PRECISION,
    "last_trade_price" DOUBLE PRECISION,
    "spread" DOUBLE PRECISION,
    "volume" DOUBLE PRECISION,
    "liquidity" DOUBLE PRECISION,
    "volume_24hr" DOUBLE PRECISION,
    "volume_1wk" DOUBLE PRECISION,
    "volume_1mo" DOUBLE PRECISION,
    "order_min_size" DOUBLE PRECISION,
    "order_min_tick_size" DOUBLE PRECISION,
    "enable_order_book" BOOLEAN NOT NULL DEFAULT true,
    "restricted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "polymarket_market_pkey" PRIMARY KEY ("market_id")
);

-- CreateTable
CREATE TABLE "polymarket_outcome" (
    "outcome_id" SERIAL NOT NULL,
    "market_id" INTEGER NOT NULL,
    "clob_token_id" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "outcome_index" INTEGER NOT NULL,
    "current_price" DOUBLE PRECISION,
    "price_change_24hr" DOUBLE PRECISION,
    "price_change_1wk" DOUBLE PRECISION,
    "price_change_1mo" DOUBLE PRECISION,
    "winning_outcome" BOOLEAN NOT NULL DEFAULT false,
    "payout_per_share" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "polymarket_outcome_pkey" PRIMARY KEY ("outcome_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "polymarket_market_condition_id_key" ON "polymarket_market"("condition_id");

-- CreateIndex
CREATE INDEX "polymarket_market_event_id_idx" ON "polymarket_market"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "polymarket_outcome_clob_token_id_key" ON "polymarket_outcome"("clob_token_id");

-- CreateIndex
CREATE INDEX "polymarket_outcome_market_id_idx" ON "polymarket_outcome"("market_id");

-- CreateIndex
CREATE INDEX "polymarket_outcome_clob_token_id_idx" ON "polymarket_outcome"("clob_token_id");

-- CreateIndex
CREATE UNIQUE INDEX "polymarket_outcome_market_id_outcome_index_key" ON "polymarket_outcome"("market_id", "outcome_index");

-- CreateIndex
CREATE INDEX "position_wiretap_brokerage_account_id_idx" ON "position"("wiretap_brokerage_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "position_wiretap_brokerage_account_id_outcome_id_key" ON "position"("wiretap_brokerage_account_id", "outcome_id");

-- CreateIndex
CREATE INDEX "purchase_order_wiretap_brokerage_account_id_idx" ON "purchase_order"("wiretap_brokerage_account_id");

-- CreateIndex
CREATE INDEX "purchase_order_outcome_id_idx" ON "purchase_order"("outcome_id");

-- CreateIndex
CREATE INDEX "sale_order_wiretap_brokerage_account_id_idx" ON "sale_order"("wiretap_brokerage_account_id");

-- CreateIndex
CREATE INDEX "sale_order_outcome_id_idx" ON "sale_order"("outcome_id");

-- AddForeignKey
ALTER TABLE "polymarket_market" ADD CONSTRAINT "polymarket_market_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "polymarket_event"("event_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "polymarket_outcome" ADD CONSTRAINT "polymarket_outcome_market_id_fkey" FOREIGN KEY ("market_id") REFERENCES "polymarket_market"("market_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "position" ADD CONSTRAINT "position_outcome_id_fkey" FOREIGN KEY ("outcome_id") REFERENCES "polymarket_outcome"("outcome_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order" ADD CONSTRAINT "purchase_order_outcome_id_fkey" FOREIGN KEY ("outcome_id") REFERENCES "polymarket_outcome"("outcome_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_order" ADD CONSTRAINT "sale_order_outcome_id_fkey" FOREIGN KEY ("outcome_id") REFERENCES "polymarket_outcome"("outcome_id") ON DELETE RESTRICT ON UPDATE CASCADE;
