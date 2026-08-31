/*
  Warnings:

  - Made the column `publicId` on table `PetImage` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PetImage" ALTER COLUMN "publicId" SET NOT NULL;
