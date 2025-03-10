/*
  Warnings:

  - The primary key for the `Custodian` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `lastProofDownload` on the `Custodian` table. All the data in the column will be lost.
  - You are about to drop the column `onchainContract` on the `Custodian` table. All the data in the column will be lost.
  - You are about to drop the column `proofsVerified` on the `Custodian` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Custodian` table. All the data in the column will be lost.
  - You are about to drop the column `webhookURL` on the `Custodian` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `Custodian` table. All the data in the column will be lost.
  - The `id` column on the `Custodian` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- DropIndex
DROP INDEX "Custodian_onchainContract_key";

-- AlterTable
ALTER TABLE "Custodian" DROP CONSTRAINT "Custodian_pkey",
DROP COLUMN "lastProofDownload",
DROP COLUMN "onchainContract",
DROP COLUMN "proofsVerified",
DROP COLUMN "status",
DROP COLUMN "webhookURL",
DROP COLUMN "website",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Custodian_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "ProofAnalytics" (
    "id" SERIAL NOT NULL,
    "custodianId" INTEGER NOT NULL,
    "proofsVerified" INTEGER NOT NULL,
    "lastProofVerifiedTimestamp" TIMESTAMP(3) NOT NULL,
    "proofDownload" TEXT NOT NULL,
    "status" "Status" NOT NULL,

    CONSTRAINT "ProofAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCustodian" (
    "userId" INTEGER NOT NULL,
    "custodianId" INTEGER NOT NULL,

    CONSTRAINT "UserCustodian_pkey" PRIMARY KEY ("userId","custodianId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "ProofAnalytics" ADD CONSTRAINT "ProofAnalytics_custodianId_fkey" FOREIGN KEY ("custodianId") REFERENCES "Custodian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCustodian" ADD CONSTRAINT "UserCustodian_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCustodian" ADD CONSTRAINT "UserCustodian_custodianId_fkey" FOREIGN KEY ("custodianId") REFERENCES "Custodian"("id") ON DELETE CASCADE ON UPDATE CASCADE;
