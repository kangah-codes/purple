package models

import (
	"nucleus/internal/encryption"
	"nucleus/log"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Account struct {
	Base
	UserId           uuid.UUID     `json:"user_id"`
	User             User          `gorm:"foreignKey:UserId" json:"-"`
	Category         string        `gorm:"size:100;not null" json:"category"`
	Name             string        `gorm:"size:100;not null" json:"name"`
	Balance          float64       `gorm:"not null" json:"balance"`
	IsDefaultAccount bool          `gorm:"default:false" json:"is_default_account"`
	Currency         string        `gorm:"size:5;not_null" json:"currency"`
	Transactions     []Transaction `gorm:"constraint:OnDelete:CASCADE;"`
}

func (a *Account) BeforeSave(tx *gorm.DB) (err error) {
	Name, err := encryption.Encrypt(a.Name)

	if err != nil {
		log.InfoLogger.Panic().Msgf("Error encrypting data for account model: %s", err)
	}

	a.Name = Name

	return
}

func (a *Account) AfterFind(tx *gorm.DB) (err error) {
	// a.Name = utils.Decrypt(a.Name)
	return
}

func (a *Account) UpdateAccountBalance(account *Account, balance float64, db *gorm.DB) error {
	account.Balance = balance
	result := db.Save(&account)

	if result.Error != nil {
		return result.Error
	}

	return nil
}
