package models

import "github.com/google/uuid"

type UserPreferences struct {
	PrimaryIncomeSource  string          `json:"primary_income_source"`
	MonthlyIncomeRange   string          `json:"monthly_income_range"`
	SpendingCategories   []string        `json:"spending_categories"`
	PreferredCurrency    string          `json:"preferred_currency"`
	MonthlySavingsGoal   float64         `json:"monthly_savings_goal"`
	NotificationPrefs    map[string]bool `json:"notification_prefs"`
	TransactionFrequency string          `json:"transaction_frequency"`
	TrackingStyle        string          `json:"tracking_style"`
	TopFinancialGoal     string          `json:"top_financial_goal"`
	DebtTracking         bool            `json:"debt_tracking"`
	InvestmentInterests  []string        `json:"investment_interests"`
	BudgetingExperience  string          `json:"budgeting_experience"`
	FinancialTipsOptIn   bool            `json:"financial_tips_opt_in"`
}

type UserProfile struct {
	Base
	// i only renamed it to PUserId because I was fucking getting errors for migrating that column from a string to a uuid
	PUserId     uuid.UUID       `json:"user_id"`
	Preferences UserPreferences `gorm:"type:jsonb" json:"preferences"` // JSONB column for flexible fields
}
