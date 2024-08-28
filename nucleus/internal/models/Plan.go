package models

import (
	"time"

	"gorm.io/gorm"
)

const (
	SavingPlan  string = "saving"
	ExpensePlan string = "expense"
)

const (
	Daily    string = "daily"
	Weekly   string = "weekly"
	BiWeekly string = "bi-weekly"
	Monthly  string = "monthly"
	Yearly   string = "yearly"
)

type Plan struct {
	gorm.Model
	UserId           uint      `json:"user_id"`
	User             User      `gorm:"foreignKey:UserId" json:"-"`
	Type             string    `gorm:"not null" json:"type"`
	Category         string    `gorm:"size:100;not null"`
	Target           float64   `gorm:"not null" json:"target"`
	Balance          float64   `gorm:"not null" json:"balance"`
	AccountId        uint      `json:"account_id"`
	Account          Account   `gorm:"foreignKey:AccountId"`
	StartDate        time.Time `json:"start_date"`
	EndDate          time.Time `json:"end_date"`
	DepositFrequency string    `gorm:"not null" json:"deposit_frequency"`
	PushNotification bool      `json:"push_notification"`
}
