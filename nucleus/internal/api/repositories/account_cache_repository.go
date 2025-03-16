package repositories

import (
	"context"
	"nucleus/internal/cache"
	"nucleus/internal/models"
	"nucleus/log"
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

func (r *CachingAccountRepository) Update(ctx context.Context, account *models.Account) error {
	err := r.next.Update(ctx, account)
	if err == nil {
		r.cache.Invalidate(ctx, r.buildAccountCacheKey(account.UserId, account.ID))
		r.invalidateUserAccountsCache(ctx, account.UserId)
	}
	return err
}

func (r *CachingAccountRepository) FindByIDAndUserID(ctx context.Context, accountID uuid.UUID, userID uuid.UUID) (*models.Account, error) {
	key := r.buildAccountCacheKey(userID, accountID)
	var cachedAccount models.Account
	found, err := r.cache.GetEncrypted(ctx, key, &cachedAccount)
	if err != nil {
		log.ErrorLogger.Printf("Error getting account from cache: %v", err)
	}
	if found {
		return &cachedAccount, nil
	}

	account, err := r.next.FindByIDAndUserID(ctx, accountID, userID)
	if err == nil && account != nil {
		err := r.cache.SetEncrypted(ctx, key, account, r.expiration)
		if err != nil {
			log.ErrorLogger.Printf("Error setting account in cache: %v", err)
		}
	}
	return account, err
}

func (r *CachingAccountRepository) FindByUserIDPaginated(ctx context.Context, userID uuid.UUID, page int, limit int) ([]models.Account, int64, error) {
	key := r.buildUserAccountsCacheKey(userID, page, limit)
	var cachedAccounts []models.Account
	found, err := r.cache.GetEncrypted(ctx, key, &cachedAccounts)
	if err != nil {
		log.ErrorLogger.Printf("Error getting paginated accounts from cache: %v", err)
	}

	if found {
		totalItems, err := r.next.CountByUserID(ctx, userID)
		if err != nil {
			log.ErrorLogger.Printf("Error getting account count: %v", err)
		}
		return cachedAccounts, totalItems, nil
	}

	accounts, totalItems, err := r.next.FindByUserIDPaginated(ctx, userID, page, limit)
	if err == nil && len(accounts) > 0 {
		err := r.cache.SetEncrypted(ctx, key, accounts, r.expiration)
		if err != nil {
			log.ErrorLogger.Printf("Error setting paginated accounts in cache: %v", err)
		}
	}

	return accounts, totalItems, err
}

func (r *CachingAccountRepository) CountByUserID(ctx context.Context, userID uuid.UUID) (int64, error) {
	key := r.buildUserAccountsCountCacheKey(userID)
	var cachedCount int64
	found, err := r.cache.Get(ctx, key, &cachedCount)
	if err != nil {
		log.ErrorLogger.Printf("Error getting account count from cache: %v", err)
	}
	if found {
		return cachedCount, nil
	}

	count, err := r.next.CountByUserID(ctx, userID)
	if err == nil {
		err := r.cache.Set(ctx, key, count, r.expiration)
		if err != nil {
			log.ErrorLogger.Printf("Error setting account count in cache: %v", err)
		}
	}
	return count, err
}

func (r *CachingAccountRepository) Delete(ctx context.Context, tx *gorm.DB, account *models.Account) error {
	err := r.next.Delete(ctx, tx, account)
	if err == nil {
		r.cache.Invalidate(ctx, r.buildAccountCacheKey(account.UserId, account.ID))
		r.invalidateUserAccountsCache(ctx, account.UserId)
	}
	return err
}

func (r *CachingAccountRepository) invalidateUserAccountsCache(ctx context.Context, userID uuid.UUID) {
	r.cache.Invalidate(ctx, r.cache.BuildKey(r.keyPrefix, userID.String(), "*"))
	r.cache.Invalidate(ctx, r.cache.BuildKey(r.keyPrefix, "users", userID.String()))
}
