// DELETE api/room/[id]

import { prisma } from '@/libs/prisma';
import { NextResponse } from 'next/server';

export async function DELETE(
    req: Request,
    { params }: {
        params: Promise<{ id: string }>
    }
) {
    try {
        const { id } = await params;
        await prisma.room.update({
            where: {
                id: id
            },
            data: {
                status: 'inactive'
            }
        })

        return NextResponse.json({});
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        )
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const room = await prisma.room.update({
            where: {
                id: id
            },
            data: {
                status: 'active'
            }
        })

        return NextResponse.json(room);
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        )
    }
}