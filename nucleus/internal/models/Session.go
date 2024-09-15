package models

import (
	"time"

	"github.com/google/uuid"
)

type Session struct {
	Base
	UserID    uuid.UUID `gorm:"not null" json:"user_id"`
	User      User      `gorm:"foreignKey:UserID" json:"-"`
	Token     string    `gorm:"not null;index:session_token;unique"`
	ExpiresAt time.Time `gorm:"not null"`
}

type RefreshToken struct {
	Base
	SessionID uuid.UUID `gorm:"not null"`
	Session   Session   `gorm:"foreignKey:SessionID"`
	Token     string    `gorm:"not null;index:refresh_token;unique"`
	ExpiresAt time.Time `gorm:"not null"`
}

type TokenPair struct {
	AccessToken  Session      `json:"access_token"`
	RefreshToken RefreshToken `json:"refresh_token"`
}
