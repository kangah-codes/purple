package types

type SignUpDTO struct {
	FirstName   string `json:"first_name" binding:"required"`
	LastName    string `json:"last_name" binding:"required"`
	Email       string `json:"email" binding:"required"`
	Username    string `json:"username" binding:"required"`
	Password    string `json:"password" binding:"required"`
	PhoneNumber string `json:"phone_number" binding:"required"`
}

type SignInDTO struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type UpdateAccountDTO struct {
	Username    string `json:"username" binding:"required"`
	PhoneNumber string `json:"phone_number" binding:"required"`
}
