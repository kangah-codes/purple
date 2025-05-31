package types

import (
	"time"

	"github.com/google/uuid"
)

type CreateAnalyticsEventDTO struct {
	ID         uuid.UUID      `json:"id" binding:"required"`
	TrackingId string         `json:"tracking_id" binding:"required"`
	Type       string         `json:"type" binding:"required"`
	Payload    map[string]any `json:"payload" binding:"required"`
	RetryCount *int           `json:"retry_count" binding:"required"`
	CreatedAt  time.Time      `json:"created_at" binding:"required"`
}
