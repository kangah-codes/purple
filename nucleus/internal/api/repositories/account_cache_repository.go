package repositories

import (
	"context"
	"nucleus/internal/cache"
	"nucleus/internal/log"
	"nucleus/internal/models"
	"strconv"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CachingAccountRepository struct {
	next       AccountRepository
	cache      cache.CacheService
	keyPrefix  string
	expiration time.Duration
}

func NewCachingAccountRepository(next AccountRepository, cacheService cache.CacheService, keyPrefix string, expiration time.Duration) *CachingAccountRepository {
	return &CachingAccountRepository{
		next:       next,
		cache:      cacheService,
		keyPrefix:  keyPrefix,
		expiration: expiration,
	}
}

func (r *CachingAccountRepository) buildAccountCacheKey(userID uuid.UUID, accountID uuid.UUID) string {
	return r.cache.BuildKey(r.keyPrefix, userID.String(), accountID.String())
}

func (r *CachingAccountRepository) buildUserAccountsCacheKey(userID uuid.UUID, page int, limit int) string {
	return r.cache.BuildKey(r.keyPrefix, userID.String(), "page", strconv.Itoa(page), "limit", strconv.Itoa(limit))
}

func (r *CachingAccountRepository) buildUserAccountsCountCacheKey(userID uuid.UUID) string {
	return r.cache.BuildKey(r.keyPrefix, userID.String(), "count")
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
		r.cache.Invalidate(ctx, r.buildAccountCacheKey(account.UserId, account.ID))
		r.invalidateUserAccountsCache(ctx, account.UserId)
	}
	return err
}

func (r *CachingAccountRepository) FindByIDAndUserID(ctx context.Context, accountID uuid.UUID, userID uuid.UUID) (*models.Account, error) {
	key := r.buildAccountCacheKey(userID, accountID)
	var cachedAccount models.Account
	found, err := r.cache.Get(ctx, key, &cachedAccount)
	if err != nil {
		log.ErrorLogger.Errorf("Error getting account from cache: %v", err)
	}
	if found {
		return &cachedAccount, nil
	}

	account, err := r.next.FindByIDAndUserID(ctx, accountID, userID)
	if err == nil && account != nil {
		err := r.cache.Set(ctx, key, account, r.expiration)
		if err != nil {
			log.ErrorLogger.Errorf("Error setting account in cache: %v", err)
		}
	}
	return account, err
}

func (r *CachingAccountRepository) FindByUserID(ctx context.Context, userID uuid.UUID, page int, limit int) ([]models.Account, int, error) {
	key := r.buildUserAccountsCacheKey(userID, page, limit)
	var cachedAccounts []models.Account
	found, err := r.cache.Get(ctx, key, &cachedAccounts)
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
		err := r.cache.Set(ctx, key, accounts, r.expiration)
		if err != nil {
			log.ErrorLogger.Errorf("Error setting paginated accounts in cache: %v", err)
		}
	}

	return accounts, totalItems, err
}

func (r *CachingAccountRepository) CountByUserID(ctx context.Context, userID uuid.UUID) (int, error) {
	key := r.buildUserAccountsCountCacheKey(userID)
	var cachedCount int
	found, err := r.cache.Get(ctx, key, &cachedCount)
	if err != nil {
		log.ErrorLogger.Errorf("Error getting account count from cache: %v", err)
	}
	if found {
		return cachedCount, nil
	}

	count, err := r.next.CountByUserID(ctx, userID)
	if err == nil {
		err := r.cache.Set(ctx, key, count, r.expiration)
		if err != nil {
			log.ErrorLogger.Errorf("Error setting account count in cache: %v", err)
		}
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
	r.cache.InvalidateMultiple(ctx, []string{
		r.cache.BuildKey(r.keyPrefix, userID.String(), "*"),
	})
}
