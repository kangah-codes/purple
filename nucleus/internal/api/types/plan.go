package types

import "time"

type CreatePlanDTO struct {
	AccountId        uint      `json:"account_id" binding:"required"`
	Type             string    `json:"type" binding:"required"`
	Category         string    `json:"category" binding:"required"`
	Target           float64   `json:"target" binding:"required"`
	Balance          float64   `json:"balance" binding:"required"`
	StartDate        time.Time `json:"start_date" binding:"required"`
	EndDate          time.Time `json:"end_date" binding:"required"`
	DepositFrequency string    `json:"deposit_frequency" binding:"required"`
	PushNotification bool      `json:"push_notification" binding:"required"`
}

type UpdatePlanBalanceDTO struct {
	Balance float64 `json:"balance" binding:"required"`
}
