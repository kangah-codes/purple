package repositories

import (
	"context"
	"fmt"
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

func (r *CachingUserRepository) Create(ctx context.Context, tx *gorm.DB, user *models.User) error {
	return r.next.Create(ctx, tx, user)
}

func (r *CachingUserRepository) FindByID(ctx context.Context, id uuid.UUID) (*models.User, error) {
	key := fmt.Sprintf("%s:users:%s", r.keyPrefix, id.String())
	var cachedUser models.User
	found, err := r.config.RedisCache.Get(ctx, key, &cachedUser)
	if err != nil {
		log.ErrorLogger.Errorf("Error getting user by ID from cache: %v", err)
	}
	if found {
		return &cachedUser, nil
	}

	user, err := r.next.FindByID(ctx, id)
	if err != nil || user == nil {
		return user, err
	}

	if err := r.config.RedisCache.Set(ctx, key, user, r.expiration); err != nil {
		log.ErrorLogger.Errorf("Error setting user by ID in cache: %v", err)
	}

	return user, err
}

func (r *CachingUserRepository) FindByUsernameOrEmail(ctx context.Context, username, email string) (*models.User, error) {
	return r.next.FindByUsernameOrEmail(ctx, username, email)
}

func (r *CachingUserRepository) FindByUsernameAuth(ctx context.Context, username string) (*models.User, error) {
	return r.next.FindByUsernameAuth(ctx, username)
}

func (r *CachingUserRepository) FindByUsername(ctx context.Context, username string) (*models.User, error) {
	usernameMappingKey := fmt.Sprintf("%s:username_to_id:%s", r.keyPrefix, username)
	var userID string
	mappingFound, mappingErr := r.config.RedisCache.Get(ctx, usernameMappingKey, &userID)
	if mappingErr != nil {
		log.ErrorLogger.Errorf("Error getting username mapping from cache: %v", mappingErr)
	}

	// If mapping exists, use it to get the user by ID
	if mappingFound && userID != "" {
		id, err := uuid.Parse(userID)
		if err == nil {
			return r.FindByID(ctx, id)
		}
		log.ErrorLogger.Errorf("Error parsing cached user ID: %v", err)
	}

	user, err := r.next.FindByUsername(ctx, username)
	if err != nil || user == nil {
		return user, err
	}

	userKey := fmt.Sprintf("%s:users:%s", r.keyPrefix, user.ID.String())
	if cacheErr := r.config.RedisCache.Set(ctx, userKey, user, r.expiration); cacheErr != nil {
		log.ErrorLogger.Errorf("Error setting user in cache: %v", cacheErr)
	}

	if cacheErr := r.config.RedisCache.Set(ctx, usernameMappingKey, user.ID.String(), r.expiration); cacheErr != nil {
		log.ErrorLogger.Errorf("Error setting username mapping in cache: %v", cacheErr)
	}

	return user, nil
}

func (r *CachingUserRepository) Activate(ctx context.Context, user *models.User, confirmation *models.AccountConfirmationPin) error {
	return r.next.Activate(ctx, user, confirmation)
}

func (r *CachingUserRepository) Update(ctx context.Context, user *models.User) error {
	err := r.next.Update(ctx, user)
	if err == nil {
		r.config.RedisCache.InvalidateMultiple(ctx, []string{
			fmt.Sprintf("%s:users:%s", r.keyPrefix, user.ID.String()),
		})
	}
	return err
}

func (r *CachingUserRepository) Delete(ctx context.Context, tx *gorm.DB, id uuid.UUID) error {
	user, err := r.next.FindByID(ctx, id)
	if user == nil || err != nil {
		return err
	}

	if err := r.next.Delete(ctx, tx, id); err != nil {
		return err
	}

	r.config.RedisCache.InvalidateMultiple(ctx, []string{
		fmt.Sprintf("%s:users:%s", r.keyPrefix, user.ID.String()),
		fmt.Sprintf("%s:accounts:%s:*", r.keyPrefix, user.ID.String()),
		fmt.Sprintf("%s:transactions:%s:*", r.keyPrefix, user.ID.String()),
		fmt.Sprintf("%s:plans:%s:*", r.keyPrefix, user.ID.String()),
	})

	return nil
}

func (r *CachingUserRepository) CheckAvailableUsernameExists(ctx context.Context, username string) (bool, error) {
	return r.next.CheckAvailableUsernameExists(ctx, username)
}
