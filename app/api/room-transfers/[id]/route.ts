// PUT /api/room-transfers/[id]

import { NextResponse } from "next/server";
import { z } from 'zod';
import { prisma } from "@/libs/prisma";

const schema = z.object({
    status: z.string(),
    approvedBy: z.string().optional(),
    transferFee: z.number().optional(),
    reason: z.string().optional()
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const validatedData = schema.parse(body);

        const transfer = await prisma.roomTransfer.findUnique({
            where: {
                id: id
            }
        })

        if (!transfer) {
            return NextResponse.json(
                { error: 'Room transfer not found' },
                { status: 404 }
            )
        }

        if (validatedData.status === 'completed' && transfer.status !== 'completed') {
            await prisma.$transaction(async (tx) => {
                await tx.room.update({
                    where: { id: transfer.fromRoomId },
                    data: { statusEmpty: 'empty' }
                });

                await tx.room.update({
                    where: { id: transfer.toRoomId },
                    data: { statusEmpty: 'no' }
                });

                await tx.booking.update({
                    where: { id: transfer.bookingId },
                    data: { roomId: transfer.toRoomId }
                })

                await tx.roomTransfer.update({
                    where: { id: id },
                    data: {
                        status: 'completed',
                        approveAt: new Date(),
                        reason: validatedData.reason,
                        transferFee: validatedData.transferFee
                    }
                })
            })

            return NextResponse.json({});
        }

        return NextResponse.json({ message: 'not if' })
    } catch (err) {
        return NextResponse.json(
            { error: (err as Error).message },
            { status: 500 }
        )
    }
} 