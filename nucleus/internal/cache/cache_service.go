package cache

import (
	"context"
	"time"
)

type CacheService interface {
	Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error
	Get(ctx context.Context, key string, object interface{}) (bool, error)
	Invalidate(ctx context.Context, pattern string) error
	InvalidateMultiple(ctx context.Context, patterns []string) error
	BuildKey(parts ...string) string
}
