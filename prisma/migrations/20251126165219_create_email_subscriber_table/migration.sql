-- CreateTable
CREATE TABLE "email_update_subscriber" (
    "email_update_subscriber_id" SERIAL NOT NULL,
    "email__encrypted" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_update_subscriber_pkey" PRIMARY KEY ("email_update_subscriber_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_update_subscriber_email__encrypted_key" ON "email_update_subscriber"("email__encrypted");
