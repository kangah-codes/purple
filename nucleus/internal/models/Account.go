package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Account struct {
	Base
	UserId           uuid.UUID `json:"user_id"`
	User             User      `gorm:"foreignKey:UserId" json:"-"`
	Category         string    `gorm:"size:100;not null" json:"category"`
	Name             string    `gorm:"size:100;not null" json:"name"`
	Balance          float64   `gorm:"not null" json:"balance"`
	IsDefaultAccount bool      `gorm:"default:false" json:"is_default_account"`
}

func (a *Account) UpdateAccountBalance(account *Account, balance float64, db *gorm.DB) error {
	account.Balance = balance
	result := db.Save(&account)

	if result.Error != nil {
		return result.Error
	}

	return nil
}
