package repositories

import (
	"context"
	"nucleus/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserRepository interface {
	Create(ctx context.Context, tx *gorm.DB, user *models.User) error
	FindByID(ctx context.Context, id uuid.UUID) (*models.User, error)
	FindByUsernameAuth(ctx context.Context, username string) (*models.User, error)
	FindByUsername(ctx context.Context, username string) (*models.User, error)
	FindByUsernameOrEmail(ctx context.Context, username, email string) (*models.User, error)
	CheckAvailableUsernameExists(ctx context.Context, username string) (bool, error)
	Update(ctx context.Context, user *models.User) error
	Delete(ctx context.Context, tx *gorm.DB, id uuid.UUID) error
}
