import { nativeStorage } from '@/lib/utils/storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { User } from '../Auth/schema';

type UserStore = {
    user: User | null;
    setUser: (user: User) => void;
};

export const createUserStore = create<UserStore>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user) => set({ user }),
        }),
        {
            name: 'user-store',
            storage: createJSONStorage(() => nativeStorage),
        },
    ),
);
