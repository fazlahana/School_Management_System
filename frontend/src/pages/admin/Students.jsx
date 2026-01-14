import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import {
    Users,
    Search,
    Plus,
    MoreVertical,
    Mail,
    User,
    BookOpen,
    ExternalLink,
    Filter,
    Trash2,
    Edit2,
    Eye,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    Download,
    Upload,
    CheckCircle2,
    XCircle,
    Info,
    Send,
    X,
    Calendar,
    ArrowUpCircle,
    GraduationCap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotification } from '../../hooks/useNotification';

const AdminStudents = () => {
    const { toast, alert } = useNotification();
    // Basic Data State
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination State
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(15);
    const [total, setTotal] = useState(0);
    const [lastPage, setLastPage] = useState(1);

    // Filter & Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filters, setFilters] = useState({
        class_id: '',
        status: '',
        unassigned: false,
        date_from: '',
        date_to: ''
    });
    const [isFilterVisible, setIsFilterVisible] = useState(false);

    // Sorting State
    const [sort, setSort] = useState({ field: 'created_at', order: 'desc' });

    // Selection State
    const [selectedIds, setSelectedIds] = useState([]);

    // Modals & Panels State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkStatusModalOpen, setIsBulkStatusModalOpen] = useState(false);
    const [isBulkEmailModalOpen, setIsBulkEmailModalOpen] = useState(false);
    const [isQuickPreviewOpen, setIsQuickPreviewOpen] = useState(false);

    const [editingStudent, setEditingStudent] = useState(null);
    const [previewStudent, setPreviewStudent] = useState(null);

    // Form Data
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        student_code: '',
        class_id: '',
        date_of_birth: '',
        guardian_name: '',
        status: 'active'
    });

    const [bulkStatus, setBulkStatus] = useState('active');
    const [bulkEmailData, setBulkEmailData] = useState({ subject: '', message: '' });

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch Data
    useEffect(() => {
        fetchStudents();
    }, [page, perPage, debouncedSearch, filters, sort]);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                per_page: perPage,
                search: debouncedSearch,
                sort_by: sort.field,
                sort_order: sort.order,
                ...filters
            };
            const response = await api.get('/admin/students', { params });
            setStudents(response.data.data || []);
            setTotal(response.data.total || 0);
            setLastPage(response.data.last_page || 1);
        } catch (error) {
            toast.error('Failed to fetch students');
        } finally {
            setLoading(false);
        }
    };

    const fetchClasses = async () => {
        try {
            const response = await api.get('/admin/classes');
            setClasses(response.data.data || []);
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    };

    // Handlers
    const handleSort = (field) => {
        setSort(prev => ({
            field,
            order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
        }));
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === students.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(students.map(s => s.id));
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleOpenModal = (student = null) => {
        if (student) {
            setEditingStudent(student);
            setFormData({
                name: student.user?.name || '',
                email: student.user?.email || '',
                password: '',
                student_code: student.student_code || '',
                class_id: student.class_id || '',
                date_of_birth: student.date_of_birth ? student.date_of_birth.split('T')[0] : '',
                guardian_name: student.guardian_name || '',
                status: student.status || 'active'
            });
        } else {
            setEditingStudent(null);
            setFormData({
                name: '',
                email: '',
                password: '',
                student_code: '',
                class_id: '',
                date_of_birth: '',
                guardian_name: '',
                status: 'active'
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const loadToast = toast.loading(editingStudent ? 'Updating student...' : 'Creating student...');
        try {
            if (editingStudent) {
                await api.put(`/admin/students/${editingStudent.id}`, formData);
                toast.success('Student updated successfully!', { id: loadToast });
            } else {
                await api.post('/admin/students', formData);
                toast.success('Student created successfully!', { id: loadToast });
            }
            setIsModalOpen(false);
            fetchStudents();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save student info.', { id: loadToast });
        }
    };

    const handleDeleteClick = async (student) => {
        const result = await alert.confirmDelete(
            'Delete Student?',
            `Are you sure you want to delete ${student.user?.name}? This will remove all their records.`
        );
        if (result.isConfirmed) {
            confirmDelete(student);
        }
    };

    const handleBulkDeleteClick = async () => {
        const result = await alert.confirmDelete(
            'Delete Multiple Students?',
            `Are you sure you want to delete ${selectedIds.length} students? This action cannot be undone.`
        );
        if (result.isConfirmed) {
            confirmDelete({ bulk: true, ids: [...selectedIds] });
        }
    };

    const confirmDelete = async (target) => {
        const studentBackup = [...students];
        const selectedBackup = [...selectedIds];
        const loadToast = toast.loading('Deleting student(s)...');

        // Optimistic Update
        if (target.bulk) {
            setStudents(prev => prev.filter(s => !selectedBackup.includes(s.id)));
            setSelectedIds([]);
        } else {
            setStudents(prev => prev.filter(s => s.id !== target.id));
            setSelectedIds(prev => prev.filter(id => id !== target.id));
        }

        try {
            if (target.bulk) {
                await api.post('/admin/students/bulk-delete', { ids: selectedBackup });
            } else {
                await api.delete(`/admin/students/${target.id}`);
            }
            toast.success('Deleted successfully!');
            toast.dismiss(loadToast);
            fetchStudents();
        } catch (error) {
            setStudents(studentBackup);
            setSelectedIds(selectedBackup);
            toast.error('Failed to delete.');
            toast.dismiss(loadToast);
        }
    };

    const handleBulkStatusUpdate = async (e) => {
        e.preventDefault();
        const loadToast = toast.loading('Updating statuses...');
        try {
            await api.post('/admin/students/bulk-status', {
                ids: selectedIds,
                status: bulkStatus
            });
            toast.success('Statuses updated successfully!', { id: loadToast });
            setIsBulkStatusModalOpen(false);
            fetchStudents();
        } catch (error) {
            toast.error('Failed to update status.', { id: loadToast });
        }
    };

    const handleBulkEmail = async (e) => {
        e.preventDefault();
        const loadToast = toast.loading('Sending emails...');
        try {
            await api.post('/admin/students/bulk-email', {
                ids: selectedIds,
                ...bulkEmailData
            });
            toast.success('Emails sent successfully!', { id: loadToast });
            setIsBulkEmailModalOpen(false);
        } catch (error) {
            toast.error('Failed to send emails.', { id: loadToast });
        }
    };

    const exportToCSV = async () => {
        try {
            const response = await api.get('/admin/students/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `students_export_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Exported successfully!');
        } catch (error) {
            toast.error('Failed to export CSV.');
        }
    };

    const handleQuickPreview = (student) => {
        setPreviewStudent(student);
        setIsQuickPreviewOpen(true);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
            case 'inactive': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
            case 'graduated': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300';
        }
    };

    const handleImportCSV = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        const loadToast = toast.loading('Importing students...');
        try {
            await api.post('/admin/students/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Students imported successfully!', { id: loadToast });
            fetchStudents();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Import failed. Check CSV format.', { id: loadToast });
        }
    };

    return (
        <div className="space-y-6 relative min-h-screen">
            <input
                type="file"
                id="csvImport"
                className="hidden"
                accept=".csv"
                onChange={handleImportCSV}
            />
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                        Student Directory
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage enrollments, filters, and bulk actions</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-medium"
                    >
                        <Download size={18} />
                        Export
                    </button>
                    <button
                        onClick={() => document.getElementById('csvImport').click()}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-medium"
                    >
                        <Upload size={18} />
                        Import
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-semibold shadow-lg shadow-blue-500/25 active:scale-95"
                    >
                        <Plus size={20} />
                        Enroll Student
                    </button>
                </div>
            </div>

            {/* Quick Stats / Active Selections */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 bg-slate-900 dark:bg-slate-800 text-white px-6 py-3 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 border border-slate-700">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center text-[10px] font-bold">
                            {selectedIds.length}
                        </div>
                        <span className="text-sm font-medium pr-4 border-r border-slate-700">Selected</span>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => setIsBulkStatusModalOpen(true)} className="flex items-center gap-2 hover:text-blue-400 transition-colors text-sm font-semibold">
                            <CheckCircle2 size={16} /> Status
                        </button>
                        <button onClick={() => setIsBulkEmailModalOpen(true)} className="flex items-center gap-2 hover:text-indigo-400 transition-colors text-sm font-semibold">
                            <Send size={16} /> Email
                        </button>
                        <button onClick={handleBulkDeleteClick} className="flex items-center gap-2 hover:text-red-400 transition-colors text-sm font-semibold">
                            <Trash2 size={16} /> Delete
                        </button>
                        <button onClick={() => setSelectedIds([])} className="ml-2 bg-slate-700 hover:bg-slate-600 p-1.5 rounded-lg transition-colors">
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Search and Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-4 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Find students by name, email or code..."
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-700 dark:text-slate-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setIsFilterVisible(!isFilterVisible)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all font-medium ${isFilterVisible
                            ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                            }`}
                    >
                        <Filter size={18} />
                        Filters
                    </button>
                </div>

                {/* Collapsible Filter Bar */}
                {isFilterVisible && (
                    <div className="px-4 pb-4 border-t border-slate-50 dark:border-slate-750 grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 animate-in slide-in-from-top-2 duration-300">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Class</label>
                            <select
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                                value={filters.unassigned === 'true' ? 'unassigned' : filters.class_id}
                                onChange={(e) => {
                                    if (e.target.value === 'unassigned') {
                                        setFilters({ ...filters, class_id: '', unassigned: 'true' });
                                    } else {
                                        setFilters({ ...filters, class_id: e.target.value, unassigned: false });
                                    }
                                }}
                            >
                                <option value="">All Classes</option>
                                <option value="unassigned">Unassigned Only</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Status</label>
                            <select
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            >
                                <option value="">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="graduated">Graduated</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Registration From</label>
                            <input
                                type="date"
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                                value={filters.date_from}
                                onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                            />
                        </div>
                        <div className="flex items-end gap-2">
                            <div className="space-y-1 flex-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">To</label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                                    value={filters.date_to}
                                    onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                                />
                            </div>
                            <button
                                onClick={() => {
                                    setFilters({ class_id: '', status: '', unassigned: false, date_from: '', date_to: '' });
                                    setSearchTerm('');
                                }}
                                className="h-10 px-3 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 w-12 text-center">
                                    <input
                                        type="checkbox"
                                        className="rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                                        checked={students.length > 0 && selectedIds.length === students.length}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th onClick={() => handleSort('name')} className="px-6 py-4 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                                    <div className="flex items-center gap-2">
                                        Student Name
                                        <ArrowUpDown size={14} className={sort.field === 'name' ? 'text-blue-500' : 'text-slate-300'} />
                                    </div>
                                </th>
                                <th onClick={() => handleSort('student_code')} className="px-6 py-4 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                                    <div className="flex items-center gap-2">
                                        Code
                                        <ArrowUpDown size={14} className={sort.field === 'student_code' ? 'text-blue-500' : 'text-slate-300'} />
                                    </div>
                                </th>
                                <th onClick={() => handleSort('class')} className="px-6 py-4 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                                    <div className="flex items-center gap-2">
                                        Class
                                        <ArrowUpDown size={14} className={sort.field === 'class' ? 'text-blue-500' : 'text-slate-300'} />
                                    </div>
                                </th>
                                <th className="px-6 py-4">Status</th>
                                <th onClick={() => handleSort('date_of_birth')} className="px-6 py-4 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                                    <div className="flex items-center gap-2">
                                        DOB
                                        <ArrowUpDown size={14} className={sort.field === 'date_of_birth' ? 'text-blue-500' : 'text-slate-300'} />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 w-4 bg-slate-100 dark:bg-slate-700 rounded m-auto" /></td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full" />
                                                <div className="space-y-2">
                                                    <div className="h-4 w-32 bg-slate-100 dark:bg-slate-700 rounded" />
                                                    <div className="h-3 w-24 bg-slate-100 dark:bg-slate-700 rounded" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-100 dark:bg-slate-700 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-100 dark:bg-slate-700 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-6 w-16 bg-slate-100 dark:bg-slate-700 rounded-full" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-100 dark:bg-slate-700 rounded" /></td>
                                        <td className="px-6 py-4 text-right"><div className="h-8 w-20 bg-slate-100 dark:bg-slate-700 rounded ml-auto" /></td>
                                    </tr>
                                ))
                            ) : students.length > 0 ? (
                                students.map((student) => (
                                    <tr
                                        key={student.id}
                                        className={`group hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors ${selectedIds.includes(student.id) ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''}`}
                                    >
                                        <td className="px-6 py-4 text-center">
                                            <input
                                                type="checkbox"
                                                className="rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                                                checked={selectedIds.includes(student.id)}
                                                onChange={() => toggleSelect(student.id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-110 transition-transform">
                                                    {student.user?.name?.charAt(0) || 'S'}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                        {student.user?.name || 'Unknown'}
                                                    </div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                        {student.user?.email || 'No email provided'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono text-slate-600 dark:text-slate-300">
                                            #{student.student_code}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${student.class ? 'bg-slate-100 border border-slate-200 text-slate-600 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300' : 'bg-amber-50 border border-amber-200 text-amber-600'
                                                }`}>
                                                {student.class ? `${student.class.name}` : 'UNASSIGNED'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${getStatusStyle(student.status)}`}>
                                                {student.status || 'active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                            {student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '---'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => handleQuickPreview(student)}
                                                    className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-blue-500"
                                                    title="Quick View"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <Link
                                                    to={`/admin/students/${student.id}`}
                                                    className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-indigo-500"
                                                    title="Full Profile"
                                                >
                                                    <ExternalLink size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleOpenModal(student)}
                                                    className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-blue-500"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(student)}
                                                    className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-red-500"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="h-16 w-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-200">
                                                <Users size={32} />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No students found</h3>
                                            <p className="text-sm text-slate-400 max-w-xs">We couldn't find any results. Try adjusting your search query or filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Pagination */}
                <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-750 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Showing <span className="font-bold text-slate-800 dark:text-slate-200">{(page - 1) * perPage + 1}</span> to <span className="font-bold text-slate-800 dark:text-slate-200">{Math.min(page * perPage, total)}</span> of <span className="font-bold text-slate-800 dark:text-slate-200">{total}</span>
                        </p>
                        <select
                            className="bg-transparent border-none text-sm font-bold text-slate-600 dark:text-slate-300 outline-none cursor-pointer"
                            value={perPage}
                            onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                        >
                            <option value="10">10 / Page</option>
                            <option value="15">15 / Page</option>
                            <option value="25">25 / Page</option>
                            <option value="50">50 / Page</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-all"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, lastPage) }, (_, i) => {
                                let pageNum;
                                if (lastPage <= 5) pageNum = i + 1;
                                else if (page <= 3) pageNum = i + 1;
                                else if (page >= lastPage - 2) pageNum = lastPage - 4 + i;
                                else pageNum = page - 2 + i;

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setPage(pageNum)}
                                        className={`h-9 w-9 rounded-lg text-sm font-bold transition-all ${page === pageNum
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                            : 'hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            disabled={page === lastPage}
                            onClick={() => setPage(p => Math.min(lastPage, p + 1))}
                            className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-all"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Preview Side Panel */}
            {isQuickPreviewOpen && previewStudent && (
                <div
                    className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-300"
                    onClick={() => setIsQuickPreviewOpen(false)}
                >
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />
                    <div
                        className="relative w-full max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right-full duration-500 ease-out p-0"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Panel Header */}
                        <div className="h-48 bg-gradient-to-br from-blue-600 to-indigo-700 relative">
                            <button
                                onClick={() => setIsQuickPreviewOpen(false)}
                                className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
                            >
                                <X size={20} />
                            </button>
                            <div className="absolute -bottom-12 left-8">
                                <div className="h-24 w-24 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-xl">
                                    <div className="h-full w-full bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-3xl font-black text-blue-600">
                                        {previewStudent.user?.name?.charAt(0) || 'S'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Panel Body */}
                        <div className="pt-16 px-8 pb-12 space-y-8">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                                    {previewStudent.user?.name}
                                </h2>
                                <p className="text-slate-500 font-medium">#{previewStudent.student_code}</p>
                                <div className="flex gap-2 mt-4">
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${getStatusStyle(previewStudent.status)}`}>
                                        {previewStudent.status}
                                    </span>
                                    {previewStudent.class && (
                                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                            {previewStudent.class.name}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Info size={14} /> Personal Information
                                    </h3>
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl space-y-4 border border-slate-100 dark:border-slate-800">
                                        <div className="flex items-start gap-4">
                                            <Mail className="text-slate-400 mt-1" size={18} />
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{previewStudent.user?.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <Calendar className="text-slate-400 mt-1" size={18} />
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date of Birth</p>
                                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                                    {previewStudent.date_of_birth ? new Date(previewStudent.date_of_birth).toLocaleDateString('en-US', { dateStyle: 'long' }) : 'Not provided'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <User className="text-slate-400 mt-1" size={18} />
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Guardian</p>
                                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{previewStudent.guardian_name || 'Not provided'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex justify-between items-center">
                                        <Link
                                            to={`/admin/students/${previewStudent.id}`}
                                            className="grow flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20"
                                        >
                                            View Full Profile <ExternalLink size={18} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Individual Student Modal (Create/Edit) */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingStudent ? 'Update Enrollment' : 'Enroll New Student'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-6 py-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Student Name</label>
                            <input
                                required
                                type="text"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all text-slate-700 dark:text-slate-100 font-medium"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                            <input
                                required
                                type="email"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all text-slate-700 dark:text-slate-100 font-medium"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                                {editingStudent ? 'Change Password (Optional)' : 'Default Password'}
                            </label>
                            <input
                                required={!editingStudent}
                                type="password"
                                placeholder={editingStudent ? 'Leave blank to keep current' : ''}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all text-slate-700 dark:text-slate-100 font-medium"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Student Identifier Code</label>
                            <input
                                required
                                type="text"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all text-slate-700 dark:text-slate-100 font-bold font-mono"
                                value={formData.student_code}
                                onChange={(e) => setFormData({ ...formData, student_code: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Class</label>
                            <select
                                required
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all"
                                value={formData.class_id}
                                onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                            >
                                <option value="">Select a Class...</option>
                                {classes.map((cls) => (
                                    <option key={cls.id} value={cls.id}>{cls.name} ({cls.section})</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Registration Status</label>
                            <select
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive / Suspended</option>
                                <option value="graduated">Graduated</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
                            <input
                                type="date"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all text-slate-700 dark:text-slate-100 font-medium"
                                value={formData.date_of_birth}
                                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Guardian / Parent Name</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all text-slate-700 dark:text-slate-100 font-medium"
                                value={formData.guardian_name}
                                onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-6 py-2.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 font-bold transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-bold shadow-lg shadow-blue-500/25 active:scale-95"
                        >
                            {editingStudent ? 'Commit Changes' : 'Confirm Enrollment'}
                        </button>
                    </div>
                </form>
            </Modal>



            {/* Bulk Status Modal */}
            <Modal
                isOpen={isBulkStatusModalOpen}
                onClose={() => setIsBulkStatusModalOpen(false)}
                title={`Batch Status Update: ${selectedIds.length} Students`}
                size="sm"
            >
                <form onSubmit={handleBulkStatusUpdate} className="space-y-6 pt-2">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Universal Status</label>
                        <div className="grid grid-cols-1 gap-2">
                            {['active', 'inactive', 'graduated'].map(s => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setBulkStatus(s)}
                                    className={`px-4 py-3 rounded-xl border text-left flex items-center justify-between transition-all ${bulkStatus === s
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/10'
                                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <span className="capitalize font-bold">{s}</span>
                                    {bulkStatus === s && <CheckCircle2 size={18} />}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="submit"
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                        >
                            Apply to {selectedIds.length} Students
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Bulk Email Modal */}
            <Modal
                isOpen={isBulkEmailModalOpen}
                onClose={() => setIsBulkEmailModalOpen(false)}
                title={`Broadcast Message: ${selectedIds.length} Recipients`}
                size="lg"
            >
                <form onSubmit={handleBulkEmail} className="space-y-6 pt-2">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Subject / Heading</label>
                            <input
                                required
                                type="text"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold"
                                value={bulkEmailData.subject}
                                onChange={(e) => setBulkEmailData({ ...bulkEmailData, subject: e.target.value })}
                                placeholder="E.g. Monthly Newsletter - January 2026"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Message Content</label>
                            <textarea
                                required
                                rows={6}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm leading-relaxed"
                                value={bulkEmailData.message}
                                onChange={(e) => setBulkEmailData({ ...bulkEmailData, message: e.target.value })}
                                placeholder="Type your broadcast message here..."
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => setIsBulkEmailModalOpen(false)}
                            className="px-6 py-2.5 text-slate-500 hover:text-slate-700 font-bold transition-colors"
                        >
                            Discard
                        </button>
                        <button
                            type="submit"
                            className="px-10 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all font-bold shadow-lg shadow-indigo-500/25 flex items-center gap-2 active:scale-95"
                        >
                            Send Broadcast <Send size={18} />
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AdminStudents;
