import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    BookOpen,
    FileText,
    Calendar,
    Settings,
    LogOut,
    CreditCard,
    ChevronDown,
    ChevronRight,
    Search,
    UserPlus,
    Plus
} from 'lucide-react';
import classNames from 'classnames';

const Sidebar = ({ isOpen }) => {
    const { user, logout, role } = useAuth();
    const { settings } = useSettings();
    const [expandedMenus, setExpandedMenus] = React.useState({});

    const toggleMenu = (name) => {
        setExpandedMenus(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const getNavItems = () => {
        // ... (switch case remains same)
        switch (role) {
            case 'admin':
                return [
                    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
                    {
                        name: 'Students',
                        icon: GraduationCap,
                        path: '/admin/students',
                        children: [
                            { name: 'All Students', icon: GraduationCap, path: '/admin/students' },
                            { name: 'Add Student', icon: UserPlus, path: '/admin/students?action=add' },
                            { name: 'Student Profile', icon: Search, path: '/admin/students/search' },
                        ]
                    },
                    {
                        name: 'Teachers',
                        icon: Users,
                        path: '/admin/teachers',
                        children: [
                            { name: 'All Teachers', icon: Users, path: '/admin/teachers' },
                            { name: 'Add Teacher', icon: UserPlus, path: '/admin/teachers?action=add' },
                            { name: 'Manage Teacher', icon: BookOpen, path: '/admin/teachers?action=manage_subjects' },
                        ]
                    },
                    {
                        name: 'Classes',
                        icon: BookOpen,
                        path: '/admin/classes',
                        children: [
                            { name: 'All Classes', icon: BookOpen, path: '/admin/classes' },
                            { name: 'Add Class', icon: Plus, path: '/admin/classes?action=add' },
                            { name: 'Class Details', icon: Search, path: '/admin/classes?action=details_search' },
                        ]
                    },
                    { name: 'Subjects', icon: FileText, path: '/admin/subjects' },
                    { name: 'Exams', icon: Calendar, path: '/admin/exams' },
                    { name: 'Payments', icon: CreditCard, path: '/admin/payments' },
                ];
            case 'teacher':
                return [
                    { name: 'Dashboard', icon: LayoutDashboard, path: '/teacher/dashboard' },
                    { name: 'My Classes', icon: Users, path: '/teacher/classes' },
                    { name: 'Exams', icon: Calendar, path: '/teacher/exams' },
                    { name: 'Assignments', icon: FileText, path: '/teacher/assignments' },
                ];
            case 'student':
                return [
                    { name: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
                    { name: 'Timetable', icon: Calendar, path: '/student/exams' },
                    { name: 'Results', icon: FileText, path: '/student/results' },
                    { name: 'Assignments', icon: BookOpen, path: '/student/assignments' },
                ];
            default:
                return [];
        }
    };

    const navItems = getNavItems();

    // Get simple initials
    const getInitials = (name) => {
        return name
            ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
            : 'SS';
    };

    return (
        <div className={classNames(
            "fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 to-slate-950 text-white transition-all duration-300 z-20 flex flex-col shadow-xl",
            { "w-64": isOpen, "w-20": !isOpen }
        )}>
            <div className="flex items-center px-4 h-16 border-b border-slate-700 overflow-hidden">
                {settings?.school_logo ? (
                    <img
                        src={`http://localhost:8000${settings.school_logo}`}
                        alt="Logo"
                        className={classNames("h-10 w-10 rounded-lg object-cover transition-all duration-300", { "mr-3": isOpen })}
                    />
                ) : (
                    !isOpen && <span className="font-bold text-xl">{getInitials(settings?.school_name)}</span>
                )}<p></p>

                <h1 className={classNames("font-bold text-lg transition-all duration-300 whitespace-nowrap overflow-hidden text-ellipsis", {
                    "opacity-100": isOpen,
                    "opacity-0 hidden": !isOpen
                })}>
                    {settings?.school_name || 'SchoolSys'}
                </h1>
            </div>

            <nav className="flex-1 px-2 py-6 flex flex-col gap-y-2 overflow-y-auto overflow-x-hidden">
                <div className="space-y-2">
                    {navItems.map((item) => (
                        <div key={item.name}>
                            {item.children ? (
                                <>
                                    <button
                                        onClick={() => toggleMenu(item.name)}
                                        className={classNames(
                                            "w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors text-slate-400 hover:text-white hover:bg-white/5",
                                            { "text-white": expandedMenus[item.name] }
                                        )}
                                    >
                                        <div className="flex items-center">
                                            <item.icon size={20} className="min-w-[20px]" />
                                            <span className={classNames("ml-3 transition-opacity whitespace-nowrap", { "opacity-100": isOpen, "opacity-0 hidden": !isOpen })}>
                                                {item.name}
                                            </span>
                                        </div>
                                        {isOpen && (
                                            expandedMenus[item.name] ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                                        )}
                                    </button>
                                    {/* Submenu */}
                                    <div className={classNames("overflow-hidden transition-all duration-300", {
                                        "max-h-96 opacity-100": expandedMenus[item.name] && isOpen,
                                        "max-h-0 opacity-0": !expandedMenus[item.name] || !isOpen
                                    })}>
                                        <div className="mt-1 ml-4 space-y-1 border-l border-slate-700 pl-2">
                                            {item.children.map((child) => (
                                                <NavLink
                                                    key={child.name}
                                                    to={child.path}
                                                    className={({ isActive }) => classNames(
                                                        "flex items-center px-4 py-2 rounded-lg transition-colors text-sm",
                                                        { "bg-blue-600 text-white": isActive && !child.path.includes('?action=add'), "text-slate-400 hover:text-white": !isActive }
                                                    )}
                                                >
                                                    <child.icon size={16} className="min-w-[16px]" />
                                                    <span className="ml-3 truncate">{child.name}</span>
                                                </NavLink>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) => classNames(
                                        "flex items-center px-4 py-3 rounded-lg transition-colors",
                                        { "bg-blue-600 text-white": isActive, "text-slate-400 hover:bg-slate-800 hover:text-white": !isActive }
                                    )}
                                >
                                    <item.icon size={20} className="min-w-[20px]" />
                                    <span className={classNames("ml-3 transition-opacity whitespace-nowrap", { "opacity-100": isOpen, "opacity-0 hidden": !isOpen })}>
                                        {item.name}
                                    </span>
                                </NavLink>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-auto space-y-2 pt-6">
                    {role === 'admin' && (
                        <NavLink
                            to="/admin/settings"
                            className={({ isActive }) => classNames(
                                "flex items-center px-4 py-3 rounded-lg transition-colors",
                                { "bg-blue-600 text-white": isActive, "text-slate-400 hover:bg-slate-800 hover:text-white": !isActive }
                            )}
                        >
                            <Settings size={20} className="min-w-[20px]" />
                            <span className={classNames("ml-3 transition-opacity whitespace-nowrap", { "opacity-100": isOpen, "opacity-0 hidden": !isOpen })}>
                                Settings
                            </span>
                        </NavLink>
                    )}

                    <button
                        onClick={logout}
                        className="w-full flex items-center px-4 py-3 rounded-lg text-slate-400 hover:bg-red-900/20 hover:text-red-400 transition-colors"
                    >
                        <LogOut size={20} className="min-w-[20px]" />
                        <span className={classNames("ml-3 transition-opacity whitespace-nowrap", { "opacity-100": isOpen, "opacity-0 hidden": !isOpen })}>
                            Logout
                        </span>
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;
