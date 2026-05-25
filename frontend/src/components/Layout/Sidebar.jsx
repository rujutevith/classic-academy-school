import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, Calendar, DollarSign, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const { logout } = useAuth();

    const menuItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/employees', icon: Users, label: 'Employees' },
        { path: '/departments', icon: Building2, label: 'Departments' },
        { path: '/attendance', icon: Calendar, label: 'Attendance' },
        { path: '/salaries', icon: DollarSign, label: 'Salaries' },
    ];

    return (
        <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0">
            <div className="p-6">
                <h1 className="text-xl font-bold">Classic Academy</h1>
                <p className="text-sm text-gray-400 mt-1">EIMS</p>
            </div>
            <nav className="mt-8">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition ${
                                isActive ? 'bg-gray-800 text-white border-r-4 border-blue-500' : ''
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition w-full mt-4"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </nav>
        </div>
    );
};

export default Sidebar;