// POST /api/water-and-electricity-log

import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const schema = z.object({
            roomName: z.string(),
            waterMeter: z.number(),
            electricityMeter: z.number(),
        });
        const { roomName, waterMeter, electricityMeter } = schema.parse(body);
        const room = await prisma.room.findFirst({
            where: {
                name: roomName,
                status: 'active'
            }
        });
        const booking = await prisma.booking.findFirst({
            where: {
                roomId: room?.id,
                status: 'active'
            }
        });

        if (!booking) {
            return NextResponse.json(
                { error: 'Booking not found' },
            );
        }

        const oldWaterPrice = await prisma.waterLog.findFirst({
            where: {
                bookingId: booking?.id,
                waterUnit: waterMeter
            }
        });
        const oldElectricityPrice = await prisma.electricityLog.findFirst({
            where: {
                bookingId: booking?.id,
                electricityUnit: electricityMeter
            }
        });

        if (!oldWaterPrice) {
            await prisma.waterLog.create({
                data: {
                    bookingId: booking?.id ?? '',
                    waterUnit: waterMeter
                }
            });
        }
        if (!oldElectricityPrice) {
            await prisma.electricityLog.create({
                data: {
                    bookingId: booking?.id ?? '',
                    electricityUnit: electricityMeter
                }
            });
        }
        return NextResponse.json({});
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        );
    }
}