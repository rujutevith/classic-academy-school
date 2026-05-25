import React, { useState, useEffect } from 'react';
import { getEmployees, getDepartments, getAttendance, getSalaries } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, Building2, Calendar, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const StatsCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-gray-500 text-sm font-medium">{title}</p>
                <p className="text-2xl font-bold mt-2">{value}</p>
            </div>
            <div className={`p-3 rounded-full ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        employees: 0,
        departments: 0,
        attendance: 0,
        salary: 0
    });
    const [recentEmployees, setRecentEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [employeesRes, departmentsRes, attendanceRes, salariesRes] = await Promise.all([
                getEmployees(),
                getDepartments(),
                getAttendance(),
                getSalaries()
            ]);

            setStats({
                employees: employeesRes.data.length,
                departments: departmentsRes.data.length,
                attendance: attendanceRes.data.filter(a => a.status === 'present').length,
                salary: salariesRes.data.reduce((sum, s) => sum + parseFloat(s.net_salary || 0), 0)
            });

            setRecentEmployees(employeesRes.data.slice(0, 5));
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Sample chart data
    const attendanceData = [
        { month: 'Jan', present: 85, absent: 15 },
        { month: 'Feb', present: 88, absent: 12 },
        { month: 'Mar', present: 90, absent: 10 },
        { month: 'Apr', present: 87, absent: 13 },
        { month: 'May', present: 92, absent: 8 },
        { month: 'Jun', present: 89, absent: 11 },
    ];

    const departmentData = [
        { name: 'Teaching', value: 45 },
        { name: 'Administration', value: 12 },
        { name: 'Finance', value: 8 },
        { name: 'ICT', value: 6 },
    ];

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">
                    Welcome back, {user?.username}!
                </h1>
                <p className="text-gray-500 mt-1">Here's what's happening at Classic Academy today.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    title="Total Employees"
                    value={stats.employees}
                    icon={Users}
                    color="bg-blue-500"
                />
                <StatsCard
                    title="Departments"
                    value={stats.departments}
                    icon={Building2}
                    color="bg-green-500"
                />
                <StatsCard
                    title="Present Today"
                    value={stats.attendance}
                    icon={Calendar}
                    color="bg-yellow-500"
                />
                <StatsCard
                    title="Monthly Payroll"
                    value={`RWF ${stats.salary.toLocaleString()}`}
                    icon={DollarSign}
                    color="bg-purple-500"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4">Attendance Trends</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={attendanceData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="present" stroke="#3B82F6" strokeWidth={2} />
                            <Line type="monotone" dataKey="absent" stroke="#EF4444" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4">Department Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={departmentData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {departmentData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Employees */}
            <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold">Recent Employees</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {recentEmployees.map((emp) => (
                                <tr key={emp.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{emp.employee_code}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{emp.first_name} {emp.last_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{emp.position}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{emp.department_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            emp.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {emp.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;