package models

import (
	"gorm.io/gorm"
)

type Account struct {
	gorm.Model
	UserId           uint    `json:"user_id"`
	User             User    `gorm:"foreignKey:UserId"`
	Category         string  `gorm:"size:100;not null"`
	Name             string  `gorm:"size:100;not null"`
	Balance          float64 `gorm:"not null"`
	IsDefaultAccount bool    `gorm:"default:false" json:"is_default_account"`
}

func (a *Account) UpdateAccountBalance(account *Account, balance float64, db *gorm.DB) error {
	account.Balance = balance
	result := db.Save(&account)

	if result.Error != nil {
		return result.Error
	}

	return nil
}
