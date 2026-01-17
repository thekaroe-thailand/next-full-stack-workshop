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
                name: 'asc'
            },
            include: {
                roomType: true,
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
            },
            where: {
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