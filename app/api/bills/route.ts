// GET /api/bills
// POST /api/bills

import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { z } from "zod";

const billSchema = z.object({
    roomId: z.string(),
    bookingId: z.string(),
    waterUnit: z.number(),
    waterPricePerUnit: z.number(),
    electricityUnit: z.number(),
    electricityPricePerUnit: z.number(),
    roomPrice: z.number(),
    additionalCosts: z.array(z.object({
        name: z.string(),
        amount: z.number(),
    })),
});

export async function GET() {
    try {
        const bills = await prisma.bill.findMany({
            include: {
                room: true,
                booking: true,
                billItems: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return NextResponse.json(bills);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch bills' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validationData = billSchema.parse(body);

        const currentMonth = new Date();
        const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

        const existingBill = await prisma.bill.findFirst({
            where: {
                roomId: validationData.roomId,
                bookingId: validationData.bookingId,
                billDate: {
                    gte: startOfMonth,
                    lte: endOfMonth,
                },
            },
        });

        if (existingBill) {
            return NextResponse.json({
                success: false,
                message: 'บิลนี้ถูกสร้างแล้ว',
                billId: existingBill.id,
            });
        }

        const waterCost = validationData.waterUnit * validationData.waterPricePerUnit;
        const electricityCost = validationData.electricityUnit * validationData.electricityPricePerUnit;
        const additionalCostTotal = validationData.additionalCosts.reduce((sum, cost) => sum + cost.amount, 0);
        const totalAmount = waterCost + electricityCost + validationData.roomPrice + additionalCostTotal;

        const bill = await prisma.bill.create({
            data: {
                roomId: validationData.roomId,
                bookingId: validationData.bookingId,
                waterUnit: validationData.waterUnit,
                electricityUnit: validationData.electricityUnit,
                waterCost: waterCost,
                electricityCost: electricityCost,
                roomPrice: validationData.roomPrice,
                additionalCost: additionalCostTotal,
                totalAmount: totalAmount,
                status: 'pending',
                billDate: new Date(),
            }
        });

        // create bill items
        const billItems = [];

        // room item
        billItems.push({
            billId: bill.id,
            name: 'ค่าเช่าห้อง',
            amount: validationData.roomPrice,
            type: 'room',
        });

        // water item
        billItems.push({
            billId: bill.id,
            name: `ค่าน้ำ ${validationData.waterUnit} หน่วย x ${validationData.waterPricePerUnit} บาท/หน่วย`,
            amount: waterCost,
            type: 'water',
        });

        // electricity item
        billItems.push({
            billId: bill.id,
            name: `ค่าไฟ ${validationData.electricityUnit} หน่วย x ${validationData.electricityPricePerUnit} บาท/หน่วย`,
            amount: electricityCost,
            type: 'electricity',
        });

        // additional costs
        for (const cost of validationData.additionalCosts) {
            billItems.push({
                billId: bill.id,
                name: cost.name,
                amount: cost.amount,
                type: 'additional',
            });
        }

        await prisma.billItem.createMany({
            data: billItems,
        });
        return NextResponse.json(bill);
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: 'Failed to create bill' },
            { status: 500 }
        );
    }
}

