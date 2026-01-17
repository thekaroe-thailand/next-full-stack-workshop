// POST api/money-added/route.ts
// GET api/money-added/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/libs/prisma';
import { z } from 'zod';

export async function GET() {
    try {
        const moneyAdded = await prisma.moneyAdded.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            where: {
                status: 'active'
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

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const schema = z.object({
            name: z.string(),
            amount: z.number()
        });
        const { name, amount } = schema.parse(body);
        const moneyAdded = await prisma.moneyAdded.create({
            data: {
                name: name,
                amount: amount,
                status: 'active'
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

