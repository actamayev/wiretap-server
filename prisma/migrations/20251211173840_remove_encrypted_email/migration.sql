/*
  Warnings:

  - You are about to drop the column `email__encrypted` on the `credentials` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "credentials_email__encrypted_key";

-- AlterTable
ALTER TABLE "credentials" DROP COLUMN "email__encrypted";
