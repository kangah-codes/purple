import { nativeStorage } from '@/lib/utils/storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { CreateNewPlanStore, PlanStore } from './schema';

export const createNewPlanStore = create<CreateNewPlanStore>()((set) => ({
    amount: 10,
    startDate: undefined,
    endDate: undefined,
    categories: [],
    setAmount: (amount) => set({ amount }),
    setStartDate: (date) => set({ startDate: date }),
    setEndDate: (date) => set({ endDate: date }),
    setCategories: (categories) => set({ categories }),
    addCategory: (category) =>
        set((state) => ({
            categories: state.categories.includes(category)
                ? state.categories
                : [...state.categories, category],
        })),
    removeCategory: (category) =>
        set((state) => ({
            categories: state.categories.filter((cat) => cat.category !== category),
        })),
    updateCategory: (category) =>
        set((state) => ({
            categories: state.categories.map((cat) =>
                cat.category === category.category
                    ? {
                          category: category.category,
                          allocation: category.allocation ?? cat.allocation,
                      }
                    : cat,
            ),
        })),
    reset: () => set({ amount: 10, startDate: undefined, endDate: undefined, categories: [] }),
}));

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
