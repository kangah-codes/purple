import { CustomTransactionType, UserPreferences } from '@/components/Settings/schema';
import { nativeStorage } from '@/lib/utils/storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface PreferencesStore {
    preferences: UserPreferences;
    setPreferences: (prefs: Partial<UserPreferences>) => void;
    addCategory: (category: CustomTransactionType) => void;
}

export const usePreferencesStore = create<PreferencesStore>()(
    persist(
        (set) => ({
            preferences: {
                currency: 'GHS',
                theme: 'light',
                customTransactionTypes: [],
            },
            setPreferences: (partialPrefs) =>
                set((state) => ({
                    preferences: { ...state.preferences, ...partialPrefs },
                })),
            addCategory: (category) =>
                set((state) => ({
                    preferences: {
                        ...state.preferences,
                        customTransactionTypes: [
                            ...state.preferences.customTransactionTypes,
                            category,
                        ],
                    },
                })),
        }),
        {
            name: 'preferences-store',
            storage: createJSONStorage(() => nativeStorage),
        },
    ),
);
