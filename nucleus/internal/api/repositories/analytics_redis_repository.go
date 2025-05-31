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
