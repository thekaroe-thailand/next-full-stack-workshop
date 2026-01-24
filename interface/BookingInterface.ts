import { ElectricityLogInterface } from "./ElectricityLogInterface";
import { WaterLogInterface } from "./WaterLogInterface";

export interface BookingInterface {
    id: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    cardId: string;
    gender: string;
    roomId: string;
    remark: string;
    deposit: number;
    stayAt: Date;
    stayTo: Date;
    status: string;
    waterLogs: WaterLogInterface[];
    electricityLogs: ElectricityLogInterface[];
}