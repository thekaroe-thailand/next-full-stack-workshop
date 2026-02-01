// PUT /api/move-outs/[id]
// DELETE /api/move-outs/[id]

import { NextResponse } from "next/server";
import { z } from 'zod';
import { prisma } from "@/libs/prisma";

const updateMoveOutSchema = z.object({
    status: z.string().optional(),
    approvedBy: z.string().optional(),
    depositReturn: z.number().optional(),
    refund: z.number().optional(),
    reason: z.string().optional(),
});

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const validatedData = updateMoveOutSchema.parse(body);

        const moveOut = await prisma.moveOut.findUnique({
            where: { id: id }
        });

        if (!moveOut) {
            return NextResponse.json(
                { error: 'Move out not found' },
                { status: 404 }
            );
        }

        if (moveOut.status === 'pending') {
            await prisma.$transaction(async (tx) => {
                await tx.room.update({
                    where: {
                        id: moveOut.roomId
                    },
                    data: {
                        statusEmpty: 'empty'
                    }
                });

                await tx.moveOut.update({
                    where: {
                        id: id
                    },
                    data: {
                        status: validatedData.status,
                        approveAt: new Date(),
                        reason: validatedData.reason,
                        despositReturn: validatedData.depositReturn,
                        refund: validatedData.refund,
                    }
                })
            })
        }
        return NextResponse.json({})
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const moveOut = await prisma.moveOut.findUnique({
            where: { id: id }
        });

        if (!moveOut) {
            return NextResponse.json(
                { error: 'Move out not found' },
                { status: 404 }
            );
        }

        await prisma.$transaction(async (tx) => {
            await tx.room.update({
                where: {
                    id: moveOut.roomId
                },
                data: {
                    statusEmpty: 'no'
                }
            })

            await tx.moveOut.delete({
                where: {
                    id: id
                }
            })
        })

        return NextResponse.json({});
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        );
    }
}







