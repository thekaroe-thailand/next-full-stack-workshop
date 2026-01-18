// GET /api/room/filter-by-tower/[towerName]

import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ towerName: string }> }
) {
    try {
        const { towerName } = await params;
        const rooms = await prisma.room.findMany({
            where: {
                towerName: towerName
            },
            orderBy: {
                name: 'asc'
            },
            include: {
                bookings: {
                    include: {
                        waterLogs: {
                            orderBy: {
                                createdAt: 'desc'
                            },
                            take: 1
                        },
                        electricityLogs: {
                            orderBy: {
                                createdAt: 'desc'
                            },
                            take: 1
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1
                }
            }
        });
        return NextResponse.json(rooms);
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        );
    }
}
