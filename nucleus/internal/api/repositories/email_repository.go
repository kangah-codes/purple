package repositories

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
	SendEmail(information EmailInformation) error
}
