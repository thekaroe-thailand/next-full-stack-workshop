'use client';

import { RoomInterface } from "@/interface/RoomInterface";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

const currentMonth = new Date().toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });

interface Apartment {
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    lineId: string;
    taxCode: string;
}

interface WaterAndElectricityPrice {
    id: string;
    waterPricePerUnit: number;
    electricityPricePerUnit: number;
}

export default function ReceivePage() {
    const params = useParams();
    const roomId = params.roomId;

    const [apartment, setApartment] = useState<Apartment>();
    const [room, setRoom] = useState<RoomInterface>();
    const [price, setPrice] = useState<WaterAndElectricityPrice>();

    useEffect(() => {
        fetchDataApartment();
        fetchDataRoom();
        fetchPrice();
    }, []);

    const fetchDataApartment = async () => {
        const response = await fetch('/api/apartment').then((res) => res.json());
        setApartment(response);
    }

    const fetchDataRoom = async () => {
        const response = await fetch('/api/room/' + roomId).then((res) => res.json());
        setRoom(response);
    }

    const fetchPrice = async () => {
        const response = await fetch('/api/water-and-electricity-price').then((res) => res.json());
        setPrice(response);
    }

    const calculateWaterCost = () => {
        if (!room?.bookings?.[0]?.waterLogs?.[0] || !price) return 0;
        const currentWaterUnit = room.bookings[0].waterLogs[0].waterUnit;
        return currentWaterUnit * price.waterPricePerUnit;
    }

    const calculateElectricityCost = () => {
        if (!room?.bookings?.[0]?.electricityLogs?.[0] || !price) return 0;
        const currentElectricityUnit = room.bookings[0].electricityLogs[0].electricityUnit;
        return currentElectricityUnit * price.electricityPricePerUnit;
    }

    const calculateTotal = () => {
        const roomPrice = room?.roomType?.price ?? 0;
        const waterCost = calculateWaterCost();
        const electricityCost = calculateElectricityCost();
        return roomPrice + waterCost + electricityCost;
    }

    function printDiv() {
        const content = document.getElementById('page')?.innerHTML;
        if (!content) return;

        const win = window.open('', '', 'width: 900, height: 1200');
        if (!win) return;

        win.document.write(`
            <!DOCTYPE html>
            <html lang="th">
                <head>
                    <meta charset="UTF-8">
                    <title>ใบแจ้งค่าเช่า</title>
                    <style>
                        @import url('https://fonts.googlepis.com/css2?family=Sarabun:sght@400;600;700&display=swap');
                        body {
                            font-family: 'Sarabun', Arial, sans-serif;
                            margin: 0;
                            padding: 0;
                            background: #f4f4f4;
                            color: #222;
                        }

                        .receive-container {
                            width: 210mm;
                            min-height: 297mm;
                            margin: 0 auto;
                            padding: 20mm;
                            background: #fff;
                            box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
                            box-sizing: border-box;
                        }

                        header {
                            padding: 20px;
                            border-radius: 8px 8px 0 0;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 20px;
                        }

                        header h1 {
                            margin: 0;
                            font-size: 22px;
                        }

                        .apartment-info p {
                            margin: 2px 0;
                            font-size: 14px;
                            line-height: 1.4;
                        }

                        .info {
                            display: flex;
                            justify-content: space-between;
                            margin-bottom: 20px;
                            font-size: 14px;
                        }

                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 20px;
                            font-size: 14px;
                        }

                        table th, table td {
                            border: 1px solid #333;
                            padding: 10px; 
                        }

                        table th {
                            background-color: #e9ecef;
                            font-weight: 700;
                            text-align: left;
                        }

                        table tbody tr:nth-child(even) {
                            background-color: #f9f9fa;
                        }

                        table tfoot th, table tfoot td {
                            background-color: #dee2e6;
                            font-weight: 700;
                            font-size: 15px;
                        }

                        .text-right {
                            text-align: right;
                        }

                        footer {
                            display: flex;
                            justify-content: space-between;
                            margin-top: 50px;
                            font-size: 14px;
                        }

                        .sign {
                            width: 200px;
                            text-align: center;
                            border-top: 1px solid #000;
                            padding-top: 6px;
                            margin-top: 40px;
                        }

                        @page {
                            size: A4;
                            margin: 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="receive-container">
                        ${content}

                        <script>
                            window.onload = function() {
                                window.print();
                                window.close();
                            }
                        </script>
                    </div>
                </body>
            </html>
        `);

        win.document.close();
    }

    return (
        <div className="min-h-screen py-8">
            <div id="page" className="receive-container bg-white p-6 mx-auto shadow-lg rounded-lg" style={{ width: '794px' }}>

            </div>
        </div>
    )
}