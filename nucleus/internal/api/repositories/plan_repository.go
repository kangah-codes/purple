package repositories

import (
	"context"
	"nucleus/internal/models"

	"github.com/google/uuid"
)

type PlanRepository interface {
	Create(ctx context.Context, plan *models.Plan) error
	Update(ctx context.Context, plan *models.Plan) error
	FindByIDAndUserID(ctx context.Context, planID uuid.UUID, userID uuid.UUID) (*models.Plan, error)
	FindByUserIDPaginated(ctx context.Context, userID uuid.UUID, name, startDate, endDate, planType string, page int, limit int) ([]models.Plan, int64, error)
	CountByUserID(ctx context.Context, userID uuid.UUID) (int64, error)
	Delete(ctx context.Context, plan *models.Plan) error
}
