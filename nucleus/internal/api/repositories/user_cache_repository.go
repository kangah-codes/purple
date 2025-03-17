package repositories

import (
	"context"
	"nucleus/internal/cache"
	"nucleus/internal/log"
	"nucleus/internal/models"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CachingUserRepository struct {
	next       UserRepository
	cache      cache.CacheService
	keyPrefix  string
	expiration time.Duration
}

func NewCachingUserRepository(next UserRepository, cacheService cache.CacheService, keyPrefix string, expiration time.Duration) *CachingUserRepository {
	return &CachingUserRepository{
		next:       next,
		cache:      cacheService,
		keyPrefix:  keyPrefix,
		expiration: expiration,
	}
}

func (r *CachingUserRepository) buildUserCacheKey(id uuid.UUID) string {
	return r.cache.BuildKey(r.keyPrefix, "users", id.String())
}

func (r *CachingUserRepository) buildUserByUsernameCacheKey(username string) string {
	return r.cache.BuildKey(r.keyPrefix, "users", "username", username)
}

func (r *CachingUserRepository) Create(ctx context.Context, tx *gorm.DB, user *models.User) error {
	return r.next.Create(ctx, tx, user)
}

func (r *CachingUserRepository) FindByID(ctx context.Context, id uuid.UUID) (*models.User, error) {
	key := r.buildUserCacheKey(id)
	var cachedUser models.User
	found, err := r.cache.Get(ctx, key, &cachedUser)
	if err != nil {
		log.ErrorLogger.Printf("Error getting user by ID from cache: %v", err)
	}
	if found {
		return &cachedUser, nil
	}

	user, err := r.next.FindByID(ctx, id)
	if err == nil && user != nil {
		err := r.cache.Set(ctx, key, user, r.expiration)
		if err != nil {
			log.ErrorLogger.Printf("Error setting user by ID in cache: %v", err)
		}
	}
	return user, err
}

func (r *CachingUserRepository) FindByUsername(ctx context.Context, username string) (*models.User, error) {
	key := r.buildUserByUsernameCacheKey(username)
	var cachedUser models.User
	found, err := r.cache.Get(ctx, key, &cachedUser)
	if err != nil {
		log.ErrorLogger.Printf("Error getting user by username from cache: %v", err)
	}
	if found {
		return &cachedUser, nil
	}

	user, err := r.next.FindByUsername(ctx, username)
	if err == nil && user != nil {
		err := r.cache.Set(ctx, key, user, r.expiration)
		if err != nil {
			log.ErrorLogger.Printf("Error setting user by username in cache: %v", err)
		}
	}
	return user, err
}

func (r *CachingUserRepository) Update(ctx context.Context, user *models.User) error {
	err := r.next.Update(ctx, user)
	if err == nil {
		r.cache.Invalidate(ctx, r.buildUserCacheKey(user.ID))
		r.cache.Invalidate(ctx, r.buildUserByUsernameCacheKey(user.Username))
	}
	return err
}

func (r *CachingUserRepository) Delete(ctx context.Context, id uuid.UUID) error {
	user, err := r.next.FindByID(ctx, id)
	if err == nil && user != nil {
		r.cache.Invalidate(ctx, r.buildUserCacheKey(id))
		r.cache.Invalidate(ctx, r.buildUserByUsernameCacheKey(user.Username))
	}
	return r.next.Delete(ctx, id)
}
