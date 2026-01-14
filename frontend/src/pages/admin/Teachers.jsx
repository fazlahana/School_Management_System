import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import { useNotification } from '../../hooks/useNotification';
import {
    Users,
    Search,
    Plus,
    MoreVertical,
    Mail,
    Briefcase,
    Calendar,
    Filter,
    Edit2,
    Trash2,
    BookOpen,
    Check
} from 'lucide-react';

const AdminTeachers = () => {
    const { toast, alert } = useNotification();
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        employee_code: '',
        specialization: '',
        status: 'pending'
    });

    const [allSubjects, setAllSubjects] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const [savingSubjects, setSavingSubjects] = useState(false);

    const [selectedIds, setSelectedIds] = useState([]);
    const [isBulkUpdateModalOpen, setIsBulkUpdateModalOpen] = useState(false);
    const [bulkSpecialization, setBulkSpecialization] = useState('');

    useEffect(() => {
        fetchTeachers();
        fetchAllSubjects();
    }, []);

    const fetchAllSubjects = async () => {
        try {
            const response = await api.get('/admin/all-subjects');
            setAllSubjects(response.data);
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    const fetchTeachers = async () => {
        try {
            const response = await api.get('/admin/teachers');
            setTeachers(response.data.data || []);
            setSelectedIds([]); // Clear selection on refresh
        } catch (error) {
            console.error('Error fetching teachers:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredTeachers.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredTeachers.map(t => t.id));
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = async () => {
        const result = await alert.confirmDelete(
            'Delete Multiple Teachers?',
            `Are you sure you want to delete ${selectedIds.length} teachers? This will also delete their login accounts.`
        );
        if (result.isConfirmed) {
            try {
                await api.post('/admin/teachers/bulk-delete', { ids: selectedIds });
                fetchTeachers();
                toast.success('Teachers deleted successfully');
            } catch (error) {
                console.error('Error in bulk delete:', error);
                toast.error('Failed to delete teachers');
            }
        }
    };

    const handleBulkUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/teachers/bulk-update', {
                ids: selectedIds,
                specialization: bulkSpecialization
            });
            setIsBulkUpdateModalOpen(false);
            setBulkSpecialization('');
            fetchTeachers();
            toast.success('Teachers updated successfully');
        } catch (error) {
            console.error('Error in bulk update:', error);
            toast.error('Failed to update teachers');
        }
    };

    const handleOpenModal = (teacher = null) => {
        if (teacher) {
            setEditingTeacher(teacher);
            setFormData({
                name: teacher.user?.name || '',
                email: teacher.user?.email || '',
                employee_code: teacher.employee_code || '',
                specialization: teacher.specialization || '',
                status: teacher.user?.status || 'pending'
            });
        } else {
            setEditingTeacher(null);
            setFormData({
                name: '',
                email: '',
                employee_code: '',
                specialization: '',
                status: 'pending'
            });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        const result = await alert.confirmDelete(
            'Delete Teacher?',
            'Are you sure you want to delete this teacher? This will also delete their login account.'
        );
        if (result.isConfirmed) {
            try {
                await api.delete(`/admin/teachers/${id}`);
                fetchTeachers();
                toast.success('Teacher deleted successfully');
            } catch (error) {
                console.error('Error deleting teacher:', error);
                toast.error('Failed to delete teacher');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTeacher) {
                await api.put(`/admin/teachers/${editingTeacher.id}`, formData);
            } else {
                await api.post('/admin/teachers', formData);
            }
            setIsModalOpen(false);
            fetchTeachers();
            toast.success(editingTeacher ? 'Teacher updated successfully' : 'Teacher added successfully');
        } catch (error) {
            console.error('Error saving teacher:', error);
            const errors = error.response?.data?.errors;
            let message = error.response?.data?.message || error.response?.data?.error || 'Failed to save teacher info.';
            if (errors) {
                message = Object.values(errors).flat().join('\n');
            }
            toast.error(message);
        }
    };

    const filteredTeachers = teachers.filter(teacher =>
        (teacher.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (teacher.employee_code || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleManageSubjects = async (teacher) => {
        setSelectedTeacher(teacher);
        setIsSubjectModalOpen(true);
        try {
            const response = await api.get(`/admin/teachers/${teacher.id}/subjects`);
            setSelectedSubjects(response.data.map(s => s.id));
        } catch (error) {
            console.error('Error fetching teacher subjects:', error);
            setSelectedSubjects([]);
        }
    };

    const handleSaveSubjects = async () => {
        setSavingSubjects(true);
        try {
            await api.post(`/admin/teachers/${selectedTeacher.id}/subjects`, {
                subject_ids: selectedSubjects
            });
            setIsSubjectModalOpen(false); // Close after success
            fetchTeachers();
            toast.success('Subjects assigned successfully');
        } catch (error) {
            console.error('Error saving subjects:', error);
            toast.error('Failed to assign subjects');
        } finally {
            setSavingSubjects(false);
        }
    };

    const toggleSubject = (subjectId) => {
        setSelectedSubjects(prev =>
            prev.includes(subjectId)
                ? prev.filter(id => id !== subjectId)
                : [...prev, subjectId]
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Teacher Management</h1>
                    <p className="text-slate-500 dark:text-slate-400">View and manage all faculty members</p>
                </div>
                <div className="flex gap-2">
                    {selectedIds.length > 0 && (
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 px-4 rounded-lg animate-in fade-in slide-in-from-right-4 duration-300">
                            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                                {selectedIds.length} Selected
                            </span>
                            <div className="h-6 w-px bg-slate-200 dark:bg-slate-600 mx-2" />
                            <button
                                onClick={() => setIsBulkUpdateModalOpen(true)}
                                className="text-xs font-black uppercase text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                Update Spec.
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                className="text-xs font-black uppercase text-red-600 hover:text-red-700 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    )}
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-lg shadow-blue-500/20"
                    >
                        <Plus size={20} className="mr-2" />
                        Add Teacher
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or employee code..."
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
                                <th className="px-6 py-4 w-12">
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        checked={selectedIds.length === filteredTeachers.length && filteredTeachers.length > 0}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th className="px-6 py-4">Teacher</th>
                                <th className="px-6 py-4">Employee ID</th>
                                <th className="px-6 py-4">Specialization</th>
                                <th className="px-6 py-4">Join Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {loading ? (
                                [1, 2, 3].map((n) => (
                                    <tr key={n} className="animate-pulse">
                                        <td className="px-6 py-4"></td>
                                        <td className="px-6 py-4"><div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-full"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
                                        <td className="px-6 py-4 text-right"><div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : filteredTeachers.length > 0 ? (
                                filteredTeachers.map((teacher) => (
                                    <tr
                                        key={teacher.id}
                                        className={`hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors ${selectedIds.includes(teacher.id) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                            }`}
                                    >
                                        <td className="px-6 py-4 w-12">
                                            <input
                                                type="checkbox"
                                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                checked={selectedIds.includes(teacher.id)}
                                                onChange={() => toggleSelect(teacher.id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center font-bold">
                                                    {teacher.user?.name?.charAt(0) || 'T'}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-semibold text-slate-800 dark:text-white">
                                                        {teacher.user?.name || 'Unknown'}
                                                    </div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center mt-0.5">
                                                        <Mail size={12} className="mr-1" />
                                                        {teacher.user?.email || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-mono">
                                            {teacher.employee_code}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                                <Briefcase size={12} className="mr-1" />
                                                {teacher.specialization || 'General'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                            <span className="flex items-center">
                                                <Calendar size={12} className="mr-1" />
                                                {teacher.join_date ? new Date(teacher.join_date).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleManageSubjects(teacher)}
                                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                                                    title="Manage Subjects"
                                                >
                                                    <BookOpen size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenModal(teacher)}
                                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                                                    title="Edit Teacher"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(teacher.id)}
                                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                                                    title="Delete Teacher"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                        No teachers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Individual Teacher Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                            <input
                                required
                                type="text"
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 dark:text-slate-200"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                            <input
                                required
                                type="email"
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 dark:text-slate-200"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Employee ID</label>
                            <input
                                required
                                type="text"
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 dark:text-slate-200"
                                value={formData.employee_code}
                                onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Specialization</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 dark:text-slate-200"
                                value={formData.specialization}
                                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
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
                            {editingTeacher ? 'Update Teacher' : 'Save Teacher'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Manage Subjects Modal */}
            <Modal
                isOpen={isSubjectModalOpen}
                onClose={() => setIsSubjectModalOpen(false)}
                title={`Manage Subjects - ${selectedTeacher?.user?.name}`}
            >
                <div className="space-y-6">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        Select the subjects this teacher is authorized to teach.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto p-1">
                        {allSubjects.map(subject => (
                            <div
                                key={subject.id}
                                onClick={() => toggleSubject(subject.id)}
                                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedSubjects.includes(subject.id)
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                    : 'border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${selectedSubjects.includes(subject.id)
                                        ? 'bg-indigo-500 text-white'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                        }`}>
                                        <BookOpen size={16} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-800 dark:text-white leading-none">{subject.name}</p>
                                        <p className="text-[10px] text-slate-500 mt-1 uppercase font-black tracking-widest">{subject.code}</p>
                                    </div>
                                </div>
                                {selectedSubjects.includes(subject.id) && (
                                    <div className="text-indigo-600 dark:text-indigo-400">
                                        <Check size={20} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => setIsSubjectModalOpen(false)}
                            className="px-6 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-bold text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveSubjects}
                            disabled={savingSubjects}
                            className="px-8 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all font-bold text-sm shadow-lg shadow-indigo-500/25 disabled:opacity-50"
                        >
                            {savingSubjects ? 'Saving...' : 'Save Assignments'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Bulk Update Modal */}
            <Modal
                isOpen={isBulkUpdateModalOpen}
                onClose={() => setIsBulkUpdateModalOpen(false)}
                title={`Bulk Update Specialization: ${selectedIds.length} Teachers`}
            >
                <form onSubmit={handleBulkUpdate} className="space-y-4">
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm mb-4">
                        You are about to update the specialization for <strong>{selectedIds.length}</strong> selected teachers.
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">New Specialization</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. Mathematics, Physics..."
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 dark:text-slate-200"
                            value={bulkSpecialization}
                            onChange={(e) => setBulkSpecialization(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setIsBulkUpdateModalOpen(false)}
                            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
                        >
                            Apply Bulk Update
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AdminTeachers;
