import React from 'react';
import { Construction } from 'lucide-react';

const UnderConstruction = ({ title }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            <div className="p-6 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-300">
                <Construction size={48} />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">{title}</h1>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    This page is currently under development. Our team is working hard to bring you these features soon.
                </p>
            </div>
            <button
                onClick={() => window.history.back()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
                Go Back
            </button>
        </div>
    );
};

export default UnderConstruction;
