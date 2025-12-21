// GET /api/room/list/[roomTypeId]

import { prisma } from '@/libs/prisma';
import { NextResponse } from 'next/server';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ roomTypeId: string }> }
) {
    try {
        const { roomTypeId } = await params;
        const rooms = await prisma.room.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                roomType: true
            },
            where: {
                status: 'active',
                roomTypeId: roomTypeId
            }
        })

        return NextResponse.json(rooms);
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        )
    }
}