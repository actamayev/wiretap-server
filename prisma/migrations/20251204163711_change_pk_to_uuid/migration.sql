/*
  Warnings:

  - You are about to drop the column `wiretap_fund_id` on the `position` table. All the data in the column will be lost.
  - You are about to drop the column `wiretap_fund_id` on the `purchase_order` table. All the data in the column will be lost.
  - You are about to drop the column `wiretap_fund_id` on the `sale_order` table. All the data in the column will be lost.
  - The primary key for the `wiretap_fund` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `wiretap_fund_id` on the `wiretap_fund` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[wiretap_fund_uuid,outcome_id]` on the table `position` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `wiretap_fund_uuid` to the `position` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wiretap_fund_uuid` to the `purchase_order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wiretap_fund_uuid` to the `sale_order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wiretap_fund_uuid` to the `wiretap_fund` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "position" DROP CONSTRAINT "position_wiretap_fund_id_fkey";

-- DropForeignKey
ALTER TABLE "purchase_order" DROP CONSTRAINT "purchase_order_wiretap_fund_id_fkey";

-- DropForeignKey
ALTER TABLE "sale_order" DROP CONSTRAINT "sale_order_wiretap_fund_id_fkey";

-- DropIndex
DROP INDEX "position_wiretap_fund_id_idx";

-- DropIndex
DROP INDEX "position_wiretap_fund_id_outcome_id_key";

-- DropIndex
DROP INDEX "purchase_order_wiretap_fund_id_idx";

-- DropIndex
DROP INDEX "sale_order_wiretap_fund_id_idx";

-- AlterTable
ALTER TABLE "position" DROP COLUMN "wiretap_fund_id",
ADD COLUMN     "wiretap_fund_uuid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "purchase_order" DROP COLUMN "wiretap_fund_id",
ADD COLUMN     "wiretap_fund_uuid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "sale_order" DROP COLUMN "wiretap_fund_id",
ADD COLUMN     "wiretap_fund_uuid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "wiretap_fund" DROP CONSTRAINT "wiretap_fund_pkey",
DROP COLUMN "wiretap_fund_id",
ADD COLUMN     "wiretap_fund_uuid" TEXT NOT NULL,
ADD CONSTRAINT "wiretap_fund_pkey" PRIMARY KEY ("wiretap_fund_uuid");

-- CreateIndex
CREATE INDEX "position_wiretap_fund_uuid_idx" ON "position"("wiretap_fund_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "position_wiretap_fund_uuid_outcome_id_key" ON "position"("wiretap_fund_uuid", "outcome_id");

-- CreateIndex
CREATE INDEX "purchase_order_wiretap_fund_uuid_idx" ON "purchase_order"("wiretap_fund_uuid");

-- CreateIndex
CREATE INDEX "sale_order_wiretap_fund_uuid_idx" ON "sale_order"("wiretap_fund_uuid");

-- AddForeignKey
ALTER TABLE "position" ADD CONSTRAINT "position_wiretap_fund_uuid_fkey" FOREIGN KEY ("wiretap_fund_uuid") REFERENCES "wiretap_fund"("wiretap_fund_uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order" ADD CONSTRAINT "purchase_order_wiretap_fund_uuid_fkey" FOREIGN KEY ("wiretap_fund_uuid") REFERENCES "wiretap_fund"("wiretap_fund_uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_order" ADD CONSTRAINT "sale_order_wiretap_fund_uuid_fkey" FOREIGN KEY ("wiretap_fund_uuid") REFERENCES "wiretap_fund"("wiretap_fund_uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
