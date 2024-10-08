package types

type CreateAccountDTO struct {
	Category string  `json:"category" binding:"required"`
	Name     string  `json:"name" binding:"required"`
	Balance  float64 `json:"balance" validate:"number"`
	Currency string  `json:"currency" binding:"required" validation:"validCurrency"`
}

type UpdateAccountDTO struct {
	Name     string  `json:"name" binding:"required"`
	Balance  float64 `json:"balance" binding:"required"`
	Category string  `json:"category" validate:"number"`
}
