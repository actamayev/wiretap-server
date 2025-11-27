-- CreateEnum
CREATE TYPE "AuthMethods" AS ENUM ('wiretap', 'google');

-- CreateTable
CREATE TABLE "credentials" (
    "user_id" SERIAL NOT NULL,
    "username" TEXT,
    "password" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "auth_method" "AuthMethods" NOT NULL,
    "email__encrypted" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credentials_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "login_history" (
    "login_history_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "login_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_history_pkey" PRIMARY KEY ("login_history_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "credentials_username_key" ON "credentials"("username");

-- CreateIndex
CREATE UNIQUE INDEX "credentials_email__encrypted_key" ON "credentials"("email__encrypted");

-- CreateIndex
CREATE INDEX "login_history__user_id_idx" ON "login_history"("user_id");

-- AddForeignKey
ALTER TABLE "login_history" ADD CONSTRAINT "login_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "credentials"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
