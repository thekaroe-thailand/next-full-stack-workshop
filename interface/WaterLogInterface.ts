import { BookingInterface } from "./BookingInterface";

export interface WaterLogInterface {
    id: string;
    bookingId: string;
    booking: BookingInterface;
    waterUnit: number;
    createdAt: Date;
    updatedAt: Date;
}
