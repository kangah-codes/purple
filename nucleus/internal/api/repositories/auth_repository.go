package repositories

import (
	"context"
	"nucleus/internal/models"
)

type AuthRepository interface {
	SignIn(ctx context.Context, session *models.Session) error
	Clear(ctx context.Context, token string) error
	Get(ctx context.Context, token string) (*models.Session, error)
}
