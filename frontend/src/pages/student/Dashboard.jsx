import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    BookOpen,
    Calendar,
    Trophy,
    AlertCircle,
    Clock,
    ArrowRight,
    Star,
    User,
    CreditCard,
    FileText,
    Bell,
    Mail,
    Phone,
    MapPin,
    CheckCircle2,
    Download,
    Eye,
    GraduationCap,
    Receipt
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 flex items-center transition-all hover:shadow-md hover:scale-[1.02] duration-300 border border-slate-100 dark:border-slate-700">
        <div className={`p-4 rounded-2xl ${colorClass} mr-4 transition-transform group-hover:rotate-6`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{title}</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-none mt-1">
                {value}
            </h3>
        </div>
    </div>
);

const StudentDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setError(null);
                const response = await api.get('/student/dashboard');
                setData(response.data);
            } catch (error) {
                console.error('Error fetching student dashboard:', error);
                setError(error.response?.data?.error || 'Failed to load dashboard data. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse p-4">
                <div className="h-10 w-64 bg-slate-200 dark:bg-slate-700 rounded-xl mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>)}
                </div>
                <div className="h-12 w-full max-w-2xl bg-slate-200 dark:bg-slate-700 rounded-xl mt-8"></div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                    <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-3xl"></div>
                    <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-3xl"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-200 dark:border-slate-700 p-12 text-center shadow-sm">
                <div className="p-6 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-full">
                    <AlertCircle size={48} />
                </div>
                <div className="max-w-md">
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white">Something went wrong</h2>
                    <p className="text-slate-500 mt-2 font-medium">{error}</p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/30 active:scale-95"
                >
                    Retry Loading
                </button>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: BookOpen },
        { id: 'academic', label: 'Academic', icon: GraduationCap },
        { id: 'financial', label: 'Financial', icon: CreditCard },
        { id: 'documents', label: 'Documents', icon: FileText },
        { id: 'profile', label: 'Profile', icon: User },
    ];



    return (
        <div className="space-y-8 pb-10">
            {/* Header Hero Area */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-700 rounded-[2rem] p-10 text-white shadow-2xl shadow-blue-500/30">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-widest mb-4">
                            <Star size={12} className="fill-white" /> Student Portal
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                            Welcome back, <span className="text-blue-200">{data?.student?.user?.name || 'Student'}</span>! 👋
                        </h1>
                        <p className="text-blue-100 mt-4 text-lg font-medium opacity-90 max-w-xl">
                            You're enrolled in <span className="font-black text-white px-2 py-0.5 bg-white/10 rounded-lg">{data?.stats?.my_class || 'your class'}</span>.
                            Let's see what's happening today.
                        </p>
                    </div>
                    {data?.student?.photo && (
                        <div className="shrink-0">
                            <img
                                src={data.student.photo}
                                alt="Profile"
                                className="w-32 h-32 md:w-40 md:h-40 rounded-3xl object-cover border-4 border-white/30 shadow-2xl"
                            />
                        </div>
                    )}
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[120%] bg-white/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-20%] left-[-5%] w-[30%] h-[100%] bg-indigo-400/20 rounded-full blur-[80px]"></div>
            </div>

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Upcoming Exams"
                    value={data?.stats?.upcoming_exams || 0}
                    icon={Calendar}
                    colorClass="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                />
                <StatCard
                    title="My Subjects"
                    value={data?.my_subjects?.length || 0}
                    icon={BookOpen}
                    colorClass="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                />
                <StatCard
                    title="Pending Fees"
                    value={`$${data?.stats?.pending_fees || 0}`}
                    icon={AlertCircle}
                    colorClass="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
                />
                <StatCard
                    title="Total Scores"
                    value={data?.stats?.total_results || 0}
                    icon={Trophy}
                    colorClass="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                />
            </div>

            {/* Main Content Area with Custom Tabs */}
            <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-all duration-300 ${isActive
                                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                                    }`}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                <div className="p-8">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Exam Notice Board */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                                        <Calendar className="text-blue-500" /> Upcoming Exams
                                    </h2>
                                    <Link to="/student/exams" className="text-xs font-black text-blue-600 hover:underline">VIEW ALL</Link>
                                </div>
                                <div className="space-y-4">
                                    {data?.upcoming_exams?.length > 0 ? data.upcoming_exams.map(exam => (
                                        <div key={exam.id} className="p-5 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex flex-col items-center justify-center border border-slate-100">
                                                    <span className="text-[10px] font-black text-blue-500 uppercase">{new Date(exam.exam_date).toLocaleDateString(undefined, { month: 'short' })}</span>
                                                    <span className="text-lg font-black text-slate-800 dark:text-white">{new Date(exam.exam_date).toLocaleDateString(undefined, { day: 'numeric' })}</span>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 dark:text-white">{exam.title}</p>
                                                    <p className="text-xs text-slate-500">{exam.subject?.name}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                                    <Clock size={14} /> {exam.start_time}
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-3xl">No exams schedules.</div>
                                    )}
                                </div>
                            </div>

                            {/* Recent Results */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                                        <Trophy className="text-amber-500" /> Recent Results
                                    </h2>
                                    <Link to="/student/results" className="text-xs font-black text-blue-600 hover:underline">VIEW PERFORMANCE</Link>
                                </div>
                                <div className="space-y-4">
                                    {data?.recent_results?.length > 0 ? data.recent_results.map(result => (
                                        <div key={result.id} className="p-5 bg-gradient-to-r from-emerald-50 to-white dark:from-emerald-900/10 dark:to-slate-800 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{result.exam?.subject?.name}</p>
                                                <p className="font-bold text-slate-800 dark:text-white">{result.exam?.title}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-black text-emerald-600">{result.marks_obtained}%</div>
                                                <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{result.grade}</span>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-3xl">No results yet.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'academic' && (
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-lg font-black text-slate-800 dark:text-white mb-6">Enrolled Subjects</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {data?.my_subjects?.length > 0 ? data.my_subjects.map(subject => (
                                        <div key={subject.id} className="p-6 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-start gap-4">
                                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl">
                                                <BookOpen size={24} />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-800 dark:text-white">{subject.name}</p>
                                                <p className="text-xs text-slate-500 mt-1 uppercase tracking-tighter font-bold">{subject.code || 'SUB-00'}</p>
                                            </div>
                                        </div>
                                    )) : <p>No subjects assigned.</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'financial' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 p-8 bg-slate-900 rounded-[2.5rem] text-white overflow-hidden relative shadow-2xl shadow-slate-900/20">
                                <div className="relative z-10">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Treasury Status</p>
                                    <h3 className="text-4xl font-black tracking-tighter">
                                        Outstanding: <span className="text-rose-400">${data?.stats?.pending_fees || 0}</span>
                                    </h3>
                                    <p className="text-slate-400 mt-2 text-sm font-medium">Please settle overdue invoices to avoid academic suspension.</p>
                                </div>
                                <div className="relative z-10 flex gap-4">
                                    <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-md border border-white/10 flex flex-col items-center">
                                        <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl mb-2"><CheckCircle2 size={24} /></div>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Settled</p>
                                        <p className="text-xl font-black">{data?.invoices?.filter(i => i.status === 'paid').length}</p>
                                    </div>
                                    <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-md border border-white/10 flex flex-col items-center">
                                        <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl mb-2"><Clock size={24} /></div>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Awaiting</p>
                                        <p className="text-xl font-black">{data?.invoices?.filter(i => i.status !== 'paid').length}</p>
                                    </div>
                                </div>
                                <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px]"></div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-lg font-black text-slate-800 dark:text-white px-2 uppercase tracking-tight flex items-center gap-3">
                                    <Receipt className="text-indigo-500" /> Bill & Collection History
                                </h3>

                                <div className="grid grid-cols-1 gap-4">
                                    {data?.invoices?.length > 0 ? data.invoices.map(inv => (
                                        <div key={inv.id} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2rem] overflow-hidden shadow-sm hover:border-indigo-400 transition-all group">
                                            <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6">
                                                <div className="flex gap-6">
                                                    <div className="h-14 w-14 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-100 dark:border-slate-700 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                        <FileText size={24} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{inv.invoice_number}</p>
                                                        <h4 className="text-lg font-black text-slate-800 dark:text-white tracking-tight leading-none mb-2 uppercase">{inv.title}</h4>
                                                        <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                                                            <Calendar size={14} className="text-slate-400" />
                                                            Due by {new Date(inv.due_date).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col md:items-end justify-center">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status:</span>
                                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${inv.status === 'paid'
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                                                            : inv.status === 'partial'
                                                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                                                                : 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'
                                                            }`}>
                                                            {inv.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter">${parseFloat(inv.total_amount).toLocaleString()}</span>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Bill</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {inv.payments?.length > 0 && (
                                                <div className="bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-700 p-6 md:p-8">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Transaction logs against this invoice</p>
                                                    <div className="space-y-3">
                                                        {inv.payments.map(pay => (
                                                            <div key={pay.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm transition-transform hover:scale-[1.01]">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="h-10 w-10 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-xl flex items-center justify-center">
                                                                        <CheckCircle2 size={18} />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-black text-slate-700 dark:text-slate-200">${parseFloat(pay.amount).toLocaleString()}</p>
                                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Settled via {pay.method}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-4">
                                                                    <p className="text-xs font-bold text-slate-500">{new Date(pay.payment_date).toLocaleDateString()}</p>
                                                                    <button
                                                                        onClick={() => window.open(`${api.defaults.baseURL}/admin/accounting/payments/${pay.id}/receipt`, '_blank')}
                                                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-xl transition-all"
                                                                        title="Download Receipt"
                                                                    >
                                                                        <Download size={18} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )) : (
                                        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/20 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
                                            <Receipt size={48} className="mx-auto text-slate-300 mb-4" />
                                            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Clear Record: No Invoices Found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'documents' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-black text-slate-800 dark:text-white">Uploaded Documents</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {data?.documents?.length > 0 ? data.documents.map(doc => (
                                    <div key={doc.id} className="p-5 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
                                                <FileText size={24} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-white uppercase tracking-tight">{doc.name}</p>
                                                <p className="text-xs text-slate-500 uppercase font-black">{doc.type || 'PDF'}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl shadow-sm transition-colors text-slate-400 hover:text-blue-500">
                                                <Download size={18} />
                                            </button>
                                            <button className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl shadow-sm transition-colors text-slate-400 hover:text-indigo-500">
                                                <Eye size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-2 text-center py-20 bg-slate-50 dark:bg-slate-900/20 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-slate-700">
                                        <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                                        <p className="text-slate-400 font-bold">No documents uploaded yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="max-w-4xl">
                            <div className="flex flex-col md:flex-row gap-10 items-start">
                                <div className="shrink-0">
                                    <div className="w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 overflow-hidden border-8 border-white dark:border-slate-700 shadow-xl relative group">
                                        {data?.student?.photo ? (
                                            <img src={data.student.photo} alt="Student" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <User size={64} />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                            <p className="text-white text-[10px] font-black uppercase tracking-widest">Update Photo</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                                        <p className="text-lg font-black text-slate-800 dark:text-white">{data?.student?.user?.name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Roll Number</label>
                                        <p className="text-lg font-black text-blue-600">#{data?.student?.roll_number || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Mail size={12} /> Email Address</label>
                                        <p className="font-bold text-slate-700 dark:text-slate-300">{data?.student?.user?.email}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Phone size={12} /> Contact</label>
                                        <p className="font-bold text-slate-700 dark:text-slate-300">{data?.student?.phone || 'Not Provided'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date of Birth</label>
                                        <p className="font-bold text-slate-700 dark:text-slate-300">{data?.student?.date_of_birth ? new Date(data.student.date_of_birth).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gender</label>
                                        <p className="font-bold text-slate-700 dark:text-slate-300 uppercase">{data?.student?.gender || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1 sm:col-span-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><MapPin size={12} /> Residential Address</label>
                                        <p className="font-bold text-slate-700 dark:text-slate-300">{data?.student?.address || 'No address on file.'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Notifications Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                        <Bell className="text-indigo-500" /> Recent Notifications
                    </h2>
                    <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 rounded-2xl text-xs font-black transition-colors">MARK ALL READ</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data?.notifications?.length > 0 ? data.notifications.map(notif => (
                        <div key={notif.id} className="p-6 bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 flex items-start gap-4 shadow-sm group">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 rounded-2xl">
                                <Bell size={20} />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{notif.data?.title || 'Notification'}</h4>
                                <p className="text-sm text-slate-500 mt-1">{notif.data?.message || 'No details available.'}</p>
                                <p className="text-[10px] font-black text-slate-400 mt-3 uppercase tracking-widest">{new Date(notif.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-2 p-8 text-center bg-slate-50 dark:bg-slate-900/20 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-slate-700 text-slate-400 font-bold">
                            You're all caught up! No notifications.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
