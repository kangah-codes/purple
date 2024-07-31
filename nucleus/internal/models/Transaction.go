package models

import (
	"gorm.io/gorm"
)

const (
	Credit   string = "credit"
	Debit    string = "debit"
	Transfer string = "transfer"
)

type Transaction struct {
	gorm.Model
	AccountId   uint    `json:"account_id"`
	UserId      uint    `json:"user_id"`
	Type        string  `gorm:"type:enum('credit', 'debit')"`
	Amount      float64 `gorm:"not null" json:"amount"`
	User        User    `gorm:"foreignKey:UserId"`
	Account     Account `gorm:"foreignKey:AccountId"`
	Note        string  `gorm:"size:255" json:"note"`
	Category    string  `gorm:"size:100" json:"category"`
	FromAccount uint    `json:"from_account"`
	ToAccount   uint    `json:"to_account"`
}
