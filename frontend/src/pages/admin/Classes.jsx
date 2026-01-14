import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import { useNotification } from '../../hooks/useNotification';
import {
    BookOpen,
    Search,
    Plus,
    MoreVertical,
    Users,
    User,
    Calendar,
    Layout,
    Edit2,
    Trash2
} from 'lucide-react';

const AdminClasses = () => {
    const { toast, alert } = useNotification();
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        section: 'A',
        capacity: 40,
        teacher_id: ''
    });

    useEffect(() => {
        fetchClasses();
        fetchTeachers();
    }, []);

    const fetchClasses = async () => {
        try {
            const response = await api.get('/admin/classes');
            setClasses(response.data.data || []);
        } catch (error) {
            console.error('Error fetching classes:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTeachers = async () => {
        try {
            const response = await api.get('/admin/teachers');
            setTeachers(response.data.data || []);
        } catch (error) {
            console.error('Error fetching teachers:', error);
        }
    };

    const handleOpenModal = (cls = null) => {
        if (cls) {
            setEditingClass(cls);
            setFormData({
                name: cls.name || '',
                section: cls.section || '',
                capacity: cls.capacity || 40,
                teacher_id: cls.teacher_id || ''
            });
        } else {
            setEditingClass(null);
            setFormData({
                name: '',
                section: 'A',
                capacity: 40,
                teacher_id: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        const result = await alert.confirmDelete('Delete Class?', 'Are you sure you want to delete this class?');
        if (result.isConfirmed) {
            try {
                await api.delete(`/admin/classes/${id}`);
                fetchClasses();
                toast.success('Class deleted successfully');
            } catch (error) {
                console.error('Error deleting class:', error);
                toast.error('Failed to delete class');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingClass) {
                await api.put(`/admin/classes/${editingClass.id}`, formData);
            } else {
                await api.post('/admin/classes', formData);
            }
            setIsModalOpen(false);
            fetchClasses();
            toast.success(editingClass ? 'Class updated successfully' : 'Class created successfully');
        } catch (error) {
            console.error('Error saving class:', error);
            const errors = error.response?.data?.errors;
            let message = error.response?.data?.message || error.response?.data?.error || 'Failed to save class info';
            if (errors) {
                message = Object.values(errors).flat().join('\n');
            }
            toast.error(message);
        }
    };

    const filteredClasses = classes.filter(cls =>
        cls.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Class Management</h1>
                    <p className="text-slate-500 dark:text-slate-400">View and manage all grades and sections</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-lg shadow-blue-500/20"
                >
                    <Plus size={20} className="mr-2" />
                    Create New Class
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by class name..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 dark:text-slate-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {loading ? (
                        [1, 2, 3].map((n) => (
                            <div key={n} className="h-48 bg-slate-100 dark:bg-slate-700 animate-pulse rounded-xl"></div>
                        ))
                    ) : filteredClasses.length > 0 ? (
                        filteredClasses.map((cls) => (
                            <div key={cls.id} className="bg-slate-50 dark:bg-slate-900 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all group">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                            <BookOpen size={24} />
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleOpenModal(cls)}
                                                className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cls.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">
                                        {cls.name}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 font-medium">
                                        Section: {cls.section || 'N/A'}
                                    </p>

                                    <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                                            <User size={16} className="mr-2 text-slate-400" />
                                            <span className="truncate">Teacher: {cls.teacher?.user.name || 'Unassigned'}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                                            <Users size={16} className="mr-2 text-slate-400" />
                                            <span>Capacity: {cls.capacity} Students</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-6 py-3 bg-slate-100 dark:bg-slate-800/50 flex justify-end">
                                    <button className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline flex items-center">
                                        View Details <Layout size={14} className="ml-1" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400">
                            No classes found.
                        </div>
                    )}
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingClass ? 'Edit Class' : 'Create New Class'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Class Name</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Grade 10"
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 dark:text-slate-200"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Section</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. A"
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 dark:text-slate-200"
                                value={formData.section}
                                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Capacity</label>
                            <input
                                required
                                type="number"
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 dark:text-slate-200"
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Class Teacher</label>
                            <select
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 dark:text-slate-200"
                                value={formData.teacher_id}
                                onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                            >
                                <option value="">Select Teacher (Optional)</option>
                                {teachers.map((t) => (
                                    <option key={t.id} value={t.id}>{t.user?.name} ({t.employee_code})</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                        >
                            {editingClass ? 'Update Class' : 'Create Class'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AdminClasses;
