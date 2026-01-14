import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import { useNotification } from '../../hooks/useNotification';
import { Plus, BookOpen, Clock, Users, ArrowRight, Trash2, Edit2, AlertCircle } from 'lucide-react';

const TeacherAssignments = () => {
    const { toast, alert } = useNotification();
    const [assignments, setAssignments] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subject_id: '',
        class_id: '',
        due_date: '',
        total_marks: 100
    });

    // Submissions Marking State
    const [isSubModalOpen, setIsSubModalOpen] = useState(false);
    const [selectedAssignmentSubs, setSelectedAssignmentSubs] = useState(null);
    const [gradingLoading, setGradingLoading] = useState({}); // {submissionId: true/false}

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [assignRes, subRes, classRes] = await Promise.all([
                api.get('/teacher/assignments'),
                api.get('/teacher/subjects'),
                api.get('/teacher/classes')
            ]);
            setAssignments(assignRes.data);
            setSubjects(subRes.data || []);
            setClasses(classRes.data || []);
        } catch (error) {
            console.error('Error fetching assignment data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (assignment = null) => {
        if (assignment) {
            setEditingAssignment(assignment);
            setFormData({
                title: assignment.title,
                description: assignment.description,
                subject_id: assignment.subject_id,
                class_id: assignment.class_id,
                due_date: assignment.due_date.split('T')[0],
                total_marks: assignment.total_marks
            });
        } else {
            setEditingAssignment(null);
            setFormData({
                title: '',
                description: '',
                subject_id: '',
                class_id: '',
                due_date: '',
                total_marks: 100
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAssignment) {
                await api.put(`/teacher/assignments/${editingAssignment.id}`, formData);
            } else {
                await api.post('/teacher/assignments', formData);
            }
            setIsModalOpen(false);
            fetchData();
            toast.success('Assignment set successfully!');
        } catch (error) {
            console.error('Error saving assignment:', error);
            toast.error('Error saving assignment. Please check all fields.');
        }
    };

    const handleDelete = async (id) => {
        const result = await alert.confirmDelete('Delete Assignment?', 'Wipe this assignment from history?');
        if (result.isConfirmed) {
            try {
                await api.delete(`/teacher/assignments/${id}`);
                fetchData();
                toast.success('Assignment deleted successfully');
            } catch (error) {
                console.error('Error deleting assignment:', error);
                toast.error('Failed to delete assignment');
            }
        }
    };

    const handleViewSubmissions = async (assignmentId) => {
        try {
            const response = await api.get(`/teacher/assignments/${assignmentId}/submissions`);
            setSelectedAssignmentSubs(response.data);
            setIsSubModalOpen(true);
        } catch (error) {
            console.error('Error fetching submissions:', error);
            toast.error('Failed to load submissions.');
        }
    };

    const submitGrade = async (assignmentId, submissionId, studentId) => {
        const student = selectedAssignmentSubs.submissions.find(s => s.id === studentId);
        const sub = student.submissions[0];

        if (!sub.temp_marks) {
            toast.warning('Please enter marks before submitting.');
            return;
        }

        setGradingLoading(prev => ({ ...prev, [submissionId]: true }));
        try {
            await api.post(`/teacher/assignments/${assignmentId}/grade/${submissionId}`, {
                marks_obtained: sub.temp_marks,
                feedback: sub.temp_feedback
            });

            // Refresh local state
            handleViewSubmissions(assignmentId);
            toast.success('Grade published successfully!');
        } catch (error) {
            console.error('Grading error:', error);
            toast.error('Failed to save grade.');
        } finally {
            setGradingLoading(prev => ({ ...prev, [submissionId]: false }));
        }
    };

    const handleTempChange = (studentId, field, value) => {
        setSelectedAssignmentSubs(prev => ({
            ...prev,
            submissions: prev.submissions.map(s => {
                if (s.id === studentId) {
                    const submission = s.submissions[0];
                    return {
                        ...s,
                        submissions: [{
                            ...submission,
                            [field]: value
                        }]
                    };
                }
                return s;
            })
        }));
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Preparing workspace...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Assignments</h1>
                    <p className="text-slate-500 dark:text-slate-400">Create and track homework for your students</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/20 transition-all"
                >
                    <Plus size={18} /> Create Assignment
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {assignments.length > 0 ? (
                    assignments.map((assignment) => (
                        <div key={assignment.id} className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition-all group relative">
                            <div className="absolute top-6 right-6 flex gap-2">
                                <button onClick={() => handleOpenModal(assignment)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(assignment.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="mb-4">
                                <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full uppercase tracking-tighter">
                                    {assignment.subject?.name}
                                </span>
                            </div>

                            <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight line-clamp-1">{assignment.title}</h3>
                            <p className="text-xs text-slate-500 mt-2 line-clamp-2 min-h-[32px]">{assignment.description}</p>

                            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                                    <Users size={14} className="text-emerald-500" />
                                    Class: {assignment.class?.name}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                                    <Clock size={14} className="text-rose-500" />
                                    Due: {new Date(assignment.due_date).toLocaleDateString()}
                                </div>
                            </div>

                            <button
                                onClick={() => handleViewSubmissions(assignment.id)}
                                className="w-full mt-6 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all flex items-center justify-center gap-2"
                            >
                                <BookOpen size={14} /> View Submissions
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <Plus size={48} className="mx-auto text-slate-200 mb-4" />
                        <h2 className="text-xl font-bold text-slate-400">No Assignments Yet</h2>
                        <button onClick={() => handleOpenModal()} className="mt-4 text-indigo-600 font-bold hover:underline">Start by creating your first task</button>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingAssignment ? 'Edit Assignment' : 'New Assignment'}
            >
                <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 space-y-1">
                            <label className="text-xs font-black uppercase text-slate-400">Title</label>
                            <input
                                required
                                type="text"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2 space-y-1">
                            <label className="text-xs font-black uppercase text-slate-400">Description</label>
                            <textarea
                                required
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-black uppercase text-slate-400">Subject</label>
                            <select
                                required
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                                value={formData.subject_id}
                                onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                            >
                                <option value="">Select Subject</option>
                                {subjects.length > 0 ? (
                                    subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)
                                ) : (
                                    <option disabled>No Subjects Assigned</option>
                                )}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-black uppercase text-slate-400">Class</label>
                            <select
                                required
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                                value={formData.class_id}
                                onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                            >
                                <option value="">Select Class</option>
                                {classes.length > 0 ? (
                                    classes.map(c => <option key={c.id} value={c.id}>{c.name} - {c.section}</option>)
                                ) : (
                                    <option disabled>No Classes Assigned</option>
                                )}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-black uppercase text-slate-400">Due Date</label>
                            <input
                                required
                                type="date"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                                value={formData.due_date}
                                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-black uppercase text-slate-400">Max Marks</label>
                            <input
                                required
                                type="number"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                                value={formData.total_marks}
                                onChange={(e) => setFormData({ ...formData, total_marks: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-8">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 font-black text-xs uppercase text-slate-400">Cancel</button>
                        <button type="submit" className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest">
                            {editingAssignment ? 'Update Task' : 'Deploy Assignment'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Submissions Modal */}
            <Modal
                isOpen={isSubModalOpen}
                onClose={() => setIsSubModalOpen(false)}
                title={`Submissions: ${selectedAssignmentSubs?.assignment?.title}`}
            >
                <div className="max-w-4xl max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="space-y-6">
                        {selectedAssignmentSubs?.submissions.map(student => {
                            const submission = student.submissions[0];
                            return (
                                <div key={student.id} className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 font-bold uppercase">
                                                {student.user?.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-800 dark:text-white text-sm uppercase">{student.user?.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{student.student_code}</p>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${submission ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {submission ? (submission.status === 'graded' ? 'Graded' : 'Submitted') : 'Missing'}
                                        </div>
                                    </div>

                                    {submission ? (
                                        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                                            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Student Response</p>
                                                <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed italic">
                                                    "{submission.submission_text}"
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase">Awarded Marks / {selectedAssignmentSubs.assignment.total_marks}</label>
                                                    <input
                                                        type="number"
                                                        placeholder="Enter Score"
                                                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold"
                                                        value={submission.temp_marks ?? (submission.marks_obtained || '')}
                                                        onChange={(e) => handleTempChange(student.id, 'temp_marks', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase">Teacher Feedback</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Constructive remarks..."
                                                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                                        value={submission.temp_feedback ?? (submission.feedback || '')}
                                                        onChange={(e) => handleTempChange(student.id, 'temp_feedback', e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex justify-end">
                                                <button
                                                    onClick={() => submitGrade(selectedAssignmentSubs.assignment.id, submission.id, student.id)}
                                                    disabled={gradingLoading[submission.id]}
                                                    className="px-6 py-2.5 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50"
                                                >
                                                    {gradingLoading[submission.id] ? 'Publishing...' : (submission.status === 'graded' ? 'Update Grade' : 'Publish Result')}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-4 text-center">
                                            <p className="text-xs font-bold text-slate-400 uppercase italic">Awaiting submission from this student</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default TeacherAssignments;
