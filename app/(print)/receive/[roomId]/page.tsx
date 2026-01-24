'use client';

import { RoomInterface } from "@/interface/RoomInterface";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { MoneyAddedInterface } from "@/interface/MoneyAddedInterface";

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
    const [moneyAdded, setMoneyAdded] = useState<MoneyAddedInterface[]>([]);

    useEffect(() => {
        fetchDataApartment();
        fetchDataRoom();
        fetchPrice();
        fetchMoneyAdded();
    }, []);

    const fetchMoneyAdded = async () => {
        const response = await fetch('/api/money-added/').then((res) => res.json());
        setMoneyAdded(response);
    }

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
        const moneyAddedTotal = moneyAdded.reduce((sum, item) => sum + item.amount, 0);

        return roomPrice + waterCost + electricityCost + moneyAddedTotal;
    }

    async function printDiv() {
        try {
            const payload = {
                roomId: roomId,
                bookingId: room?.bookings[0]?.id || '',
                waterUnit: room?.bookings[0]?.waterLogs[0]?.waterUnit || 0,
                waterPricePerUnit: price?.waterPricePerUnit || 0,
                electricityUnit: room?.bookings[0]?.electricityLogs[0]?.electricityUnit || 0,
                electricityPricePerUnit: price?.electricityPricePerUnit || 0,
                roomPrice: room?.roomType?.price || 0,
                additionalCosts: moneyAdded.map((item) => {
                    return {
                        name: item.name,
                        amount: item.amount,
                    };
                }),
            }
            const response = await fetch('/api/bills', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Failed to create bill');
            }
        } catch (error) {
            alert(error);
            return;
        }

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
                            padding-right: 0px;
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
                <header>
                    <h1><strong>ใบแจ้งค่าเช่า / ใบเสร็จรับเงิน</strong></h1>
                    <div className="apartment-info text-right">
                        <p><strong>หอพัก: </strong>{apartment?.name}</p>
                        <p>ที่อยู่: {apartment?.address}</p>
                        <p>โทร: {apartment?.phone}</p>
                        <p>อีเมล: {apartment?.email}</p>
                        <p>Line ID: {apartment?.lineId}</p>
                        <p>เลขผู้เสียภาษี: {apartment?.taxCode}</p>
                    </div>
                </header>

                <section className="info">
                    <div>
                        <p><strong>ผู้เช่า:</strong> {room?.bookings[0]?.customerName}</p>
                        <p><strong>ห้อง:</strong> {room?.name}</p>
                    </div>
                    <div>
                        <p><strong>เดือน:</strong> {currentMonth}</p>
                    </div>
                </section>

                <table className="table mt-3">
                    <thead>
                        <tr>
                            <th>รายการ</th>
                            <th style={{ textAlign: 'right' }}>จำนวน</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>ค่าเช่าห้อง</td>
                            <td className="text-right">
                                {room?.roomType?.price.toLocaleString()}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                ค่าน้ำ
                                (
                                {' '}
                                {room?.bookings[0]?.waterLogs[0].waterUnit} หน่วย
                                x
                                {' '}
                                {price?.waterPricePerUnit}
                                {' '}
                                บาท
                                )
                            </td>
                            <td className="text-right">
                                {calculateWaterCost().toLocaleString()}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                ค่าไฟ
                                (
                                {' '}
                                {room?.bookings[0]?.electricityLogs[0].electricityUnit} หน่วย
                                x
                                {' '}
                                {price?.electricityPricePerUnit}
                                {' '}
                                บาท
                                )
                            </td>
                            <td className="text-right">
                                {calculateElectricityCost().toLocaleString()}
                            </td>
                        </tr>
                        {moneyAdded.map((item) => (
                            <tr key={item.id}>
                                <td>{item.name}</td>
                                <td className="text-right">
                                    {item.amount.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <th>รวม</th>
                            <th className="text-right" style={{ textAlign: 'right' }}>
                                {calculateTotal().toLocaleString()}
                            </th>
                        </tr>
                    </tfoot>
                </table>

                <footer>
                    <div>
                        <p>ผู้รับเงิน</p>
                        <div className="sign"></div>
                    </div>
                    <div>
                        <p>ผู้จ่ายเงิน</p>
                        <div className="sign"></div>
                    </div>
                </footer>
            </div>

            {/* print button */}
            <div className="text-center mt-6">
                <button
                    onClick={() => printDiv()}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg"
                >
                    <i className="fas fa-print mr-2"></i>
                    พิมพ์เอกสาร
                </button>
            </div>

            <style jsx>
                {`
                        .receive-container {
                            margin: 0 auto;
                            padding: 20mm;
                            padding-top: 10mm;
                            background: #fff;
                            box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
                            box-sizing: border-box;
                        }

                        header {
                            padding: 20px;
                            padding-right: 0px;
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
                    `}
            </style>
        </div>
    )
}