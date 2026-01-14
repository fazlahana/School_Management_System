import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, Clock, MapPin, BookOpen, AlertCircle } from 'lucide-react';

const StudentExams = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const response = await api.get('/student/exams');
                setExams(response.data);
            } catch (error) {
                console.error('Error fetching student exams:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchExams();
    }, []);

    if (loading) return <div className="p-8 text-center text-slate-500">Loading your examination schedule...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Exam Timetable</h1>
                    <p className="text-slate-500 dark:text-slate-400">Stay prepared for your upcoming academic assessments</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">
                            <tr>
                                <th className="px-8 py-5">Date & Time</th>
                                <th className="px-8 py-5">Subject</th>
                                <th className="px-8 py-5">Exam Details</th>
                                <th className="px-8 py-5">Location</th>
                                <th className="px-8 py-5">Result</th>
                                <th className="px-8 py-5 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {exams.length > 0 ? (
                                exams.map((exam) => (
                                    <tr key={exam.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex flex-col items-center justify-center border border-indigo-100/50">
                                                    <span className="text-[10px] font-black uppercase">{new Date(exam.exam_date).toLocaleDateString(undefined, { month: 'short' })}</span>
                                                    <span className="text-lg font-black leading-none">{new Date(exam.exam_date).toLocaleDateString(undefined, { day: 'numeric' })}</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight">{new Date(exam.exam_date).toLocaleDateString(undefined, { weekday: 'long' })}</p>
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mt-0.5">
                                                        <Clock size={12} /> {exam.start_time} - {exam.end_time}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                                                    <BookOpen size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tighter">{exam.subject?.name}</p>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase">{exam.subject?.code}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{exam.title}</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase mt-0.5">Max Marks: {exam.total_marks}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                                                <MapPin size={14} className="text-rose-500" />
                                                {exam.location || 'Examination Hall B'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {exam.is_published && exam.results?.[0] ? (
                                                <div className="flex flex-col">
                                                    <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                                                        {exam.results[0].marks_obtained}
                                                        <span className="text-slate-400 text-[10px] ml-1">/ {exam.total_marks}</span>
                                                    </p>
                                                    <p className={`text-[10px] font-black uppercase ${exam.results[0].grade === 'F' ? 'text-rose-500' : 'text-emerald-500'
                                                        }`}>
                                                        Grade: {exam.results[0].grade}
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-black text-slate-300 uppercase italic">Pending</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${new Date(exam.exam_date) > new Date()
                                                ? 'bg-amber-100 text-amber-700'
                                                : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                {new Date(exam.exam_date) > new Date() ? 'Upcoming' : 'Ended'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 text-slate-300">
                                            <AlertCircle size={48} />
                                            <p className="text-slate-500 font-bold">No exams on your current schedule.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentExams;
