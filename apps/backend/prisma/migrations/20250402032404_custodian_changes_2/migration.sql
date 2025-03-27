/*
  Warnings:

  - You are about to drop the `UserCustodian` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserCustodian" DROP CONSTRAINT "UserCustodian_custodianId_fkey";

-- DropForeignKey
ALTER TABLE "UserCustodian" DROP CONSTRAINT "UserCustodian_userId_fkey";

-- AlterTable
ALTER TABLE "Custodian" ADD COLUMN     "assetsZkAppAddress" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "liabilitiesZkAppAddress" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "posZkAppAddress" TEXT NOT NULL DEFAULT '';

-- DropTable
DROP TABLE "UserCustodian";
