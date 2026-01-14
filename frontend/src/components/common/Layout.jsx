import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuth } from '../../contexts/AuthContext';

const Layout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const { loading } = useAuth();

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            <Sidebar isOpen={isSidebarOpen} />
            <Topbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

            <main
                className={`pt-20 px-6 pb-8 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}
            >
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
