package types

import (
	"time"

	"github.com/google/uuid"
)

type CreateAnalyticsEventDTO struct {
	Items          []AnalyticsEvent `json:"items" binding:"required"`
	Timestamp      time.Time        `json:"timestamp" binding:"required"`
	DeviceMetadata DeviceMetadata   `json:"deviceMetadata" binding:"required"`
}

type AnalyticsEvent struct {
	ID         uuid.UUID             `json:"id" binding:"required"`
	Type       string                `json:"type" binding:"required,oneof=event error"`
	Payload    AnalyticsEventPayload `json:"payload" binding:"required"`
	RetryCount *int                  `json:"retryCount"`
	CreatedAt  time.Time             `json:"createdAt" binding:"required"`
}

type AnalyticsEventPayload struct {
	Name       string         `json:"name" binding:"required"`
	Properties map[string]any `json:"properties" binding:"required"`
	Timestamp  string         `json:"timestamp" binding:"required"`
	SessionID  uuid.UUID      `json:"sessionId" binding:"required"`

	Message  string         `json:"message"`
	Stack    string         `json:"stack"`
	Metadata map[string]any `json:"metadata"`
	Level    string         `json:"level"`
}

type DeviceMetadata struct {
	SystemName    string `json:"systemName" binding:"required"`
	SystemVersion string `json:"systemVersion" binding:"required"`
	Brand         string `json:"brand" binding:"required"`
	Model         string `json:"model" binding:"required"`
	DeviceID      string `json:"deviceId" binding:"required"`
	AppVersion    string `json:"appVersion" binding:"required"`
	BuildNumber   string `json:"buildNumber" binding:"required"`
	IsEmulator    bool   `json:"isEmulator"`
	Carrier       string `json:"carrier" binding:"required"`
	UniqueID      string `json:"uniqueId" binding:"required"`
}
