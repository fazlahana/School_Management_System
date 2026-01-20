import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../contexts/SettingsContext';
import { useAuth } from '../../contexts/AuthContext';
import { GraduationCap } from 'lucide-react';
import { API_BASE_URL } from '../../services/api';

const Splash = () => {
    const navigate = useNavigate();
    const { settings } = useSettings();
    const { user, isAuthenticated } = useAuth();
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        // Subtle delay for content entry
        const contentTimer = setTimeout(() => setShowContent(true), 100);

        // Redirection timer - reduced to 800ms for better performance
        const redirectTimer = setTimeout(() => {
            if (isAuthenticated && user) {
                if (user.role === 'admin') navigate('/admin/dashboard');
                else if (user.role === 'teacher') navigate('/teacher/dashboard');
                else if (user.role === 'student') navigate('/student/dashboard');
                else navigate('/login');
            } else {
                navigate('/login');
            }
        }, 800);

        return () => {
            clearTimeout(contentTimer);
            clearTimeout(redirectTimer);
        };
    }, [navigate, isAuthenticated, user]);

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden font-sans">
            {/* Dynamic Background Elements */}
            <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>

            <div className={`transition-all duration-1000 transform ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} flex flex-col items-center`}>
                {/* Logo Container */}
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full scale-150 animate-pulse"></div>
                    <div className="relative z-10 w-32 h-32 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-3xl flex items-center justify-center shadow-2xl overflow-hidden">
                        {settings?.school_logo ? (
                            <img
                                src={`${API_BASE_URL}${settings.school_logo}`}
                                alt="Logo"
                                className="w-24 h-24 object-cover rounded-2xl animate-logo-pop"
                            />
                        ) : (
                            <GraduationCap size={64} className="text-blue-400" />
                        )}
                    </div>
                </div>

                {/* Welcome Text */}
                <div className="text-center">
                    <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-slate-400 tracking-tight mb-4 animate-text-glow">
                        Welcome to {settings?.school_name || 'EduSpire'}
                    </h1>
                    <p className="text-slate-400 text-lg font-medium tracking-widest uppercase opacity-80">
                        Empowering the Future of Education
                    </p>
                </div>

                {/* Loading Indicator */}
                <div className="mt-12 flex flex-col items-center gap-4">
                    <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 animate-loading-bar"></div>
                    </div>
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Initialising System...</span>
                </div>
            </div>

            {/* Premium Animations */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes loading-bar {
                    0% { width: 0%; transform: translateX(-100%); }
                    50% { width: 100%; transform: translateX(0%); }
                    100% { width: 100%; transform: translateX(100%); }
                }
                @keyframes logo-pop {
                    0% { transform: scale(0.8); opacity: 0; }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes text-glow {
                    0%, 100% { filter: drop-shadow(0 0 0px rgba(255,255,255,0)); }
                    50% { filter: drop-shadow(0 0 15px rgba(59,130,246,0.3)); }
                }
                .animate-loading-bar {
                    animation: loading-bar 2.5s infinite ease-in-out;
                }
                .animate-logo-pop {
                    animation: logo-pop 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
                .animate-text-glow {
                    animation: text-glow 3s infinite ease-in-out;
                }
                .animate-pulse-slow {
                    animation: pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}} />
        </div>
    );
};

export default Splash;
