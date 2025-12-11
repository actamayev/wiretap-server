/*
  Warnings:

  - Made the column `email` on table `credentials` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "credentials" ALTER COLUMN "email" SET NOT NULL;
