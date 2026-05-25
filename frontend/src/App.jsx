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
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import Sidebar from './components/Layout/Sidebar';
import Navbar from './components/Layout/Navbar';

// Private Route wrapper component
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
            
            {/* Dashboard Route */}
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
            
            {/* Employees Route */}
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
            
            {/* Departments Route */}
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
            
            {/* Attendance Route */}
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
            
            {/* Salaries Route */}
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
            
            {/* Reports Route - NEW */}
            <Route
                path="/reports"
                element={
                    <PrivateRoute>
                        <AppLayout>
                            <Reports />
                        </AppLayout>
                    </PrivateRoute>
                }
            />
            
            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
    );
}

// Main App component
function App() {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
                <Toaster 
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#363636',
                            color: '#fff',
                        },
                        success: {
                            duration: 3000,
                            iconTheme: {
                                primary: '#10B981',
                                secondary: '#fff',
                            },
                        },
                        error: {
                            duration: 4000,
                            iconTheme: {
                                primary: '#EF4444',
                                secondary: '#fff',
                            },
                        },
                    }}
                />
            </AuthProvider>
        </Router>
    );
}

export default App;