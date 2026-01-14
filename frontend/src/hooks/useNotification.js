import { useCallback } from 'react';
import { showToast, showAlert } from '../utils/notification';

/**
 * Hook to provide standardized notifications throughout the app.
 */
export const useNotification = () => {

    const toast = useCallback({
        success: (msg) => showToast.success(msg),
        error: (msg) => showToast.error(msg),
        info: (msg) => showToast.info(msg),
        warning: (msg) => showToast.warning(msg),
        loading: (msg) => showToast.loading(msg),
        dismiss: (id) => showToast.dismiss(id),
    }, []);

    const alert = useCallback({
        confirmDelete: (title, text) => showAlert.confirmDelete(title, text),
        confirmAction: (title, text, confirmText) => showAlert.confirmAction(title, text, confirmText),
        success: (title, text) => showAlert.success(title, text),
        error: (title, text) => showAlert.error(title, text),
    }, []);

    return { toast, alert };
};
