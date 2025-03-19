package models

import (
	"time"

	"github.com/google/uuid"
)

type PasswordResetPin struct {
	Base
	UserId    uuid.UUID `gorm:"not null" json:"user_id"`
	Pin       string    `gorm:"not null" json:"pin"`
	ExpiresAt time.Time `json:"expires_at"`
}
