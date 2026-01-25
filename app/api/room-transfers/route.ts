// GET /api/room-transfers
// POST /api/room-transfers

import { NextResponse } from "next/server";
import { z } from 'zod';
import { prisma } from '@/libs/prisma';

const roomTransferSchema = z.object({
    fromRoomId: z.string(),
    toRoomId: z.string(),
    bookingId: z.string(),
    transferDate: z.string().optional(),
    reason: z.string().optional(),
    transferFee: z.number().optional()
});

export async function GET() {
    try {
        const transfers = await prisma.roomTransfer.findMany({
            include: {
                fromRoom: {
                    include: {
                        roomType: true
                    }
                },
                toRoom: {
                    include: {
                        roomType: true
                    }
                },
                booking: true
            }
        })

        return NextResponse.json(transfers);
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validatedData = roomTransferSchema.parse(body);

        const transfer = await prisma.roomTransfer.create({
            data: {
                fromRoomId: validatedData.fromRoomId,
                toRoomId: validatedData.toRoomId,
                bookingId: validatedData.bookingId,
                transferDate: validatedData.transferDate ? new Date(validatedData.transferDate) : new Date(),
                reason: validatedData.reason ?? '',
                transferFee: validatedData.transferFee,
                status: 'pending'
            }
        })

        return NextResponse.json(transfer);
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        )
    }
}