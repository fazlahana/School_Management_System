import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Trophy, Star, TrendingUp, AlertCircle, BookOpen } from 'lucide-react';

const StudentResults = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const response = await api.get('/student/results');
                setResults(response.data);
            } catch (error) {
                console.error('Error fetching student results:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, []);

    const getGradeColor = (grade) => {
        if (grade.startsWith('A')) return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
        if (grade.startsWith('B')) return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
        if (grade.startsWith('C')) return 'text-amber-500 bg-amber-50 dark:bg-amber-900/20';
        return 'text-rose-500 bg-rose-50 dark:bg-rose-900/20';
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Compiling your academic record...</div>;

    const averageScore = results.length > 0
        ? (results.reduce((acc, curr) => acc + parseFloat(curr.marks_obtained), 0) / (results.length * 100) * 100).toFixed(1)
        : 0;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Academic Transcript</h1>
                    <p className="text-slate-500 dark:text-slate-400">Track your performance and progress across all examinations</p>
                </div>

                <div className="flex gap-4">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 flex items-center gap-4 shadow-sm">
                        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global average</p>
                            <p className="text-xl font-black text-slate-800 dark:text-white leading-none mt-1">{averageScore}%</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {results.length > 0 ? (
                    results.map((result) => (
                        <div key={result.id} className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all relative overflow-hidden group">
                            <div className="flex justify-between items-start relative z-10">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                                            <BookOpen size={12} /> {result.exam?.subject?.name}
                                        </p>
                                        <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase mt-2 tracking-tight group-hover:text-indigo-600 transition-colors">
                                            {result.exam?.title}
                                        </h3>
                                    </div>
                                    <div className="flex gap-6">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</p>
                                            <p className="text-2xl font-black text-slate-800 dark:text-white">{result.marks_obtained}<span className="text-slate-300 text-sm">/{result.exam?.total_marks}</span></p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Performance</p>
                                            <div className={`mt-1 px-4 py-1 rounded-full text-sm font-black uppercase text-center ${getGradeColor(result.grade)}`}>
                                                {result.grade}
                                            </div>
                                        </div>
                                    </div>
                                    {result.remarks && (
                                        <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instructor's Note</p>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 italic mt-1">"{result.remarks}"</p>
                                        </div>
                                    )}
                                </div>
                                <div className="absolute top-8 right-8 text-slate-50 dark:text-slate-700/50 group-hover:text-indigo-50 transition-colors pointer-events-none">
                                    <Trophy size={80} />
                                </div>
                            </div>
                            {/* Decorative background circle */}
                            <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-full blur-3xl group-hover:bg-indigo-100/50 transition-colors"></div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-24 text-center bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <Star size={48} className="mx-auto text-slate-200 mb-4" />
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Transcript Empty</h2>
                        <p className="text-slate-500 text-sm mt-2">Results are displayed once your instructors finalize the grading process.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentResults;
