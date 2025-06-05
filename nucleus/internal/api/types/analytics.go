package types

import (
	"time"

	"github.com/google/uuid"
)

type CreateAnalyticsEventDTO struct {
	Items          []AnalyticsEvent `json:"items" binding:"required"`
	SessionID      string                    `json:"sessionId" binding:"required"`
	Timestamp      time.Time                 `json:"timestamp" binding:"required"`
	DeviceMetadata DeviceMetadata            `json:"deviceMetadata" binding:"required"`
}

type AnalyticsEvent struct {
	ID         uuid.UUID         `json:"id" binding:"required"`
	TrackingId string            `json:"tracking_id" binding:"required"`
	Type       string            `json:"type" binding:"required"`
	Payload    map[string]any    `json:"payload" binding:"required"`
	RetryCount *int              `json:"retry_count" binding:"required"`
	CreatedAt  time.Time         `json:"created_at" binding:"required"`
}

type DeviceMetadata struct {
	DeviceID    string `json:"deviceId" binding:"required"`
	AppVersion  string `json:"appVersion" binding:"required"`
	OS          string `json:"os" binding:"required"`
	OSVersion   string `json:"osVersion" binding:"required"`
	Manufacturer string `json:"manufacturer" binding:"required"`
	Model       string `json:"model" binding:"required"`
}
