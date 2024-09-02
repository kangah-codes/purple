package types

type CreateTransactionDTO struct {
	AccountId   uint    `json:"account_id" binding:"required"`
	Type        string  `json:"type" binding:"required"`
	Amount      float64 `json:"amount" binding:"required"`
	Note        string  `json:"note"`
	Category    string  `json:"category" binding:"required"`
	FromAccount uint    `json:"from_account"`
	ToAccount   uint    `json:"to_account"`
}

type UpdateTransactionDTO struct {
	AccountId   uint    `json:"account_id" binding:"required"`
	Type        string  `json:"type" binding:"required"`
	Amount      float64 `json:"amount" binding:"required"`
	Note        string  `json:"note" binding:"required"`
	Category    string  `json:"category" binding:"required"`
	FromAccount uint    `json:"from_account" binding:"required"`
	ToAccount   uint    `json:"to_account" binding:"required"`
}
