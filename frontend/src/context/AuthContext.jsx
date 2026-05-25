import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as loginApi, getProfile } from '../services/api';
import toast from 'react-hot-toast';

// Create context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Auth Provider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        console.log('AuthProvider init - token exists:', !!token);
        console.log('AuthProvider init - storedUser exists:', !!storedUser);
        
        if (token && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                fetchProfile();
            } catch (error) {
                console.error('Error parsing stored user:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await getProfile();
            if (response.data) {
                setUser(prev => ({ ...prev, ...response.data }));
                // Update stored user with latest data
                const updatedUser = { ...user, ...response.data };
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            if (error.response?.status === 401) {
                logout();
            }
        }
    };

    const login = async (username, password) => {
        try {
            console.log('Attempting login for user:', username);
            
            const response = await loginApi({ username, password });
            console.log('Login response:', response.data);
            
            const { token, user: userData } = response.data;
            
            if (!token || !userData) {
                throw new Error('Invalid response from server');
            }
            
            // Store token and user data
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            
            toast.success('Login successful!');
            return true;
        } catch (error) {
            console.error('Login error:', error);
            console.error('Error response:', error.response?.data);
            
            const errorMessage = error.response?.data?.message || 'Login failed';
            toast.error(errorMessage);
            return false;
        }
    };

    const logout = () => {
        console.log('Logging out user');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        toast.success('Logged out successfully');
        // Use window.location for hard redirect
        window.location.href = '/login';
    };

    const value = {
        user,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};