import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useNotification } from '../../hooks/useNotification';
import {
    Users,
    User,
    BookOpen,
    ArrowLeft,
    Mail,
    Search,
    GraduationCap
} from 'lucide-react';
import PageLoader from '../../components/common/PageLoader';

const AdminClassDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useNotification();
    const [classData, setClassData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [studentSearch, setStudentSearch] = useState('');

    useEffect(() => {
        const fetchClassDetails = async () => {
            try {
                const response = await api.get(`/admin/classes/${id}`);
                setClassData(response.data.data ? response.data.data : response.data);
            } catch (error) {
                console.error('Error fetching class details:', error);
                toast.error('Failed to load class details');
                navigate('/admin/classes');
            } finally {
                setLoading(false);
            }
        };

        fetchClassDetails();
    }, [id, navigate, toast]);

    if (loading) return <PageLoader />;
    if (!classData) return null;

    // Filter students if search term is present
    const students = classData.students || [];
    const filteredStudents = students.filter(student =>
        student.user?.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        student.student_code.toLowerCase().includes(studentSearch.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Back Button */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/admin/classes')}
                    className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 transition-all"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        {classData.name} <span className="text-slate-400 font-normal">Section {classData.section}</span>
                    </h1>
                    <p className="text-slate-500 text-sm">Manage class details and enrolled students</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Class Info Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center">
                            <BookOpen size={20} className="mr-2 text-blue-500" />
                            Class Information
                        </h2>

                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Class Teacher</p>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold">
                                        {classData.teacher?.user?.name.charAt(0) || <User size={18} />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 dark:text-white">
                                            {classData.teacher?.user?.name || 'Not Assigned'}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {classData.teacher?.email || 'No email available'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Capacity</p>
                                    <p className="text-xl font-black text-slate-800 dark:text-white">{classData.capacity}</p>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Enrolled</p>
                                    <p className="text-xl font-black text-slate-800 dark:text-white">{students.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Students List */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-full">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
                                <GraduationCap size={20} className="mr-2 text-indigo-500" />
                                Enrolled Students
                                <span className="ml-2 px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded-full">
                                    {students.length}
                                </span>
                            </h2>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search students..."
                                    className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                                    value={studentSearch}
                                    onChange={(e) => setStudentSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto max-h-[600px]">
                            {filteredStudents.length > 0 ? (
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider sticky top-0 z-10 backdrop-blur-sm">
                                        <tr>
                                            <th className="px-6 py-3">Student Name</th>
                                            <th className="px-6 py-3">Code</th>
                                            <th className="px-6 py-3">Parent/Contact</th>
                                            <th className="px-6 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {filteredStudents.map((student) => (
                                            <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center font-bold text-xs">
                                                            {student.user?.name.charAt(0)}
                                                        </div>
                                                        <span className="font-medium text-slate-700 dark:text-slate-200">{student.user?.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-mono text-slate-500">
                                                    {student.student_code}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-500">
                                                    {student.user?.email || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => navigate(`/admin/students/${student.id}`)}
                                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
                                                    >
                                                        Profile
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-12 text-center text-slate-400">
                                    <Users size={48} className="mx-auto mb-4 opacity-20" />
                                    <p>No students found in this class.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminClassDetails;
