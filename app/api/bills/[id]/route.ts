// GET /api/bills/[id]
// PUT /api/bills/[id]

import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { z } from "zod";

const billSchema = z.object({
    paymentDate: z.string().optional(),
    status: z.string().optional(),
    lateFee: z.number().optional(),
});

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const bill = await prisma.bill.findUnique({
            where: {
                id,
            },
            include: {
                room: true,
                booking: true,
                billItems: true,
            },
        });
        return NextResponse.json(bill);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch bill' },
            { status: 500 }
        );
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const validationData = billSchema.parse(body);
        const paymentDate = new Date(validationData.paymentDate || '');

        const bill = await prisma.bill.update({
            where: {
                id: id,
            },
            data: {
                paymentDate: paymentDate,
                status: validationData.status,
                lateFee: validationData.lateFee,
            },
        });
        return NextResponse.json(bill);
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        );
    }
}