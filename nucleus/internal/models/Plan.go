package models

import (
	"time"

	"github.com/google/uuid"
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
	Base
	UserId           uuid.UUID     `json:"user_id"`
	User             User          `gorm:"foreignKey:UserId" json:"-"`
	Type             string        `gorm:"not null" json:"type"`
	Category         string        `gorm:"size:100;not null" json:"category"`
	Name             string        `gorm:"size:100" json:"name"`
	Target           float64       `gorm:"not null" json:"target"`
	Balance          float64       `gorm:"not null" json:"balance"`
	StartDate        time.Time     `json:"start_date"`
	EndDate          time.Time     `json:"end_date"`
	DepositFrequency string        `gorm:"not null" json:"deposit_frequency"`
	PushNotification bool          `json:"push_notification"`
	CreatedAt        time.Time     `gorm:"type:timestamptz;not null"`
	UpdatedAt        time.Time     `gorm:"type:timestamptz;not null"`
	Currency         string        `gorm:"size:3;not null" json:"currency"`
	Transactions     []Transaction `gorm:"foreignKey:PlanId;constraint:OnDelete:CASCADE;"`
}

func (p *Plan) AfterFind(tx *gorm.DB) (err error) {
	if p.Transactions == nil {
		p.Transactions = []Transaction{}
	}
	return
}

func (p *Plan) BeforeCreate(tx *gorm.DB) (err error) {
	if p.Transactions == nil {
		p.Transactions = []Transaction{}
	}
	return
}
