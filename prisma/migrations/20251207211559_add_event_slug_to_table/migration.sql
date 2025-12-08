/*
  Warnings:

  - Added the required column `event_slug` to the `polymarket_event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "polymarket_event" ADD COLUMN     "event_slug" TEXT NOT NULL;
