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

type CachingAccountRepository struct {
	next       AccountRepository
	keyPrefix  string
	expiration time.Duration
	config     *config.Config
}

func NewCachingAccountRepository(next AccountRepository, cfg *config.Config, keyPrefix string, expiration time.Duration) *CachingAccountRepository {
	return &CachingAccountRepository{
		next:       next,
		keyPrefix:  keyPrefix,
		expiration: expiration,
		config:     cfg,
	}
}

func (r *CachingAccountRepository) Create(ctx context.Context, account *models.Account) error {
	err := r.next.Create(ctx, account)
	if err == nil {
		r.config.RedisCache.Invalidate(ctx, fmt.Sprintf("%s:accounts:%s:*", r.keyPrefix, account.User.ID.String()))
	}
	return err
}

func (r *CachingAccountRepository) Update(ctx context.Context, tx *gorm.DB, account *models.Account) error {
	err := r.next.Update(ctx, tx, account)
	if err == nil {
		r.config.RedisCache.Invalidate(ctx, fmt.Sprintf("%s:accounts:%s:*", r.keyPrefix, account.User.ID.String()))
	}
	return err
}

func (r *CachingAccountRepository) FindByID(ctx context.Context, accountID uuid.UUID) (*models.Account, error) {
	userID := ctx.Value("userID").(uuid.UUID)
	key := fmt.Sprintf("%s:accounts:%s:%s", r.keyPrefix, userID.String(), accountID.String())
	var cachedAccount models.Account
	found, err := r.config.RedisCache.Get(ctx, key, &cachedAccount)
	if err != nil {
		log.ErrorLogger.Errorf("Error getting account from cache: %v", err)
	}
	if found {
		return &cachedAccount, nil
	}

	account, err := r.next.FindByID(ctx, accountID)
	if err == nil && account != nil {
		err := r.config.RedisCache.Set(ctx, key, account, r.expiration)
		if err != nil {
			log.ErrorLogger.Errorf("Error setting account in cache: %v", err)
		}
	}
	return account, err
}

func (r *CachingAccountRepository) FindByUserID(ctx context.Context, userID uuid.UUID, page int, limit int) ([]models.Account, int, error) {
	key := fmt.Sprintf("%s:accounts:%s:page-%d:limit-%d", r.keyPrefix, userID.String(), page, limit)
	var cachedAccounts []models.Account
	found, err := r.config.RedisCache.Get(ctx, key, &cachedAccounts)
	if err != nil {
		log.ErrorLogger.Errorf("Error getting paginated accounts from cache: %v", err)
	}

	if found {
		totalItems, err := r.next.CountByUserID(ctx, userID)
		if err != nil {
			log.ErrorLogger.Errorf("Error getting account count: %v", err)
		}
		return cachedAccounts, totalItems, nil
	}

	accounts, totalItems, err := r.next.FindByUserID(ctx, userID, page, limit)
	if err == nil && len(accounts) > 0 {
		err := r.config.RedisCache.Set(ctx, key, accounts, r.expiration)
		if err != nil {
			log.ErrorLogger.Errorf("Error setting paginated accounts in cache: %v", err)
		}
	}

	return accounts, totalItems, err
}

func (r *CachingAccountRepository) CountByUserID(ctx context.Context, userID uuid.UUID) (int, error) {
	count, err := r.next.CountByUserID(ctx, userID)
	if err == nil {
		return 0, err
	}

	return count, err
}

func (r *CachingAccountRepository) Delete(ctx context.Context, tx *gorm.DB, account *models.Account) error {
	err := r.next.Delete(ctx, tx, account)
	if err != nil {
		return err
	}

	r.config.RedisCache.Invalidate(ctx, fmt.Sprintf("%s:accounts:%s:*", r.keyPrefix, account.User.ID.String()))
	return nil
}

func (r *CachingAccountRepository) DeleteByUserID(ctx context.Context, tx *gorm.DB, userID uuid.UUID) error {
	err := r.next.DeleteByUserID(ctx, tx, userID)
	if err != nil {
		return err
	}

	r.config.RedisCache.Invalidate(ctx, fmt.Sprintf("%s:accounts:%s:*", r.keyPrefix, userID.String()))
	return nil
}
