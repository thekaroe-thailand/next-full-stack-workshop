'use client';

import Button from "@/components/button";
import { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import Modal from "@/components/ui/modal";
import { RoomInterface } from "@/interface/RoomInterface";
import RoomTypeInterface from "@/interface/RoomTypeInterface";
import { RoomTransferInterface } from "@/interface/RoomTransferInteface";

export default function RoomTransferPage() {
    const [isOpen, setIsOpen] = useState(false);
    const [transfers, setTransfers] = useState<RoomTransferInterface[]>([]);
    const [rooms, setRooms] = useState<RoomInterface[]>([]);
    const [roomTypes, setRoomTypes] = useState<RoomTypeInterface[]>([]);

    // form state
    const [fromRoomId, setFromRoomId] = useState('');
    const [toRoomId, setToRoomid] = useState('');
    const [bookingId, setBookingId] = useState('');
    const [transferDate, setTransferDate] = useState(new Date());
    const [transferFee, setTransferFee] = useState(0);
    const [reason, setReason] = useState('');

    useEffect(() => {
        fetchData();
        fetchRoomData();
    }, []);

    const fetchRoomData = async () => {
        try {
            const typesRes = await axios.get('/api/room-type');
            const types: RoomTypeInterface[] = typesRes.data;

            const roomPromises = types.map(type => axios.get('/api/room/list/' + type.id));
            const roomResponse = await Promise.all(roomPromises);
            const allRooms = roomResponse.flatMap(res => res.data);

            setRooms(allRooms);
        } catch (err) {
            Swal.fire({
                title: 'error',
                icon: 'error',
                text: (err as Error).message
            })
        }
    }

    const fetchData = async () => {
        try {
            const response = await axios.get('/api/room-transfers');
            setTransfers(response.data);
        } catch (err) {
            Swal.fire({
                title: 'error',
                icon: 'error',
                text: (err as Error).message
            })
        }
    }

    const clearForm = () => {
        setFromRoomId('');
        setToRoomid('');
        setBookingId('');
        setTransferDate(new Date());
        setTransferFee(0);
        setReason('');
    }

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            if (!fromRoomId || !toRoomId) {
                Swal.fire('Error', 'กรุณาเลือกห้องต้นทางและปลายทาง', 'error');
                return;
            }

            const payload = {
                fromRoomId: fromRoomId,
                toRoomId: toRoomId,
                bookingId: bookingId,
                transferDate: dayjs(transferDate).toISOString(),
                transferFee: transferFee,
                reason: reason
            }

            await axios.post('/api/room-transfers', payload);
            setIsOpen(false);

            Swal.fire({
                icon: 'success',
                title: 'บันทึกข้อมูลเรียบร้อย',
                timer: 1500
            });

            fetchData();
            fetchRoomData();
            clearForm();
        } catch (err) {
            Swal.fire({
                title: 'error',
                icon: 'error',
                text: (err as Error).message
            })
        }
    }

    const handleFromRoomChange = (roomId: string) => {
        setFromRoomId(roomId);

        const selectedRoom = rooms.find(r => r.id === roomId);

        if (selectedRoom && selectedRoom.bookings.length > 0) {
            setBookingId(selectedRoom.bookings[0].id);
        } else {
            setBookingId('');
        }
    }

    const handleComplete = async (id: string) => {
        const result = await Swal.fire({
            title: 'ยืนยันการย้ายห้อง',
            text: 'คุณต้องการบันทึกการบ้ายห้อง ใช่ไหม',
            icon: 'question',
            showConfirmButton: true,
            showCancelButton: true
        });

        if (result.isConfirmed) {
            try {
                await axios.put('/api/room-transfers/' + id, { status: 'completed' })
                Swal.fire('สำเร็จ', 'อัพเดตข้อมูลการย้ายห้องเรียบร้อยแล้ว', 'success');
                fetchData();
                fetchRoomData();
            } catch (err) {
                Swal.fire({
                    title: 'error',
                    icon: 'error',
                    text: (err as Error).message
                })
            }
        }
    }

    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            text: 'คุณต้องการยกเลิกรายการนี้ใช่หรือไม่',
            icon: 'question',
            title: 'ยกเลิกรายการ',
            showCancelButton: true,
            showConfirmButton: true
        })

        if (result.isConfirmed) {
            try {
                await axios.delete('/api/room-transfers/' + id);
                fetchData();
            } catch (err) {
                Swal.fire({
                    title: 'error',
                    icon: 'error',
                    text: (err as Error).message
                })
            }
        }
    }

    const occupiiedRooms = rooms.filter(r => r.statusEmpty === 'no');
    const emptyRooms = rooms.filter(r => r.statusEmpty !== 'no');

    return (
        <div className="p-5">
            <div className="flex flex-col justify-between items-start mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">ขอย้ายห้องพัก</h1>
                    <p className="text-gray-600">จัดการข้อมูลการย้ายห้องของผู้เข้าพัก</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" className="flex items-center gap-2 shadow-lg">
                        <i className="fa-solid fa-arrows-rotate"></i>
                        รีเฟรส
                    </Button>
                    <Button
                        onClick={() => {
                            setIsOpen(true);
                            clearForm();
                        }}
                        className="flex itesm-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg">
                        <i className="fa-solid fa-plus"></i>
                        เพิ่มรายการ
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b borer-gray-200">
                                <th className="p-4 font-semibold text-gray-700">ห้องเดิม</th>
                                <th className="p-4 font-semibold text-gray-700 text-center">
                                    <i className="fa-solid fa-right-left"></i>
                                </th>
                                <th className="p-4 font-semibold text-gray-700">ห้องใหม่</th>
                                <th className="p-4 font-semibold text-gray-700">วันที่ย้าย</th>
                                <th className="p-4 font-semibold text-gray-700 text-right">ค่าย้าย</th>
                                <th className="p-4 font-semibold text-gray-700">เหตุผล</th>
                                <th className="p-4 font-semibold text-gray-700">สถานะ</th>
                                <th className="p-4 font-semibold text-gray-700 text-center">
                                    จัดการ
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {transfers.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-12 text-gray-400 italic">
                                        ไม่พบข้อมูลการย้ายห้อง
                                    </td>
                                </tr>
                            ) : (
                                transfers.map((item, index) => (
                                    <tr key={item.id} className="border-b border-gray-50 hover:bg-blue-50/50">
                                        <td className="p-4">
                                            <div className="font-medium text-gray-900">{item.fromRoom?.name}</div>
                                            <div className="text-md text-gray-500">{item.fromRoom?.roomType?.name}</div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <i className="fa fa-arrow-right"></i>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-gray-900">{item.toRoom?.name}</div>
                                            <div className="text-md text-gray-500">{item.toRoom?.roomType.name}</div>
                                        </td>
                                        <td className="p-4">{dayjs(item.transferDate).format('DD/MM/YYYY')}</td>
                                        <td className="p-4 text-right">{item.transferFee?.toLocaleString()}</td>
                                        <td className="p-4">{item.reason || '-'}</td>
                                        <td className="p-4">
                                            {item.status === 'pending' ? 'รอดำเนินการ' : 'สำเร็จ'}
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex gap-2">
                                                {item.status === 'pending' && (
                                                    <Button
                                                        onClick={() => handleComplete(item.id)}
                                                        className="text-green-600 bg-white border-green-600 border
                                                        hover:bg-green-600 hover:text-white
                                                    ">
                                                        <i className="fa-solid fa-circle-check"></i>
                                                        ยืนยัน
                                                    </Button>
                                                )}
                                                <Button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="text-red-600 bg-white border-red-600 border
                                                    hover:bg-red-600 hover:text-white
                                                ">
                                                    ยกเลิก
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            <Modal title="สร้างรายการย้ายห้อง" isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <form onSubmit={handleSave} className="space-y-6 py-2">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="items-center gap-2 flex">
                                <i className="fa-solid fa-magnifying-glass text-blue-500"></i>
                                ห้องต้นทาง (ห้องที่ไม่ว่าง)
                            </label>
                            <select className="input-modal"
                                value={fromRoomId}
                                onChange={(e) => handleFromRoomChange(e.target.value)}
                            >
                                <option>--- เลือกห้อง ---</option>
                                {occupiiedRooms.map(r => (
                                    <option key={r.id} value={r.id}>
                                        {r.name} - {r.bookings[0]?.customerName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="items-center gap-2 flex">
                                <i className="fa-solid fa-magnifying-glass text-green-500"></i>
                                ห้องปลายทาง (ห้องว่าง)
                            </label>
                            <select className="input-modal"
                                value={toRoomId}
                                onChange={(e) => setToRoomid(e.target.value)}
                            >
                                <option>--- เลือกห้อง ---</option>
                                {emptyRooms.map(r => (
                                    <option key={r.id} value={r.id}>
                                        {r.name} - {r.roomType.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2">
                                <i className="fa-solid fa-calendar text-purple-500"></i>
                                วันที่ย้าย
                            </label>
                            <input type="date" className="input-modal" required
                                value={dayjs(transferDate).format('YYYY-MM-DD')}
                                onChange={(e) => setTransferDate(new Date(e.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="flex itesm-center gap-2">
                                <i className="fa-solid fa-credit-card text-emerald-500"></i>
                                ค่าย้าย
                            </label>
                            <input type="number" className="input-modal" placeholder="0"
                                value={transferFee}
                                onChange={(e) => setTransferFee(Number(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label>
                            เหตุผล
                        </label>
                        <textarea className="input-modal min-h-20"
                            value={reason} onChange={(e) => setReason(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end border-t border-gray-400 pt-4 gap-1">
                        <Button type="button" variant="secondary"
                            onClick={() => setIsOpen(false)} className="border border-gray-400">
                            <i className="fa fa-times"></i>
                            ยกเลิก
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <i className="fa fa-check"></i>
                            ยืนยันการย้ายห้อง
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

