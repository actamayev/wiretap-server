/*
  Warnings:

  - You are about to drop the column `average_cost_per_contract` on the `position` table. All the data in the column will be lost.
  - You are about to drop the column `number_contracts_held` on the `position` table. All the data in the column will be lost.
  - You are about to drop the column `number_of_contracts` on the `purchase_order` table. All the data in the column will be lost.
  - You are about to drop the column `price_per_contract` on the `purchase_order` table. All the data in the column will be lost.
  - You are about to drop the column `number_of_contracts` on the `sale_order` table. All the data in the column will be lost.
  - You are about to drop the column `price_per_contract` on the `sale_order` table. All the data in the column will be lost.
  - Added the required column `average_cost_per_share` to the `position` table without a default value. This is not possible if the table is not empty.
  - Added the required column `number_shares_held` to the `position` table without a default value. This is not possible if the table is not empty.
  - Added the required column `number_of_shares` to the `purchase_order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price_per_share` to the `purchase_order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `number_of_shares` to the `sale_order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price_per_share` to the `sale_order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "position" DROP COLUMN "average_cost_per_contract",
DROP COLUMN "number_contracts_held",
ADD COLUMN     "average_cost_per_share" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "number_shares_held" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "purchase_order" DROP COLUMN "number_of_contracts",
DROP COLUMN "price_per_contract",
ADD COLUMN     "number_of_shares" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "price_per_share" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "sale_order" DROP COLUMN "number_of_contracts",
DROP COLUMN "price_per_contract",
ADD COLUMN     "number_of_shares" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "price_per_share" DOUBLE PRECISION NOT NULL;
