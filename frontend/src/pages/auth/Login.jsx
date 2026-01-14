import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Lock,
    ShieldCheck,
    GraduationCap,
    Users,
    ArrowRight,
    Loader2,
    CheckCircle2
} from 'lucide-react';
import loginBg from '../../assets/login-bg.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [selectedRole, setSelectedRole] = useState('student'); // Visual only, backend determines actual role
    const { login } = useAuth();
    const { settings } = useSettings();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const user = await login(email, password, selectedRole);
            setSuccess(true);
            setTimeout(() => {
                if (user.role === 'admin') navigate('/admin/dashboard');
                else if (user.role === 'teacher') navigate('/teacher/dashboard');
                else if (user.role === 'student') navigate('/student/dashboard');
            }, 1000);
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        { id: 'admin', label: 'Admin', icon: ShieldCheck, color: 'blue' },
        { id: 'teacher', label: 'Teacher', icon: Users, color: 'indigo' },
        { id: 'student', label: 'Student', icon: GraduationCap, color: 'violet' },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-900 font-sans">
            {/* ... bg ... */}
            <div className="absolute inset-0 z-0">
                <img
                    src={loginBg}
                    alt="Education Background"
                    className="w-full h-full object-cover scale-105 animate-slow-zoom opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-indigo-900/40"></div>
            </div>

            {/* ... blobs ... */}
            <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>

            <div className="relative z-10 w-full max-w-xl px-4 py-8">
                {/* Logo & Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 mb-4 shadow-2xl">
                        {settings?.school_logo ? (
                            <img
                                src={`http://localhost:8000${settings.school_logo}`}
                                alt="School Logo"
                                className="w-12 h-12 object-cover rounded-xl"
                            />
                        ) : (
                            <GraduationCap size={40} className="text-blue-400" />
                        )}
                    </div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
                        {settings?.school_name || 'EduSpire'}
                    </h1>
                    <p className="text-slate-400 font-medium">Empowering Education Everywhere</p>
                </div>

                {/* Login Card */}
                <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden">
                    {/* Role Picker */}
                    <div className="flex p-2 bg-black/20 backdrop-blur-sm">
                        {roles.map((role) => {
                            const Icon = role.icon;
                            const isActive = selectedRole === role.id;
                            return (
                                <button
                                    key={role.id}
                                    type="button"
                                    onClick={() => setSelectedRole(role.id)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all duration-300 ${isActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <Icon size={18} />
                                    <span className="font-semibold text-sm">{role.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="p-8 sm:p-10">
                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-200 animate-shake">
                                <ShieldCheck size={20} className="shrink-0" />
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                        <User size={20} />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-800/50 border border-white/10 text-white pl-12 pr-4 py-4 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-600"
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                    <label htmlFor="password" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Password
                                    </label>
                                    <button type="button" className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">
                                        Forgot?
                                    </button>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                        <Lock size={20} />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-800/50 border border-white/10 text-white pl-12 pr-4 py-4 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-600"
                                        placeholder="Enter your password"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                disabled={loading || success}
                                type="submit"
                                className={`group relative w-full overflow-hidden rounded-2xl p-px font-bold text-white transition-all duration-300 ${success ? 'bg-green-500' : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                                    } shadow-[0_10px_20px_-10px_rgba(59,130,246,0.5)] active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100`}
                            >
                                <div className={`flex items-center justify-center gap-2 py-4 rounded-2xl transition-all duration-300 ${success ? 'bg-green-500' : 'bg-blue-600 group-hover:bg-transparent'
                                    }`}>
                                    {loading ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : success ? (
                                        <CheckCircle2 size={20} className="animate-bounce" />
                                    ) : (
                                        <>
                                            <span>Sign In to {roles.find(r => r.id === selectedRole)?.label}</span>
                                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </div>
                            </button>
                        </form>
                    </div>

                    {/* Footer Info */}
                    <div className="px-8 pb-8 pt-2 text-center">
                        <p className="text-slate-500 text-sm">
                            Don't have an account? <span className="text-blue-400 hover:underline cursor-pointer">Contact Administration</span>
                        </p>
                    </div>
                </div>

                {/* Additional Links */}
                <div className="flex justify-center gap-6 mt-8">
                    {['Terms', 'Privacy', 'Help Center'].map(link => (
                        <button key={link} className="text-slate-500 hover:text-slate-300 text-xs font-semibold transition-colors">
                            {link}
                        </button>
                    ))}
                </div>
            </div>

            {/* Quality of life styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes slow-zoom {
                    0% { transform: scale(1); }
                    100% { transform: scale(1.1); }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-slow-zoom {
                    animation: slow-zoom 20s infinite alternate ease-in-out;
                }
                .animate-shake {
                    animation: shake 0.4s ease-in-out;
                }
            ` }} />
        </div>
    );
};

export default Login;
