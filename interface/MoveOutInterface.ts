import { BookingInterface } from "./BookingInterface";
import { RoomInterface } from "./RoomInterface";

export interface MoveOutInterface {
    id: string;
    roomId: string;
    room: RoomInterface;
    bookingId: string;
    booking: BookingInterface;
    moveOutDate: Date;
    reason?: string;
    despositReturn?: number;
    outstandingFees?: number;
    status: string;
    approveBy?: string;
    approveAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

