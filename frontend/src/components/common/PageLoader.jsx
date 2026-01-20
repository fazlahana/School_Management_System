import React from 'react';

const PageLoader = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
            <div className="flex flex-col items-center">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-800 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <div className="mt-4 flex flex-col items-center gap-1">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 animate-pulse">
                        Loading System
                    </p>
                    <p className="text-xs text-slate-400">
                        Preparing your workspace...
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PageLoader;
