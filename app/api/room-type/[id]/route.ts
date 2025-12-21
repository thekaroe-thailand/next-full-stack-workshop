// GET /api/room-type/[id]
// PUT /api/room-type/[id]
// DELETE /api/room-type/[id]

import { NextResponse } from 'next/server';
import { prisma } from '@/libs/prisma';
import { z } from 'zod';

export async function GET(
    req: Request,
    { params }: {
        params: Promise<{ id: string }>
    }
) {
    try {
        const { id } = await params;
        const roomType = await prisma.roomType.findUnique({
            where: {
                id: id
            }
        })
        return NextResponse.json(roomType);
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        )
    }
}

export async function PUT(
    req: Request,
    { params }: {
        params: Promise<{ id: string }>
    }
) {
    try {
        const formSchema = z.object({
            name: z.string(),
            price: z.number(),
            remark: z.string().optional()
        })
        const { id } = await params;
        const payload = formSchema.parse(await req.json());
        const roomType = await prisma.roomType.update({
            where: {
                id: id
            },
            data: payload
        })
        return NextResponse.json(roomType);
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        )
    }
}

export async function DELETE(
    req: Request,
    { params }: {
        params: Promise<{ id: string }>
    }
) {
    try {
        const { id } = await params;
        const roomType = await prisma.roomType.update({
            where: {
                id: id
            },
            data: {
                status: 'inactive'
            }
        });

        return NextResponse.json(roomType);
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        )
    }
}
