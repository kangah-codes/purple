import { nativeStorage } from '@/lib/utils/storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { UserPreferenceStore, UserStore } from './schema';

export const createUserStore = create<UserStore>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user) => set({ user }),
            reset: () => set({ user: null }),
        }),
        {
            name: 'user-store',
            storage: createJSONStorage(() => nativeStorage),
        },
    ),
);
