package models

import (
	"time"

	"github.com/google/uuid"
)

type PlanTransaction struct {
	Base
	PlanId    uuid.UUID `json:"plan_id"`
	UserId    uuid.UUID `json:"user_id"`
	Amount    float64   `gorm:"not null" json:"amount"`
	User      User      `gorm:"foreignKey:UserId" json:"-"`
	Plan      Plan      `gorm:"foreignKey:PlanId" json:"plan"`
	Note      string    `gorm:"size:255" json:"note"`
	CreatedAt time.Time `gorm:"type:timestamptz;not null"`
}
