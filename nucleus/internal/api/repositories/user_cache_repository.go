package repositories

import (
	"context"
	"nucleus/internal/config"
	"nucleus/internal/log"
	"nucleus/internal/models"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CachingUserRepository struct {
	next       UserRepository
	keyPrefix  string
	expiration time.Duration
	config     *config.Config
}

func NewCachingUserRepository(next UserRepository, cfg *config.Config, keyPrefix string, expiration time.Duration) *CachingUserRepository {
	return &CachingUserRepository{
		next:       next,
		keyPrefix:  keyPrefix,
		expiration: expiration,
		config:     cfg,
	}
}

func (r *CachingUserRepository) buildUserCacheKey(id uuid.UUID) string {
	return r.config.RedisCache.BuildKey(r.keyPrefix, "users", id.String())
}

func (r *CachingUserRepository) buildUserByUsernameCacheKey(username string) string {
	return r.config.RedisCache.BuildKey(r.keyPrefix, "users", "username", username)
}

func (r *CachingUserRepository) Create(ctx context.Context, tx *gorm.DB, user *models.User) error {
	return r.next.Create(ctx, tx, user)
}

func (r *CachingUserRepository) FindByID(ctx context.Context, id uuid.UUID) (*models.User, error) {
	key := r.buildUserCacheKey(id)
	var cachedUser models.User
	found, err := r.config.RedisCache.Get(ctx, key, &cachedUser)
	if err != nil {
		log.ErrorLogger.Errorf("Error getting user by ID from cache: %v", err)
	}
	if found {
		return &cachedUser, nil
	}

	user, err := r.next.FindByID(ctx, id)
	if err == nil && user != nil {
		err := r.config.RedisCache.Set(ctx, key, user, r.expiration)
		if err != nil {
			log.ErrorLogger.Errorf("Error setting user by ID in cache: %v", err)
		}
	}
	return user, err
}

func (r *CachingUserRepository) CheckAvailableUsernameExists(ctx context.Context, username string) (bool, error) {
	return r.next.CheckAvailableUsernameExists(ctx, username)
}

func (r *CachingUserRepository) FindByUsernameAuth(ctx context.Context, username string) (*models.User, error) {
	return r.next.FindByUsernameAuth(ctx, username)
}

func (r *CachingUserRepository) FindByUsername(ctx context.Context, username string) (*models.User, error) {
	key := r.buildUserByUsernameCacheKey(username)
	var cachedUser models.User
	found, err := r.config.RedisCache.Get(ctx, key, &cachedUser)
	if err != nil {
		log.ErrorLogger.Errorf("Error getting user by username from cache: %v", err)
	}
	if found {
		return &cachedUser, nil
	}

	user, err := r.next.FindByUsername(ctx, username)
	if err == nil && user != nil {
		err := r.config.RedisCache.Set(ctx, key, user, r.expiration)
		if err != nil {
			log.ErrorLogger.Errorf("Error setting user by username in cache: %v", err)
		}
	}
	return user, err
}

func (r *CachingUserRepository) Update(ctx context.Context, user *models.User) error {
	err := r.next.Update(ctx, user)
	if err == nil {
		r.config.RedisCache.Invalidate(ctx, r.buildUserCacheKey(user.ID))
		r.config.RedisCache.Invalidate(ctx, r.buildUserByUsernameCacheKey(user.Username))
	}
	return err
}

func (r *CachingUserRepository) Delete(ctx context.Context, tx *gorm.DB, id uuid.UUID) error {
	user, err := r.next.FindByID(ctx, id)
	if user == nil || err != nil {
		return err
	}

	err = r.next.Delete(ctx, tx, id)
	if err != nil {
		return err
	}

	r.config.RedisCache.Invalidate(ctx, r.buildUserCacheKey(id))
	r.config.RedisCache.Invalidate(ctx, r.buildUserByUsernameCacheKey(user.Username))

	return nil
}
