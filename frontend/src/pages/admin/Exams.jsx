import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import { useNotification } from '../../hooks/useNotification';
import {
    Calendar,
    Search,
    Plus,
    Edit2,
    Trash2,
    Clock,
    MapPin,
    BookOpen,
    Users,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react';

const AdminExams = () => {
    const { toast, alert } = useNotification();
    const [exams, setExams] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExam, setEditingExam] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        subject_id: '',
        class_id: '',
        teacher_id: '',
        exam_date: '',
        start_time: '',
        end_time: '',
        location: '',
        total_marks: 100,
        passing_marks: 40
    });

    useEffect(() => {
        fetchExams();
        fetchSubjects();
        fetchClasses();
        fetchTeachers();
    }, []);

    const fetchExams = async () => {
        try {
            const response = await api.get('/admin/exams');
            setExams(response.data.data || []);
        } catch (error) {
            console.error('Error fetching exams:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubjects = async () => {
        try {
            const response = await api.get('/admin/subjects');
            setSubjects(response.data.data || []);
        } catch (error) {
            console.error('Error fetching subjects:', error);
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

    const fetchTeachers = async () => {
        try {
            const response = await api.get('/admin/teachers');
            setTeachers(response.data.data || []);
        } catch (error) {
            console.error('Error fetching teachers:', error);
        }
    };

    const handleOpenModal = (exam = null) => {
        if (exam) {
            setEditingExam(exam);
            setFormData({
                title: exam.title || '',
                subject_id: exam.subject_id || '',
                class_id: exam.class_id || '',
                teacher_id: exam.teacher_id || '',
                exam_date: exam.exam_date ? exam.exam_date.split('T')[0] : '',
                start_time: exam.start_time || '',
                end_time: exam.end_time || '',
                location: exam.location || '',
                total_marks: exam.total_marks || 100,
                passing_marks: exam.passing_marks || 40
            });
        } else {
            setEditingExam(null);
            setFormData({
                title: '',
                subject_id: '',
                class_id: '',
                teacher_id: '',
                exam_date: '',
                start_time: '',
                end_time: '',
                location: '',
                total_marks: 100,
                passing_marks: 40
            });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        const result = await alert.confirmDelete('Delete Exam?', 'Are you sure you want to delete this exam?');
        if (result.isConfirmed) {
            try {
                await api.delete(`/admin/exams/${id}`);
                fetchExams();
                toast.success('Exam deleted successfully');
            } catch (error) {
                console.error('Error deleting exam:', error);
                toast.error('Failed to delete exam');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = {
            ...formData,
            subject_id: formData.subject_id || null,
            class_id: formData.class_id || null,
            teacher_id: formData.teacher_id || null,
        };

        try {
            if (editingExam) {
                await api.put(`/admin/exams/${editingExam.id}`, data);
            } else {
                await api.post('/admin/exams', data);
            }
            setIsModalOpen(false);
            fetchExams();
            toast.success(editingExam ? 'Exam updated successfully' : 'Exam scheduled successfully');
        } catch (error) {
            console.error('Error saving exam:', error);
            const errors = error.response?.data?.errors;
            let message = error.response?.data?.message || error.response?.data?.error || 'Failed to save exam info';
            if (errors) {
                message = Object.values(errors).flat().join('\n');
            }
            toast.error(message);
        }
    };

    const filteredExams = exams.filter(exam =>
        (exam.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exam.subject?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Exam Management</h1>
                    <p className="text-slate-500 dark:text-slate-400">Schedule and manage school examinations</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium shadow-lg shadow-indigo-500/20"
                >
                    <Plus size={20} className="mr-2" />
                    Schedule Exam
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by exam title or subject..."
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
                                <th className="px-6 py-4">Exam Info</th>
                                <th className="px-6 py-4">Class & Subject</th>
                                <th className="px-6 py-4">Timing</th>
                                <th className="px-6 py-4">Marks</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {loading ? (
                                [1, 2, 3].map((n) => (
                                    <tr key={n} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
                                        <td className="px-6 py-4 text-right"><div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : filteredExams.length > 0 ? (
                                filteredExams.map((exam) => (
                                    <tr key={exam.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-semibold text-slate-800 dark:text-white">
                                                {exam.title}
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center mt-1">
                                                <MapPin size={12} className="mr-1" />
                                                {exam.location || 'Main Hall'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-800 dark:text-white flex items-center">
                                                <BookOpen size={14} className="mr-1.5 text-blue-500" />
                                                {exam.subject?.name}
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center mt-1">
                                                <Users size={12} className="mr-1.5 text-green-500" />
                                                {exam.class ? `${exam.class.name} - ${exam.class.section}` : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-600 dark:text-slate-300 flex items-center">
                                                <Calendar size={14} className="mr-1.5" />
                                                {new Date(exam.exam_date).toLocaleDateString()}
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center mt-1">
                                                <Clock size={12} className="mr-1.5" />
                                                {exam.start_time} - {exam.end_time}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-slate-800 dark:text-white">
                                                Total: {exam.total_marks}
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                                Pass: {exam.passing_marks}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(exam)}
                                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                                                    title="Edit Exam"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(exam.id)}
                                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                                                    title="Delete Exam"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                        No exams scheduled.
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
                title={editingExam ? 'Edit Exam' : 'Schedule New Exam'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {(subjects.length === 0 || classes.length === 0) && (
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-lg flex items-start gap-3">
                            <AlertCircle size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-amber-700 dark:text-amber-400">
                                <strong>Prerequisites Missing:</strong> Please ensure you have created both <strong>Subjects</strong> and <strong>Classes</strong> before scheduling an exam.
                            </p>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Exam Title</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Midterm Examination 2024"
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 dark:text-slate-200"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Subject</label>
                            <select
                                required
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 dark:text-slate-200"
                                value={formData.subject_id}
                                onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                            >
                                <option value="">Select Subject</option>
                                {subjects.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Class</label>
                            <select
                                required
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 dark:text-slate-200"
                                value={formData.class_id}
                                onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                            >
                                <option value="">Select Class</option>
                                {classes.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Invigilator (Teacher)</label>
                            <select
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 dark:text-slate-200"
                                value={formData.teacher_id}
                                onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                            >
                                <option value="">Select Teacher (Optional)</option>
                                {teachers.map((t) => (
                                    <option key={t.id} value={t.id}>{t.user?.name || 'Unknown Teacher'}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Exam Date</label>
                            <input
                                required
                                type="date"
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 dark:text-slate-200"
                                value={formData.exam_date}
                                onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Start Time</label>
                            <input
                                required
                                type="time"
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 dark:text-slate-200"
                                value={formData.start_time}
                                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">End Time</label>
                            <input
                                required
                                type="time"
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 dark:text-slate-200"
                                value={formData.end_time}
                                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Marks</label>
                            <input
                                required
                                type="number"
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 dark:text-slate-200"
                                value={formData.total_marks}
                                onChange={(e) => setFormData({ ...formData, total_marks: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Passing Marks</label>
                            <input
                                required
                                type="number"
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 dark:text-slate-200"
                                value={formData.passing_marks}
                                onChange={(e) => setFormData({ ...formData, passing_marks: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Location / Room No.</label>
                            <input
                                type="text"
                                placeholder="e.g. Room 302, Science Hall"
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 dark:text-slate-200"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
                        >
                            {editingExam ? 'Update Exam' : 'Schedule Exam'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AdminExams;
