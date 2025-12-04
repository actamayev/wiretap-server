/*
  Warnings:

  - Added the required column `fund_name` to the `wiretap_fund` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "wiretap_fund" ADD COLUMN     "fund_name" TEXT NOT NULL;
