/*
  Warnings:

  - You are about to drop the column `category` on the `polymarket_event` table. All the data in the column will be lost.
  - You are about to drop the column `accepting_orders` on the `polymarket_market` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "polymarket_event" DROP COLUMN "category";

-- AlterTable
ALTER TABLE "polymarket_market" DROP COLUMN "accepting_orders",
ALTER COLUMN "question" DROP NOT NULL;
