/*
  Warnings:

  - You are about to drop the column `resolution_time` on the `polymarket_event` table. All the data in the column will be lost.
  - You are about to drop the column `resolved` on the `polymarket_event` table. All the data in the column will be lost.
  - You are about to drop the column `winning_outcome` on the `polymarket_outcome` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "polymarket_event" DROP COLUMN "resolution_time",
DROP COLUMN "resolved",
ADD COLUMN     "closed_time" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "polymarket_outcome" DROP COLUMN "winning_outcome";
