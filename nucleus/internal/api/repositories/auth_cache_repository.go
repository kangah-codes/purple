package repositories

import (
	"context"
	"nucleus/internal/cache"
	"nucleus/internal/models"
	"nucleus/log"
	"nucleus/utils"
	"time"
)

type CachingAuthRepository struct {
	next       AuthRepository
	cache      cache.CacheService
	keyPrefix  string
	expiration time.Duration
}

func NewCachingAuthRepository(next AuthRepository, cacheService cache.CacheService, keyPrefix string, expiration time.Duration) *CachingAuthRepository {
	return &CachingAuthRepository{
		next:       next,
		cache:      cacheService,
		keyPrefix:  keyPrefix,
		expiration: expiration,
	}
}

func (r *CachingAuthRepository) buildUserAuthCacheKey(token string) string {
	return r.cache.BuildKey(r.keyPrefix, utils.HashToken(token))
}

func (r *CachingAuthRepository) SignIn(ctx context.Context, session *models.Session) error {
	err := r.next.SignIn(ctx, session)
	if err == nil {
		r.invalidateUserAuthCache(ctx, session.Token)
	} else {
		return err
	}

	cacheKey := r.buildUserAuthCacheKey(session.Token)
	err = r.cache.Set(ctx, cacheKey, session, time.Minute*5)
	if err != nil {
		log.ErrorLogger.Printf("Error setting user session in cache: %v", err)
	}

	return nil
}

func (r *CachingAuthRepository) Clear(ctx context.Context, token string) error {
	err := r.next.Clear(ctx, token)
	if err == nil {
		r.invalidateUserAuthCache(ctx, token)
	}

	return err
}

func (r *CachingAuthRepository) Get(ctx context.Context, token string) (*models.Session, error) {
	cacheKey := r.buildUserAuthCacheKey(token)
	var cachedSession models.Session
	found, err := r.cache.Get(ctx, cacheKey, &cachedSession)
	if err != nil {
		log.ErrorLogger.Printf("Error getting session from cache: %v", err)
	}
	if found {
		return &cachedSession, nil
	}

	session, err := r.next.Get(ctx, token)
	if err == nil && session != nil {
		err := r.cache.Set(ctx, cacheKey, session, r.expiration)
		if err != nil {
			log.ErrorLogger.Printf("Error setting session in cache: %v", err)
		}
	}

	return session, err
}

func (r *CachingAuthRepository) invalidateUserAuthCache(ctx context.Context, token string) {
	r.cache.Invalidate(ctx, r.cache.BuildKey(r.keyPrefix, utils.HashToken(token)))
}
