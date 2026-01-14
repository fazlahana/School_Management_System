import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import { useNotification } from '../../hooks/useNotification';
import { Calendar, ClipboardList, PenTool, CheckCircle, Search, AlertCircle } from 'lucide-react';

const TeacherExams = () => {
    const { toast } = useNotification();
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [markingModal, setMarkingModal] = useState(false);
    const [markingData, setMarkingData] = useState(null);
    const [marks, setMarks] = useState({}); // {student_id: {marks_obtained: X, remarks: Y}}
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            const response = await api.get('/teacher/exams');
            setExams(response.data);
        } catch (error) {
            console.error('Error fetching exams:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenMarking = async (exam) => {
        try {
            const response = await api.get(`/teacher/exams/${exam.id}/marking`);
            setMarkingData(response.data);

            // Initialize marks state from existing results
            const initialMarks = {};
            response.data.students.forEach(s => {
                const result = s.results[0]; // Logic assumes one result per student per exam
                initialMarks[s.id] = {
                    student_id: s.id,
                    marks_obtained: result ? result.marks_obtained : '',
                    remarks: result ? result.remarks : ''
                };
            });
            setMarks(initialMarks);
            setMarkingModal(true);
        } catch (error) {
            console.error('Error loading marking data:', error);
            toast.error('Failed to load student list for marking');
        }
    };

    const handleMarkChange = (studentId, field, value) => {
        setMarks(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [field]: value
            }
        }));
    };

    const handleSubmitMarks = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                marks: Object.values(marks).filter(m => m.marks_obtained !== '')
            };
            await api.post(`/teacher/exams/${markingData.exam.id}/marks`, payload);
            setMarkingModal(false);
            toast.success('Academic performance updated successfully! 🚀');
            fetchExams();
        } catch (error) {
            console.error('Error saving marks:', error);
            toast.error('Failed to publish marks to the system');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Retrieving academic schedules...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Exam Center</h1>
                    <p className="text-slate-500 dark:text-slate-400">View schedules and record student performance</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams.length > 0 ? (
                    exams.map((exam) => (
                        <div key={exam.id} className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                                    <ClipboardList size={22} />
                                </div>
                                <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${new Date(exam.exam_date) > new Date() ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                    }`}>
                                    {new Date(exam.exam_date) > new Date() ? 'Upcoming' : 'Completed'}
                                </span>
                            </div>

                            <h3 className="text-lg font-black text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                                {exam.title}
                            </h3>

                            <div className="mt-4 space-y-2">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                    <Calendar size={14} className="text-indigo-400" />
                                    {new Date(exam.exam_date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                                <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase">
                                    <span className="text-indigo-500">{exam.subject?.name}</span> • Class {exam.class?.name}
                                </div>
                            </div>

                            <button
                                onClick={() => handleOpenMarking(exam)}
                                className="w-full mt-6 py-3 bg-slate-900 hover:bg-indigo-700 dark:bg-slate-700 dark:hover:bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                            >
                                <PenTool size={16} /> Record Marks
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <AlertCircle size={48} className="mx-auto text-slate-200 mb-4" />
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">No Exams Found</h2>
                        <p className="text-slate-500 text-sm">You haven't been assigned any exams to invigilate or grade yet.</p>
                    </div>
                )}
            </div>

            {/* Marking Modal */}
            <Modal
                isOpen={markingModal}
                onClose={() => !saving && setMarkingModal(false)}
                title={`Performance Entry: ${markingData?.exam?.title}`}
            >
                <div className="max-w-3xl">
                    <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                        <div className="flex justify-between items-center text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                            <span>Total Marks: {markingData?.exam?.total_marks}</span>
                            <span>Passing: {markingData?.exam?.passing_marks}</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmitMarks} className="space-y-4">
                        <div className="max-h-[50vh] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                            {markingData?.students.map(student => (
                                <div key={student.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center gap-4">
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-800 dark:text-white uppercase text-xs">{student.user?.name}</p>
                                        <p className="text-[10px] font-black text-slate-400">{student.student_code}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="w-24">
                                            <input
                                                type="number"
                                                placeholder="Score"
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                                value={marks[student.id]?.marks_obtained}
                                                onChange={(e) => handleMarkChange(student.id, 'marks_obtained', e.target.value)}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-[150px]">
                                            <input
                                                type="text"
                                                placeholder="Remarks"
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                                value={marks[student.id]?.remarks}
                                                onChange={(e) => handleMarkChange(student.id, 'remarks', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-3 pt-6">
                            <button
                                type="button"
                                onClick={() => setMarkingModal(false)}
                                className="px-6 py-3 text-xs font-black uppercase text-slate-500 hover:text-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/20 flex items-center gap-2 disabled:opacity-50"
                            >
                                {saving ? 'Publishing...' : 'Publish Performance Data'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
};

export default TeacherExams;
