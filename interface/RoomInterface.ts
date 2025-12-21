import RoomTypeInterface from './RoomTypeInterface';

export interface RoomInterface {
    id: string;
    name: string;
    towerName: string;
    totalLevel: number;
    totalRoom: number;
    roomTypeId: string;
    roomType: RoomTypeInterface;
    remark: string;
    status: string;
    statusEmpty: string;
    createdAt: Date;
    updatedAt: Date;
}