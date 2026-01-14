import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import { useNotification } from '../../hooks/useNotification';
import {
    FileText,
    Search,
    Plus,
    Edit2,
    Trash2,
    Hash
} from 'lucide-react';

const AdminSubjects = () => {
    const { toast, alert } = useNotification();
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        code: ''
    });

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const response = await api.get('/admin/subjects');
            setSubjects(response.data.data || []);
        } catch (error) {
            console.error('Error fetching subjects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (subject = null) => {
        if (subject) {
            setEditingSubject(subject);
            setFormData({
                name: subject.name || '',
                code: subject.code || ''
            });
        } else {
            setEditingSubject(null);
            setFormData({
                name: '',
                code: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        const result = await alert.confirmDelete('Delete Subject?', 'Are you sure you want to delete this subject?');
        if (result.isConfirmed) {
            try {
                await api.delete(`/admin/subjects/${id}`);
                fetchSubjects();
                toast.success('Subject deleted successfully');
            } catch (error) {
                console.error('Error deleting subject:', error);
                toast.error('Failed to delete subject');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSubject) {
                await api.put(`/admin/subjects/${editingSubject.id}`, formData);
            } else {
                await api.post('/admin/subjects', formData);
            }
            setIsModalOpen(false);
            fetchSubjects();
            toast.success(editingSubject ? 'Subject updated successfully' : 'Subject created successfully');
        } catch (error) {
            console.error('Error saving subject:', error);
            const errors = error.response?.data?.errors;
            let message = error.response?.data?.message || error.response?.data?.error || 'Failed to save subject info.';
            if (errors) {
                message = Object.values(errors).flat().join('\n');
            }
            toast.error(message);
        }
    };

    const filteredSubjects = subjects.filter(subject =>
        (subject.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (subject.code || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Subject Management</h1>
                    <p className="text-slate-500 dark:text-slate-400">View and manage school curriculum subjects</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-lg shadow-blue-500/20"
                >
                    <Plus size={20} className="mr-2" />
                    Add Subject
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or code..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 dark:text-slate-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm font-medium">
                            <tr>
                                <th className="px-6 py-4">Subject Name</th>
                                <th className="px-6 py-4">Subject Code</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {loading ? (
                                [1, 2, 3].map((n) => (
                                    <tr key={n} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
                                        <td className="px-6 py-4 text-right"><div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : filteredSubjects.length > 0 ? (
                                filteredSubjects.map((subject) => (
                                    <tr key={subject.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg flex items-center justify-center">
                                                    <FileText size={20} />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-semibold text-slate-800 dark:text-white">
                                                        {subject.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-mono">
                                            <span className="flex items-center">
                                                <Hash size={14} className="mr-1 text-slate-400" />
                                                {subject.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(subject)}
                                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                                                    title="Edit Subject"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(subject.id)}
                                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                                                    title="Delete Subject"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                        No subjects found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingSubject ? 'Edit Subject' : 'Add New Subject'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Subject Name</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Mathematics"
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 dark:text-slate-200"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Subject Code</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. MATH101"
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 dark:text-slate-200"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            />
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
                            {editingSubject ? 'Update Subject' : 'Save Subject'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AdminSubjects;
