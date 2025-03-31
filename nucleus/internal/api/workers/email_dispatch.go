package workers

import (
	"context"
	"nucleus/internal/api/repositories"
	"nucleus/internal/api/services"
	"nucleus/internal/api/types"
	"nucleus/internal/dispatch"
	"nucleus/internal/log"
	"nucleus/internal/templates"
	"path/filepath"
)

// user sign up event listener
// when a user signs up a message is popped here
// for async email handling
func CreateUserSignUpListener() dispatch.Listener[types.UserSignUpEvent] {
	return dispatch.Listener[types.UserSignUpEvent]{
		Channel: "user.signup",
		Callback: func(event types.UserSignUpEvent) error {
			templatePath, _ := filepath.Abs("internal/templates/html/auth.html")
			renderedTemplate, err := templates.RenderTemplate(templatePath, map[string]string{
				"Username":         event.Username,
				"VerificationCode": event.VerificationCode,
			})
			if err != nil {
				log.ErrorLogger.Errorf("Error rendering html template: %v", err)
				return err
			}

			emailService := services.GetEmailService(nil)
			emailInfo := repositories.EmailInformation{
				Recipient: struct {
					Email string
					Name  string
				}{
					Email: event.Email,
					Name:  event.Username,
				},
				Subject:  "Welcome to Purple",
				Template: renderedTemplate,
				Variables: map[string]string{
					"user":              event.Username,
					"verification_code": event.VerificationCode,
				},
			}

			ctx := context.Background()
			_, err = emailService.SendEmail(ctx, emailInfo)
			if err != nil {
				log.ErrorLogger.Errorf("Error sending welcome email: %v", err)
				return err
			} else {
				log.ErrorLogger.Printf("Sent confirmation email to; %v", emailInfo.Recipient.Email)
				return nil
			}
		},
	}
}
