/*
  Warnings:

  - The primary key for the `polymarket_outcome` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `outcome_id` on the `polymarket_outcome` table. All the data in the column will be lost.
  - You are about to drop the column `outcome_id` on the `position` table. All the data in the column will be lost.
  - You are about to drop the column `outcome_id` on the `purchase_order` table. All the data in the column will be lost.
  - You are about to drop the column `outcome_id` on the `sale_order` table. All the data in the column will be lost.
  - Added the required column `clob_token_id` to the `position` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clob_token_id` to the `purchase_order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clob_token_id` to the `sale_order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "position" DROP CONSTRAINT "position_outcome_id_fkey";

-- DropForeignKey
ALTER TABLE "purchase_order" DROP CONSTRAINT "purchase_order_outcome_id_fkey";

-- DropForeignKey
ALTER TABLE "sale_order" DROP CONSTRAINT "sale_order_outcome_id_fkey";

-- DropIndex
DROP INDEX "polymarket_outcome_clob_token_id_idx";

-- DropIndex
DROP INDEX "polymarket_outcome_clob_token_id_key";

-- DropIndex
DROP INDEX "position_wiretap_fund_uuid_outcome_id_key";

-- DropIndex
DROP INDEX "purchase_order_outcome_id_idx";

-- DropIndex
DROP INDEX "sale_order_outcome_id_idx";

-- AlterTable
ALTER TABLE "polymarket_outcome" DROP CONSTRAINT "polymarket_outcome_pkey",
DROP COLUMN "outcome_id",
ADD CONSTRAINT "polymarket_outcome_pkey" PRIMARY KEY ("clob_token_id");

-- AlterTable
ALTER TABLE "position" DROP COLUMN "outcome_id",
ADD COLUMN     "clob_token_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "purchase_order" DROP COLUMN "outcome_id",
ADD COLUMN     "clob_token_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "sale_order" DROP COLUMN "outcome_id",
ADD COLUMN     "clob_token_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "purchase_order_clob_token_id_idx" ON "purchase_order"("clob_token_id");

-- CreateIndex
CREATE INDEX "sale_order_clob_token_id_idx" ON "sale_order"("clob_token_id");

-- AddForeignKey
ALTER TABLE "position" ADD CONSTRAINT "position_clob_token_id_fkey" FOREIGN KEY ("clob_token_id") REFERENCES "polymarket_outcome"("clob_token_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order" ADD CONSTRAINT "purchase_order_clob_token_id_fkey" FOREIGN KEY ("clob_token_id") REFERENCES "polymarket_outcome"("clob_token_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_order" ADD CONSTRAINT "sale_order_clob_token_id_fkey" FOREIGN KEY ("clob_token_id") REFERENCES "polymarket_outcome"("clob_token_id") ON DELETE RESTRICT ON UPDATE CASCADE;
