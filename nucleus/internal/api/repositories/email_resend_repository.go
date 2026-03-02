package repositories

import (
	"context"
	"fmt"
	"nucleus/internal/log"

	"github.com/resend/resend-go/v2"
)

type ResendEmailRepository struct {
	APIKey string
}

func NewResendEmailRepository(apiKey string) *ResendEmailRepository {
	return &ResendEmailRepository{APIKey: apiKey}
}

func (m *ResendEmailRepository) SendEmail(ctx context.Context, information EmailInformation) (string, error) {
	client := resend.NewClient(m.APIKey)
	params := &resend.SendEmailRequest{
		From:    "Purple <transactional@transactions.trypurpleapp.site>",
		To:      []string{information.Recipient.Email},
		Html:    information.Template,
		Subject: "Confirm your email address",
	}

	sent, err := client.Emails.Send(params)
	if err != nil {
		log.ErrorLogger.Errorf("Error sending email to %s: %v", information.Recipient.Email, err)
		fmt.Println(err.Error())
		return "", err
	}

	return sent.Id, nil
}
