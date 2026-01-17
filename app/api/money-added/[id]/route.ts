// PUT api/money-added/[id]/route.ts
// DELETE api/money-added/[id]/route.ts

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/libs/prisma';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const body = await request.json();
        const schema = z.object({
            name: z.string(),
            amount: z.number()
        });
        const { name, amount } = schema.parse(body);
        const { id } = await params;
        const moneyAdded = await prisma.moneyAdded.update({
            where: {
                id: id
            },
            data: {
                name: name,
                amount: amount
            }
        });
        return NextResponse.json(moneyAdded);
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const moneyAdded = await prisma.moneyAdded.update({
            where: {
                id: id
            },
            data: {
                status: 'inactive'
            }
        });
        return NextResponse.json(moneyAdded);
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        );
    }
}
