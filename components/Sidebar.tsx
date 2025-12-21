'use client';

import Link from 'next/link';

export default function Sidebar() {
    return (
        <div className="w-84 h-screen bg-gray-800 text-white">
            <div className="p-4 text-center bg-gray-900">
                <div className="text-2xl font-bold">jApartment 1.0</div>
                <div className="text-xl mt-2">โปรแกรมบริหารงานหอพัก</div>
            </div>
            <nav className="p-5">
                <ul className="sidebar-menu">
                    <li>
                        <Link href="/home/apartment" className="flex items-center gap-2">
                            <i className="fa-solid fa-house w-7"></i>
                            <span>ข้อมูลหอพัก</span>
                        </Link>
                    </li>
                    <li>
                        <Link href="/home/room-type" className="flex items-center gap-2">
                            <i className="fa-solid fa-bed w-7"></i>
                            <span>ประเภทห้องพัก</span>
                        </Link>
                    </li>
                    <li>
                        <Link href="/home/room" className="flex items-center gap-2">
                            <i className="fa-solid fa-box w-7"></i>
                            <span>ห้องพัก</span>
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    )
}