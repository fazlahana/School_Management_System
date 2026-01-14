import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Bell, CheckCircle, Info, AlertTriangle, X, Trash2, Check } from 'lucide-react';

const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "just now";
};

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await api.get('/notifications');
            setNotifications(response.data.notifications.data);
        } catch (error) {
            console.error('Error fetching notifications:', error.response?.status, error.response?.data || error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.post(`/notifications/${id}/read`);
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, read_at: new Date() } : n
            ));
        } catch (error) {
            console.error('Error marking read:', error.response?.status, error.response?.data || error);
        }
    };

    const markAllRead = async () => {
        try {
            await api.post('/notifications/mark-all-read');
            setNotifications(notifications.map(n => ({ ...n, read_at: new Date() })));
        } catch (error) {
            console.error('Error marking all read:', error.response?.status, error.response?.data || error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg"><CheckCircle size={20} /></div>;
            case 'warning': return <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg"><AlertTriangle size={20} /></div>;
            case 'error': return <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg"><X size={20} /></div>;
            default: return <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg"><Info size={20} /></div>;
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Notifications</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm italic">Stay updated with the latest school activities</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={async () => {
                            try {
                                setLoading(true);
                                await api.post('/notifications/test');
                                await fetchNotifications();
                            } catch (error) {
                                console.error('Test failed:', error);
                            } finally {
                                setLoading(false);
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors shadow-sm"
                    >
                        <Bell size={16} />
                        Test System
                    </button>
                    <button
                        onClick={markAllRead}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <Check size={16} />
                        Mark all as read
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                {loading ? (
                    <div className="p-20 text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-slate-500">Retrieving notifications...</p>
                    </div>
                ) : notifications.length > 0 ? (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {notifications.map((n) => (
                            <div
                                key={n.id}
                                className={`p-6 flex gap-4 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-700/20 ${!n.read_at ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                            >
                                {getIcon(n.data.type)}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className={`font-bold ${!n.read_at ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                            {n.data.title}
                                        </h3>
                                        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                                            {timeAgo(n.created_at)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                        {n.data.message}
                                    </p>
                                    <div className="flex items-center gap-4 mt-4">
                                        {n.data.link && (
                                            <a href={n.data.link} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                                                View Action
                                            </a>
                                        )}
                                        {!n.read_at && (
                                            <button
                                                onClick={() => markAsRead(n.id)}
                                                className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1"
                                            >
                                                Mark as read
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {!n.read_at && (
                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-2 shadow-[0_0_10px_rgba(37,99,235,0.4)]"></div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-20 text-center">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Bell size={40} className="text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">All clear!</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">You don't have any notifications at the moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
