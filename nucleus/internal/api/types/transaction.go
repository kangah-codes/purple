package types

import "github.com/google/uuid"

type CreateTransactionDTO struct {
	AccountId   uuid.UUID `json:"account_id" binding:"required"`
	Type        string    `json:"type" binding:"required"`
	Amount      float64   `json:"amount" binding:"required"`
	Note        string    `json:"note"`
	Category    string    `json:"category" binding:"required"`
	FromAccount uuid.UUID `json:"from_account"`
	ToAccount   uuid.UUID `json:"to_account"`
}

type UpdateTransactionDTO struct {
	AccountId   uuid.UUID `json:"account_id" binding:"required"`
	Type        string    `json:"type" binding:"required"`
	Amount      float64   `json:"amount" binding:"required"`
	Note        string    `json:"note" binding:"required"`
	Category    string    `json:"category" binding:"required"`
	FromAccount uuid.UUID `json:"from_account" binding:"required"`
	ToAccount   uuid.UUID `json:"to_account" binding:"required"`
}
