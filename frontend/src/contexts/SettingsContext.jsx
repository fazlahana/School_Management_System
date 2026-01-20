import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const { user } = useAuth();
    const [settings, setSettings] = useState({
        school_name: 'EduSpire International',
        school_email: 'admin@eduspire.com',
        school_phone: '',
        school_address: '',
    });
    const [loading, setLoading] = useState(true);

    const fetchPublicSettings = async () => {
        try {
            const response = await api.get('/public-settings');
            if (response.data) {
                setSettings(prev => ({ ...prev, ...response.data }));
            }
        } catch (error) {
            console.error('Failed to fetch public settings', error);
        }
    };

    const fetchSettings = async () => {
        try {
            const response = await api.get('/admin/accounting/settings');
            if (response.data) {
                setSettings(prev => ({ ...prev, ...response.data }));
            }
        } catch (error) {
            console.error('Failed to fetch private settings', error);
        } finally {
            setLoading(false);
        }
    };

    const updateSettings = async (newSettings) => {
        try {
            const config = {};
            if (newSettings instanceof FormData) {
                config.headers = { 'Content-Type': 'multipart/form-data' };
            }
            const response = await api.post('/admin/accounting/settings', newSettings, config);

            if (response.data.settings) {
                setSettings(response.data.settings);
            } else {
                // Fallback if server doesn't return settings (legacy)
                if (!(newSettings instanceof FormData)) {
                    setSettings(prev => ({ ...prev, ...newSettings }));
                } else {
                    // If it was FormData but no settings returned, we should probably fetch fresh settings
                    fetchSettings();
                }
            }
            return true;
        } catch (error) {
            console.error('Failed to update settings', error);
            throw error;
        }
    };

    useEffect(() => {
        fetchPublicSettings();
    }, []);

    useEffect(() => {
        if (user) {
            fetchSettings();
        }
    }, [user]);

    return (
        <SettingsContext.Provider value={{ settings, loading, updateSettings, fetchSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);
