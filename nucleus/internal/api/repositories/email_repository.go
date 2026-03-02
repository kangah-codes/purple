package repositories

import "context"

type EmailInformation struct {
	Recipient struct {
		Email string
		Name  string
	}
	Subject   string
	Template  string
	Variables map[string]string
}

type EmailRepository interface {
	SendEmail(ctx context.Context, information EmailInformation) (string, error)
}
