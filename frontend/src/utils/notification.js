import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

/**
 * Standardized Notification Service
 * Combines React Hot Toast for quick notifications 
 * and SweetAlert2 for interactive/confirmation dialogs.
 */

const toastConfig = {
    duration: 4000,
    style: {
        background: '#ffffff',
        color: '#1e293b',
        padding: '16px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        border: '1px solid rgba(226, 232, 240, 0.8)',
    },
};

export const showToast = {
    success: (message) => toast.success(message, toastConfig),
    error: (message) => toast.error(message, toastConfig),
    info: (message) => toast(message, { ...toastConfig, icon: 'ℹ️' }),
    warning: (message) => toast(message, { ...toastConfig, icon: '⚠️' }),
    loading: (message) => toast.loading(message, toastConfig),
    dismiss: (toastId) => toast.dismiss(toastId),
};

// Custom styling for SweetAlert2 to match the premium slate/indigo theme
const swalConfig = Swal.mixin({
    customClass: {
        confirmButton: 'px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-md transition-all mx-2',
        cancelButton: 'px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold rounded-lg transition-all mx-2',
        popup: 'rounded-2xl border-none shadow-2xl dark:bg-slate-800 dark:text-white',
        title: 'text-xl font-bold text-slate-800 dark:text-white',
        htmlContainer: 'text-slate-600 dark:text-slate-300',
    },
    buttonsStyling: false,
});

export const showAlert = {
    confirmDelete: async (title = 'Are you sure?', text = "This action cannot be undone.") => {
        return swalConfig.fire({
            title,
            text,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#ef4444', // Red for delete
            reverseButtons: true,
        });
    },
    confirmAction: async (title, text, confirmText = 'Confirm') => {
        return swalConfig.fire({
            title,
            text,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: confirmText,
            cancelButtonText: 'Cancel',
            reverseButtons: true,
        });
    },
    success: (title, text) => {
        return swalConfig.fire({
            title,
            text,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
        });
    },
    error: (title, text) => {
        return swalConfig.fire({
            title,
            text,
            icon: 'error',
            confirmButtonText: 'Close',
        });
    }
};

const notification = {
    toast: showToast,
    alert: showAlert
};

export default notification;
