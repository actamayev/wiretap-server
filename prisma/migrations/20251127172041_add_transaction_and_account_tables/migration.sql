/*
  Warnings:

  - The values [wiretap,google] on the enum `AuthMethods` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AuthMethods_new" AS ENUM ('WIRETAP', 'GOOGLE');
ALTER TABLE "credentials" ALTER COLUMN "auth_method" TYPE "AuthMethods_new" USING ("auth_method"::text::"AuthMethods_new");
ALTER TYPE "AuthMethods" RENAME TO "AuthMethods_old";
ALTER TYPE "AuthMethods_new" RENAME TO "AuthMethods";
DROP TYPE "public"."AuthMethods_old";
COMMIT;

-- CreateTable
CREATE TABLE "wiretap_brokerage_account" (
    "wiretap_brokerage_account_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "starting_account_balance_usd" DOUBLE PRECISION NOT NULL,
    "current_account_balance_usd" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wiretap_brokerage_account_pkey" PRIMARY KEY ("wiretap_brokerage_account_id")
);

-- CreateTable
CREATE TABLE "contract" (
    "contract_uuid" TEXT NOT NULL,
    "polymarket_link" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contract_pkey" PRIMARY KEY ("contract_uuid")
);

-- CreateTable
CREATE TABLE "position" (
    "position_id" SERIAL NOT NULL,
    "contract_uuid" TEXT NOT NULL,
    "number_contracts_held" INTEGER NOT NULL,
    "wiretap_brokerage_account_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "position_pkey" PRIMARY KEY ("position_id")
);

-- CreateTable
CREATE TABLE "purchase_order" (
    "purchase_id" SERIAL NOT NULL,
    "contract_uuid" TEXT NOT NULL,
    "number_of_contracts" INTEGER NOT NULL,
    "wiretap_brokerage_account_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_order_pkey" PRIMARY KEY ("purchase_id")
);

-- CreateTable
CREATE TABLE "sale_order" (
    "sale_id" SERIAL NOT NULL,
    "contract_uuid" TEXT NOT NULL,
    "number_of_contracts" INTEGER NOT NULL,
    "wiretap_brokerage_account_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sale_order_pkey" PRIMARY KEY ("sale_id")
);

-- AddForeignKey
ALTER TABLE "wiretap_brokerage_account" ADD CONSTRAINT "wiretap_brokerage_account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "credentials"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "position" ADD CONSTRAINT "position_wiretap_brokerage_account_id_fkey" FOREIGN KEY ("wiretap_brokerage_account_id") REFERENCES "wiretap_brokerage_account"("wiretap_brokerage_account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "position" ADD CONSTRAINT "position_contract_uuid_fkey" FOREIGN KEY ("contract_uuid") REFERENCES "contract"("contract_uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order" ADD CONSTRAINT "purchase_order_wiretap_brokerage_account_id_fkey" FOREIGN KEY ("wiretap_brokerage_account_id") REFERENCES "wiretap_brokerage_account"("wiretap_brokerage_account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order" ADD CONSTRAINT "purchase_order_contract_uuid_fkey" FOREIGN KEY ("contract_uuid") REFERENCES "contract"("contract_uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_order" ADD CONSTRAINT "sale_order_wiretap_brokerage_account_id_fkey" FOREIGN KEY ("wiretap_brokerage_account_id") REFERENCES "wiretap_brokerage_account"("wiretap_brokerage_account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_order" ADD CONSTRAINT "sale_order_contract_uuid_fkey" FOREIGN KEY ("contract_uuid") REFERENCES "contract"("contract_uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
