import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, Calendar, DollarSign, LogOut, FileText, MapPin, User, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();

    const menuItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/employees', icon: Users, label: 'Employees' },
        { path: '/departments', icon: Building2, label: 'Departments' },
        { path: '/attendance', icon: Calendar, label: 'Attendance' },
        { path: '/salaries', icon: DollarSign, label: 'Salaries' },
        { path: '/reports', icon: FileText, label: 'Reports' },
    ];

    return (
        <div className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white h-screen fixed left-0 top-0 shadow-xl">
            {/* Logo Section */}
            <div className="p-6 border-b border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-xl font-bold">CA</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Classic Academy</h1>
                        <p className="text-xs text-gray-400">EIMS</p>
                    </div>
                </div>
                
                {/* Location Subtitle */}
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-400 border-t border-gray-700 pt-3">
                    <MapPin className="w-3 h-3" />
                    <span>Ntarabana Sector, Rulindo District</span>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="mt-6 px-3">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 ${
                                isActive ? 'bg-gray-700 text-white border-r-2 border-blue-500' : ''
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Footer - User Info & Logout */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
                <div className="flex items-center gap-3 mb-3 p-2 rounded-lg bg-gray-800">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-white">{user?.username || 'User'}</p>
                        <p className="text-xs text-gray-400 capitalize">{user?.role || 'Role'}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-all duration-200 w-full"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;