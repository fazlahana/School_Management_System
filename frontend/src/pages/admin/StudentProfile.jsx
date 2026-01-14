import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import {
    User, Mail, Phone, Calendar, MapPin,
    BookOpen, GraduationCap, ClipboardList, CreditCard,
    FileText, Bell, Settings, Activity, MessageSquare,
    Download, Upload, Shield, Key, Camera, ArrowLeft,
    CheckCircle, AlertCircle, Clock, Trash2, Edit
} from 'lucide-react';

import SendMessageModal from '../../components/common/SendMessageModal';

const StudentProfile = () => {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [uploading, setUploading] = useState(false);
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, [id]);

    const fetchProfile = async () => {
        // ... same functionality
        try {
            const response = await api.get(`/admin/students/${id}/profile`);
            setProfile(response.data);
        } catch (error) {
            console.error('Error fetching student profile:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Gathering student records...</div>;
    if (!profile) return <div className="p-8 text-center text-rose-500">Student profile not found.</div>;

    const { student, subjects, stats, activity_log } = profile;

    const tabs = [
        { id: 'overview', label: 'Overview', icon: User },
        { id: 'academic', label: 'Academic', icon: GraduationCap },
        { id: 'exams', label: 'Exams & Results', icon: ClipboardList },
        { id: 'assignments', label: 'Assignments', icon: BookOpen },
        { id: 'payments', label: 'Payments', icon: CreditCard },
        { id: 'documents', label: 'Documents', icon: FileText },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <SendMessageModal
                isOpen={isMessageModalOpen}
                onClose={() => setIsMessageModalOpen(false)}
                recipient={{ user_id: student.user_id, name: student.user.name }}
            />

            {/* Header / Breadcrumbs */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/admin/students" className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-all text-slate-500 hover:text-blue-500">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Student Profile</h1>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">System Identifier: #{student.student_code}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsMessageModalOpen(true)}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
                    >
                        <MessageSquare size={16} /> Send Message
                    </button>
                    <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2">
                        <Download size={16} /> Export Dossier
                    </button>
                </div>
            </div>

            {/* Profile Overview Card */}
            <div className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-blue-500/20 overflow-hidden">
                            {student.photo ? (
                                <img src={`${api.defaults.baseURL.replace('/api', '')}/storage/${student.photo}`} alt="" className="w-full h-full object-cover" />
                            ) : (
                                student.user?.name?.charAt(0) || 'S'
                            )}
                        </div>
                        <button className="absolute -bottom-2 -right-2 p-2 bg-white dark:bg-slate-700 rounded-xl shadow-lg border border-slate-100 dark:border-slate-600 text-blue-600 hover:scale-110 transition-transform">
                            <Camera size={16} />
                        </button>
                    </div>
                    <div className="flex-1 space-y-4">
                        <div>
                            <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">{student.user?.name}</h2>
                            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400 mt-2">
                                <span className="flex items-center gap-1.5"><Mail size={14} className="text-blue-500" /> {student.user?.email}</span>
                                <span className="flex items-center gap-1.5"><Phone size={14} className="text-emerald-500" /> {student.phone || 'Contact pending'}</span>
                                <span className="flex items-center gap-1.5"><GraduationCap size={14} className="text-indigo-500" /> {student.class ? `${student.class.name} - ${student.class.section}` : 'General Entry'}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-50 dark:border-slate-700/50">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase">Status</p>
                                <span className="text-xs font-black text-emerald-500 uppercase flex items-center gap-1 mt-1">
                                    <Shield size={12} /> Active Enrollment
                                </span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase">Attendance</p>
                                <p className="text-sm font-black text-slate-800 dark:text-white mt-1">{stats.attendance_summary}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase">Fees Status</p>
                                <p className={`text-sm font-black mt-1 ${stats.pending_fees > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                    {stats.pending_fees > 0 ? `$${stats.pending_fees} PENDING` : 'PAID IN FULL'}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase">Last Interaction</p>
                                <p className="text-sm font-black text-slate-800 dark:text-white mt-1">{new Date(stats.last_login).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Decorative background */}
                <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-3xl -z-0"></div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-900/50 rounded-2xl w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                            ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm border border-slate-200 dark:border-slate-700'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                    >
                        <tab.icon size={16} />
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Contents */}
            <div className="min-h-[400px]">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-300">
                        {/* Basic & Personal Info */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-8 flex items-center gap-2">
                                    <User className="text-blue-500" size={20} /> Identity & Contact
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <InfoItem icon={User} label="Full Legal Name" value={student.user?.name} />
                                        <InfoItem icon={Calendar} label="Date of Birth" value={new Date(student.date_of_birth).toLocaleDateString()} />
                                        <InfoItem icon={User} label="Gender Identity" value={student.gender || 'Not specified'} />
                                    </div>
                                    <div className="space-y-4">
                                        <InfoItem icon={Mail} label="Canonical Email" value={student.user?.email} />
                                        <InfoItem icon={Phone} label="Primary Contact" value={student.phone || 'N/A'} />
                                        <InfoItem icon={MapPin} label="Residential Address" value={student.address || 'Address pending'} />
                                    </div>
                                    <div className="md:col-span-2 pt-4 border-t border-slate-50 dark:border-slate-700">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Emergency / Guardian Details</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <InfoItem icon={User} label="Guardian Name" value={student.guardian_name || 'N/A'} />
                                            <InfoItem icon={Phone} label="Guardian Contact" value={student.guardian_phone || 'N/A'} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-8 flex items-center gap-2">
                                    <Activity className="text-emerald-500" size={20} /> System Activity Log
                                </h3>
                                <div className="space-y-4">
                                    {activity_log.map((log, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{log.action}</p>
                                            </div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase">{log.time}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recent Mentions / Remarks */}
                        <div className="lg:col-span-1 space-y-8">
                            <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-500/20">
                                <MessageSquare className="mb-4 text-indigo-200" size={24} />
                                <h3 className="text-xl font-black uppercase tracking-tight">Instructor Remarks</h3>
                                <p className="text-xs text-indigo-100 font-bold mt-2 uppercase tracking-widest">Feedback Dashboard</p>
                                <div className="mt-8 space-y-4">
                                    <div className="p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
                                        <p className="text-xs italic leading-relaxed">"Demonstrated exceptional leadership during the science exhibition last week."</p>
                                        <p className="text-[10px] font-black uppercase mt-4 text-indigo-200">— Prof. Anderson</p>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <p className="text-xs italic leading-relaxed">"Consistently meets all academic deadlines with high-quality submissions."</p>
                                        <p className="text-[10px] font-black uppercase mt-4 text-indigo-200">— Sarah Jenkins</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'academic' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-300">
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-8">Course Curriculum</h3>
                            <div className="space-y-3">
                                {subjects.map(subject => (
                                    <div key={subject.id} className="p-5 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 text-indigo-500">
                                                <BookOpen size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors uppercase text-sm tracking-tight">{subject.name}</p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase mt-0.5">Level {subject.code || 'CORE'}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-8 flex items-center gap-2">
                                    <GraduationCap className="text-indigo-500" size={20} /> Academic Records
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900/30 rounded-2xl">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Enrolment Date</span>
                                        <span className="text-sm font-black text-slate-800 dark:text-white">{new Date(student.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900/30 rounded-2xl">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Grade Classification</span>
                                        <span className="text-sm font-black text-slate-800 dark:text-white">{student.class?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900/30 rounded-2xl">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Primary Instructor</span>
                                        <span className="text-sm font-black text-slate-800 dark:text-white">Assigned by Class</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'exams' && (
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm animate-in slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Performance History</h3>
                            <button className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                                <Download size={16} /> Bulk Report Cards
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left border-b border-slate-100 dark:border-slate-700">
                                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Exam Dossier</th>
                                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Focus Area</th>
                                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Outcome</th>
                                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Grade</th>
                                        <th className="pb-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                    {student.exam_results?.length > 0 ? (
                                        student.exam_results.map(result => (
                                            <tr key={result.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                                                <td className="py-5">
                                                    <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{result.exam?.title}</p>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase mt-0.5">{new Date(result.exam?.exam_date).toLocaleDateString()}</p>
                                                </td>
                                                <td className="py-5">
                                                    <span className="text-xs font-bold text-slate-500 uppercase">{result.exam?.subject?.name}</span>
                                                </td>
                                                <td className="py-5 text-center">
                                                    <div className="inline-block py-1.5 px-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl text-xs font-black">
                                                        {result.marks_obtained}%
                                                    </div>
                                                </td>
                                                <td className="py-5 text-center">
                                                    <span className="text-xs font-black text-slate-700 dark:text-slate-300">{result.grade || 'A'}</span>
                                                </td>
                                                <td className="py-5 text-right">
                                                    <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                                                        <Download size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="py-12 text-center text-slate-400 font-bold italic">No examination history recorded.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'assignments' && (
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm animate-in slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Assignment History</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left border-b border-slate-100 dark:border-slate-700">
                                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assignment</th>
                                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Outcome</th>
                                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                        <th className="pb-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                    {student.assignment_submissions?.length > 0 ? (
                                        student.assignment_submissions.map(sub => (
                                            <tr key={sub.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                                                <td className="py-5">
                                                    <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{sub.assignment?.title}</p>
                                                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-1 italic">"{sub.submission_text.substring(0, 50)}..."</p>
                                                </td>
                                                <td className="py-5">
                                                    <span className="text-xs font-bold text-slate-500 uppercase">{sub.assignment?.subject?.name}</span>
                                                </td>
                                                <td className="py-5 text-center">
                                                    <div className="inline-block py-1.5 px-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl text-xs font-black">
                                                        {sub.marks_obtained ? `${sub.marks_obtained} / ${sub.assignment?.total_marks}` : 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="py-5 text-center">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${sub.status === 'graded' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                        {sub.status}
                                                    </span>
                                                </td>
                                                <td className="py-5 text-right text-[10px] font-black text-slate-400 uppercase">
                                                    {new Date(sub.submitted_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="py-12 text-center text-slate-400 font-bold italic">No assignment activity detected.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'payments' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Outstanding Balance</p>
                                    <p className="text-4xl font-black text-rose-500 mt-1">${stats.pending_fees}</p>
                                </div>
                                <CreditCard size={48} className="text-rose-100 dark:text-rose-900/30" />
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Settled</p>
                                    <p className="text-4xl font-black text-emerald-500 mt-1">${stats.total_paid}</p>
                                </div>
                                <CheckCircle size={48} className="text-emerald-100 dark:text-emerald-900/30" />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-8">Transaction Ledger</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left border-b border-slate-100 dark:border-slate-700">
                                            <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ref ID</th>
                                            <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Allocation</th>
                                            <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantum</th>
                                            <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                            <th className="pb-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Receipt</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                        {student.payments?.length > 0 ? (
                                            student.payments.map(payment => (
                                                <tr key={payment.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                                                    <td className="py-5 font-mono text-xs text-slate-500">#{payment.id.toString().padStart(6, '0')}</td>
                                                    <td className="py-5">
                                                        <p className="text-xs font-bold text-slate-700 dark:text-white uppercase tracking-tight">{payment.type || 'Tuition Fee'}</p>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase mt-1">{new Date(payment.payment_date).toLocaleDateString()}</p>
                                                    </td>
                                                    <td className="py-5 font-black text-slate-800 dark:text-white">${payment.amount}</td>
                                                    <td className="py-5">
                                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${payment.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                                            }`}>
                                                            {payment.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-5 text-right">
                                                        <button className="p-2 text-slate-400 hover:text-indigo-600">
                                                            <Download size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="py-12 text-center text-slate-400 font-bold italic">Financial history clear.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'documents' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-300">
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl">
                                <Upload className="mb-4 text-slate-400" size={24} />
                                <h3 className="text-xl font-black uppercase tracking-tight">Vault Upload</h3>
                                <p className="text-xs text-slate-400 font-bold mt-2 uppercase tracking-widest">Secure File Transmission</p>
                                <div className="mt-8 border-2 border-dashed border-slate-700 rounded-2xl p-8 text-center hover:border-blue-500 transition-all cursor-pointer group">
                                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                        <Plus size={20} className="text-blue-500" />
                                    </div>
                                    <p className="text-xs font-black uppercase text-slate-500">Add New Document</p>
                                    <p className="text-[10px] text-slate-600 mt-2 uppercase">PDF, JPG up to 10MB</p>
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-8">Stored Documents</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {student.documents?.length > 0 ? (
                                    student.documents.map(doc => (
                                        <div key={doc.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 text-rose-500">
                                                    <FileText size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">{doc.document_type.replace('_', ' ')}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">{doc.file_name}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 text-slate-400 hover:text-blue-600">
                                                    <Download size={16} />
                                                </button>
                                                <button className="p-2 text-slate-400 hover:text-rose-600">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    /* Virtual/Placeholder Docs for UI demo if none exist yet */
                                    <>
                                        <DocPlaceholder label="Identity Verification" type="ID Card" />
                                        <DocPlaceholder label="Academic Transcript" type="Transfer Cert" />
                                        <DocPlaceholder label="Proof of Residency" type="Birth Certificate" />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-300">
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-8 flex items-center gap-2">
                                    <Settings className="text-slate-400" size={20} /> Account Access
                                </h3>
                                <form className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormInput label="Account Name" value={student.user?.name} />
                                        <FormInput label="Email Interface" value={student.user?.email} />
                                        <FormInput label="Credential Token" type="password" placeholder="••••••••••••" />
                                        <FormInput label="Security Pin" type="password" placeholder="••••" />
                                    </div>
                                    <div className="pt-6 border-t border-slate-50 dark:border-slate-700 flex justify-end">
                                        <button type="button" className="px-8 py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all hover:scale-105 active:scale-95">
                                            Synchronize Profile
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm text-center">
                                <AlertCircle className="mx-auto text-rose-500 mb-4" size={32} />
                                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Danger Zone</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 mb-8">Account Termination Protocols</p>
                                <button className="px-8 py-3 border-2 border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
                                    Erase Student Records
                                </button>
                            </div>
                        </div>

                        <div className="lg:col-span-1 space-y-8">
                            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                                <Shield className="mb-4 text-blue-500" size={24} />
                                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Permissions</h3>
                                <div className="mt-8 space-y-4">
                                    <PermissionToggle label="Examination Access" enabled={true} />
                                    <PermissionToggle label="Portal Messaging" enabled={true} />
                                    <PermissionToggle label="Fee Submission" enabled={true} />
                                    <PermissionToggle label="Doc Modification" enabled={false} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

/* Helper Components for Refined UI */

const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex gap-4">
        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 text-slate-400">
            <Icon size={18} />
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-0.5">{value || 'DATA PENDING'}</p>
        </div>
    </div>
);

const DocPlaceholder = ({ label, type }) => (
    <div className="p-4 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-between opacity-60">
        <div className="flex items-center gap-4">
            <div className="p-2 bg-white dark:bg-slate-800 rounded-xl text-slate-300">
                <FileText size={20} />
            </div>
            <div>
                <p className="text-xs font-black text-slate-500 uppercase tracking-tight">{label}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">{type}</p>
            </div>
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase">Awaiting File</span>
    </div>
);

const FormInput = ({ label, type = "text", placeholder, value }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <input
            type={type}
            placeholder={placeholder}
            defaultValue={value}
            className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
        />
    </div>
);

const PermissionToggle = ({ label, enabled }) => (
    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700">
        <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase">{label}</span>
        <div className={`w-10 h-5 rounded-full relative transition-colors ${enabled ? 'bg-blue-600' : 'bg-slate-300'}`}>
            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${enabled ? 'right-1' : 'left-1'}`}></div>
        </div>
    </div>
);

export default StudentProfile;
