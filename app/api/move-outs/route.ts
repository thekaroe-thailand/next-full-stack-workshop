// GET /api/move-outs
// POST /api/move-outs

import { NextResponse } from "next/server";
import { includes, z } from 'zod';
import { prisma } from '@/libs/prisma';

const moveOutSchema = z.object({
    roomId: z.string(),
    bookingId: z.string(),
    moveOutDate: z.string().optional(),
    reason: z.string().optional(),
    depositReturn: z.number().optional(),
    refund: z.number().optional(),
});

export async function GET() {
    try {
        const moveOuts = await prisma.moveOut.findMany({
            include: {
                room: {
                    include: {
                        roomType: true
                    }
                },
                booking: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        return NextResponse.json(moveOuts);
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validatedData = moveOutSchema.parse(body);

        const row = await prisma.moveOut.findFirst({
            where: {
                roomId: validatedData.roomId,
                status: 'pending'
            }
        })

        if (row) return NextResponse.json({});

        await prisma.moveOut.create({
            data: {
                roomId: validatedData.roomId,
                bookingId: validatedData.bookingId,
                moveOutDate: validatedData.moveOutDate ? new Date(validatedData.moveOutDate) : new Date(),
                reason: validatedData.reason ?? '',
                despositReturn: validatedData.depositReturn,
                refund: validatedData.refund,
                status: 'pending'
            }
        })
        return NextResponse.json({});
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        );
    }
}

