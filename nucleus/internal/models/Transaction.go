package models

import "github.com/google/uuid"

const (
	Credit   string = "credit"
	Debit    string = "debit"
	Transfer string = "transfer"
)

type Transaction struct {
	Base
	AccountId   uuid.UUID `json:"account_id"`
	UserId      uuid.UUID `json:"user_id"`
	Type        string    `gorm:"not null"`
	Amount      float64   `gorm:"not null" json:"amount"`
	User        User      `gorm:"foreignKey:UserId" json:"-"`
	Account     Account   `gorm:"foreignKey:AccountId" json:"account"`
	Note        string    `gorm:"size:255" json:"note"`
	Category    string    `gorm:"size:100" json:"category"`
	FromAccount uuid.UUID `json:"from_account"`
	ToAccount   uuid.UUID `json:"to_account"`
}
