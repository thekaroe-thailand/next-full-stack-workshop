import { RoomInterface } from "./RoomInterface";
import { BookingInterface } from "./BookingInterface";

export interface RoomTransferInterface {
    id: string;
    fromRoomId: string;
    fromRoom: RoomInterface;
    toRoomId: string;
    toRoom: RoomInterface;
    bookingId: string;
    booking: BookingInterface;
    transferDate: Date;
    reason?: string;
    transferFee?: number;
    status: string;
    approveBy?: string;
    approveAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

