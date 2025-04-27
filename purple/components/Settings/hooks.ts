import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useMemo } from 'react';
import { useStore } from 'zustand';
import { createPreferencesStore } from './state';
import { SettingsServiceFactory } from '@/lib/factory/SettingsFactory';
import { UserPreferences } from './schema';

export function usePreferences() {
    const db = useSQLiteContext();
    const service = SettingsServiceFactory.create(db);
    const store = useMemo(() => createPreferencesStore(db), [db]);
    const preferences = useStore(store, (state) => state.preferences);
    const setPreference = useStore(store, (state) => state.setPreferences);
    const ensureDefaults = useStore(store, (state) => state.ensureDefaults);

    useEffect(() => {
        let isMounted = true;
        const loadPreferences = async () => {
            try {
                const [savedCurrency, customTransactionTypes] = await Promise.all([
                    store.getState().preferences.currency,
                    service.listTransactionTypes(),
                ]);

                if (isMounted) {
                    setPreference({
                        currency: savedCurrency,
                        customTransactionTypes,
                    });
                }
            } catch (error) {
                console.error('Failed to load preferences:', error);
            }
        };

        loadPreferences();
        return () => {
            isMounted = false;
        };
    }, [store]);

    return {
        preferences,
        setPreference: (
            key: keyof UserPreferences,
            value: UserPreferences[keyof UserPreferences],
        ) => setPreference({ [key]: value }),
        ensureDefaults,
    };
}
