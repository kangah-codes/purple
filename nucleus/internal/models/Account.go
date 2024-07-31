package models

import (
	"gorm.io/gorm"
)

type Account struct {
	gorm.Model
	UserId  uint    `json:"user_id"`
	User    User    `gorm:"foreignKey:UserId"`
	Type    string  `gorm:"size:100;not null"`
	Name    string  `gorm:"size:100;not null"`
	Balance float64 `gorm:"not null"`
}
