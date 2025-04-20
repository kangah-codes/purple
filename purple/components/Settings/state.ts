import { nativeStorage } from '@/lib/utils/storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserPreferenceStore } from './schema';

export const createPreferencesStore = create<UserPreferenceStore>()(
    persist(
        (set) => ({
            currency: 'GHS',
            setPreferences: ({ currency }) => set({ currency }),
        }),
        {
            name: 'user-preferences',
            storage: createJSONStorage(() => nativeStorage),
        },
    ),
);
