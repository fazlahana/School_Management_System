import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, BookOpen, Calendar, ClipboardCheck, Clock, ArrowRight, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 flex items-center transition-transform hover:scale-[1.02] duration-300">
        <div className={`p-4 rounded-xl ${colorClass} mr-4`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white leading-none mt-1">
                {value}
            </h3>
        </div>
    </div>
);

const TeacherDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get('/teacher/dashboard');
                setData(response.data);
            } catch (error) {
                console.error('Error fetching teacher dashboard:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                    <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">Teacher Dashboard</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage your classes and student progress</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Students"
                    value={data?.stats?.total_students || 0}
                    icon={Users}
                    colorClass="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                />
                <StatCard
                    title="My Classes"
                    value={data?.stats?.total_classes || 0}
                    icon={BookOpen}
                    colorClass="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                />
                <StatCard
                    title="Active Subjects"
                    value={data?.stats?.total_subjects || 0}
                    icon={ClipboardCheck}
                    colorClass="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                />
                <StatCard
                    title="Assignments"
                    value={data?.stats?.active_assignments || 0}
                    icon={Calendar}
                    colorClass="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Exams Notifications */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Bell className="text-amber-500" size={20} />
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Upcoming Exams</h2>
                        </div>
                        <Link to="/teacher/exams" className="text-xs font-bold text-blue-600 hover:underline">View All</Link>
                    </div>
                    <div className="space-y-4">
                        {data?.upcoming_exams?.length > 0 ? (
                            data.upcoming_exams.map((exam) => (
                                <div key={exam.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 group">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-white text-sm">{exam.title}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                {exam.subject?.name} • Class: {exam.class?.name}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-amber-600">
                                                {new Date(exam.exam_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-end">
                                                <Clock size={10} className="mr-1" /> {exam.start_time}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center py-6 text-slate-500 dark:text-slate-400 text-sm italic">No exams scheduled for your classes.</p>
                        )}
                    </div>
                </div>

                {/* Recent Assignments */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <ClipboardCheck className="text-indigo-500" size={20} />
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Recent Assignments</h2>
                        </div>
                        <Link to="/teacher/assignments" className="text-xs font-bold text-blue-600 hover:underline">Manage</Link>
                    </div>
                    <div className="space-y-4">
                        {data?.recent_assignments?.length > 0 ? (
                            data.recent_assignments.map((assignment) => (
                                <div key={assignment.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 dark:text-white">{assignment.title}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Due: {new Date(assignment.due_date).toLocaleDateString()}</p>
                                    </div>
                                    <ArrowRight size={16} className="text-slate-400" />
                                </div>
                            ))
                        ) : (
                            <p className="text-center py-6 text-slate-500 dark:text-slate-400 text-sm italic">No assignments created yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
