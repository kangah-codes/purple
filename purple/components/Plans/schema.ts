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

type CreatePlanPayload = {
    type: string;
    category: string;
    target: number;
    balance: number;
    start_date: string;
    end_date: string;
    deposit_frequency: string;
    name: string;
    currency: string;
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

/**
 * 	PlanId         uuid.UUID  `json:"plan_id"`
	UserId         uuid.UUID  `json:"user_id"`
	Amount         float64    `gorm:"not null" json:"amount"`
	User           User       `gorm:"foreignKey:UserId" json:"-"`
	Plan           Plan       `gorm:"foreignKey:PlanId" json:"plan"`
	Note           string     `gorm:"size:255" json:"note"`
	CreatedAt      time.Time  `gorm:"type:timestamptz;not null"`
	DebitAccountId *uuid.UUID `json:"debit_account_id"`
	DebitAccount   Account    `gorm:"foreignKey:debit_account_id" json:"-"`
 */
