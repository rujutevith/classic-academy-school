import React, { useState, useEffect } from 'react';
import { FileText, Users, DollarSign, Calendar, Download, Printer } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Reports = () => {
    const [activeReport, setActiveReport] = useState('dashboard');
    const [dashboardData, setDashboardData] = useState(null);
    const [employeeReport, setEmployeeReport] = useState(null);
    const [salaryReport, setSalaryReport] = useState(null);
    const [attendanceReport, setAttendanceReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllReports();
    }, []);

    const fetchAllReports = async () => {
        setLoading(true);
        try {
            const [dashboardRes, employeeRes, salaryRes, attendanceRes] = await Promise.all([
                api.get('/reports/dashboard'),
                api.get('/reports/employees'),
                api.get('/reports/salaries'),
                api.get('/reports/attendance')
            ]);
            
            setDashboardData(dashboardRes.data);
            setEmployeeReport(employeeRes.data);
            setSalaryReport(salaryRes.data);
            setAttendanceReport(attendanceRes.data);
        } catch (error) {
            console.error('Error fetching reports:', error);
            toast.error('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExport = () => {
        const data = activeReport === 'employees' ? employeeReport :
                    activeReport === 'salaries' ? salaryReport :
                    activeReport === 'attendance' ? attendanceReport :
                    dashboardData;
        
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeReport}_report_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Report exported successfully');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
                    <p className="text-gray-500 mt-1">View detailed reports and insights</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handlePrint}
                        className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50"
                    >
                        <Printer className="w-4 h-4" />
                        Print
                    </button>
                    <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Report Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex gap-4">
                    <button
                        onClick={() => setActiveReport('dashboard')}
                        className={`px-4 py-2 font-medium transition ${
                            activeReport === 'dashboard'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <FileText className="w-4 h-4 inline mr-2" />
                        Dashboard Report
                    </button>
                    <button
                        onClick={() => setActiveReport('employees')}
                        className={`px-4 py-2 font-medium transition ${
                            activeReport === 'employees'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <Users className="w-4 h-4 inline mr-2" />
                        Employee Report
                    </button>
                    <button
                        onClick={() => setActiveReport('salaries')}
                        className={`px-4 py-2 font-medium transition ${
                            activeReport === 'salaries'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <DollarSign className="w-4 h-4 inline mr-2" />
                        Salary Report
                    </button>
                    <button
                        onClick={() => setActiveReport('attendance')}
                        className={`px-4 py-2 font-medium transition ${
                            activeReport === 'attendance'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Attendance Report
                    </button>
                </nav>
            </div>

            {/* Dashboard Report */}
            {activeReport === 'dashboard' && dashboardData && (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">Total Employees</p>
                                    <p className="text-2xl font-bold">{dashboardData.data.summary.totalEmployees}</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">Monthly Payroll</p>
                                    <p className="text-2xl font-bold">{dashboardData.data.summary.monthlyPayroll.toLocaleString()} RWF</p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-full">
                                    <DollarSign className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">Present Today</p>
                                    <p className="text-2xl font-bold">{dashboardData.data.summary.presentToday}</p>
                                </div>
                                <div className="p-3 bg-yellow-100 rounded-full">
                                    <Calendar className="w-6 h-6 text-yellow-600" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">Attendance Rate</p>
                                    <p className="text-2xl font-bold">{dashboardData.data.summary.attendanceRate}%</p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-full">
                                    <FileText className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Department Distribution */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold mb-4">Department Distribution</h3>
                        <div className="space-y-3">
                            {dashboardData.data.departmentDistribution.map((dept, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <span className="text-gray-700">{dept.name}</span>
                                    <div className="flex-1 mx-4">
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-blue-600 rounded-full"
                                                style={{ width: `${(dept.count / dashboardData.data.summary.totalEmployees) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <span className="text-gray-600">{dept.count} employees</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Employees */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-semibold">Recent Employees</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Code</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Position</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Department</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {dashboardData.data.recentEmployees.map((emp) => (
                                        <tr key={emp.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm">{emp.employee_code}</td>
                                            <td className="px-6 py-4 text-sm">{emp.first_name} {emp.last_name}</td>
                                            <td className="px-6 py-4 text-sm">{emp.position}</td>
                                            <td className="px-6 py-4 text-sm">{emp.department_name}</td>
                                            <td className="px-6 py-4">
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
            )}

            {/* Employee Report */}
            {activeReport === 'employees' && employeeReport && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b">
                        <h3 className="text-lg font-semibold">{employeeReport.report.title}</h3>
                        <p className="text-sm text-gray-500">Generated: {new Date(employeeReport.report.generated_date).toLocaleString()}</p>
                        <p className="text-sm text-gray-500">Total Employees: {employeeReport.report.total_employees}</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Code</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Position</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Department</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Salary (RWF)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {employeeReport.report.employees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm">{emp.employee_code}</td>
                                        <td className="px-6 py-4 text-sm">{emp.name}</td>
                                        <td className="px-6 py-4 text-sm">{emp.position}</td>
                                        <td className="px-6 py-4 text-sm">{emp.department}</td>
                                        <td className="px-6 py-4 text-sm">{emp.email}</td>
                                        <td className="px-6 py-4 text-sm">{emp.salary.toLocaleString()}</td>
                                        <td className="px-6 py-4">
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
            )}

            {/* Salary Report */}
            {activeReport === 'salaries' && salaryReport && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b">
                        <h3 className="text-lg font-semibold">{salaryReport.report.title}</h3>
                        <p className="text-sm text-gray-500">Generated: {new Date(salaryReport.report.generated_date).toLocaleString()}</p>
                        <div className="grid grid-cols-3 gap-4 mt-4">
                            <div>
                                <p className="text-sm text-gray-500">Total Payroll</p>
                                <p className="text-xl font-bold">{salaryReport.report.summary.total_payroll.toLocaleString()} RWF</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Paid Amount</p>
                                <p className="text-xl font-bold text-green-600">{salaryReport.report.summary.paid_amount.toLocaleString()} RWF</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Pending Amount</p>
                                <p className="text-xl font-bold text-yellow-600">{salaryReport.report.summary.pending_amount.toLocaleString()} RWF</p>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Employee</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Month</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Base Salary</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Bonuses</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Deductions</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Net Salary</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {salaryReport.report.salaries.map((salary) => (
                                    <tr key={salary.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm">{salary.employee_name}</td>
                                        <td className="px-6 py-4 text-sm">{salary.month_year}</td>
                                        <td className="px-6 py-4 text-sm">{salary.base_salary.toLocaleString()} RWF</td>
                                        <td className="px-6 py-4 text-sm">{salary.bonuses.toLocaleString()} RWF</td>
                                        <td className="px-6 py-4 text-sm">{salary.deductions.toLocaleString()} RWF</td>
                                        <td className="px-6 py-4 text-sm font-semibold">{salary.net_salary.toLocaleString()} RWF</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                salary.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {salary.payment_status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Attendance Report */}
            {activeReport === 'attendance' && attendanceReport && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b">
                        <h3 className="text-lg font-semibold">{attendanceReport.report.title}</h3>
                        <p className="text-sm text-gray-500">Generated: {new Date(attendanceReport.report.generated_date).toLocaleString()}</p>
                        <div className="grid grid-cols-4 gap-4 mt-4">
                            <div>
                                <p className="text-sm text-gray-500">Total Records</p>
                                <p className="text-xl font-bold">{attendanceReport.report.summary.total_records}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Present</p>
                                <p className="text-xl font-bold text-green-600">{attendanceReport.report.summary.present}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Late</p>
                                <p className="text-xl font-bold text-yellow-600">{attendanceReport.report.summary.late}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Attendance Rate</p>
                                <p className="text-xl font-bold text-blue-600">{attendanceReport.report.summary.attendance_rate}%</p>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Employee</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Check In</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Check Out</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {attendanceReport.report.attendance.map((att) => (
                                    <tr key={att.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm">{att.employee_name}</td>
                                        <td className="px-6 py-4 text-sm">{att.date}</td>
                                        <td className="px-6 py-4 text-sm">{att.check_in || '-'}</td>
                                        <td className="px-6 py-4 text-sm">{att.check_out || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                att.status === 'present' ? 'bg-green-100 text-green-800' :
                                                att.status === 'late' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {att.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">{att.remarks || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;