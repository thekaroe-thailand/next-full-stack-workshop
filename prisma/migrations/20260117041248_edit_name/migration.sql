/*
  Warnings:

  - You are about to drop the `ElectcityLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ElectcityLog" DROP CONSTRAINT "ElectcityLog_bookingId_fkey";

-- DropTable
DROP TABLE "ElectcityLog";

-- CreateTable
CREATE TABLE "ElectricityLog" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "electricityUnit" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ElectricityLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ElectricityLog" ADD CONSTRAINT "ElectricityLog_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
