// POST api/booking/route.ts

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/libs/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const schema = z.object({
            customerName: z.string(),
            customerPhone: z.string(),
            customerAddress: z.string(),
            cardId: z.string(),
            gender: z.string(),
            roomId: z.string(),
            remark: z.string().optional(),
            deposit: z.number().default(0),
            stayAt: z.string().transform((str) => new Date(str)),
            stayTo: z.string().nullable().optional().transform((str) => (str ? new Date(str) : null)),
            waterUnit: z.number().default(0),
            electricityUnit: z.number().default(0)
        });
        const {
            customerName,
            customerPhone,
            customerAddress,
            cardId,
            gender,
            roomId,
            remark,
            deposit,
            stayAt,
            stayTo,
            waterUnit,
            electricityUnit
        } = schema.parse(body);

        const oldBooking = await prisma.booking.findFirst({
            where: {
                roomId: roomId,
                room: {
                    statusEmpty: 'no',
                    status: 'active'
                }
            }
        });

        let bookingId = '';

        if (oldBooking) {
            // update
            bookingId = oldBooking.id;

            await prisma.booking.update({
                where: {
                    id: oldBooking.id
                },
                data: {
                    customerName: customerName,
                    customerPhone: customerPhone,
                    customerAddress: customerAddress,
                    cardId: cardId,
                    gender: gender,
                    remark: remark,
                    deposit: deposit,
                    stayAt: stayAt,
                    stayTo: stayTo,
                }
            });
        } else {
            // create
            const booking = await prisma.booking.create({
                data: {
                    customerName: customerName,
                    customerPhone: customerPhone,
                    customerAddress: customerAddress,
                    cardId: cardId,
                    gender: gender,
                    roomId: roomId,
                    remark: remark,
                    deposit: deposit,
                    stayAt: stayAt,
                    stayTo: stayTo,
                    status: 'active'
                }
            });

            bookingId = booking.id;
        }

        // update statusEmpty of room
        await prisma.room.update({
            where: {
                id: roomId
            },
            data: {
                statusEmpty: 'no'
            }
        });

        await updateUnitWaterAndElectricity(bookingId, waterUnit, electricityUnit);

        return NextResponse.json({});
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        );
    }
}

const updateUnitWaterAndElectricity = async (
    bookingId: string,
    waterUnit: number,
    electricityUnit: number
) => {
    const oldWaterUnit = await prisma.waterLog.findFirst({
        where: {
            bookingId: bookingId,
            waterUnit: waterUnit
        }
    });

    const oldElectricityUnit = await prisma.electricityLog.findFirst({
        where: {
            bookingId: bookingId,
            electricityUnit: electricityUnit
        }
    });

    if (oldWaterUnit) {
        await prisma.waterLog.update({
            where: {
                id: oldWaterUnit.id
            },
            data: {
                waterUnit: waterUnit
            }
        });
    } else {
        await prisma.waterLog.create({
            data: {
                bookingId: bookingId,
                waterUnit: waterUnit
            }
        });
    }

    if (oldElectricityUnit) {
        await prisma.electricityLog.update({
            where: {
                id: oldElectricityUnit.id
            },
            data: {
                electricityUnit: electricityUnit
            }
        });
    } else {
        await prisma.electricityLog.create({
            data: {
                bookingId: bookingId,
                electricityUnit: electricityUnit
            }
        });
    }
}




























