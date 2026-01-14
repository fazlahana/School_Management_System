import React, { useState } from 'react';
import { X, Send, Bell } from 'lucide-react';
import api from '../../services/api';
import { useNotification } from '../../hooks/useNotification';

const SendMessageModal = ({ isOpen, onClose, recipient, onSuccess }) => {
    const { toast } = useNotification();
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState('info');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/admin/notifications/send', {
                user_id: recipient.user_id, // Assuming recipient object has user_id
                title,
                message,
                type
            });

            toast.success('Message sent successfully!');
            setTitle('');
            setMessage('');
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-modal-pop">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <Bell size={20} />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-white">Send Notification</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg text-sm mb-4">
                        Sending to: <span className="font-bold">{recipient?.name || 'User'}</span>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">Title / Subject</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Urgent Reminder"
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">Message</label>
                        <textarea
                            required
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message here..."
                            rows="4"
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white resize-none"
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">Importance Level</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => setType('info')}
                                className={`p-2 text-xs font-bold rounded-lg border transition-all ${type === 'info' ? 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'}`}
                            >
                                Info
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('warning')}
                                className={`p-2 text-xs font-bold rounded-lg border transition-all ${type === 'warning' ? 'bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'}`}
                            >
                                Warning
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('error')}
                                className={`p-2 text-xs font-bold rounded-lg border transition-all ${type === 'error' ? 'bg-red-100 border-red-300 text-red-700 dark:bg-red-900/50 dark:text-red-200' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'}`}
                            >
                                Critical
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Send size={16} /> Send Notification
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SendMessageModal;
