import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, Lock, Mail, ArrowRight, Eye, EyeOff, School } from 'lucide-react';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    // Login form state
    const [loginData, setLoginData] = useState({
        username: '',
        password: ''
    });

    // Register form state
    const [registerData, setRegisterData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'employee'
    });

    // Forgot password state
    const [forgotData, setForgotData] = useState({
        email: ''
    });

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        const success = await login(loginData.username, loginData.password);
        setLoading(false);
        
        if (success) {
            navigate('/dashboard');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        
        if (registerData.password !== registerData.confirmPassword) {
            toast.error('Passwords do not match!');
            return;
        }

        if (registerData.password.length < 6) {
            toast.error('Password must be at least 6 characters!');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: registerData.username,
                    email: registerData.email,
                    password: registerData.password,
                    role: registerData.role
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                toast.success('Registration successful! Please login.');
                setIsLogin(true);
                setRegisterData({
                    username: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    role: 'employee'
                });
            } else {
                toast.error(data.message || 'Registration failed');
            }
        } catch (error) {
            toast.error('Error during registration');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        // Simulate password reset (you'll need to implement this on backend)
        toast.success(`Password reset link sent to ${forgotData.email}`);
        setShowForgotPassword(false);
        setForgotData({ email: '' });
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full filter blur-3xl opacity-20"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full filter blur-3xl opacity-20"></div>
            </div>

            {/* Main Container */}
            <div className="relative z-10 w-full max-w-md">
                {/* Logo and Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-4">
                        <School className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Classic Academy</h1>
                    <p className="text-blue-200">Employee Information Management System</p>
                </div>

                {/* Toggle Buttons */}
                {!showForgotPassword && (
                    <div className="flex gap-2 mb-6 bg-white/10 backdrop-blur-sm rounded-lg p-1">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2 rounded-md transition-all duration-200 ${
                                isLogin 
                                    ? 'bg-blue-600 text-white shadow-lg' 
                                    : 'text-gray-300 hover:text-white'
                            }`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2 rounded-md transition-all duration-200 ${
                                !isLogin 
                                    ? 'bg-blue-600 text-white shadow-lg' 
                                    : 'text-gray-300 hover:text-white'
                            }`}
                        >
                            Sign Up
                        </button>
                    </div>
                )}

                {/* Login Form */}
                {isLogin && !showForgotPassword && (
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
                        <form onSubmit={handleLogin}>
                            <div className="mb-6">
                                <label className="block text-white text-sm font-semibold mb-2">
                                    Username
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={loginData.username}
                                        onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter your username"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-white text-sm font-semibold mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={loginData.password}
                                        onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                                        className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter your password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5 text-gray-400" />
                                        ) : (
                                            <Eye className="w-5 h-5 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="text-right mb-6">
                                <button
                                    type="button"
                                    onClick={() => setShowForgotPassword(true)}
                                    className="text-sm text-blue-300 hover:text-blue-200 transition"
                                >
                                    Forgot Password?
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                                {!loading && <ArrowRight className="w-5 h-5" />}
                            </button>
                        </form>
                    </div>
                )}

                {/* Register Form */}
                {!isLogin && !showForgotPassword && (
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
                        <form onSubmit={handleRegister}>
                            <div className="mb-4">
                                <label className="block text-white text-sm font-semibold mb-2">
                                    Username
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={registerData.username}
                                        onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Choose a username"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-white text-sm font-semibold mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={registerData.email}
                                        onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="your@email.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-white text-sm font-semibold mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={registerData.password}
                                        onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                                        className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Create a password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5 text-gray-400" />
                                        ) : (
                                            <Eye className="w-5 h-5 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-white text-sm font-semibold mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={registerData.confirmPassword}
                                        onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Confirm your password"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-white text-sm font-semibold mb-2">
                                    Role
                                </label>
                                <select
                                    value={registerData.role}
                                    onChange={(e) => setRegisterData({...registerData, role: e.target.value})}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="employee" className="bg-gray-900">Employee</option>
                                    <option value="manager" className="bg-gray-900">Manager</option>
                                    <option value="hr" className="bg-gray-900">HR</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? 'Creating Account...' : 'Sign Up'}
                                {!loading && <ArrowRight className="w-5 h-5" />}
                            </button>
                        </form>
                    </div>
                )}

                {/* Forgot Password Form */}
                {showForgotPassword && (
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
                        <h2 className="text-2xl font-bold text-white mb-4">Reset Password</h2>
                        <p className="text-blue-200 text-sm mb-6">
                            Enter your email address and we'll send you a link to reset your password.
                        </p>
                        
                        <form onSubmit={handleForgotPassword}>
                            <div className="mb-6">
                                <label className="block text-white text-sm font-semibold mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={forgotData.email}
                                        onChange={(e) => setForgotData({email: e.target.value})}
                                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="your@email.com"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold disabled:opacity-50"
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowForgotPassword(false)}
                                className="w-full mt-3 text-blue-300 hover:text-blue-200 text-sm transition"
                            >
                                Back to Sign In
                            </button>
                        </form>
                    </div>
                )}

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-blue-200 text-xs">
                        © 2026 Classic Academy School. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;