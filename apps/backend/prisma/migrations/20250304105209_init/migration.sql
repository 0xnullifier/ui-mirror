-- CreateTable
CREATE TABLE "Custodian" (
    "id" TEXT NOT NULL,
    "onchainContract" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "webhookURL" TEXT NOT NULL,
    "proofsVerified" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "lastProofDownload" TEXT NOT NULL,

    CONSTRAINT "Custodian_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Custodian_onchainContract_key" ON "Custodian"("onchainContract");
