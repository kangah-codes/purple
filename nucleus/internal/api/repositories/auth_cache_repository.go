package repositories

import (
	"context"
	"nucleus/internal/config"
	"nucleus/internal/log"
	"nucleus/internal/models"
	"nucleus/internal/utils"
	"time"
)

type CachingAuthRepository struct {
	next       AuthRepository
	keyPrefix  string
	expiration time.Duration
	config     *config.Config
}

func NewCachingAuthRepository(next AuthRepository, cfg *config.Config, keyPrefix string, expiration time.Duration) *CachingAuthRepository {
	return &CachingAuthRepository{
		next:       next,
		keyPrefix:  keyPrefix,
		expiration: expiration,
		config:     cfg,
	}
}

func (r *CachingAuthRepository) buildUserAuthCacheKey(token string) string {
	return r.config.RedisCache.BuildKey(r.keyPrefix, utils.HashToken(token))
}

func (r *CachingAuthRepository) SignIn(ctx context.Context, session *models.Session) error {
	err := r.next.SignIn(ctx, session)
	if err == nil {
		r.invalidateUserAuthCache(ctx, session.Token)
	} else {
		return err
	}

	cacheKey := r.buildUserAuthCacheKey(session.Token)
	err = r.config.RedisCache.Set(ctx, cacheKey, session, time.Minute*5)
	if err != nil {
		log.ErrorLogger.Errorf("Error setting user session in cache: %v", err)
	}

	return nil
}

func (r *CachingAuthRepository) SignOut(ctx context.Context, session *models.Session) error {
	err := r.next.SignOut(ctx, session)
	if err == nil {
		r.invalidateUserAuthCache(ctx, session.Token)
	} else {
		return err
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
	found, err := r.config.RedisCache.Get(ctx, cacheKey, &cachedSession)
	if err != nil {
		log.ErrorLogger.Errorf("Error getting session from cache: %v", err)
	}
	if found {
		return &cachedSession, nil
	}

	session, err := r.next.Get(ctx, token)
	if err == nil && session != nil {
		err := r.config.RedisCache.Set(ctx, cacheKey, session, r.expiration)
		if err != nil {
			log.ErrorLogger.Errorf("Error setting session in cache: %v", err)
		}
	}

	return session, err
}

func (r *CachingAuthRepository)

// TODO; clean this out
func (r *CachingAuthRepository) invalidateUserAuthCache(ctx context.Context, token string) {
	r.config.RedisCache.Invalidate(ctx, r.config.RedisCache.BuildKey(r.keyPrefix, utils.HashToken(token)))
}
