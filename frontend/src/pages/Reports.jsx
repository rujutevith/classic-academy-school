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
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            // Fetch employees and departments first
            const [empRes, deptRes] = await Promise.all([
                api.get('/employees'),
                api.get('/departments')
            ]);
            
            setEmployees(empRes.data);
            setDepartments(deptRes.data);
            
            // Create department report
            const deptReportData = {
                title: 'Department Report',
                generated_date: new Date().toISOString(),
                total_departments: deptRes.data.length,
                total_employees: empRes.data.length,
                departments: deptRes.data.map(dept => {
                    const deptEmployees = empRes.data.filter(e => e.department_id === dept.id);
                    const totalSalary = deptEmployees.reduce((sum, e) => sum + (e.salary || 0), 0);
                    const avgSalary = deptEmployees.length > 0 ? totalSalary / deptEmployees.length : 0;
                    
                    return {
                        id: dept.id,
                        name: dept.name,
                        description: dept.description || 'No description',
                        employee_count: deptEmployees.length,
                        employees: deptEmployees,
                        total_salary: totalSalary,
                        average_salary: avgSalary,
                        active_employees: deptEmployees.filter(e => e.status === 'active').length
                    };
                })
            };
            setDepartmentReport(deptReportData);
            
            // Fetch other reports
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
            console.error('Error fetching data:', error);
            toast.error('Failed to load reports');
        } finally {
            setLoading(false);
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
                        <FileText className="w-4 h-4 inline mr-2" />
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
                        <Users className="w-4 h-4 inline mr-2" />
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
                        <Building2 className="w-4 h-4 inline mr-2" />
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
                        <DollarSign className="w-4 h-4 inline mr-2" />
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
                        <Calendar className="w-4 h-4 inline mr-2" />
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
                                    <p className="text-2xl font-bold">{dashboardData.data?.summary?.totalEmployees || employees.length}</p>
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
                                    <p className="text-2xl font-bold">{dashboardData.data?.summary?.totalDepartments || departments.length}</p>
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

                    {/* Department Distribution Chart */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h3 className="text-lg font-semibold mb-4">Department Distribution</h3>
                        <div className="space-y-3">
                            {departments.map((dept) => {
                                const empCount = employees.filter(e => e.department_id === dept.id).length;
                                const percentage = employees.length > 0 ? (empCount / employees.length) * 100 : 0;
                                return (
                                    <div key={dept.id} className="flex items-center justify-between">
                                        <span className="text-gray-700 w-32">{dept.name}</span>
                                        <div className="flex-1 mx-4">
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-blue-600 rounded-full"
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <span className="text-gray-600 w-24 text-right">{empCount} employees</span>
                                    </div>
                                );
                            })}
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
                                    {employees.slice(0, 5).map((emp) => (
                                        <tr key={emp.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm">{emp.employee_code}</td>
                                            <td className="px-4 py-3 text-sm">{emp.first_name} {emp.last_name}</td>
                                            <td className="px-4 py-3 text-sm">{emp.position}</td>
                                            <td className="px-4 py-3 text-sm">{departments.find(d => d.id === emp.department_id)?.name || '-'}</td>
                                            <td className="px-4 py-3 text-sm">{emp.salary?.toLocaleString()} RWF</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* DEPARTMENT REPORT - FULL DETAILS */}
            {activeReport === 'departments' && departmentReport && (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                    <p className="text-gray-500 text-sm">Total Employees</p>
                                    <p className="text-2xl font-bold">{departmentReport.total_employees}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center gap-3">
                                <DollarSign className="w-8 h-8 text-purple-600" />
                                <div>
                                    <p className="text-gray-500 text-sm">Total Payroll</p>
                                    <p className="text-2xl font-bold">
                                        {departmentReport.departments?.reduce((sum, d) => sum + d.total_salary, 0).toLocaleString()} RWF
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Departments Summary Table */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-semibold">Department Summary</h3>
                            <p className="text-sm text-gray-500">Generated: {new Date(departmentReport.generated_date).toLocaleString()}</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employees</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Salary</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Average Salary</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {departmentReport.departments?.map((dept, index) => (
                                        <tr key={dept.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm">{index + 1}</td>
                                            <td className="px-4 py-3 text-sm font-semibold text-blue-600">{dept.name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{dept.description}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                                    {dept.employee_count} employees
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                                    {dept.active_employees} active
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

                    {/* Detailed Employee List by Department */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-800">Employees by Department</h3>
                        {departmentReport.departments?.map((dept) => (
                            dept.employee_count > 0 && (
                                <div key={`details-${dept.id}`} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                                    <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-5 h-5 text-blue-600" />
                                                <h4 className="text-md font-semibold text-gray-800">{dept.name} Department</h4>
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs ml-2">
                                                    {dept.employee_count} Employees
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Total Salary: {dept.total_salary.toLocaleString()} RWF
                                            </div>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Full Name</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Salary</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {dept.employees?.map((emp) => (
                                                    <tr key={emp.id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-2 text-sm font-mono">{emp.employee_code}</td>
                                                        <td className="px-4 py-2 text-sm font-medium">{emp.first_name} {emp.last_name}</td>
                                                        <td className="px-4 py-2 text-sm">{emp.position || '-'}</td>
                                                        <td className="px-4 py-2 text-sm">{emp.email || '-'}</td>
                                                        <td className="px-4 py-2 text-sm">{emp.phone || '-'}</td>
                                                        <td className="px-4 py-2 text-sm">{emp.salary?.toLocaleString()} RWF</td>
                                                        <td className="px-4 py-2">
                                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                                emp.status === 'active' ? 'bg-green-100 text-green-800' : 
                                                                emp.status === 'inactive' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                                {emp.status}
                                                            </span>
                                                        </td>
                                                    </td>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                </div>
            )}

            {/* Employee Report */}
            {activeReport === 'employees' && employeeReport && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center gap-3">
                                <Users className="w-8 h-8 text-blue-600" />
                                <div>
                                    <p className="text-gray-500 text-sm">Total Employees</p>
                                    <p className="text-2xl font-bold">{employeeReport.report?.total_employees || employees.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center gap-3">
                                <UserCheck className="w-8 h-8 text-green-600" />
                                <div>
                                    <p className="text-gray-500 text-sm">Active Employees</p>
                                    <p className="text-2xl font-bold">
                                        {employees.filter(e => e.status === 'active').length}
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
                                        {employees.reduce((sum, e) => sum + (e.salary || 0), 0).toLocaleString()} RWF
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-semibold">Employee Directory</h3>
                            <p className="text-sm text-gray-500">Complete list of all employees</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salary</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {employees.map((emp) => (
                                        <tr key={emp.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm font-mono">{emp.employee_code}</td>
                                            <td className="px-4 py-3 text-sm font-medium">{emp.first_name} {emp.last_name}</td>
                                            <td className="px-4 py-3 text-sm">{emp.position}</td>
                                            <td className="px-4 py-3 text-sm">{departments.find(d => d.id === emp.department_id)?.name || '-'}</td>
                                            <td className="px-4 py-3 text-sm">{emp.email}</td>
                                            <td className="px-4 py-3 text-sm">{emp.salary?.toLocaleString()} RWF</td>
                                            <td className="px-4 py-3">
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