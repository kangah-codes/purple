package repositories

import (
	"context"
	"nucleus/internal/config"
	"nucleus/internal/log"
	"nucleus/internal/models"
	"strconv"
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

func (r *CachingAccountRepository) buildAccountCacheKey(accountID uuid.UUID) string {
	return r.config.RedisCache.BuildKey(r.keyPrefix, accountID.String())
}

func (r *CachingAccountRepository) buildUserAccountsCacheKey(userID uuid.UUID, page int, limit int) string {
	return r.config.RedisCache.BuildKey(r.keyPrefix, userID.String(), "page", strconv.Itoa(page), "limit", strconv.Itoa(limit))
}

func (r *CachingAccountRepository) Create(ctx context.Context, account *models.Account) error {
	err := r.next.Create(ctx, account)
	if err == nil {
		r.invalidateUserAccountsCache(ctx, account.UserId)
	}
	return err
}

func (r *CachingAccountRepository) Update(ctx context.Context, tx *gorm.DB, account *models.Account) error {
	err := r.next.Update(ctx, tx, account)
	if err == nil {
		r.config.RedisCache.Invalidate(ctx, r.buildAccountCacheKey(account.ID))
		r.invalidateUserAccountsCache(ctx, account.UserId)
	}
	return err
}

func (r *CachingAccountRepository) FindByIDAndUserID(ctx context.Context, accountID uuid.UUID, userID uuid.UUID) (*models.Account, error) {
	key := r.buildAccountCacheKey(accountID)
	var cachedAccount models.Account
	found, err := r.config.RedisCache.Get(ctx, key, &cachedAccount)
	if err != nil {
		log.ErrorLogger.Errorf("Error getting account from cache: %v", err)
	}
	if found {
		return &cachedAccount, nil
	}

	account, err := r.next.FindByIDAndUserID(ctx, accountID, userID)
	if err == nil && account != nil {
		err := r.config.RedisCache.Set(ctx, key, account, r.expiration)
		if err != nil {
			log.ErrorLogger.Errorf("Error setting account in cache: %v", err)
		}
	}
	return account, err
}

func (r *CachingAccountRepository) FindByUserID(ctx context.Context, userID uuid.UUID, page int, limit int) ([]models.Account, int, error) {
	key := r.buildUserAccountsCacheKey(userID, page, limit)
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

	r.invalidateUserAccountsCache(ctx, account.UserId)

	return nil
}

func (r *CachingAccountRepository) DeleteByUserID(ctx context.Context, tx *gorm.DB, userID uuid.UUID) error {
	err := r.next.DeleteByUserID(ctx, tx, userID)
	if err != nil {
		return err
	}

	r.invalidateUserAccountsCache(ctx, userID)

	return nil
}

func (r *CachingAccountRepository) invalidateUserAccountsCache(ctx context.Context, userID uuid.UUID) {
	r.config.RedisCache.InvalidateMultiple(ctx, []string{
		r.config.RedisCache.BuildKey(r.keyPrefix, userID.String(), "*"),
	})
}
