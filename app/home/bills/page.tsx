'use client';

import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Button from "@/components/button";
import Modal from "@/components/ui/modal";

interface Bill {
    id: string;
    roomId: string;
    bookingId: string;
    billDate: string;
    totalAmount: number;
    waterUnit: number;
    electricityUnit: number;
    waterCost: number;
    electricityCost: number;
    roomPrice: number;
    additionalCost: number;
    status: string;
    room: {
        id: string;
        name: string;
    },
    booking: {
        id: string;
        customerName: string;
    },
    billItems: {
        id: string;
        name: string;
        amount: number;
        type: string;
    }[],
}

export default function BillsPage() {
    const [bills, setBills] = useState<Bill[]>([]);
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
    const [paymentDate, setPaymentDate] = useState<string>('');
    const [lateFee, setLateFee] = useState<number>(0);
    const [isOpen, setIsOpen] = useState(false);

    const fetchData = async () => {
        try {
            const response = await axios.get('/api/bills');
            setBills(response.data);
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: (error as Error).message,
                icon: 'error',
            });
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleReceivePayment = async (bill: Bill) => {
        setSelectedBill(bill);
        setLateFee(0);
        setPaymentDate(new Date().toISOString().split('T')[0]);
        setIsOpen(true);
    };

    const handleSubmitPayment = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!selectedBill) return;

        try {
            const payload = {
                billId: selectedBill.id,
                paymentDate: paymentDate,
                lateFee: lateFee,
                status: 'paid',
            }
            await axios.put(`/api/bills/${selectedBill?.id}`, payload);
            fetchData();
            setIsOpen(false);
            setSelectedBill(null);
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: (error as Error).message,
                icon: 'error',
            })
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
                return 'text-green-600 bg-green-100';
            case 'pending':
                return 'text-yellow-600 bg-yellow-100';
            case 'overdue':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'paid':
                return 'ชำระแล้ว';
            case 'pending':
                return 'รอชำระ';
            case 'overdue':
                return 'เกินกำหนด';
            default:
                return status;
        }
    };

    const formateDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }

    return (
        <div>
            <h1 className="text-2xl font-semibold">
                <i className="fa-solid fa-file-invoice w-7"></i>
                รายการบิล
            </h1>

            <table className="table mt-3">
                <thead>
                    <tr>
                        <th className="text-left">ห้อง</th>
                        <th className="text-left">ลูกค้า</th>
                        <th className="text-left">วันที่</th>
                        <th className="text-right">ยอดเงิน</th>
                        <th className="text-center">สถานะ</th>
                        <th className="text-center w-[150px]">การดำเนินการ</th>
                    </tr>
                </thead>
                <tbody>
                    {bills.map((bill) => (
                        <tr key={bill.id}>
                            <td>{bill.room.name}</td>
                            <td>{bill.booking.customerName}</td>
                            <td>{formateDate(bill.billDate)}</td>
                            <td className="text-right">{bill.totalAmount.toLocaleString()}</td>
                            <td className={getStatusColor(bill.status) + ' text-center'}>
                                {getStatusText(bill.status)}
                            </td>
                            <td className="text-center">
                                <Button onClick={() => handleReceivePayment(bill)}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <i className="fa fa-money-bill mr-2"></i>
                                    รับชำระ
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="รับชำระเงิน"
            >
                <form onSubmit={handleSubmitPayment}>
                    <div className="flex flex-col gap-2">
                        <label className="text-xl">ข้อมูลบิล</label>
                        <div className="bg-gray-100 p-2 rounded shadow-lg mb-5 
                            border border-gray-400">
                            <p><strong>ห้องพัก:</strong> {selectedBill?.room.name}</p>
                            <p><strong>ลูกค้า:</strong> {selectedBill?.booking.customerName}</p>
                            <p><strong>ยอดเงิน:</strong> {selectedBill?.totalAmount.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">วันที่ชำระ</label>
                        <input
                            type="date"
                            className="input-modal w-full"
                            value={paymentDate}
                            onChange={(e) => setPaymentDate(e.target.value)} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">ค่าปรับ</label>
                        <input
                            type="number"
                            className="input-modal w-full"
                            value={lateFee}
                            onChange={(e) => setLateFee(Number(e.target.value))} />
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="btn btn-primary">รับชำระ</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
