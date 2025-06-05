package models

import (
	"time"

	"github.com/google/uuid"
)

type AnalyticsEvent struct {
	ID         uuid.UUID      `json:"id"`
	TrackingId string         `json:"trackingId"`
	Type       string         `json:"type"`
	Payload    map[string]any `json:"payload"`
	CreatedAt  time.Time      `json:"createdAt"`
}
