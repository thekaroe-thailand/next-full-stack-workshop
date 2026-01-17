/*
  Warnings:

  - You are about to drop the column `customerPhont` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `customerPhone` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "customerPhont",
ADD COLUMN     "customerPhone" TEXT NOT NULL;
