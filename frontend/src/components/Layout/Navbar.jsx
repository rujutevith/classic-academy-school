import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Bell, LogOut, Settings, ChevronDown, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        setIsDropdownOpen(false);
        logout();
    };

    const handleProfile = () => {
        setIsDropdownOpen(false);
        alert('Profile Information:\n' +
              `Username: ${user?.username}\n` +
              `Role: ${user?.role}\n` +
              `Email: ${user?.email || 'Not set'}`);
    };

    const getRoleColor = (role) => {
        switch(role) {
            case 'admin': return 'bg-red-500';
            case 'hr': return 'bg-green-500';
            case 'manager': return 'bg-blue-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <nav className="bg-white shadow-md border-b border-gray-200 fixed top-0 right-0 left-64 z-10 h-14">
            <div className="px-4 py-2 flex justify-between items-center h-full">
                {/* Page Title - Simplified */}
                <div>
                    <h2 className="text-base font-semibold text-gray-800">
                        Welcome, {user?.username || 'Guest'}!
                    </h2>
                </div>

                {/* Right Side - Notifications & Profile */}
                <div className="flex items-center gap-3">
                    {/* Notifications Button */}
                    <button className="relative text-gray-500 hover:text-gray-700 transition p-1.5 rounded-full hover:bg-gray-100">
                        <Bell className="w-4 h-4" />
                        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* Profile Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1 transition"
                        >
                            <div className="relative">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${getRoleColor(user?.role)}`}>
                                    <User className="w-3.5 h-3.5 text-white" />
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>
                            <div className="text-left hidden md:block">
                                <p className="text-xs font-medium text-gray-700">{user?.username}</p>
                                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                            </div>
                            <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getRoleColor(user?.role)}`}>
                                            <User className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{user?.username}</p>
                                            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="py-1">
                                    <button
                                        onClick={handleProfile}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                                    >
                                        <User className="w-4 h-4" />
                                        <span>My Profile</span>
                                    </button>
                                    <hr className="my-1 border-gray-200" />
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;