package repositories

import "context"

type EmailInformation struct {
	Recipient struct {
		email string
		name  string
	}
	Subject   string
	Template  string
	Variables map[string]string
}

type EmailRepository interface {
	SendEmail(ctx context.Context, information EmailInformation) (any, error)
}
