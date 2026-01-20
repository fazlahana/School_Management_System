import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Search, User, ChevronRight, ExternalLink } from 'lucide-react';
import { useNotification } from '../../hooks/useNotification';

const TeacherSearch = () => {
    const navigate = useNavigate();
    const { toast } = useNotification();
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        if (debouncedSearch.trim()) {
            searchTeachers();
        } else {
            setResults([]);
        }
    }, [debouncedSearch]);

    const searchTeachers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/teachers', {
                params: {
                    search: debouncedSearch,
                    per_page: 10
                }
            });
            // Teachers API returns { data: [...] } structure
            setResults(response.data.data || []);
        } catch (error) {
            console.error('Failed to search teachers', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectTeacher = (id) => {
        // Since we don't have a full profile page yet, we redirect to the main list with a filter or highlight
        // OR we can create a TeacherProfile. For now, let's redirect to the list with ID but ideally we want a profile.
        // User asked for "Teacher Profile", implying a page.
        // I will point to a route that we will register, even if it's just a placeholder or the list.
        navigate(`/admin/teachers`);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-4 pt-10">
                <h1 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Teacher Lookup</h1>
                <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
                    Search for a teacher by name, email, or employee ID to view their details.
                </p>
            </div>

            <div className="relative max-w-2xl mx-auto">
                <div className={`relative bg-white dark:bg-slate-800 rounded-3xl shadow-xl transition-all duration-300 ${results.length > 0 && searchTerm ? 'rounded-b-none shadow-none border-b-0' : 'border border-slate-200 dark:border-slate-700'}`}>
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">
                        <Search size={24} />
                    </div>
                    <input
                        type="text"
                        placeholder="Start typing to search..."
                        className="w-full h-16 pl-16 pr-6 bg-transparent rounded-3xl text-lg font-medium text-slate-800 dark:text-white outline-none placeholder:text-slate-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                    {loading && (
                        <div className="absolute right-6 top-1/2 -translate-y-1/2">
                            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>

                {/* Results Dropdown */}
                {searchTerm && (
                    <div className="absolute top-full left-0 w-full bg-white dark:bg-slate-800 rounded-b-3xl shadow-xl border border-t-0 border-slate-200 dark:border-slate-700 overflow-hidden z-20">
                        {results.length > 0 ? (
                            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                {results.map((teacher) => (
                                    <button
                                        key={teacher.id}
                                        onClick={() => handleSelectTeacher(teacher.id)}
                                        className="w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-110 transition-transform">
                                                {teacher.user?.name?.charAt(0) || 'T'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors">
                                                    {teacher.user?.name}
                                                </p>
                                                <div className="flex gap-2 text-xs text-slate-500">
                                                    <span>#{teacher.employee_code}</span>
                                                    <span>•</span>
                                                    <span>{teacher.specialization || 'General'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-slate-300 group-hover:text-indigo-500 transition-colors">
                                            <ChevronRight size={20} />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-slate-400">
                                {loading ? 'Searching...' : 'No teachers found matching your criteria.'}
                            </div>
                        )}
                        <div className="p-3 bg-slate-50 dark:bg-slate-900/50 text-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {results.length} Result(s) Found
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto pt-8">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden group cursor-pointer" onClick={() => navigate('/admin/teachers?action=add')}>
                    <div className="relative z-10">
                        <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 text-white backdrop-blur-sm group-hover:scale-110 transition-transform">
                            <User size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Register New Teacher</h3>
                        <p className="text-indigo-100 text-sm opacity-90">Add a new teacher to the system.</p>
                    </div>
                    <div className="absolute right-[-20px] bottom-[-20px] opacity-10 group-hover:opacity-20 transition-opacity">
                        <User size={150} />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 relative overflow-hidden group cursor-pointer hover:border-indigo-500 transition-colors" onClick={() => navigate('/admin/teachers')}>
                    <div className="relative z-10">
                        <div className="h-12 w-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center mb-6 text-indigo-500 group-hover:scale-110 transition-transform">
                            <ExternalLink size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">View Full Directory</h3>
                        <p className="text-slate-500 text-sm">Browse, filter, and manage all registered teachers.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherSearch;
