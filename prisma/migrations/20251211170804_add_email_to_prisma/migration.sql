/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `credentials` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "credentials" ADD COLUMN     "email" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "credentials_email_key" ON "credentials"("email");
