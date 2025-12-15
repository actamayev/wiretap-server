/*
  Warnings:

  - You are about to drop the `polymarket_price_history` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "polymarket_price_history" DROP CONSTRAINT "polymarket_price_history_clob_token_id_fkey";

-- DropTable
DROP TABLE "polymarket_price_history";
