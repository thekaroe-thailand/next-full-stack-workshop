'use client';

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import Button from '@/components/button';
import Modal from '@/components/ui/modal';
import RoomTypeInterface from '@/interface/RoomTypeInterface';

export default function RoomTypePage() {
    const [roomTypes, setRoomTypes] = useState<RoomTypeInterface[]>([]);
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [remark, setRemark] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get('/api/room-type');
            const data = await response.data;
            setRoomTypes(data);
        } catch (error) {
            Swal.fire({
                title: 'error',
                text: (error as Error).message,
                icon: 'error'
            })
        }
    }

    const handleSave = async (form: React.FormEvent<HTMLFormElement>) => {
        form.preventDefault();

        try {
            const payload = {
                name: name,
                price: price,
                remark: remark
            }

            if (id) {
                await axios.put('/api/room-type/' + id, payload);
            } else {
                await axios.post('/api/room-type', payload);
            }

            fetchData();
            setIsOpen(false);
            clearForm();
        } catch (error) {
            Swal.fire({
                title: 'error',
                text: (error as Error).message,
                icon: 'error'
            })
        }
    }

    const clearForm = () => {
        setId('');
        setName('');
        setPrice(0);
        setRemark('');
    }

    const handleDelete = async (id: string) => {
        try {
            const buttonConfirm = await Swal.fire({
                icon: 'question',
                title: 'Are you sure?',
                text: 'delete',
                showCancelButton: true,
                showConfirmButton: true
            })

            if (!buttonConfirm.isConfirmed) return;

            await axios.delete('/api/room-type/' + id);
            fetchData();
        } catch (error) {
            Swal.fire({
                title: 'error',
                text: (error as Error).message,
                icon: 'error'
            })
        }
    }

    return (
        <div>
            <h1 className="text-2xl font-semibold">ประเภทห้องพัก</h1>
            <Button onClick={() => {
                clearForm();
                setIsOpen(true);
            }}>
                <i className="fa fa-plus"></i>
                เพิ่มรายการ
            </Button>

            <table className="table mt-2">
                <thead>
                    <tr>
                        <th>ชื่อประเภทห้องพัก</th>
                        <th>ราคา</th>
                        <th>หมายเหตุ</th>
                        <th className="w-24"></th>
                    </tr>
                </thead>
                <tbody>
                    {roomTypes.map((roomType) => (
                        <tr key={roomType.id}>
                            <td>{roomType.name}</td>
                            <td>{roomType.price}</td>
                            <td>{roomType.remark}</td>
                            <td>
                                <div className="flex gap-1">
                                    <Button onClick={() => {
                                        setId(roomType.id);
                                        setName(roomType.name);
                                        setPrice(roomType.price);
                                        setRemark(roomType.remark!);
                                        setIsOpen(true);
                                    }}>
                                        <i className="fa fa-pencil"></i>
                                        แก้ไข
                                    </Button>
                                    <Button variant='destructive' onClick={() => handleDelete(roomType.id)}>
                                        <i className="fa fa-times"></i>
                                        ลบ
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title='เพิ่มประเภทห้องพัก'>
                <div>
                    <form onSubmit={handleSave}>
                        <div className="mb-3">
                            <label>ชื่อประเภทห้องพัก</label>
                            <input type="text" className="input-modal" value={name}
                                onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="mb-3">
                            <label>ราคา</label>
                            <input type="number" className="input-modal" value={price}
                                onChange={(e) => setPrice(Number(e.target.value))} />
                        </div>
                        <div className="mb-3">
                            <label>หมายเหตุ</label>
                            <textarea className="input-modal" value={remark}
                                onChange={(e) => setRemark(e.target.value)}></textarea>
                        </div>
                        <Button type="submit">
                            <i className="fa fa-check"></i>
                            บันทึก
                        </Button>
                    </form>
                </div>
            </Modal>
        </div>
    )

}