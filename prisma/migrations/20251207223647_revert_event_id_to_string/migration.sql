/*
  Warnings:

  - The primary key for the `polymarket_event` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "polymarket_market" DROP CONSTRAINT "polymarket_market_event_id_fkey";

-- AlterTable
ALTER TABLE "polymarket_event" DROP CONSTRAINT "polymarket_event_pkey",
ALTER COLUMN "event_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "polymarket_event_pkey" PRIMARY KEY ("event_id");

-- AlterTable
ALTER TABLE "polymarket_market" ALTER COLUMN "event_id" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "polymarket_market" ADD CONSTRAINT "polymarket_market_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "polymarket_event"("event_id") ON DELETE RESTRICT ON UPDATE CASCADE;
