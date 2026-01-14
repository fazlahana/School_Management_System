import { useAuth } from '../../contexts/AuthContext';
// ... rest of imports

const Unauthorized = () => {
    const { user } = useAuth();

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-6 px-4">
            <div className="p-6 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">
                <ShieldAlert size={64} />
            </div>
            <div className="space-y-2">
                <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white">Access Denied</h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    You don't have permission to access this page.
                </p>
                <div className="text-xs text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded mt-4">
                    Debug: Logged in as <span className="font-bold">{user?.role || 'Guest'}</span>
                </div>
            </div>
            <Link
                to="/login"
                className="px-8 py-3 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white rounded-xl transition-all font-bold shadow-lg"
            >
                Return to Login
            </Link>
        </div>
    );
};

export default Unauthorized;
