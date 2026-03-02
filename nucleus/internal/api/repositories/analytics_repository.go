package repositories

import (
	"context"
	"nucleus/internal/api/types"
	"nucleus/internal/models"
)

type AnalyticsRepository interface {
	Create(ctx context.Context, event *models.AnalyticsEvent) error
	CreateBatch(ctx context.Context, events []*models.AnalyticsEvent, meta types.DeviceMetadata) error
}
