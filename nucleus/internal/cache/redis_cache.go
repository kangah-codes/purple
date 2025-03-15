package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"nucleus/internal/encryption"
	"nucleus/log"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"
)

type RedisCache struct {
	client *redis.Client
}

const (
	AppPrefix    = "app"
	CacheVersion = "v1"
)

func NewRedisCache(client *redis.Client) *RedisCache {
	return &RedisCache{client: client}
}

func (r *RedisCache) BuildKey(parts ...string) string {
	keyParts := []string{AppPrefix, CacheVersion}
	keyParts = append(keyParts, parts...)
	return strings.Join(keyParts, ":")
}

func (r *RedisCache) Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return r.client.Set(ctx, key, data, expiration).Err()
}

func (r *RedisCache) Get(ctx context.Context, key string, object interface{}) (bool, error) {
	data, err := r.client.Get(ctx, key).Result()
	if err == redis.Nil {
		return false, nil
	} else if err != nil {
		return false, err
	}
	if err := json.Unmarshal([]byte(data), object); err != nil {
		return false, err
	}
	log.InfoLogger.Debugf("Cache hit for key %s returned %v", key, object)
	return true, nil
}

func (r *RedisCache) SetEncrypted(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}
	encryptedData, err := encryption.Encrypt(string(data))
	if err != nil {
		return err
	}
	return r.client.Set(ctx, key, encryptedData, expiration).Err()
}

func (r *RedisCache) GetEncrypted(ctx context.Context, key string, object interface{}) (bool, error) {
	encryptedData, err := r.client.Get(ctx, key).Result()
	if err == redis.Nil {
		return false, nil
	} else if err != nil {
		return false, err
	}
	decryptedData, err := encryption.Decrypt(encryptedData)
	if err != nil {
		return false, err
	}
	if err := json.Unmarshal([]byte(decryptedData), object); err != nil {
		return false, err
	}
	log.InfoLogger.Debugf("Encrypted cache hit for key %s", key)
	return true, nil
}

func (r *RedisCache) Invalidate(ctx context.Context, pattern string) error {
	iter := r.client.Scan(ctx, 0, pattern, 0).Iterator()
	var keys []string
	for iter.Next(ctx) {
		keys = append(keys, iter.Val())
	}
	if err := iter.Err(); err != nil {
		return fmt.Errorf("failed to scan cache keys: %w", err)
	}
	if len(keys) > 0 {
		err := r.client.Del(ctx, keys...).Err()
		if err != nil {
			return fmt.Errorf("failed to delete cache keys: %w", err)
		}
	}
	return nil
}

func (r *RedisCache) InvalidateMultiple(ctx context.Context, patterns []string) error {
	for _, pattern := range patterns {
		iter := r.client.Scan(ctx, 0, pattern, 0).Iterator()
		var keys []string
		for iter.Next(ctx) {
			keys = append(keys, iter.Val())
		}
		if err := iter.Err(); err != nil {
			return fmt.Errorf("failed to scan cache keys for pattern %s: %w", pattern, err)
		}
		if len(keys) > 0 {
			err := r.client.Del(ctx, keys...).Err()
			if err != nil {
				return fmt.Errorf("failed to delete cache keys for pattern %s: %w", pattern, err)
			}
		}
	}
	return nil
}
