/*
  Warnings:

  - The primary key for the `polymarket_event` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `event_id` on the `polymarket_event` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `event_id` on the `polymarket_market` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "polymarket_market" DROP CONSTRAINT "polymarket_market_event_id_fkey";

-- AlterTable
ALTER TABLE "polymarket_event" DROP CONSTRAINT "polymarket_event_pkey",
DROP COLUMN "event_id",
ADD COLUMN     "event_id" INTEGER NOT NULL,
ADD CONSTRAINT "polymarket_event_pkey" PRIMARY KEY ("event_id");

-- AlterTable
ALTER TABLE "polymarket_market" DROP COLUMN "event_id",
ADD COLUMN     "event_id" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "polymarket_market_event_id_idx" ON "polymarket_market"("event_id");

-- AddForeignKey
ALTER TABLE "polymarket_market" ADD CONSTRAINT "polymarket_market_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "polymarket_event"("event_id") ON DELETE RESTRICT ON UPDATE CASCADE;
