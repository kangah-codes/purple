import { create } from 'zustand';

export type BudgetType = 'flex' | 'category';
export type FlexAllocationType = 'fixed' | 'flexible';

interface CategoryLimit {
    category: string;
    limitAmount: number;
}

interface FlexAllocation {
    category: string;
    allocationType: FlexAllocationType;
    amount: number;
}

interface CreateBudgetState {
    budgetType: BudgetType | null;

    flexAllocations: FlexAllocation[];

    categoryLimits: CategoryLimit[];

    budgetName: string;
    estimatedIncome: number;
    estimatedSpend: number;
    month: number;
    year: number;
    totalAllocated: number;

    setBudgetType: (type: BudgetType) => void;
    setBudgetName: (name: string) => void;
    setEstimatedIncome: (income: number) => void;
    setEstimatedSpend: (spend: number) => void;
    setMonthYear: (month: number, year: number) => void;
    
    addFlexAllocation: (allocation: FlexAllocation) => void;
    updateFlexAllocation: (category: string, updates: Partial<FlexAllocation>) => void;
    removeFlexAllocation: (category: string) => void;
    
    addCategoryLimit: (limit: CategoryLimit) => void;
    updateCategoryLimit: (category: string, limitAmount: number) => void;
    removeCategoryLimit: (category: string) => void;
    
    calculateTotalAllocated: () => void;
    reset: () => void;
    
    canProceedToNextStep: (currentStep: number) => boolean;
}

const initialState = {
    budgetType: null,
    flexAllocations: [],
    categoryLimits: [],
    budgetName: '',
    estimatedIncome: 0,
    estimatedSpend: 0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    totalAllocated: 0,
};

export const useCreateBudgetStore = create<CreateBudgetState>((set, get) => ({
    ...initialState,

    setBudgetType: (type) => set({ budgetType: type }),
    
    setBudgetName: (name) => set({ budgetName: name }),
    
    setEstimatedIncome: (income) => set({ estimatedIncome: income }),
    
    setEstimatedSpend: (spend) => set({ estimatedSpend: spend }),
    
    setMonthYear: (month, year) => set({ month, year }),
    
    // Flex budget actions
    addFlexAllocation: (allocation) =>
        set((state) => ({
            flexAllocations: [...state.flexAllocations, allocation],
        })),

    updateFlexAllocation: (category, updates) =>
        set((state) => ({
            flexAllocations: state.flexAllocations.map((alloc) =>
                alloc.category === category ? { ...alloc, ...updates } : alloc
            ),
        })),

    removeFlexAllocation: (category) =>
        set((state) => ({
            flexAllocations: state.flexAllocations.filter((alloc) => alloc.category !== category),
        })),

    // Category budget actions
    addCategoryLimit: (limit) =>
        set((state) => ({
            categoryLimits: [...state.categoryLimits, limit],
        })),

    updateCategoryLimit: (category, limitAmount) =>
        set((state) => ({
            categoryLimits: state.categoryLimits.map((limit) =>
                limit.category === category ? { ...limit, limitAmount } : limit
            ),
        })),

    removeCategoryLimit: (category) =>
        set((state) => ({
            categoryLimits: state.categoryLimits.filter((limit) => limit.category !== category),
        })),

    calculateTotalAllocated: () => {
        const state = get();
        let total = 0;

        if (state.budgetType === 'flex') {
            total = state.flexAllocations.reduce((sum, alloc) => sum + alloc.amount, 0);
        } else if (state.budgetType === 'category') {
            total = state.categoryLimits.reduce((sum, limit) => sum + limit.limitAmount, 0);
        }

        set({ totalAllocated: total });
    },

    reset: () => set(initialState),

    canProceedToNextStep: (currentStep) => {
        const state = get();
        
        switch (currentStep) {
            case 0: // Budget type selection
                return state.budgetType !== null;
            
            case 1: // Budget name/details
                return state.budgetName.trim().length > 0;
            
            case 2: // Allocations/Limits
                if (state.budgetType === 'flex') {
                    return state.flexAllocations.length > 0;
                } else if (state.budgetType === 'category') {
                    return state.categoryLimits.length > 0;
                }
                return false;
            
            default:
                return true;
        }
    },
}));
