/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `email_update_subscriber` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "email_update_subscriber" ADD COLUMN     "email" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "email_update_subscriber_email_key" ON "email_update_subscriber"("email");
