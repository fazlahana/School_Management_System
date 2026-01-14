import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, BookOpen, Search, UserCircle } from 'lucide-react';

const TeacherClasses = () => {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchStudent, setSearchStudent] = useState('');

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const response = await api.get('/teacher/classes');
            setClasses(response.data);
            if (response.data.length > 0) {
                fetchClassDetails(response.data[0].id);
            }
        } catch (error) {
            console.error('Error fetching teacher classes:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchClassDetails = async (id) => {
        try {
            const response = await api.get(`/teacher/classes/${id}`);
            setSelectedClass(response.data);
        } catch (error) {
            console.error('Error fetching class details:', error);
        }
    };

    const filteredStudents = selectedClass?.students?.filter(s =>
        (s.user?.name || '').toLowerCase().includes(searchStudent.toLowerCase())
    ) || [];

    if (loading) return <div className="p-8 text-center text-slate-500">Loading your academic world...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Classes</h1>
                    <p className="text-slate-500 dark:text-slate-400">View and manage students across your assigned sections</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Class List */}
                <div className="lg:col-span-1 space-y-3">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Assigned Groups</h2>
                    {classes.map((cls) => (
                        <button
                            key={cls.id}
                            onClick={() => fetchClassDetails(cls.id)}
                            className={`w-full text-left p-4 rounded-2xl transition-all border ${selectedClass?.id === cls.id
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200 dark:shadow-none'
                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${selectedClass?.id === cls.id ? 'bg-white/20' : 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'}`}>
                                    <BookOpen size={18} />
                                </div>
                                <div>
                                    <p className="font-bold">{cls.name}</p>
                                    <p className={`text-[10px] uppercase font-black opacity-70 ${selectedClass?.id === cls.id ? 'text-white' : 'text-slate-400'}`}>
                                        Section {cls.section} • {cls.students_count} Students
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Student List */}
                <div className="lg:col-span-3">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                                        {selectedClass?.name} - Students
                                    </h2>
                                    <p className="text-xs text-slate-500">{filteredStudents.length} learners found</p>
                                </div>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search student..."
                                    className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    value={searchStudent}
                                    onChange={(e) => setSearchStudent(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-6">
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((student) => (
                                    <div key={student.id} className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex items-center gap-4 hover:border-emerald-300 transition-all group">
                                        <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-300 overflow-hidden border border-slate-200 dark:border-slate-700">
                                            {student.photo ? (
                                                <img src={`${api.defaults.baseURL.replace('/api', '')}/storage/${student.photo}`} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <UserCircle size={32} />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 transition-colors">{student.user?.name}</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase">{student.student_code}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center">
                                    <Users size={40} className="mx-auto text-slate-200 mb-2" />
                                    <p className="text-slate-400 font-bold">No students matched your search</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherClasses;
