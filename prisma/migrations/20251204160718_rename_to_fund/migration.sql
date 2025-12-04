/*
  Warnings:

  - You are about to drop the column `wiretap_brokerage_account_id` on the `position` table. All the data in the column will be lost.
  - You are about to drop the column `wiretap_brokerage_account_id` on the `purchase_order` table. All the data in the column will be lost.
  - You are about to drop the column `wiretap_brokerage_account_id` on the `sale_order` table. All the data in the column will be lost.
  - You are about to drop the `wiretap_brokerage_account` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[wiretap_fund_id,outcome_id]` on the table `position` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `wiretap_fund_id` to the `position` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wiretap_fund_id` to the `purchase_order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wiretap_fund_id` to the `sale_order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "position" DROP CONSTRAINT "position_wiretap_brokerage_account_id_fkey";

-- DropForeignKey
ALTER TABLE "purchase_order" DROP CONSTRAINT "purchase_order_wiretap_brokerage_account_id_fkey";

-- DropForeignKey
ALTER TABLE "sale_order" DROP CONSTRAINT "sale_order_wiretap_brokerage_account_id_fkey";

-- DropForeignKey
ALTER TABLE "wiretap_brokerage_account" DROP CONSTRAINT "wiretap_brokerage_account_user_id_fkey";

-- DropIndex
DROP INDEX "position_wiretap_brokerage_account_id_idx";

-- DropIndex
DROP INDEX "position_wiretap_brokerage_account_id_outcome_id_key";

-- DropIndex
DROP INDEX "purchase_order_wiretap_brokerage_account_id_idx";

-- DropIndex
DROP INDEX "sale_order_wiretap_brokerage_account_id_idx";

-- AlterTable
ALTER TABLE "position" DROP COLUMN "wiretap_brokerage_account_id",
ADD COLUMN     "wiretap_fund_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "purchase_order" DROP COLUMN "wiretap_brokerage_account_id",
ADD COLUMN     "wiretap_fund_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "sale_order" DROP COLUMN "wiretap_brokerage_account_id",
ADD COLUMN     "wiretap_fund_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "wiretap_brokerage_account";

-- CreateTable
CREATE TABLE "wiretap_fund" (
    "wiretap_fund_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "starting_account_balance_usd" DOUBLE PRECISION NOT NULL,
    "current_account_balance_usd" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wiretap_fund_pkey" PRIMARY KEY ("wiretap_fund_id")
);

-- CreateIndex
CREATE INDEX "position_wiretap_fund_id_idx" ON "position"("wiretap_fund_id");

-- CreateIndex
CREATE UNIQUE INDEX "position_wiretap_fund_id_outcome_id_key" ON "position"("wiretap_fund_id", "outcome_id");

-- CreateIndex
CREATE INDEX "purchase_order_wiretap_fund_id_idx" ON "purchase_order"("wiretap_fund_id");

-- CreateIndex
CREATE INDEX "sale_order_wiretap_fund_id_idx" ON "sale_order"("wiretap_fund_id");

-- AddForeignKey
ALTER TABLE "wiretap_fund" ADD CONSTRAINT "wiretap_fund_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "credentials"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "position" ADD CONSTRAINT "position_wiretap_fund_id_fkey" FOREIGN KEY ("wiretap_fund_id") REFERENCES "wiretap_fund"("wiretap_fund_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order" ADD CONSTRAINT "purchase_order_wiretap_fund_id_fkey" FOREIGN KEY ("wiretap_fund_id") REFERENCES "wiretap_fund"("wiretap_fund_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_order" ADD CONSTRAINT "sale_order_wiretap_fund_id_fkey" FOREIGN KEY ("wiretap_fund_id") REFERENCES "wiretap_fund"("wiretap_fund_id") ON DELETE RESTRICT ON UPDATE CASCADE;
