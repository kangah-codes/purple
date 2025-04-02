package types

type UpdateUserAccountDTO struct {
	Username    string `json:"username" binding:"required"`
	PhoneNumber string `json:"phone_number" binding:"required"`
}

type UserSignUpEvent struct {
	Username         string `json:"username" binding:"required"`
	Email            string `json:"email" binding:"required"`
	VerificationCode string `json:"verification_code" binding:"required"`
}
