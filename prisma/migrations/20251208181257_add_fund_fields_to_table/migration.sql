-- AlterTable
ALTER TABLE "wiretap_fund" ADD COLUMN     "is_primary_fund" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_starting_fund" BOOLEAN NOT NULL DEFAULT false;
