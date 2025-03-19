package repositories

import (
	"context"
	"nucleus/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type TransactionRepository interface {
	Create(ctx context.Context, tx *gorm.DB, transaction *models.Transaction) error
	FindByIDAndUserID(ctx context.Context, accountID uuid.UUID, userID uuid.UUID) (*models.Transaction, error)
	FindByUserID(ctx context.Context, userID uuid.UUID, page int, limit int) ([]models.Transaction, int64, error)
	CountByUserID(ctx context.Context, userID uuid.UUID) (int64, error)
	DeleteByUserID(ctx context.Context, tx *gorm.DB, userID uuid.UUID) error
	DeleteByAccountID(ctx context.Context, tx *gorm.DB, accountID uuid.UUID) error
	DeleteByPlanID(ctx context.Context, tx *gorm.DB, planID uuid.UUID) error
}
