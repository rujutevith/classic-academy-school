import React, { useState, useEffect } from 'react';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../services/api';
import { Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Departments = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingDept, setEditingDept] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const response = await getDepartments();
            setDepartments(response.data);
        } catch (error) {
            toast.error('Error fetching departments');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingDept) {
                await updateDepartment(editingDept.id, formData);
                toast.success('Department updated successfully');
            } else {
                await createDepartment(formData);
                toast.success('Department created successfully');
            }
            fetchDepartments();
            closeModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure? This will affect employees in this department.')) {
            try {
                await deleteDepartment(id);
                toast.success('Department deleted successfully');
                fetchDepartments();
            } catch (error) {
                toast.error('Error deleting department');
            }
        }
    };

    const openModal = (dept = null) => {
        if (dept) {
            setEditingDept(dept);
            setFormData({ name: dept.name, description: dept.description || '' });
        } else {
            setEditingDept(null);
            setFormData({ name: '', description: '' });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingDept(null);
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
                <h1 className="text-2xl font-bold text-gray-800">Departments</h1>
                <button
                    onClick={() => openModal()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
                >
                    <Plus className="w-5 h-5" />
                    Add Department
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departments.map((dept) => (
                    <div key={dept.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">{dept.name}</h3>
                                <p className="text-gray-600 mt-2 text-sm">{dept.description || 'No description'}</p>
                                <p className="text-xs text-gray-400 mt-3">Created: {new Date(dept.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => openModal(dept)} className="text-blue-600 hover:text-blue-800">
                                    <Edit className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleDelete(dept.id)} className="text-red-600 hover:text-red-800">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h2 className="text-xl font-bold mb-4">
                            {editingDept ? 'Edit Department' : 'Add Department'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name*</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={closeModal} className="px-4 py-2 border rounded-md hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                    {editingDept ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Departments;