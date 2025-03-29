package repositories

import (
	"context"
	"nucleus/internal/config"
	"nucleus/internal/models"
	"time"

	"gorm.io/gorm"
)

type PostgresAuthRepository struct {
	db *gorm.DB
}

func NewPostgresAuthRepository(cfg *config.Config) *PostgresAuthRepository {
	return &PostgresAuthRepository{db: cfg.DB}
}

func (r *PostgresAuthRepository) SignIn(ctx context.Context, session *models.Session) error {
	return r.db.WithContext(ctx).Create(session).Error
}

func (r *PostgresAuthRepository) SignOut(ctx context.Context, session *models.Session) error {
	return r.db.WithContext(ctx).Delete(session).Error
}

func (r *PostgresAuthRepository) Clear(ctx context.Context, token string) error {
	return r.db.WithContext(ctx).Where("token = ?", token).Delete(&models.Session{}).Error
}

func (r *PostgresAuthRepository) GenerateResetPin(ctx context.Context, resetPin *models.PasswordResetPin) error {
	return r.db.WithContext(ctx).Create(resetPin).Error
}

func (r PostgresAuthRepository) Get(ctx context.Context, token string) (*models.Session, error) {
	var session models.Session
	if err := r.db.WithContext(ctx).Where("token = ? AND expires_at > ?", token, time.Now()).First(&session).Error; err != nil {
		return nil, err
	}

	return &session, nil
}
