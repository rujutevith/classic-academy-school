import React, { useState, useEffect } from 'react';
import { getAttendance, createAttendance, updateAttendance, deleteAttendance, getEmployees } from '../services/api';
import { Plus, Edit, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const Attendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [formData, setFormData] = useState({
        employee_id: '',
        date: new Date().toISOString().split('T')[0],
        check_in: '',
        check_out: '',
        status: 'present',
        remarks: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [attendanceRes, employeesRes] = await Promise.all([
                getAttendance(),
                getEmployees()
            ]);
            setAttendance(attendanceRes.data);
            setEmployees(employeesRes.data);
        } catch (error) {
            toast.error('Error fetching data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingRecord) {
                await updateAttendance(editingRecord.id, formData);
                toast.success('Attendance updated successfully');
            } else {
                await createAttendance(formData);
                toast.success('Attendance recorded successfully');
            }
            fetchData();
            closeModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this attendance record?')) {
            try {
                await deleteAttendance(id);
                toast.success('Attendance record deleted');
                fetchData();
            } catch (error) {
                toast.error('Error deleting record');
            }
        }
    };

    const openModal = (record = null) => {
        if (record) {
            setEditingRecord(record);
            setFormData({
                employee_id: record.employee_id,
                date: record.date.split('T')[0],
                check_in: record.check_in || '',
                check_out: record.check_out || '',
                status: record.status,
                remarks: record.remarks || ''
            });
        } else {
            setEditingRecord(null);
            setFormData({
                employee_id: '',
                date: new Date().toISOString().split('T')[0],
                check_in: '',
                check_out: '',
                status: 'present',
                remarks: ''
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingRecord(null);
    };

    const getStatusColor = (status) => {
        const colors = {
            present: 'bg-green-100 text-green-800',
            absent: 'bg-red-100 text-red-800',
            late: 'bg-yellow-100 text-yellow-800',
            half_day: 'bg-blue-100 text-blue-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
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
                <h1 className="text-2xl font-bold text-gray-800">Attendance Records</h1>
                <button
                    onClick={() => openModal()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
                >
                    <Plus className="w-5 h-5" />
                    Record Attendance
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {attendance.map((record) => (
                                <tr key={record.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(record.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {record.first_name} {record.last_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.check_in || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.check_out || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(record.status)}`}>
                                            {record.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{record.remarks || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <button onClick={() => openModal(record)} className="text-blue-600 hover:text-blue-800 mr-3">
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDelete(record.id)} className="text-red-600 hover:text-red-800">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h2 className="text-xl font-bold mb-4">
                            {editingRecord ? 'Edit Attendance' : 'Record Attendance'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Employee*</label>
                                <select
                                    required
                                    value={formData.employee_id}
                                    onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Employee</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date*</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Check In Time</label>
                                <input
                                    type="time"
                                    value={formData.check_in}
                                    onChange={(e) => setFormData({...formData, check_in: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Check Out Time</label>
                                <input
                                    type="time"
                                    value={formData.check_out}
                                    onChange={(e) => setFormData({...formData, check_out: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="present">Present</option>
                                    <option value="absent">Absent</option>
                                    <option value="late">Late</option>
                                    <option value="half_day">Half Day</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                                <textarea
                                    value={formData.remarks}
                                    onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                                    rows="2"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={closeModal} className="px-4 py-2 border rounded-md hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                    {editingRecord ? 'Update' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Attendance;