package types

type CreateAccountDTO struct {
	Category string  `json:"category" binding:"required"`
	Name     string  `json:"name" binding:"required"`
	Balance  float64 `json:"balance" binding:"required"`
}
