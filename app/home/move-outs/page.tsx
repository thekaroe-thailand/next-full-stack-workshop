'use client';

import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import Modal from "@/components/ui/modal";
import Button from "@/components/button";
import RoomTypeInterface from "@/interface/RoomTypeInterface";
import { RoomInterface } from "@/interface/RoomInterface";
import { MoveOutInterface } from "@/interface/MoveOutInterface";

export default function RoomOut() {
    const [moveOuts, setMoveOuts] = useState<MoveOutInterface[]>([]);
    const [rooms, setRooms] = useState<RoomInterface[]>([]);
    const [roomTypes, setRoomTypes] = useState<RoomTypeInterface[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    // Form state
    const [roomId, setRoomId] = useState('');
    const [bookingId, setBookingId] = useState('');
    const [moveOutDate, setMoveOutDate] = useState(new Date());
    const [reason, setReason] = useState('');
    const [depositReturn, setDepositReturn] = useState(0);
    const [refund, setRefund] = useState(0);

    const clearForm = () => {
        setRoomId('');
        setBookingId('');
        setMoveOutDate(new Date());
        setReason('');
        setDepositReturn(0);
        setRefund(0);
    }

    useEffect(() => {
        fetchData();
        fetchRoomData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get('/api/move-outs')
            setMoveOuts(response.data);
        } catch (error) {
            Swal.fire({
                title: 'error',
                text: (error as Error).message,
                icon: 'error'
            })
        }
    }

    const fetchRoomData = async () => {
        try {
            const typesRes = await axios.get('/api/room-type');
            setRoomTypes(typesRes.data);

            const roomPromise = typesRes.data.map((type: any) => axios.get('/api/room/list/' + type.id));
            const roomResponse = await Promise.all(roomPromise);
            const allRooms = roomResponse.flatMap(res => res.data);

            setRooms(allRooms);
        } catch (error) {
            Swal.fire({
                title: 'error',
                text: (error as Error).message,
                icon: 'error'
            })
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const payload = {
                roomId,
                bookingId,
                moveOutDate: dayjs(moveOutDate).toISOString(),
                reason,
                depositReturn,
                refund // ค่าปรับ
            }
            await axios.post('/api/move-outs', payload);

            Swal.fire({
                icon: 'success',
                title: 'บันทึกข้อมูล',
                text: 'บันทึกข้อมูลสำเร็จ',
                timer: 1000
            })

            setIsOpen(false);
            fetchData();
            clearForm();
        } catch (error) {
            Swal.fire({
                title: 'error',
                text: (error as Error).message,
                icon: 'error'
            })
        }
    }

    const handleRoomChange = (roomId: string) => {
        setRoomId(roomId);

        const selectedRoom = rooms.find(r => r.id === roomId);

        if (selectedRoom && selectedRoom.bookings.length > 0) {
            setBookingId(selectedRoom.bookings[0].id);
        } else {
            setBookingId('');
        }
    }

    const handleComplete = async (id: string) => {
        try {
            const result = await Swal.fire({
                title: 'ยืนยันการย้ายออก?',
                text: 'ระบบจะเปลี่ยนสถานะห้องเป็นว่างอัตโนมัติ',
                icon: 'question',
                showCancelButton: true,
                showConfirmButton: true
            });

            if (result.isConfirmed) {
                await axios.put('/api/move-outs/' + id, { status: 'completed' });
                fetchData();
                fetchRoomData();
            }
        } catch (error) {
            Swal.fire({
                title: 'error',
                text: (error as Error).message,
                icon: 'error'
            })
        }
    }

    const handleDelete = async (id: string) => {
        try {
            const result = await Swal.fire({
                title: 'คุณต้องการลบรายการนี้ใช่หรือไม่?',
                text: 'หากรายการสำเร็จแล้ว ระบบจะคืนค่าสถานะห้องพักให้ด้วย',
                icon: 'question',
                showCancelButton: true,
                showConfirmButton: true
            });

            if (result.isConfirmed) {
                await axios.delete('/api/move-outs/' + id);
                fetchData();
                fetchRoomData();
            }
        } catch (error) {
            Swal.fire({
                title: 'error',
                text: (error as Error).message,
                icon: 'error'
            })
        }
    }

    const occupiiedRooms = rooms.filter(r => r.statusEmpty === 'no');

    return (
        <div className="p-6">
            <div className="flex flex-col justify-between items-start mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-700">แจ้งย้ายออก</h1>
                    <p className="text-gray-600">จัดการข้อมูลการย้ายออกจากหอพัก</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => { }}
                        className="flex items-center gap-2 shadow-md">
                        <i className="fa-solid fa-arrows-rotate"></i>
                        รีเฟรส
                    </Button>
                    <Button
                        onClick={() => {
                            clearForm();
                            setIsOpen(true);
                        }}
                        className="flex items-center gap-2 bg-blue-600 
                    hover:bg-blue-700 shadow-md">
                        <i className="fa-solid fa-plus"></i>
                        เพิ่มรายการ
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                <div className="overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="p-4 text-gray-700 font-semibold">ห้องพัก</th>
                                <th className="p-4 text-gray-700 font-semibold">ผู้เข้าพัก</th>
                                <th className="p-4 text-gray-700 font-semibold text-center">วันที่ย้ายออก</th>
                                <th className="p-4 text-gray-700 font-semibold text-right">คืนเงินมัดจำ</th>
                                <th className="p-4 text-gray-700 font-semibold text-right">ค่าใช้จ่ายค้างชำระ</th>
                                <th className="p-4 text-gray-700 font-semibold text-center">สถานะ</th>
                                <th className="p-4 text-gray-700 font-semibold text-center">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {moveOuts.map((item) => (
                                <tr key={item.id}>
                                    <td className="p-4">
                                        <div>{item.room?.name}</div>
                                        <div>{item.room?.roomType?.name}</div>
                                    </td>
                                    <td className="p-4">
                                        <div>{item.booking?.customerName}</div>
                                        <div>{item.booking?.customerPhone}</div>
                                    </td>
                                    <td className="p-4 text-center">
                                        {dayjs(item.moveOutDate).format('DD/MM/YYYY')}
                                    </td>
                                    <td className="p-4 text-right">
                                        {item.despositReturn?.toLocaleString()}
                                    </td>
                                    <td className="p-4 text-right">
                                        {item.refun?.toLocaleString()}
                                    </td>
                                    <td className="p-4 text-center">
                                        {item.status === 'pending' ? 'รอดำเนินการ' : 'สำเร็จ'}
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex gap-2">
                                            {item.status === 'pending' &&
                                                <button onClick={() => handleComplete(item.id)}
                                                    className="text-green-600 flex gap-2 items-center 
                                                    border border-green-700 px-4 py-2 rounded-full
                                                    hover:bg-green-600 hover:text-white cursor-pointer
                                                ">
                                                    <i className="fa-solid fa-circle-check"></i>
                                                    อนุมัติ
                                                </button>
                                            }
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="text-red-600 flex gap-2 items-center 
                                                border border-red-700 px-4 py-2 rounded-full
                                                hover:bg-red-600 hover:text-white cursor-pointer
                                            ">
                                                <i className="fa fa-trash"></i>
                                                ยกเลิก
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal title="แจ้งย้ายออก" isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <form onSubmit={handleSave} className="space-y-6 py-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex itesm-center
                            gap-2
                        ">
                            <i className="fa-solid fa-door-open text-blue-500"></i>
                            เลือกห้องพัก
                        </label>
                        <select className="input-modal" value={roomId} required
                            onChange={(e) => handleRoomChange(e.target.value)}
                        >
                            <option value="">--- เลือกห้อง ---</option>
                            {occupiiedRooms.map(item => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                    {' '}
                                    {item.bookings[0]?.customerName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <i className="fa-solid fa-calendar text-purple-500"></i>
                                วันที่ย้ายออก
                            </label>
                            <input
                                className="input-modal"
                                type="date"
                                value={dayjs(moveOutDate).format('YYYY-MM-DD')}
                                onChange={(e) => setMoveOutDate(new Date(e.target.value))}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <i className="fa-solid fa-money-bill-transfer text-green-500"></i>
                                คืนเงินมัดจำ
                            </label>
                            <input
                                type="number"
                                value={depositReturn}
                                onChange={(e) => setDepositReturn(Number(e.target.value))}
                                className="input-modal text-right"
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <i className="fa-solid fa-file-invoice-dollar text-red-500"></i>
                                    ค่าปรับ
                                </label>
                                <input
                                    className="input-modal text-right"
                                    type="number"
                                    value={refund}
                                    onChange={(e) => setRefund(Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                เหตุผลประกอบการย้ายออก
                            </label>
                            <textarea
                                className="input-modal h-20"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="ระบุเหตุผลในการย้ายออก..." />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-300">
                        <Button type="button" variant="secondary" className="shadow-md border"
                            onClick={() => setIsOpen(false)}
                        >
                            ยกเลิก
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <i className="fa-solid fa-check"></i>
                            ยืนยัน
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}