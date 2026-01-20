import React from 'react';
import { Menu, Sun, Moon, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from './NotificationBell';

const Topbar = ({ toggleSidebar, isSidebarOpen }) => {
    const { user } = useAuth();
    const [isDark, setIsDark] = React.useState(false);

    const toggleTheme = () => {
        if (isDark) {
            document.documentElement.classList.remove('dark');
        } else {
            document.documentElement.classList.add('dark');
        }
        setIsDark(!isDark);
    };

    return (
        <div className={`fixed top-0 right-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm border-b border-slate-200/50 dark:border-slate-800 z-10 transition-all duration-300 ${isSidebarOpen ? 'left-64' : 'left-20'}`}>
            <div className="h-full px-6 flex items-center justify-between">
                <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">
                    <Menu size={24} />
                </button>

                <div className="flex items-center space-x-4">
                    <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    <NotificationBell />

                    <div className="flex items-center space-x-3 border-l border-slate-200 dark:border-slate-600 pl-4 ml-2">
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.name || 'User'}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role || 'Guest'}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">
                            <User size={18} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Topbar;
