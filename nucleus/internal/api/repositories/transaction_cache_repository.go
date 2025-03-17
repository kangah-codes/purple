// internal/repositories/caching_transaction_repository.go

package repositories

import (
	"context"
	"fmt"
	"nucleus/internal/cache"
	"nucleus/internal/log"
	"nucleus/internal/models"
	"strconv"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CachingTransactionRepository struct {
	next       TransactionRepository
	cache      cache.CacheService
	keyPrefix  string
	expiration time.Duration
}

type TransactionQuery struct {
	StartDate string `json:"start_date"`
	EndDate   string `json:"end_date"`
	Category  string `json:"category"`
	MinAmount string `json:"min_amount"`
	MaxAmount string `json:"max_amount"`
}

func NewCachingTransactionRepository(next TransactionRepository, cacheService cache.CacheService, keyPrefix string, expiration time.Duration) *CachingTransactionRepository {
	return &CachingTransactionRepository{
		next:       next,
		cache:      cacheService,
		keyPrefix:  keyPrefix,
		expiration: expiration,
	}
}

func (r *CachingTransactionRepository) buildTransactionCacheKey(userID uuid.UUID, transactionID uuid.UUID) string {
	return r.cache.BuildKey(r.keyPrefix, userID.String(), transactionID.String())
}

func (r *CachingTransactionRepository) buildUserTransactionsCacheKey(userID uuid.UUID, query TransactionQuery, page int, limit int) string {
	queryStr := fmt.Sprintf("start:%s-end:%s-category:%s-min:%s-max:%s", query.StartDate, query.EndDate, query.Category, query.MinAmount, query.MaxAmount)
	return r.cache.BuildKey(r.keyPrefix, userID.String(), "query", queryStr, "page", strconv.Itoa(page), "limit", strconv.Itoa(limit))
}

func (r *CachingTransactionRepository) Create(ctx context.Context, tx *gorm.DB, transaction *models.Transaction) error {
	err := r.next.Create(ctx, tx, transaction)
	if err == nil {
		r.invalidateUserTransactionsCache(ctx, transaction.UserId)
		r.invalidateUserPlansCache(ctx, transaction.UserId, *transaction.PlanId)
	}
	return err
}

func (r *CachingTransactionRepository) FindByIDAndUserID(ctx context.Context, transactionID uuid.UUID, userID uuid.UUID) (*models.Transaction, error) {
	key := r.buildTransactionCacheKey(userID, transactionID)
	var cachedTransaction models.Transaction
	found, err := r.cache.Get(ctx, key, &cachedTransaction)
	if err != nil {
		log.ErrorLogger.Printf("Error getting transaction from cache: %v", err)
	}
	if found {
		return &cachedTransaction, nil
	}

	transaction, err := r.next.FindByIDAndUserID(ctx, transactionID, userID)
	if err == nil && transaction != nil {
		err := r.cache.Set(ctx, key, transaction, r.expiration)
		if err != nil {
			log.ErrorLogger.Printf("Error setting transaction in cache: %v", err)
		}
	}
	return transaction, err
}

func (r *CachingTransactionRepository) FindByUserIDPaginated(ctx context.Context, userID uuid.UUID, page int, limit int) ([]models.Transaction, int64, error) {
	query := TransactionQuery{}
	key := r.buildUserTransactionsCacheKey(userID, query, page, limit)
	var cachedTransactions []models.Transaction
	found, err := r.cache.Get(ctx, key, &cachedTransactions)
	fmt.Println("FOUND, ", found)
	if err != nil {
		log.ErrorLogger.Printf("Error getting paginated transactions from cache: %v", err)
	}
	if found {
		totalItems, err := r.next.CountByUserID(ctx, userID)
		if err != nil {
			log.ErrorLogger.Printf("Error getting transaction count: %v", err)
		}
		return cachedTransactions, totalItems, nil
	}

	transactions, totalItems, err := r.next.FindByUserIDPaginated(ctx, userID, page, limit)
	if err == nil && len(transactions) > 0 {
		err := r.cache.Set(ctx, key, transactions, r.expiration)
		if err != nil {
			log.ErrorLogger.Printf("Error setting paginated transactions in cache: %v", err)
		}
	}
	return transactions, totalItems, err
}

func (r *CachingTransactionRepository) CountByUserID(ctx context.Context, userID uuid.UUID) (int64, error) {
	return r.next.CountByUserID(ctx, userID)
}

func (r *CachingTransactionRepository) DeleteByUserID(ctx context.Context, tx *gorm.DB, userID uuid.UUID) error {
	err := r.next.DeleteByUserID(ctx, tx, userID)
	if err == nil {
		r.invalidateUserTransactionsCache(ctx, userID)
	}
	return err
}

func (r *CachingTransactionRepository) invalidateUserTransactionsCache(ctx context.Context, userID uuid.UUID) {
	r.cache.Invalidate(ctx, r.cache.BuildKey(r.keyPrefix, userID.String(), "*"))
	r.cache.Invalidate(ctx, r.cache.BuildKey(r.keyPrefix, "users", userID.String()))
}

func (r *CachingTransactionRepository) invalidateUserPlansCache(ctx context.Context, userID uuid.UUID, planID uuid.UUID) {
	fmt.Println(r.cache.BuildKey("plans", userID.String(), planID.String()), "KL")
	r.cache.Invalidate(ctx, r.cache.BuildKey("plans", userID.String(), planID.String()))
}
