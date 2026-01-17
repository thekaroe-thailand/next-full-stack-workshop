import { BookingInterface } from "./BookingInterface";

export interface ElectricityLogInterface {
    id: string;
    bookingId: string;
    booking: BookingInterface;
    electricityUnit: number;
    createdAt: Date;
    updatedAt: Date;
}
