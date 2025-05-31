package models

import (
	"time"

	"github.com/google/uuid"
)

type AnalyticsEvent struct {
	ID         uuid.UUID      `json:"id"`
	TrackingId string         `json:"tracking_id"`
	Type       string         `json:"type"`
	Payload    map[string]any `json:"payload"`
	RetryCount int            `json:"retry_count"`
	CreatedAt  time.Time      `json:"created_at"`
}
