package services

import (
	"context"
	"nucleus/internal/api/repositories"
	"sync"
)

var (
	emailServiceInstance *EmailService
	emailOnce            sync.Once
)

type EmailService struct {
	emailRepo repositories.EmailRepository
}

func GetEmailService(emailRepo repositories.EmailRepository) *EmailService {
	emailOnce.Do(func() {
		emailServiceInstance = &EmailService{
			emailRepo: emailRepo,
		}
	})
	return emailServiceInstance
}

func NewEmailService(emailRepo repositories.EmailRepository) *EmailService {
	return &EmailService{emailRepo: emailRepo}
}

func (e *EmailService) SendEmail(ctx context.Context, information repositories.EmailInformation) (string, error) {
	return e.emailRepo.SendEmail(ctx, information)
}
