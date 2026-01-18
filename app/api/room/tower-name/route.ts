// GET /api/room/tower-name

import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

export async function GET() {
    try {
        const towers = await prisma.room.findMany({
            distinct: ["towerName"],
            select: {
                towerName: true
            }
        });
        return NextResponse.json(towers);
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        );
    }
}
