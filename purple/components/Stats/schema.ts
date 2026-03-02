export type MonthlyStats = {
    DailyActivity: Record<string, number>;
    SpendOverview: Record<string, { Expense: number; Income: number }>;
};
