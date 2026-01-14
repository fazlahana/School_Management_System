import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Users, BookOpen, UserCheck, Calendar, Bell, TrendingUp, AlertCircle } from 'lucide-react';

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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">Admin Dashboard</h1>
                    <p className="text-slate-500 dark:text-slate-400">Welcome back, system administrator!</p>
                </div>
                <div className="flex gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                        Invoiced
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        Collected
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Students"
                    value={loading ? '...' : stats.total_students}
                    icon={Users}
                    colorClass="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                />
                <StatCard
                    title="Total Teachers"
                    value={loading ? '...' : stats.total_teachers}
                    icon={UserCheck}
                    colorClass="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                />
                <StatCard
                    title="Total Classes"
                    value={loading ? '...' : stats.total_classes}
                    icon={BookOpen}
                    colorClass="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                />
                <StatCard
                    title="Total Exams"
                    value={loading ? '...' : stats.total_exams}
                    icon={Calendar}
                    colorClass="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Payment Trend Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
                        <TrendingUp size={200} />
                    </div>

                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Revenue Overview</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Monthly invoicing vs collections</p>
                            </div>
                        </div>
                    </div>

                    <div className="h-[300px] w-full mt-4" style={{ minHeight: '300px' }}>
                        {loading ? (
                            <div className="h-full w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-lg animate-pulse">
                                <p className="text-slate-400">Loading chart data...</p>
                            </div>
                        ) : chartData && chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" minHeight={100}>
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorInvoiced" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                                        tickFormatter={(value) => `$${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1e293b',
                                            border: 'none',
                                            borderRadius: '12px',
                                            color: '#fff',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                                        }}
                                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                        cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5 5' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="invoiced"
                                        name="Invoiced"
                                        stroke="#6366f1"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorInvoiced)"
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="collected"
                                        name="Collected"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorCollected)"
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700">
                                <p className="text-slate-400 italic">No financial activity recorded for the past 6 months.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Exam Notifications */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Bell className="text-indigo-500" size={20} />
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Exam Alerts</h2>
                        </div>
                        <Link to="/admin/notifications" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">View All</Link>
                    </div>
                    <div className="space-y-4">
                        {loading ? (
                            [1, 2, 3].map(n => (
                                <div key={n} className="h-16 bg-slate-50 dark:bg-slate-900 animate-pulse rounded-lg"></div>
                            ))
                        ) : stats.upcoming_exams.length > 0 ? (
                            stats.upcoming_exams.map((exam) => (
                                <div key={exam.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-indigo-300 transition-all group">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-white text-sm group-hover:text-indigo-600 transition-colors">
                                                {exam.title}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                {exam.subject?.name} • {exam.class?.name}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                                {new Date(exam.exam_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">{exam.start_time}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-full mb-3 text-slate-300">
                                    <AlertCircle size={32} />
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">No upcoming exams scheduled.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Recent Activity</h2>
                        <Link to="/admin/notifications" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">View All</Link>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                            <div>
                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug">System migration complete. All modules operational.</p>
                                <p className="text-[10px] text-slate-400 uppercase font-bold mt-1 tracking-wider">Just Now</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="mt-1.5 h-2 w-2 rounded-full bg-slate-300"></div>
                            <div>
                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug">Database backup auto-scheduled for 03:00 AM.</p>
                                <p className="text-[10px] text-slate-400 uppercase font-bold mt-1 tracking-wider">10 Minutes Ago</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Quick Management</h2>
                    </div>
                    <div className="p-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-4">
                        <Link to="/admin/students" className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 rounded-xl flex flex-col items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group">
                            <Users className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold text-slate-700 dark:text-white">Add Student</span>
                        </Link>
                        <Link to="/admin/teachers" className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 rounded-xl flex flex-col items-center gap-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all group">
                            <UserCheck className="text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold text-slate-700 dark:text-white">Add Teacher</span>
                        </Link>
                        <Link to="/admin/classes" className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 rounded-xl flex flex-col items-center gap-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all group">
                            <BookOpen className="text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold text-slate-700 dark:text-white">New Class</span>
                        </Link>
                        <Link to="/admin/exams" className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 rounded-xl flex flex-col items-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group">
                            <Calendar className="text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold text-slate-700 dark:text-white">New Exam</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
