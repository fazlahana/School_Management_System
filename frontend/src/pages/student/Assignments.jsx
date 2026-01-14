import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import { useNotification } from '../../hooks/useNotification';
import { ClipboardCheck, Clock, CheckCircle, AlertCircle, Send, BookOpen, AlertTriangle } from 'lucide-react';

const StudentAssignments = () => {
    const { toast } = useNotification();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitModal, setSubmitModal] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submissionText, setSubmissionText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            const response = await api.get('/student/assignments');
            setAssignments(response.data);
        } catch (error) {
            console.error('Error fetching student assignments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenSubmit = (assignment) => {
        setSelectedAssignment(assignment);
        setSubmissionText(assignment.submission?.submission_text || '');
        setSubmitModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post(`/student/assignments/${selectedAssignment.id}/submit`, {
                submission_text: submissionText
            });
            setSubmitModal(false);
            toast.success('Mission accomplished! Your work has been submitted. 🚀');
            fetchAssignments();
        } catch (error) {
            console.error('Submission error:', error);
            toast.error(error.response?.data?.message || 'Failed to transmit your work. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'graded': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
            case 'submitted': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'overdue': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
            default: return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Retrieving your pending tasks...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Assignments</h1>
                    <p className="text-slate-500 dark:text-slate-400">Complete your homework and track submission status</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {assignments.length > 0 ? (
                    assignments.map((assignment) => (
                        <div key={assignment.id} className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition-all group flex flex-col md:flex-row gap-6">
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 rounded-xl">
                                        <BookOpen size={18} />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{assignment.subject?.name}</span>
                                </div>

                                <div>
                                    <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight group-hover:text-indigo-600 transition-colors uppercase">
                                        {assignment.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">{assignment.description}</p>
                                </div>

                                <div className="flex items-center gap-6 pt-2">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                                        <Clock size={12} className="text-indigo-400" />
                                        Due: {new Date(assignment.due_date).toLocaleDateString()}
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusStyle(assignment.status)}`}>
                                        {assignment.status}
                                    </div>
                                </div>

                                {assignment.status === 'graded' && (
                                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800 space-y-2">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                                            <span>Score: {assignment.submission?.marks_obtained} / {assignment.total_marks}</span>
                                        </div>
                                        {assignment.submission?.feedback && (
                                            <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">
                                                “{assignment.submission.feedback}”
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="md:w-48 flex flex-col justify-center items-stretch gap-3">
                                <button
                                    onClick={() => handleOpenSubmit(assignment)}
                                    className={`py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${['submitted', 'graded'].includes(assignment.status)
                                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20'
                                        }`}
                                >
                                    {['submitted', 'graded'].includes(assignment.status) ? (
                                        <><ClipboardCheck size={14} /> {assignment.status === 'graded' ? 'View Work' : 'Edit Work'}</>
                                    ) : (
                                        <><Send size={14} /> Submit Work</>
                                    )}
                                </button>
                                {assignment.status === 'overdue' && (
                                    <div className="flex items-center justify-center gap-1.5 text-rose-500 font-bold text-[10px] uppercase italic">
                                        <AlertTriangle size={12} /> Deadline Missed
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <CheckCircle size={48} className="mx-auto text-slate-200 mb-4" />
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">All Caught Up!</h2>
                        <p className="text-slate-500 text-sm mt-2">No pending assignments at the moment. Good job!</p>
                    </div>
                )}
            </div>

            <Modal
                isOpen={submitModal}
                onClose={() => !submitting && setSubmitModal(false)}
                title={`Work Submission: ${selectedAssignment?.title}`}
            >
                <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30 flex items-start gap-3">
                        <AlertCircle size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-amber-700 dark:text-amber-400">
                            Please ensure your response carefully addresses the assignment objectives before clicking "Finalize Submission".
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Your Submission Text</label>
                        <textarea
                            required
                            className="w-full p-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl outline-none focus:ring-2 focus:ring-indigo-500 min-h-[200px] text-sm leading-relaxed"
                            placeholder="Type or paste your completed work here..."
                            value={submissionText}
                            onChange={(e) => setSubmissionText(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            disabled={submitting}
                            onClick={() => setSubmitModal(false)}
                            className="px-6 py-3 text-xs font-black uppercase text-slate-400 hover:text-slate-700 transition-colors"
                        >
                            Draft for later
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                        >
                            {submitting ? 'Transmitting...' : 'Finalize Submission'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default StudentAssignments;
