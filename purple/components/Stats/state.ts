import { dedupeByKey } from '@/lib/utils/array';
import { nativeStorage } from '@/lib/utils/storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { MonthlyStats } from './schema';

type StatsStore = {
    stats: MonthlyStats;
    setStats: (accounts: MonthlyStats) => void;
    isStatsLoading: boolean;
    setIsStatsLoading: (isLoading: boolean) => void;
    reset: () => void;
};

export const createStatsStore = create<StatsStore>()(
    persist(
        (set) => ({
            stats: {
                DailyActivity: {},
                SpendOverview: {},
            },
            setStats: (stats) => set({ stats }),
            isStatsLoading: false,
            setIsStatsLoading: (isStatsLoading) => set({ isStatsLoading }),
            reset: () =>
                set({ stats: { DailyActivity: {}, SpendOverview: {} }, isStatsLoading: false }),
        }),
        {
            name: 'stats-store',
            storage: createJSONStorage(() => nativeStorage),
        },
    ),
);
