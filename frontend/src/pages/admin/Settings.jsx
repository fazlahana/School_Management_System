import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useNotification } from '../../hooks/useNotification';
import {
    LayoutDashboard,
    Settings as SettingsIcon,
    LogOut,
    Lock,
    User,
    CreditCard,
    FileText,
    Shield,
    Globe,
    AlertCircle,
    BookOpen,
    Percent,
    Landmark,
    FileCheck
} from 'lucide-react';
import classNames from 'classnames';

const Settings = () => {
    const { toast } = useNotification();
    const { user, logout } = useAuth();
    const { settings, updateSettings } = useSettings();
    const [loading, setLoading] = useState(false);
    const [activeSection, setActiveSection] = useState('profile'); // profile, account

    // Local state for form
    const [formData, setFormData] = useState({
        school_name: '',
        school_email: '',
        school_phone: '',
        school_address: '',
        currency_symbol: '',
        academic_year: '',
    });

    React.useEffect(() => {
        if (settings) {
            setFormData(prev => ({ ...prev, ...settings }));
        }
    }, [settings]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateSettings(formData);
            toast.success('Institute profile updated');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    const SidebarItem = ({ icon: Icon, label, isActive, isLocked, onClick }) => (
        <button
            onClick={onClick}
            disabled={isLocked}
            className={classNames(
                "w-full flex items-center justify-between px-4 py-3 text-sm transition-colors relative",
                {
                    "text-blue-600 font-medium bg-blue-50/50 rounded-r-full": isActive,
                    "text-slate-500 hover:text-slate-700 hover:bg-slate-50": !isActive && !isLocked,
                    "text-slate-300 cursor-not-allowed": isLocked
                }
            )}
        >
            <div className="flex items-center gap-3">
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full"></div>}
                {Icon && <Icon size={18} />}
                <span>{label}</span>
            </div>
            {isLocked && <Lock size={14} className="text-slate-300" />}
        </button>
    );

    return (
        <div className="flex h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden text-left">
            {/* Inner Sidebar */}
            <div className="w-64 flex-shrink-0 border-r border-slate-100 bg-white flex flex-col py-6">
                <div className="px-6 mb-6">
                    <h2 className="text-xl font-bold text-slate-800">menu</h2>
                </div>

                <div className="space-y-1 overflow-y-auto flex-1 custom-scrollbar">
                    <SidebarItem icon={LayoutDashboard} label="Dashboard" onClick={() => { }} />

                    <div className="mt-4 px-6 mb-2 flex items-center justify-between text-blue-600 font-medium cursor-pointer">
                        <div className="flex items-center gap-2">
                            <SettingsIcon size={18} />
                            <span>General Settings</span>
                        </div>
                    </div>

                    <div className="pl-4 pr-2 space-y-1">
                        <SidebarItem
                            label="Institute Profile"
                            isActive={activeSection === 'profile'}
                            onClick={() => setActiveSection('profile')}
                        />
                        <SidebarItem label="Fees Particulars" isLocked />
                        <SidebarItem label="Fees Structure" isLocked />
                        <SidebarItem label="Discount Type" isLocked />
                        <SidebarItem label="Accounts For Fees Invoice" isLocked />
                        <SidebarItem label="Rules & Regulations" isLocked />
                        <SidebarItem label="Marks Grading" isLocked />
                        <SidebarItem label="Theme & Language" isLocked />
                        <SidebarItem
                            label="Account Settings"
                            isActive={activeSection === 'account'}
                            onClick={() => setActiveSection('account')}
                        />
                        <SidebarItem
                            label="Log out"
                            onClick={logout}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50 overflow-y-auto">
                <div className="p-6 border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <span className="font-bold text-slate-800">General Settings</span>
                        <span>/</span>
                        <LayoutDashboard size={14} />
                        <span>-</span>
                        <span className="text-slate-800 font-medium">
                            {activeSection === 'profile' ? 'Institute Profile' : 'Account Settings'}
                        </span>
                    </div>
                </div>

                <div className="p-8 flex-1">
                    {activeSection === 'profile' ? (
                        <div className="max-w-6xl mx-auto">
                            <div className="text-center mb-8">
                                <h1 className="text-2xl font-bold text-slate-800">Update Profile</h1>
                                <div className="flex items-center justify-center gap-4 mt-2 text-sm">
                                    <span className="flex items-center gap-1 text-indigo-600 font-medium">
                                        <div className="w-6 h-2 bg-indigo-600 rounded-full"></div> Required*
                                    </span>
                                    <span className="flex items-center gap-1 text-slate-400 font-medium">
                                        <div className="w-6 h-2 bg-slate-400 rounded-full"></div> Optional
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-12 gap-8">
                                {/* Form Section */}
                                <div className="col-span-12 lg:col-span-8">
                                    <form onSubmit={handleUpdate} className="space-y-8">
                                        {/* Logo Section */}
                                        <div className="relative p-8 border border-indigo-200 rounded-3xl bg-white mb-8">
                                            <span className="absolute -top-3 left-8 px-2 bg-white text-indigo-600 text-xs font-bold uppercase tracking-wider">
                                                Institute Logo*
                                            </span>
                                            <div className="flex items-center gap-8">
                                                <div className="w-32 h-32 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center flex-shrink-0 group relative">
                                                    {settings?.school_logo ? (
                                                        <img src={`http://localhost:8000${settings.school_logo}`} alt="Logo" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="text-center p-2">
                                                            <span className="block font-bold text-slate-400 text-xs">YOUR LOGO</span>
                                                            <span className="block font-bold text-slate-400 text-xs">HERE</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <button type="button" className="px-6 py-3 bg-indigo-500 text-white text-sm font-bold rounded-xl hover:bg-indigo-600 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-200">
                                                    <CreditCard size={18} /> Change Logo
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                                            {/* Institute Name */}
                                            <div className="relative group">
                                                <label className="absolute -top-2.5 left-6 px-2 bg-white text-indigo-600 text-xs font-bold z-10">
                                                    Name of Institute*
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.school_name}
                                                    onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
                                                    className="w-full h-14 px-6 rounded-full border border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-slate-700 font-medium placeholder:text-slate-300"
                                                    placeholder="Institute Name"
                                                />
                                            </div>

                                            {/* Phone Number */}
                                            <div className="relative group">
                                                <label className="absolute -top-2.5 left-6 px-2 bg-white text-indigo-600 text-xs font-bold z-10">
                                                    Phone Number*
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.school_phone}
                                                    onChange={(e) => setFormData({ ...formData, school_phone: e.target.value })}
                                                    className="w-full h-14 px-6 rounded-full border border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-slate-700 font-medium placeholder:text-slate-300"
                                                    placeholder="Phone No"
                                                />
                                            </div>

                                            {/* Target Line / Academic Year */}
                                            <div className="relative group">
                                                <label className="absolute -top-2.5 left-6 px-2 bg-white text-indigo-600 text-xs font-bold z-10">
                                                    Academic Year (Target Line)*
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.academic_year}
                                                    onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                                                    className="w-full h-14 px-6 rounded-full border border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-slate-700 font-medium placeholder:text-slate-300"
                                                    placeholder="2025-2026"
                                                />
                                            </div>

                                            {/* Website / Email */}
                                            <div className="relative group">
                                                <label className="absolute -top-2.5 left-6 px-2 bg-white text-slate-400 text-xs font-bold z-10">
                                                    Website / Email
                                                </label>
                                                <input
                                                    type="email"
                                                    value={formData.school_email}
                                                    onChange={(e) => setFormData({ ...formData, school_email: e.target.value })}
                                                    className="w-full h-14 px-6 rounded-full border border-slate-200 focus:border-slate-400 focus:ring-4 focus:ring-slate-400/10 outline-none transition-all text-slate-500 font-medium placeholder:text-slate-300"
                                                    placeholder="admin@school.com"
                                                />
                                            </div>

                                            {/* Address */}
                                            <div className="relative group col-span-1 md:col-span-2">
                                                <label className="absolute -top-2.5 left-6 px-2 bg-white text-indigo-600 text-xs font-bold z-10">
                                                    Address*
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.school_address}
                                                    onChange={(e) => setFormData({ ...formData, school_address: e.target.value })}
                                                    className="w-full h-14 px-6 rounded-full border border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-slate-700 font-medium placeholder:text-slate-300"
                                                    placeholder="Address"
                                                />
                                            </div>

                                            {/* Country / Currency */}
                                            <div className="relative group col-span-1 md:col-span-2">
                                                <label className="absolute -top-2.5 left-6 px-2 bg-white text-indigo-600 text-xs font-bold z-10">
                                                    Currency (Country)*
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.currency_symbol}
                                                    onChange={(e) => setFormData({ ...formData, currency_symbol: e.target.value })}
                                                    className="w-full h-14 px-6 rounded-full border border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-slate-700 font-medium placeholder:text-slate-300"
                                                    placeholder="$"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-center pt-8">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="px-10 py-4 bg-orange-300 hover:bg-orange-400 text-orange-900 font-bold rounded-full transition-all flex items-center gap-3 shadow-lg hover:shadow-orange-300/50"
                                            >
                                                {loading ? (
                                                    <div className="w-5 h-5 border-2 border-orange-900 border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <SettingsIcon size={20} />
                                                )}
                                                Update Profile
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Preview Section */}
                                <div className="col-span-12 lg:col-span-4 h-full">
                                    <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 h-full relative overflow-hidden">
                                        <div className="absolute top-8 left-8 px-4 py-1.5 bg-green-400 text-white text-sm font-bold rounded-full shadow-lg shadow-green-400/40">
                                            Profile View
                                        </div>

                                        <div className="flex flex-col items-center mt-12 mb-10">
                                            <div className="w-40 h-40 rounded-full bg-slate-50 flex items-center justify-center mb-6 overflow-hidden border-8 border-white shadow-2xl">
                                                {settings?.school_logo ? (
                                                    <img src={`http://localhost:8000${settings.school_logo}`} alt="Logo" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="text-center p-2">
                                                        <span className="block font-bold text-slate-400 text-xs">YOUR LOGO</span>
                                                        <span className="block font-bold text-slate-400 text-xs">HERE</span>
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className="text-2xl font-bold text-slate-800 text-center px-4">{formData.school_name || 'Institute Name'}</h3>
                                            <p className="text-slate-500 text-sm font-medium mt-1">{formData.academic_year || 'Institute Target Line'}</p>
                                        </div>

                                        <div className="space-y-6 px-2">
                                            <div className="flex gap-4 group">
                                                <div className="w-6 h-6 flex-shrink-0 text-slate-300 group-hover:text-blue-500 transition-colors">
                                                    <Shield size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">Phone No</p>
                                                    <p className="text-base font-medium text-slate-700">{formData.school_phone || 'xxxxxxxxxx'}</p>
                                                    <div className="w-full h-px bg-slate-100 mt-3 border-t border-dashed border-slate-300"></div>
                                                </div>
                                            </div>

                                            <div className="flex gap-4 group">
                                                <div className="w-6 h-6 flex-shrink-0 text-slate-300 group-hover:text-blue-500 transition-colors">
                                                    <Globe size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">Email</p>
                                                    <p className="text-base font-medium text-blue-600">{formData.school_email || 'email@example.com'}</p>
                                                    <div className="w-full h-px bg-slate-100 mt-3 border-t border-dashed border-slate-300"></div>
                                                </div>
                                            </div>

                                            <div className="flex gap-4 group">
                                                <div className="w-6 h-6 flex-shrink-0 text-slate-300 group-hover:text-blue-500 transition-colors">
                                                    <Globe size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">Website</p>
                                                    <p className="text-base font-medium text-slate-700">------------------</p>
                                                    <div className="w-full h-px bg-slate-100 mt-3 border-t border-dashed border-slate-300"></div>
                                                </div>
                                            </div>

                                            <div className="flex gap-4 group">
                                                <div className="w-6 h-6 flex-shrink-0 text-slate-300 group-hover:text-blue-500 transition-colors">
                                                    <LayoutDashboard size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">Address</p>
                                                    <p className="text-base font-medium text-slate-700 break-words">{formData.school_address || '------------------'}</p>
                                                    <div className="w-full h-px bg-slate-100 mt-3 border-t border-dashed border-slate-300"></div>
                                                </div>
                                            </div>
                                            <div className="flex gap-4 group">
                                                <div className="w-6 h-6 flex-shrink-0 text-slate-300 group-hover:text-blue-500 transition-colors">
                                                    <Globe size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">Country</p>
                                                    <p className="text-base font-medium text-slate-700 break-words">------------------</p>
                                                    <div className="w-full h-px bg-slate-100 mt-3 border-t border-dashed border-slate-300"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <h2 className="text-2xl font-bold text-slate-300">Section Under Maintenance</h2>
                            <p className="text-slate-400">This section is part of the original design but not currently active.</p>
                            <button onClick={() => setActiveSection('profile')} className="mt-4 text-blue-600 font-medium hover:underline">
                                Go back to Profile
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
