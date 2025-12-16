/*
  Warnings:

  - A unique constraint covering the columns `[wiretap_fund_uuid,timestamp,resolution_minutes]` on the table `portfolio_snapshot` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "portfolio_snapshot_timestamp_idx";

-- DropIndex
DROP INDEX "portfolio_snapshot_wiretap_fund_uuid_idx";

-- DropIndex
DROP INDEX "portfolio_snapshot_wiretap_fund_uuid_timestamp_key";

-- CreateIndex
CREATE INDEX "portfolio_snapshot_wiretap_fund_uuid_resolution_minutes_tim_idx" ON "portfolio_snapshot"("wiretap_fund_uuid", "resolution_minutes", "timestamp");

-- CreateIndex
CREATE INDEX "portfolio_snapshot_resolution_minutes_timestamp_idx" ON "portfolio_snapshot"("resolution_minutes", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "portfolio_snapshot_wiretap_fund_uuid_timestamp_resolution_m_key" ON "portfolio_snapshot"("wiretap_fund_uuid", "timestamp", "resolution_minutes");
