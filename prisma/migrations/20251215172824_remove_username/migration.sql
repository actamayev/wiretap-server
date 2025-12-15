/*
  Warnings:

  - You are about to drop the column `username` on the `credentials` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "credentials_username_key";

-- AlterTable
ALTER TABLE "credentials" DROP COLUMN "username";
