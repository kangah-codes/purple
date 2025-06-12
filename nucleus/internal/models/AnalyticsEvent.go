package models

import (
	"github.com/google/uuid"
)

type AnalyticsEvent struct {
	Name       string         `json:"name" binding:"required"`
	Properties map[string]any `json:"properties" binding:"required"`
	Timestamp  string         `json:"timestamp" binding:"required"`
	SessionID  uuid.UUID      `json:"sessionId" binding:"required"`
	ID         uuid.UUID      `json:"id" binding:"required"`
	Type       string         `json:"type" binding:"required,oneof=event error"`
	RetryCount *int           `json:"retryCount"`
	Stack      string         `json:"stack"`
}
