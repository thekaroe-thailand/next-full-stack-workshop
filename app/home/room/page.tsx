'use client';

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { RoomInterface } from '@/interface/RoomInterface';
import RoomTypeInterface from '@/interface/RoomTypeInterface';
import Button from '@/components/button';
import Modal from '@/components/ui/modal';

export default function Room() {
    const [rooms, setRooms] = useState<RoomInterface[]>([]);
    const [roomTypes, setRoomTypes] = useState<RoomTypeInterface[]>([]);
    const [roomTypeId, setRoomTypeId] = useState('');
    const [filterRoomTypeId, setFilterRoomTypeId] = useState('');
    const [id, setId] = useState('');
    const [isOpne, setIsOpen] = useState(false);
    const [totalRoom, setTotalRoom] = useState(0);
    const [towerName, setTowerName] = useState('');
    const [totalLevel, setTotalLevel] = useState(0);
}