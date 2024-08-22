package models

import (
	"time"

	"gorm.io/gorm"
)

type Session struct {
	gorm.Model
	UserID    uint      `gorm:"not null"`
	User      User      `gorm:"foreignKey:UserID"`
	Token     string    `gorm:"not null;index:session_token;unique"`
	ExpiresAt time.Time `gorm:"not null"`
}

type RefreshToken struct {
	gorm.Model
	SessionID uint      `gorm:"not null"`
	Session   Session   `gorm:"foreignKey:SessionID"`
	Token     string    `gorm:"not null;index:refresh_token;unique"`
	ExpiresAt time.Time `gorm:"not null"`
}

type TokenPair struct {
	AccessToken  Session      `json:"access_token"`
	RefreshToken RefreshToken `json:"refresh_token"`
}
