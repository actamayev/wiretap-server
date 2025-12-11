/*
  Warnings:

  - You are about to drop the column `email__encrypted` on the `email_update_subscriber` table. All the data in the column will be lost.
  - Made the column `email` on table `email_update_subscriber` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "email_update_subscriber_email__encrypted_key";

-- AlterTable
ALTER TABLE "email_update_subscriber" DROP COLUMN "email__encrypted",
ALTER COLUMN "email" SET NOT NULL;
