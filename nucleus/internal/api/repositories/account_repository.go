package repositories

import (
	"context"
	"nucleus/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AccountRepository interface {
	Create(ctx context.Context, account *models.Account) error
	Update(ctx context.Context, account *models.Account) error
	FindByIDAndUserID(ctx context.Context, accountID uuid.UUID, userID uuid.UUID) (*models.Account, error)
	FindByUserIDPaginated(ctx context.Context, userID uuid.UUID, page int, limit int) ([]models.Account, int64, error)
	CountByUserID(ctx context.Context, userID uuid.UUID) (int64, error)
	Delete(ctx context.Context, tx *gorm.DB, account *models.Account) error
}
