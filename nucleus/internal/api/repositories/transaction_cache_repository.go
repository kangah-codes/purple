// internal/repositories/caching_transaction_repository.go

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

type CachingTransactionRepository struct {
	next       TransactionRepository
	keyPrefix  string
	expiration time.Duration
	config     *config.Config
}

type TransactionQuery struct {
	StartDate string `json:"start_date"`
	EndDate   string `json:"end_date"`
	Category  string `json:"category"`
	MinAmount int    `json:"min_amount"`
	MaxAmount int    `json:"max_amount"`
	AccountID string `json:"account_id"`
}

func NewCachingTransactionRepository(next TransactionRepository, cfg *config.Config, keyPrefix string, expiration time.Duration) *CachingTransactionRepository {
	return &CachingTransactionRepository{
		next:       next,
		keyPrefix:  keyPrefix,
		expiration: expiration,
		config:     cfg,
	}
}

func (r *CachingTransactionRepository) Create(ctx context.Context, tx *gorm.DB, transaction *models.Transaction) error {
	err := r.next.Create(ctx, tx, transaction)
	if err == nil {
		// invalidate user transactions
		cacheKeys := []string{fmt.Sprintf("%s:transactions:%s:*", r.keyPrefix, transaction.User.ID.String())}
		if transaction.PlanId != nil {
			// if transaction is associated with a plan, clear that plan from cache
			cacheKeys = append(cacheKeys, fmt.Sprintf("%s:plans:%s:%s", r.keyPrefix, transaction.User.ID.String(), string(transaction.PlanId.String())))
		}
		// clear account cache associated with the transaction
		cacheKeys = append(cacheKeys, fmt.Sprintf("%s:accounts:%s:%s", r.keyPrefix, transaction.User.ID.String(), transaction.Account.ID.String()))
		// clear user cache
		cacheKeys = append(cacheKeys, fmt.Sprintf("%s:users:%s", r.keyPrefix, transaction.User.ID.String()))
		cacheKeys = append(cacheKeys, fmt.Sprintf("%s:users:username:%s", r.keyPrefix, transaction.User.Username))

		r.config.RedisCache.InvalidateMultiple(ctx, cacheKeys)
	}
	return err
}

func (r *CachingTransactionRepository) FindByID(ctx context.Context, transactionID uuid.UUID) (*models.Transaction, error) {
	// TODO: setting in ctx is not implemented but we're not calling this anyway
	userID := ctx.Value("userID").(uuid.UUID)
	key := fmt.Sprintf("%s:transactions:%s:%s", r.keyPrefix, userID.String(), transactionID.String())
	var cachedTransaction models.Transaction
	found, err := r.config.RedisCache.Get(ctx, key, &cachedTransaction)
	if err != nil {
		log.ErrorLogger.Errorf("Error getting transaction from cache: %v", err)
	}
	if found {
		return &cachedTransaction, nil
	}

	transaction, err := r.next.FindByID(ctx, transactionID)
	if err == nil && transaction != nil {
		err := r.config.RedisCache.Set(ctx, key, transaction, r.expiration)
		if err != nil {
			log.ErrorLogger.Errorf("Error setting transaction in cache: %v", err)
		}
	}
	return transaction, err
}

func (r *CachingTransactionRepository) FindByUserID(ctx context.Context, userID uuid.UUID, query TransactionQuery, page int, limit int) ([]models.Transaction, int64, error) {
	key := fmt.Sprintf("%s:transactions:%s:page-%d:limit-%d", r.keyPrefix, userID.String(), page, limit)
	var cachedTransactions []models.Transaction
	found, err := r.config.RedisCache.Get(ctx, key, &cachedTransactions)

	if err != nil {
		log.ErrorLogger.Errorf("Error getting paginated transactions from cache: %v", err)
	}
	if found {
		totalItems, err := r.next.CountByUserID(ctx, userID)
		if err != nil {
			log.ErrorLogger.Errorf("Error getting transaction count: %v", err)
		}
		return cachedTransactions, totalItems, nil
	}

	transactions, totalItems, err := r.next.FindByUserID(ctx, userID, query, page, limit)
	if err == nil && len(transactions) > 0 {
		err := r.config.RedisCache.Set(ctx, key, transactions, r.expiration)
		if err != nil {
			log.ErrorLogger.Errorf("Error setting paginated transactions in cache: %v", err)
		}
	}
	return transactions, totalItems, err
}

func (r *CachingTransactionRepository) CountByUserID(ctx context.Context, userID uuid.UUID) (int64, error) {
	return r.next.CountByUserID(ctx, userID)
}

func (r *CachingTransactionRepository) DeleteByUserID(ctx context.Context, tx *gorm.DB, userID uuid.UUID) error {
	err := r.next.DeleteByUserID(ctx, tx, userID)
	if err != nil {
		return err
	}

	cacheKeys := []string{
		fmt.Sprintf("%s:transactions:%s:*", r.keyPrefix, userID.String()),
		fmt.Sprintf("%s:accounts:%s:*", r.keyPrefix, userID.String()),
		fmt.Sprintf("%s:users:%s", r.keyPrefix, userID.String()),
	}
	r.config.RedisCache.InvalidateMultiple(ctx, cacheKeys)
	return nil
}

func (r *CachingTransactionRepository) DeleteByAccountID(ctx context.Context, tx *gorm.DB, accountID uuid.UUID) error {
	err := r.next.DeleteByAccountID(ctx, tx, accountID)
	if err != nil {
		return err
	}

	// TODO: doesn't seem like we're using this so userID will not be defined
	userID := ctx.Value("userID").(uuid.UUID)
	cacheKeys := []string{
		fmt.Sprintf("%s:transactions:%s:*", r.keyPrefix, userID.String()),
	}
	r.config.RedisCache.InvalidateMultiple(ctx, cacheKeys)

	return nil
}

func (r *CachingTransactionRepository) DeleteByPlanID(ctx context.Context, tx *gorm.DB, planID uuid.UUID) error {
	err := r.next.DeleteByPlanID(ctx, tx, planID)
	if err != nil {
		return err
	}

	userID := ctx.Value("userID").(uuid.UUID)
	cacheKeys := []string{
		fmt.Sprintf("%s:transactions:%s:*", r.keyPrefix, userID.String()),
	}
	r.config.RedisCache.InvalidateMultiple(ctx, cacheKeys)

	return nil
}
