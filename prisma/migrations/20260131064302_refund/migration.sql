/*
  Warnings:

  - You are about to drop the column `outstandingFees` on the `MoveOut` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MoveOut" DROP COLUMN "outstandingFees",
ADD COLUMN     "refund" INTEGER NOT NULL DEFAULT 0;
