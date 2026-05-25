import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Bell } from 'lucide-react';

const Navbar = () => {
    const { user } = useAuth();

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 right-0 left-64 z-10">
            <div className="px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                    Welcome to EIMS
                </h2>
                <div className="flex items-center gap-4">
                    <button className="text-gray-500 hover:text-gray-700">
                        <Bell className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">{user?.username}</p>
                            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;