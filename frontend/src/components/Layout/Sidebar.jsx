import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, Calendar, DollarSign, LogOut, FileText, MapPin, User } from 'lucide-react';
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
        <div className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white h-screen fixed left-0 top-0 shadow-xl flex flex-col">
            {/* Logo Section */}
            <div className="p-4 border-b border-gray-700">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold">CA</span>
                    </div>
                    <div>
                        <h1 className="text-sm font-bold">Classic Academy</h1>
                        <p className="text-xs text-gray-400">EIMS</p>
                    </div>
                </div>
            </div>

            {/* Navigation Menu - Fixed NavLink className */}
            <nav className="flex-1 mt-3 px-2 overflow-y-auto">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-2 px-3 py-2 rounded-lg mb-1 text-gray-300 transition-all duration-200 text-sm group ${
                                isActive 
                                    ? 'bg-indigo-600 text-white shadow-md' 
                                    : 'hover:bg-indigo-500 hover:text-white hover:shadow-md'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-105 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                                <span>{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom Section - Location and User Info */}
            <div className="border-t border-gray-700 mt-auto">
                {/* Location - Above user section */}
                <div className="p-3 border-b border-gray-700">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <MapPin className="w-3 h-3 text-indigo-400" />
                        <span>Ntarabana Sector, Rulindo District</span>
                    </div>
                </div>

                {/* User Info & Logout */}
                <div className="p-3">
                    <div className="flex items-center gap-2 mb-2 p-1.5 rounded-lg bg-gray-700 hover:bg-indigo-600 transition-colors duration-200 cursor-pointer group">
                        <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center group-hover:bg-white transition-colors duration-200">
                            <User className="w-3 h-3 text-white group-hover:text-indigo-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-medium text-white">{user?.username || 'User'}</p>
                            <p className="text-xs text-gray-400 capitalize group-hover:text-indigo-200 transition-colors duration-200">{user?.role || 'Role'}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-all duration-200 w-full text-sm group"
                    >
                        <LogOut className="w-4 h-4 transition-transform duration-200 group-hover:scale-105" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;