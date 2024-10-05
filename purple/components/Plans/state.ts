import { expensePlans } from './constants';
import { create } from 'zustand';
import { Plan } from './schema';
import { persist, createJSONStorage } from 'zustand/middleware';
import { nativeStorage } from '@/lib/utils/storage';

type PlanStore = {
    plans: Plan[];
    setPlans: (accounts: Plan[]) => void;
    currentPlan: Plan | null;
    setCurrentPlan: (transaction: Plan | null) => void;
    expensePlans: Plan[];
    savingPlans: Plan[];
    setExpensePlans: (plans: Plan[]) => void;
    setSavingPlans: (plans: Plan[]) => void;
    updateExpenseplans: (plan: Plan | Plan[]) => void;
    updateSavingPlans: (plan: Plan | Plan[]) => void;
};

export const createPlanStore = create<PlanStore>()(
    persist(
        (set) => ({
            plans: [],
            setPlans: (plans) => set({ plans }),
            currentPlan: null,
            setCurrentPlan: (transaction) => set({ currentPlan: transaction }),
            expensePlans: [],
            savingPlans: [],
            setExpensePlans: (plans) => set({ expensePlans: plans }),
            setSavingPlans: (plans) => set({ savingPlans: plans }),
            updateExpenseplans: (plan) =>
                set((state) => ({
                    expensePlans: Array.isArray(plan)
                        ? [...plan, ...state.expensePlans]
                        : [plan, ...state.expensePlans],
                })),
            updateSavingPlans: (plan) =>
                set((state) => ({
                    savingPlans: Array.isArray(plan)
                        ? [...plan, ...state.savingPlans]
                        : [plan, ...state.savingPlans],
                })),
        }),
        {
            name: 'plan-store',
            storage: createJSONStorage(() => nativeStorage),
        },
    ),
);
