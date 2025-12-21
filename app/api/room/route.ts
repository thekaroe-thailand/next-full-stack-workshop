// POST api/room

import { prisma } from '@/libs/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const schema = z.object({
            roomTypeId: z.string(),
            totalRoom: z.number(),
            towerName: z.string(),
            totalLevel: z.number()
        });

        let { roomTypeId, totalRoom, towerName, totalLevel } = schema.parse(body);
        totalRoom = Number(totalRoom);
        totalLevel = Number(totalLevel);

        if (totalRoom > 0) {
            const computeTotalRoom = totalRoom * totalLevel;

            for (let i = 1; i <= totalLevel; i++) {
                for (let j = 1; j <= totalRoom; j++) {
                    // name 1101 ตัวเลขคือตึก ตัวที่สองคือชั้น อีก 2 ตัวคือห้อง 
                    // 1101 = ตึก 1 ชั้น 1 ห้อง 1
                    const roomNo = String(j).padStart(2, '0');
                    const roomName = `${towerName}${i}${roomNo}`;
                    await prisma.room.create({
                        data: {
                            roomTypeId: roomTypeId,
                            name: roomName,
                            status: 'active',
                            statusEmpty: 'empty',
                            towerName: towerName,
                            totalLevel: totalLevel,
                            totalRoom: computeTotalRoom
                        }
                    })
                }
            }
        }

        return NextResponse.json({});
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        )
    }
}