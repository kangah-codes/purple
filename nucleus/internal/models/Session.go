package models

import (
	"time"

	"gorm.io/gorm"
)

type Session struct {
	gorm.Model
	UserID    uint      `gorm:"not null"`
	User      User      `gorm:"foreignKey:UserID"`
	Token     string    `gorm:"not null;uniqueIndex"`
	ExpiresAt time.Time `gorm:"not null"`
}

type RefreshToken struct {
	gorm.Model
	SessionID uint      `gorm:"not null"`
	Session   Session   `gorm:"foreignKey:SessionID"`
	Token     string    `gorm:"not null;uniqueIndex"`
	ExpiresAt time.Time `gorm:"not null"`
}

type TokenPair struct {
	AccessToken  Session      `json:"access_token"`
	RefreshToken RefreshToken `json:"refresh_token"`
}
