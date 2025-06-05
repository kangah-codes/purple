package repositories

import (
	"context"
	"encoding/json"
	"fmt"
	"nucleus/internal/config"
	"nucleus/internal/models"
)

type CachingAnalyticsRepository struct {
	keyPrefix string
	config    *config.Config
}

func NewCachingAnalyticsRepository(cfg *config.Config) *CachingAnalyticsRepository {
	return &CachingAnalyticsRepository{
		keyPrefix: "analytics",
		config:    cfg,
	}
}

func (r *CachingAnalyticsRepository) Create(ctx context.Context, event *models.AnalyticsEvent) error {
	eventBytes, err := json.Marshal(event)
	if err != nil {
		return err
	}

	key := fmt.Sprintf("%s:%s", r.keyPrefix, event.TrackingId)
	return r.config.RedisCache.Client.RPush(ctx, key, eventBytes).Err()

}

func (r *CachingAnalyticsRepository) CreateBatch(ctx context.Context, events []*models.AnalyticsEvent) error {
	grouped := make(map[string][]string)

	for _, event := range events {
		eventBytes, err := json.Marshal(event)
		if err != nil {
			return err
		}
		key := fmt.Sprintf("%s:%s", r.keyPrefix, event.TrackingId)
		grouped[key] = append(grouped[key], string(eventBytes))
	}

	for key, payloads := range grouped {
		if err := r.config.RedisCache.Client.RPush(ctx, key, payloads).Err(); err != nil {
			return fmt.Errorf("failed to RPUSH to key %s: %w", key, err)
		}
	}

	return nil
}
