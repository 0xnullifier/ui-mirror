/*
  Warnings:

  - You are about to drop the `ProofAnalytics` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProofAnalytics" DROP CONSTRAINT "ProofAnalytics_custodianId_fkey";

-- DropTable
DROP TABLE "ProofAnalytics";

-- CreateTable
CREATE TABLE "Anaytics" (
    "id" SERIAL NOT NULL,
    "custodianId" INTEGER NOT NULL,
    "numProofsVerified" INTEGER NOT NULL DEFAULT 0,
    "numProofsFailed" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Anaytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Round" (
    "id" SERIAL NOT NULL,
    "custodianId" INTEGER NOT NULL,
    "assetTxUrl" TEXT NOT NULL DEFAULT '',
    "liabilityTxUrl" TEXT NOT NULL DEFAULT '',
    "solvencyTxUrl" TEXT NOT NULL DEFAULT '',
    "startingTimeStamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "liabilitiesEndTimeStamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assetEndTimeStamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "solvencyEndTimeStamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Round_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Anaytics" ADD CONSTRAINT "Anaytics_custodianId_fkey" FOREIGN KEY ("custodianId") REFERENCES "Custodian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_custodianId_fkey" FOREIGN KEY ("custodianId") REFERENCES "Custodian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
