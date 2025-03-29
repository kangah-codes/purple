package services

import (
	"context"
	"nucleus/internal/api/repositories"
)

type EmailService struct {
	emailRepo repositories.EmailRepository
}

func NewEmailService(emailRepo repositories.EmailRepository) *EmailService {
	return &EmailService{emailRepo: emailRepo}
}

func (e *EmailService) SendEmail(ctx context.Context, information repositories.EmailInformation) (any, error) {
	return e.emailRepo.SendEmail(ctx, information)
}
