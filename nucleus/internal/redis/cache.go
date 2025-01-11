package redis

import (
	"context"
	"encoding/json"
	"fmt"
	"nucleus/log"
	"nucleus/utils"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"
)

const (
	AppPrefix    = "app"
	CacheVersion = "v1"
)

var RedisClient *redis.Client

func InitRedis() {
	ctx := context.Background()
	RedisClient = redis.NewClient(&redis.Options{
		Addr:     utils.EnvValue("REDIS_HOST", ""),
		Password: utils.EnvValue("REDIS_PASSWORD", ""),
		DB:       0,
	})

	_, err := RedisClient.Ping(ctx).Result()
	if err != nil {
		log.ErrorLogger.Fatalf("Failed to connect to Redis: %v", err.Error())
	}

	log.InfoLogger.Println("Connected to Redis")
}

// For single objects
// model:userID:objectID
// For paginated items
// model:userID:page:pageSize
func BuildCacheKey(parts ...string) string {
	keyParts := []string{AppPrefix, CacheVersion}
	keyParts = append(keyParts, parts...)

	return strings.Join(keyParts, ":")
}

func SetCache(key string, value interface{}, expiration time.Duration) error {
	data, err := json.Marshal(value)

	if err != nil {
		return err
	}

	return RedisClient.Set(context.Background(), key, data, expiration).Err()
}

func GetCache(key string, object interface{}) (bool, error) {
	data, err := RedisClient.Get(context.Background(), key).Result()

	if err == redis.Nil {
		// Key does not exist in the cache
		return false, nil
	} else if err != nil {
		// Some other Redis error occurred
		return false, err
	}

	// Key exists; unmarshal the data into the provided object
	if err := json.Unmarshal([]byte(data), object); err != nil {
		return false, err
	}

	log.InfoLogger.Debugf("Cache hit for key %s returned %v", key, object)

	return true, nil
}

func InvalidateCache(pattern string) error {
	ctx := context.Background()
	iter := RedisClient.Scan(ctx, 0, pattern, 0).Iterator()

	var keys []string
	for iter.Next(ctx) {
		keys = append(keys, iter.Val())
	}

	if err := iter.Err(); err != nil {
		return fmt.Errorf("failed to scan cache keys: %w", err)
	}

	if len(keys) > 0 {
		err := RedisClient.Del(ctx, keys...).Err()
		if err != nil {
			return fmt.Errorf("failed to delete cache keys: %w", err)
		}
	}

	return nil
}

func InvalidateMultipleCaches(patterns []string) error {
	ctx := context.Background()

	for _, pattern := range patterns {
		iter := RedisClient.Scan(ctx, 0, pattern, 0).Iterator()

		var keys []string
		for iter.Next(ctx) {
			keys = append(keys, iter.Val())
		}

		if err := iter.Err(); err != nil {
			return fmt.Errorf("failed to scan cache keys for pattern %s: %w", pattern, err)
		}

		if len(keys) > 0 {
			err := RedisClient.Del(ctx, keys...).Err()
			if err != nil {
				return fmt.Errorf("failed to delete cache keys for pattern %s: %w", pattern, err)
			}
		}
	}

	return nil
}
