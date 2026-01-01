import { Account } from '../Accounts/schema';
import { Transaction } from '../Transactions/schema';

export type Frequency = 'weekly' | 'bi-weekly' | 'monthly';

export interface Deposit {
    amount: number;
    date: Date;
}

export type BudgetPlan = {
    category: string;
    startDate: string;
    endDate: string;
    percentageCompleted: number;
    spent: number;
    balance: number;
    budget: number;
};

export type Plan = {
    id: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    user_id: string;
    type: 'expense' | 'saving';
    category: string;
    target: number;
    balance: number;
    account_id: string;
    account: Account;
    start_date: string;
    end_date: string;
    deposit_frequency: Frequency;
    push_notification: boolean;
    name: string;
    currency: string;
    transactions: Transaction[];
    is_completed: boolean;
};

export type CreatePlan = {
    type: string;
    category: string;
    target: number;
    start_date: string;
    end_date: string;
    deposit_frequency: string;
    push_notification: boolean;
    name: string;
    currency: string;
};

export type CreatePlanTransaction = {
    amount: number;
    note: string;
    debit_account_id: string;
};

export interface SpendingProgress {
    isOnTrack: boolean;
    actualSpendingRate: number;
    expectedSpendingRate: number;
    daysElapsed: number;
    totalDays: number;
    percentTimeElapsed: number;
    percentTargetSpent: number;
    deviation: number;
    message: string;
}

export interface ExpenseCalculationResult {
    totalExpense: number;
    totalExpensePercentage: number;
    totalExpenseRemaining: number;
    totalExpenseRemainingPercentage: number;
    activePlansCount: number;
}

export interface TrendDataPoint {
    date: string;
    value: number;
}

export interface SpendingTrendData {
    projected: TrendDataPoint[];
    actual: TrendDataPoint[];
    ideal: TrendDataPoint[];
}

export type PlanTransaction = {
    ID: string;
    plan_id: string;
    user_id: string;
    amount: number;
    plan: Plan;
    note: string;
    created_at: string;
    debit_account_id?: string;
    debit_account: undefined;
    CreatedAt: string;
    updated_at: string;
};

export interface PlanAccountPieChartStats {
    accountId: string;
    accountName: string;
    transactionCount: number;
    amount: number;
    value: number;
    color: string;
    gradientCenterColor: string;
}

export type PlanStore = {
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

export type CreateNewPlanStore = {
    amount: number;
    startDate: Date | undefined;
    endDate: Date | undefined;
    categories: {
        category: string;
        allocation: number;
    }[];
    setAmount: (amount: number) => void;
    setStartDate: (date: Date | undefined) => void;
    setEndDate: (date: Date | undefined) => void;
    setCategories: (categories: { category: string; allocation: number }[]) => void;
    addCategory: (category: { category: string; allocation: number }) => void;
    removeCategory: (category: string) => void;
    reset: () => void;
    updateCategory: (category: { category?: string; allocation?: number }) => void;
};

// new stuff for the plans
export type Budget = {
    id: string;
    type: 'fixed' | 'flexible';
    name: string;
    total_amount: number;
    estimated_income: number;
    estimated_expense: number;
    income_earned: number;
    expense_spent: number;
    currency: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    is_completed: boolean;
    created_at: string;
    updated_at: string;
    code: string;
}

export type NewBudgetStore = {
    estimatedIncome: number;
    estimatedExpense: number;
    totalAmount: number;
    startDate: Date | null;
    endDate: Date | null;
    type: 'fixed' | 'flexible';
    name: string;
    categoryAllocations: {
        category: string;
        allocationType: 'fixed' | 'flexible';
        allocatedAmount: number;
    }[];
    setData: (data: Partial<NewBudgetStore>) => void;
    reset: () => void;
}