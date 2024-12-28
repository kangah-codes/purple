import { Account } from '../Accounts/schema';

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
    ID: string;
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
    deposit_frequency: string;
    push_notification: boolean;
    CreatedAt: string;
    UpdatedAt: string;
    name: string;
    currency: string;
    Transactions: PlanTransaction[];
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
    debit_account_id: string;
    debit_account: Account;
    CreatedAt: string;
    updated_at: string;
};

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
