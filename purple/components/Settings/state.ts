import { UserPreferences } from '@/components/Settings/schema';
import { SettingsServiceFactory } from '@/lib/factory/SettingsFactory';
import { nativeStorage } from '@/lib/utils/storage';
import * as SQLite from 'expo-sqlite';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface UserPreferenceStore {
    preferences: UserPreferences;
    setPreferences: (prefs: Partial<UserPreferences>) => void;
    ensureDefaults: () => Promise<void>;
}

export const createPreferencesStore = (db: SQLite.SQLiteDatabase) => {
    const service = SettingsServiceFactory.create(db);

    return create<UserPreferenceStore>()(
        persist(
            (set, get) => ({
                preferences: {
                    currency: 'USD',
                    theme: 'light',
                    customTransactionTypes: [],
                },
                setPreferences: (partialPrefs) =>
                    set((state) => ({
                        preferences: {
                            ...state.preferences,
                            ...partialPrefs,
                        },
                    })),
                ensureDefaults: async () => {
                    const current = get().preferences;
                    await service.ensureDefaults({
                        currency: current.currency,
                        theme: current.theme,
                    });
                },
            }),
            {
                name: 'user-preferences',
                storage: createJSONStorage(() => nativeStorage),
            },
        ),
    );
};
