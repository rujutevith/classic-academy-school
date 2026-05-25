import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Departments from './pages/Departments';
import Attendance from './pages/Attendance';
import Salaries from './pages/Salaries';
import Sidebar from './components/Layout/Sidebar';
import Navbar from './components/Layout/Navbar';

// Private Route wrapper
const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }
    
    return user ? children : <Navigate to="/login" />;
};

// Layout wrapper for authenticated pages
const AppLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <Navbar />
            <main className="ml-64 pt-16 p-6">
                {children}
            </main>
        </div>
    );
};

// Main App content with routes
function AppContent() {
    const { user } = useAuth();

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route
                path="/dashboard"
                element={
                    <PrivateRoute>
                        <AppLayout>
                            <Dashboard />
                        </AppLayout>
                    </PrivateRoute>
                }
            />
            <Route
                path="/employees"
                element={
                    <PrivateRoute>
                        <AppLayout>
                            <Employees />
                        </AppLayout>
                    </PrivateRoute>
                }
            />
            <Route
                path="/departments"
                element={
                    <PrivateRoute>
                        <AppLayout>
                            <Departments />
                        </AppLayout>
                    </PrivateRoute>
                }
            />
            <Route
                path="/attendance"
                element={
                    <PrivateRoute>
                        <AppLayout>
                            <Attendance />
                        </AppLayout>
                    </PrivateRoute>
                }
            />
            <Route
                path="/salaries"
                element={
                    <PrivateRoute>
                        <AppLayout>
                            <Salaries />
                        </AppLayout>
                    </PrivateRoute>
                }
            />
        </Routes>
    );
}

// Main App component
function App() {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
                <Toaster position="top-right" />
            </AuthProvider>
        </Router>
    );
}

export default App;