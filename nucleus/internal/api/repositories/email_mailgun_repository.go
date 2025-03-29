package repositories

import (
	"context"
	"fmt"

	"github.com/mailgun/mailgun-go/v4"
)

type MailgunEmailRepository struct {
	APIKey string
	Domain string
}

func NewMailgunEmailRepository(apiKey, domain string) *MailgunEmailRepository {
	return &MailgunEmailRepository{APIKey: apiKey, Domain: domain}
}

func (m *MailgunEmailRepository) SendEmail(ctx context.Context, information EmailInformation) (string, error) {
	mg := mailgun.NewMailgun(m.Domain, m.APIKey)

	var _ *mailgun.MailgunImpl = mg
	msg := mailgun.NewMessage("Purple Sandbox", "Verify your email address", "")
	msg.SetTemplate("sign-up-confirmation")
	msg.AddRecipient(fmt.Sprintf("%s <%s>", information.Recipient.name, information.Recipient.email))

	for key, val := range information.Variables {
		msg.AddTemplateVariable(key, val)
	}

	_, id, err := mg.Send(ctx, msg)
	return id, err
}
