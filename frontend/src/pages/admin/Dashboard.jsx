import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Users, BookOpen, UserCheck, Calendar, Bell, TrendingUp, AlertCircle, ChevronRight } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between h-full hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 shadow-sm group">
        <div className="flex items-start justify-between mb-4">
            <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{value}</h3>
            </div>
            <div className={`p-2.5 rounded-lg ${colorClass} bg-opacity-10 dark:bg-opacity-20`}>
                <Icon size={20} />
            </div>
        </div>
        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center text-xs text-slate-500 dark:text-slate-400">
            <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <TrendingUp size={12} /> +2.5%
            </span>
            <span className="ml-1.5">vs last month</span>
        </div>
    </div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        total_students: 0,
        total_teachers: 0,
        total_classes: 0,
        total_exams: 0,
        payment_trends: [],
        upcoming_exams: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/admin/dashboard');
                setStats(response.data);
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const chartData = stats.revenue_trends || [];

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Summary of school activities and financial metrics</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm">
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Students"
                    value={loading ? '-' : stats.total_students}
                    icon={Users}
                    colorClass="text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30"
                />
                <StatCard
                    title="Total Teachers"
                    value={loading ? '-' : stats.total_teachers}
                    icon={UserCheck}
                    colorClass="text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30"
                />
                <StatCard
                    title="Active Classes"
                    value={loading ? '-' : stats.total_classes}
                    icon={BookOpen}
                    colorClass="text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/30"
                />
                <StatCard
                    title="Scheduled Exams"
                    value={loading ? '-' : stats.total_exams}
                    icon={Calendar}
                    colorClass="text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/30"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Revenue Chart Section */}
                <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 rounded-t-lg">
                        <div>
                            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Revenue Analytics</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Monthly invoicing vs actual collections</p>
                        </div>
                        <div className="flex gap-4 text-xs font-medium">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Invoiced
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Collected
                            </div>
                        </div>
                    </div>

                    <div className="p-4 flex-1 min-h-[350px]">
                        {loading ? (
                            <div className="h-full w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded animate-pulse">
                                <span className="text-sm text-slate-400">Loading metrics...</span>
                            </div>
                        ) : chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorInvoiced" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 11 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 11 }}
                                        tickFormatter={(val) => `$${val}`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            borderColor: '#e2e8f0',
                                            borderRadius: '6px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                            fontSize: '12px'
                                        }}
                                    />
                                    <Area type="monotone" dataKey="invoiced" name="Invoiced" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorInvoiced)" />
                                    <Area type="monotone" dataKey="collected" name="Collected" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCollected)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                                No data available
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column Grid */}
                <div className="space-y-6">
                    {/* Upcoming Events/Exams */}
                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <Bell size={16} className="text-slate-400" />
                                Upcoming Events
                            </h3>
                            <Link to="/admin/notifications" className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline">View All</Link>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {loading ? (
                                <div className="p-4 text-center text-xs text-slate-400">Loading...</div>
                            ) : stats.upcoming_exams.length > 0 ? (
                                stats.upcoming_exams.slice(0, 3).map(exam => (
                                    <div key={exam.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{exam.title}</span>
                                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600">
                                                {new Date(exam.exam_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                                            <span>{exam.subject?.name}</span>
                                            <span>{exam.class?.name}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center bg-slate-50/30 dark:bg-slate-900/30">
                                    <div className="inline-flex p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-300 mb-2">
                                        <Calendar size={20} />
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">No upcoming exams.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Management - Moved Below */}
                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-4">
                        <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <Link to="/admin/students?action=add" className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 hover:bg-white dark:hover:bg-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all group shadow-sm hover:shadow text-center">
                                <Users size={20} className="text-slate-500 dark:text-slate-400 group-hover:text-blue-600 transition-colors mb-2" />
                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">Add Student</span>
                            </Link>
                            <Link to="/admin/teachers?action=add" className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 hover:bg-white dark:hover:bg-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all group shadow-sm hover:shadow text-center">
                                <UserCheck size={20} className="text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 transition-colors mb-2" />
                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">Add Teacher</span>
                            </Link>
                            <Link to="/admin/payments" className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 hover:bg-white dark:hover:bg-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all group shadow-sm hover:shadow text-center">
                                <TrendingUp size={20} className="text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 transition-colors mb-2" />
                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">New Invoice</span>
                            </Link>
                            <Link to="/admin/exams" className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 hover:bg-white dark:hover:bg-slate-800 hover:border-orange-500 dark:hover:border-orange-500 transition-all group shadow-sm hover:shadow text-center">
                                <Calendar size={20} className="text-slate-500 dark:text-slate-400 group-hover:text-orange-600 transition-colors mb-2" />
                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">Schedule Exam</span>
                            </Link>
                            <Link to="/admin/classes" className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 hover:bg-white dark:hover:bg-slate-800 hover:border-amber-500 dark:hover:border-amber-500 transition-all group shadow-sm hover:shadow text-center">
                                <BookOpen size={20} className="text-slate-500 dark:text-slate-400 group-hover:text-amber-600 transition-colors mb-2" />
                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">Classes</span>
                            </Link>
                            <Link to="/admin/settings" className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-500 dark:hover:border-slate-500 transition-all group shadow-sm hover:shadow text-center">
                                <Bell size={20} className="text-slate-500 dark:text-slate-400 group-hover:text-slate-600 transition-colors mb-2" />
                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">Settings</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
