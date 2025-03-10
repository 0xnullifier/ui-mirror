/*
  Warnings:

  - Added the required column `apiKey` to the `Custodian` table without a default value. This is not possible if the table is not empty.
  - Added the required column `backendurl` to the `Custodian` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Custodian" ADD COLUMN     "apiKey" TEXT NOT NULL,
ADD COLUMN     "backendurl" TEXT NOT NULL;
