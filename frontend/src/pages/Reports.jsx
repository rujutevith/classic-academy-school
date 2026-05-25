import React, { useState, useEffect } from 'react';
import { FileText, Users, Building2, DollarSign, Calendar, Download, Printer, TrendingUp, PieChart, UserCheck, Briefcase } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Reports = () => {
    const [activeReport, setActiveReport] = useState('dashboard');
    const [dashboardData, setDashboardData] = useState(null);
    const [employeeReport, setEmployeeReport] = useState(null);
    const [departmentReport, setDepartmentReport] = useState(null);
    const [salaryReport, setSalaryReport] = useState(null);
    const [attendanceReport, setAttendanceReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        fetchAllReports();
        fetchEmployeesAndDepartments();
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

    const fetchEmployeesAndDepartments = async () => {
        try {
            const [empRes, deptRes] = await Promise.all([
                api.get('/employees'),
                api.get('/departments')
            ]);
            setEmployees(empRes.data);
            setDepartments(deptRes.data);
            
            // Create department report
            const deptReport = {
                title: 'Department Report',
                generated_date: new Date().toISOString(),
                total_departments: deptRes.data.length,
                departments: deptRes.data.map(dept => ({
                    id: dept.id,
                    name: dept.name,
                    description: dept.description,
                    employee_count: empRes.data.filter(e => e.department_id === dept.id).length,
                    employees: empRes.data.filter(e => e.department_id === dept.id),
                    total_salary: empRes.data
                        .filter(e => e.department_id === dept.id)
                        .reduce((sum, e) => sum + (e.salary || 0), 0),
                    average_salary: empRes.data.filter(e => e.department_id === dept.id).length > 0 
                        ? empRes.data.filter(e => e.department_id === dept.id).reduce((sum, e) => sum + (e.salary || 0), 0) / 
                          empRes.data.filter(e => e.department_id === dept.id).length 
                        : 0
                }))
            };
            setDepartmentReport(deptReport);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExport = () => {
        let data;
        switch(activeReport) {
            case 'employees':
                data = employeeReport;
                break;
            case 'departments':
                data = departmentReport;
                break;
            case 'salaries':
                data = salaryReport;
                break;
            case 'attendance':
                data = attendanceReport;
                break;
            default:
                data = dashboardData;
        }
        
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
                        className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition"
                    >
                        <Printer className="w-4 h-4" />
                        Print
                    </button>
                    <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700 transition"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Report Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex gap-4 flex-wrap">
                    <button
                        onClick={() => setActiveReport('dashboard')}
                        className={`px-4 py-2 font-medium transition ${
                            activeReport === 'dashboard'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Dashboard
                    </button>
                    <button
                        onClick={() => setActiveReport('employees')}
                        className={`px-4 py-2 font-medium transition ${
                            activeReport === 'employees'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Employees
                    </button>
                    <button
                        onClick={() => setActiveReport('departments')}
                        className={`px-4 py-2 font-medium transition ${
                            activeReport === 'departments'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Departments
                    </button>
                    <button
                        onClick={() => setActiveReport('salaries')}
                        className={`px-4 py-2 font-medium transition ${
                            activeReport === 'salaries'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Salaries
                    </button>
                    <button
                        onClick={() => setActiveReport('attendance')}
                        className={`px-4 py-2 font-medium transition ${
                            activeReport === 'attendance'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Attendance
                    </button>
                </nav>
            </div>

            {/* Dashboard Report */}
            {activeReport === 'dashboard' && dashboardData && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">Total Employees</p>
                                    <p className="text-2xl font-bold">{dashboardData.data?.summary?.totalEmployees || 0}</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">Total Departments</p>
                                    <p className="text-2xl font-bold">{dashboardData.data?.summary?.totalDepartments || 0}</p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-full">
                                    <Building2 className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">Monthly Payroll</p>
                                    <p className="text-2xl font-bold">{(dashboardData.data?.summary?.monthlyPayroll || 0).toLocaleString()} RWF</p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-full">
                                    <DollarSign className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">Attendance Rate</p>
                                    <p className="text-2xl font-bold">{dashboardData.data?.summary?.attendanceRate || 0}%</p>
                                </div>
                                <div className="p-3 bg-yellow-100 rounded-full">
                                    <UserCheck className="w-6 h-6 text-yellow-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Employees */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-semibold">Recent Employees</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salary</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {dashboardData.data?.recentEmployees?.map((emp) => (
                                        <tr key={emp.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm">{emp.employee_code}</td>
                                            <td className="px-4 py-3 text-sm">{emp.first_name} {emp.last_name}</td>
                                            <td className="px-4 py-3 text-sm">{emp.position}</td>
                                            <td className="px-4 py-3 text-sm">{emp.department_name}</td>
                                            <td className="px-4 py-3 text-sm">{emp.salary?.toLocaleString()} RWF</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Employee Report - Detailed */}
            {activeReport === 'employees' && employeeReport && (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center gap-3">
                                <Users className="w-8 h-8 text-blue-600" />
                                <div>
                                    <p className="text-gray-500 text-sm">Total Employees</p>
                                    <p className="text-2xl font-bold">{employeeReport.report?.total_employees || 0}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center gap-3">
                                <UserCheck className="w-8 h-8 text-green-600" />
                                <div>
                                    <p className="text-gray-500 text-sm">Active Employees</p>
                                    <p className="text-2xl font-bold">
                                        {employeeReport.report?.employees?.filter(e => e.status === 'active').length || 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center gap-3">
                                <DollarSign className="w-8 h-8 text-purple-600" />
                                <div>
                                    <p className="text-gray-500 text-sm">Total Monthly Salary</p>
                                    <p className="text-2xl font-bold">
                                        {employeeReport.report?.employees?.reduce((sum, e) => sum + (e.salary || 0), 0).toLocaleString()} RWF
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Employees Table */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-semibold">Employee Directory</h3>
                            <p className="text-sm text-gray-500">Generated: {new Date(employeeReport.report?.generated_date).toLocaleString()}</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Full Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hire Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salary</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {employeeReport.report?.employees?.map((emp) => (
                                        <tr key={emp.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm font-mono">{emp.employee_code}</td>
                                            <td className="px-4 py-3 text-sm font-medium">{emp.first_name} {emp.last_name}</td>
                                            <td className="px-4 py-3 text-sm">{emp.position}</td>
                                            <td className="px-4 py-3 text-sm">{emp.department_name}</td>
                                            <td className="px-4 py-3 text-sm">{emp.email}</td>
                                            <td className="px-4 py-3 text-sm">{emp.phone || '-'}</td>
                                            <td className="px-4 py-3 text-sm">{emp.hire_date}</td>
                                            <td className="px-4 py-3 text-sm font-semibold">{emp.salary?.toLocaleString()} RWF</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    emp.status === 'active' ? 'bg-green-100 text-green-800' : 
                                                    emp.status === 'inactive' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
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

            {/* Department Report - Detailed */}
            {activeReport === 'departments' && departmentReport && (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center gap-3">
                                <Building2 className="w-8 h-8 text-blue-600" />
                                <div>
                                    <p className="text-gray-500 text-sm">Total Departments</p>
                                    <p className="text-2xl font-bold">{departmentReport.total_departments}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center gap-3">
                                <Users className="w-8 h-8 text-green-600" />
                                <div>
                                    <p className="text-gray-500 text-sm">Total Employees Across All Departments</p>
                                    <p className="text-2xl font-bold">
                                        {departmentReport.departments?.reduce((sum, d) => sum + d.employee_count, 0)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Departments Table */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-semibold">Department Analysis</h3>
                            <p className="text-sm text-gray-500">Generated: {new Date(departmentReport.generated_date).toLocaleString()}</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employees</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Salary</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Average Salary</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {departmentReport.departments?.map((dept) => (
                                        <tr key={dept.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm">{dept.id}</td>
                                            <td className="px-4 py-3 text-sm font-medium">{dept.name}</td>
                                            <td className="px-4 py-3 text-sm">{dept.description || '-'}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                                    {dept.employee_count} employees
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm">{dept.total_salary.toLocaleString()} RWF</td>
                                            <td className="px-4 py-3 text-sm font-semibold">{Math.round(dept.average_salary).toLocaleString()} RWF</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Department Employee Details */}
                    {departmentReport.departments?.map((dept) => (
                        dept.employee_count > 0 && (
                            <div key={`details-${dept.id}`} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                                <div className="p-4 border-b border-gray-200 bg-gray-50">
                                    <h4 className="text-md font-semibold flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-blue-600" />
                                        {dept.name} Department - Employee List
                                    </h4>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Salary</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {dept.employees?.map((emp) => (
                                                <tr key={emp.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-2 text-sm font-mono">{emp.employee_code}</td>
                                                    <td className="px-4 py-2 text-sm">{emp.first_name} {emp.last_name}</td>
                                                    <td className="px-4 py-2 text-sm">{emp.position}</td>
                                                    <td className="px-4 py-2 text-sm">{emp.salary?.toLocaleString()} RWF</td>
                                                    <td className="px-4 py-2">
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
                        )
                    ))}
                </div>
            )}

            {/* Salary Report */}
            {activeReport === 'salaries' && salaryReport && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-lg font-semibold">{salaryReport.report?.title}</h3>
                        <p className="text-sm text-gray-500">Generated: {new Date(salaryReport.report?.generated_date).toLocaleString()}</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base Salary</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bonuses</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deductions</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Salary</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {salaryReport.report?.salaries?.map((salary) => (
                                    <tr key={salary.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm font-medium">{salary.employee_name}</td>
                                        <td className="px-4 py-3 text-sm">{salary.month_year}</td>
                                        <td className="px-4 py-3 text-sm">{salary.base_salary?.toLocaleString()} RWF</td>
                                        <td className="px-4 py-3 text-sm text-green-600">+{salary.bonuses?.toLocaleString()} RWF</td>
                                        <td className="px-4 py-3 text-sm text-red-600">-{salary.deductions?.toLocaleString()} RWF</td>
                                        <td className="px-4 py-3 text-sm font-semibold text-blue-600">{salary.net_salary?.toLocaleString()} RWF</td>
                                        <td className="px-4 py-3">
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
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-lg font-semibold">{attendanceReport.report?.title}</h3>
                        <p className="text-sm text-gray-500">Generated: {new Date(attendanceReport.report?.generated_date).toLocaleString()}</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {attendanceReport.report?.attendance?.map((att) => (
                                    <tr key={att.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm font-medium">{att.employee_name}</td>
                                        <td className="px-4 py-3 text-sm">{att.date}</td>
                                        <td className="px-4 py-3 text-sm">{att.check_in || '-'}</td>
                                        <td className="px-4 py-3 text-sm">{att.check_out || '-'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                att.status === 'present' ? 'bg-green-100 text-green-800' : 
                                                att.status === 'late' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {att.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm">{att.remarks || '-'}</td>
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