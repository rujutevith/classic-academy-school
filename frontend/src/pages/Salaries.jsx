import React, { useState, useEffect } from 'react';
import { getSalaries, createSalary, updateSalary, deleteSalary, getEmployees } from '../services/api';
import { Plus, Edit, Trash2, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const Salaries = () => {
    const [salaries, setSalaries] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSalary, setEditingSalary] = useState(null);
    const [formData, setFormData] = useState({
        employee_id: '',
        month_year: new Date().toISOString().slice(0, 7),
        base_salary: '',
        bonuses: '0',
        deductions: '0',
        net_salary: '',
        payment_status: 'pending',
        payment_date: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [salariesRes, employeesRes] = await Promise.all([
                getSalaries(),
                getEmployees()
            ]);
            
            console.log('Salaries data:', salariesRes.data);
            console.log('Employees data:', employeesRes.data);
            
            setSalaries(salariesRes.data);
            setEmployees(employeesRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Error fetching data');
        } finally {
            setLoading(false);
        }
    };

    const calculateNetSalary = (base, bonuses, deductions) => {
        const baseNum = parseFloat(base) || 0;
        const bonusesNum = parseFloat(bonuses) || 0;
        const deductionsNum = parseFloat(deductions) || 0;
        return (baseNum + bonusesNum - deductionsNum).toFixed(2);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            
            if (name === 'base_salary' || name === 'bonuses' || name === 'deductions') {
                newData.net_salary = calculateNetSalary(
                    name === 'base_salary' ? value : prev.base_salary,
                    name === 'bonuses' ? value : prev.bonuses,
                    name === 'deductions' ? value : prev.deductions
                );
            }
            
            return newData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.employee_id) {
            toast.error('Please select an employee');
            return;
        }
        
        if (!formData.base_salary || parseFloat(formData.base_salary) <= 0) {
            toast.error('Please enter a valid base salary');
            return;
        }
        
        try {
            const submitData = {
                employee_id: parseInt(formData.employee_id),
                month_year: formData.month_year + '-01',
                base_salary: parseFloat(formData.base_salary),
                bonuses: parseFloat(formData.bonuses) || 0,
                deductions: parseFloat(formData.deductions) || 0,
                net_salary: parseFloat(formData.net_salary),
                payment_status: formData.payment_status,
                payment_date: formData.payment_date || null
            };
            
            console.log('Submitting salary data:', submitData);
            
            if (editingSalary) {
                await updateSalary(editingSalary.id, submitData);
                toast.success('Salary record updated successfully');
            } else {
                await createSalary(submitData);
                toast.success('Salary record created successfully');
            }
            
            fetchData();
            closeModal();
        } catch (error) {
            console.error('Error saving salary:', error);
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this salary record?')) {
            try {
                await deleteSalary(id);
                toast.success('Salary record deleted');
                fetchData();
            } catch (error) {
                console.error('Error deleting salary:', error);
                toast.error('Error deleting record');
            }
        }
    };

    const openModal = (salary = null) => {
        if (salary) {
            const monthYear = salary.month_year ? salary.month_year.slice(0, 7) : '';
            
            setEditingSalary(salary);
            setFormData({
                employee_id: salary.employee_id,
                month_year: monthYear,
                base_salary: salary.base_salary,
                bonuses: salary.bonuses || '0',
                deductions: salary.deductions || '0',
                net_salary: salary.net_salary,
                payment_status: salary.payment_status,
                payment_date: salary.payment_date ? salary.payment_date.split('T')[0] : ''
            });
        } else {
            setEditingSalary(null);
            setFormData({
                employee_id: '',
                month_year: new Date().toISOString().slice(0, 7),
                base_salary: '',
                bonuses: '0',
                deductions: '0',
                net_salary: '',
                payment_status: 'pending',
                payment_date: ''
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingSalary(null);
    };

    const getPaymentStatusColor = (status) => {
        const colors = {
            paid: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    // Helper function to get employee name
    const getEmployeeName = (employeeId) => {
        const employee = employees.find(emp => emp.id === employeeId);
        return employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown Employee';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Salary Management</h1>
                <button
                    onClick={() => openModal()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
                >
                    <Plus className="w-5 h-5" />
                    Add Salary Record
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Salary</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bonuses</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deductions</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Salary</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {salaries.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                        No salary records found. Click "Add Salary Record" to create one.
                                    </td>
                                </tr>
                            ) : (
                                salaries.map((salary) => (
                                    <tr key={salary.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {salary.employee_name || getEmployeeName(salary.employee_id)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {salary.month_year ? new Date(salary.month_year).toLocaleDateString('default', { month: 'long', year: 'numeric' }) : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {parseFloat(salary.base_salary).toLocaleString()} RWF
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                                            +{parseFloat(salary.bonuses).toLocaleString()} RWF
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                                            -{parseFloat(salary.deductions).toLocaleString()} RWF
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                                            {parseFloat(salary.net_salary).toLocaleString()} RWF
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusColor(salary.payment_status)}`}>
                                                {salary.payment_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button 
                                                onClick={() => openModal(salary)} 
                                                className="text-blue-600 hover:text-blue-800 mr-3 transition"
                                                title="Edit"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(salary.id)} 
                                                className="text-red-600 hover:text-red-800 transition"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Form */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">
                            {editingSalary ? 'Edit Salary Record' : 'Add Salary Record'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
                                <select
                                    required
                                    name="employee_id"
                                    value={formData.employee_id}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Employee</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.first_name} {emp.last_name} - {emp.employee_code}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Month *</label>
                                <input
                                    type="month"
                                    required
                                    name="month_year"
                                    value={formData.month_year}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Base Salary (RWF) *</label>
                                <input
                                    type="number"
                                    required
                                    name="base_salary"
                                    value={formData.base_salary}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter base salary"
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bonuses (RWF)</label>
                                <input
                                    type="number"
                                    name="bonuses"
                                    value={formData.bonuses}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="0"
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Deductions (RWF)</label>
                                <input
                                    type="number"
                                    name="deductions"
                                    value={formData.deductions}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="0"
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Net Salary (RWF)</label>
                                <input
                                    type="text"
                                    value={formData.net_salary}
                                    readOnly
                                    className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md"
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                                <select
                                    name="payment_status"
                                    value={formData.payment_status}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            
                            {formData.payment_status === 'paid' && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                                    <input
                                        type="date"
                                        name="payment_date"
                                        value={formData.payment_date}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            )}
                            
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                                >
                                    {editingSalary ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Salaries;