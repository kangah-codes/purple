package types

type SignUpDTO struct {
	Email    string `json:"email" binding:"required"`
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type SignInDTO struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type CheckAvailableUsernameExistsDTO struct {
	Username string `json:"username"`
}

type RequestPasswordResetDTO struct {
	Username string `json:"username" binding:"required"`
}
