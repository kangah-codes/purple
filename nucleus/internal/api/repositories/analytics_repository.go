package repositories

import (
	"context"
	"nucleus/internal/models"
)

type AnalyticsRepository interface {
	Create(ctx context.Context, event *models.AnalyticsEvent) error
	CreateBatch(ctx context.Context, events []*models.AnalyticsEvent) error
}
