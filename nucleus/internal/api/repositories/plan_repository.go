package repositories

import (
	"context"
	"nucleus/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PlanRepository interface {
	Create(ctx context.Context, plan *models.Plan) error
	Update(ctx context.Context, tx *gorm.DB, plan *models.Plan) error
	FindByID(ctx context.Context, planID uuid.UUID) (*models.Plan, error)
	FindByUserID(ctx context.Context, userID uuid.UUID, name, startDate, endDate, planType string, page int, limit int) ([]models.Plan, int64, error)
	CountByUserID(ctx context.Context, userID uuid.UUID) (int64, error)
	Delete(ctx context.Context, tx *gorm.DB, plan *models.Plan) error
	DeleteByUserID(ctx context.Context, tx *gorm.DB, userID uuid.UUID) error
}
