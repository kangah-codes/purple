package dispatch

import "nucleus/internal/log"

type UserSignUpEvent struct {
	Username         string `json:"username" binding:"required"`
	Email            string `json:"email" binding:"required"`
	VerificationCode string `json:"verification_code" binding:"required"`
}

// user sign up event listener
// when a user signs up a message is popped here
// for async email handling
func CreateUserSignUpListener() Listener[UserSignUpEvent] {
	return Listener[UserSignUpEvent]{
		Channel: "user.signup",
		Callback: func(event UserSignUpEvent) error {
			log.InfoLogger.Printf("New user signup: %s (%s)",
				event.Username,
				event.Email)
			return nil
		},
	}
}
