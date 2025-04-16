import { nativeStorage } from '@/lib/utils/storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Plan } from './schema';

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
    removeExpensePlan: (id: string) => void;
    removeSavingPlan: (id: string) => void;
    reset: () => void;
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
            reset: () => set({ plans: [], currentPlan: null, expensePlans: [], savingPlans: [] }),
            removeSavingPlan: (id) =>
                set((state) => ({
                    savingPlans: state.savingPlans.filter((plan) => plan.id !== id),
                })),
            removeExpensePlan: (id) =>
                set((state) => ({
                    expensePlans: state.expensePlans.filter((plan) => plan.id !== id),
                })),
        }),
        {
            name: 'plan-store',
            storage: createJSONStorage(() => nativeStorage),
        },
    ),
);
