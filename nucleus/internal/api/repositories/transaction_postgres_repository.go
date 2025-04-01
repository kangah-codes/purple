// internal/repositories/postgres_transaction_repository.go

package repositories

import (
	"context"
	"fmt"
	"nucleus/internal/config"
	"nucleus/internal/errors"
	"nucleus/internal/models"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PostgresTransactionRepository struct {
	db *gorm.DB
}

func NewPostgresTransactionRepository(cfg *config.Config) *PostgresTransactionRepository {
	return &PostgresTransactionRepository{db: cfg.DB}
}

func (r *PostgresTransactionRepository) Create(ctx context.Context, tx *gorm.DB, transaction *models.Transaction) error {
	return tx.WithContext(ctx).Create(transaction).Error
}

func (r *PostgresTransactionRepository) FindByID(ctx context.Context, accountID uuid.UUID) (*models.Transaction, error) {
	var transaction models.Transaction
	result := r.db.WithContext(ctx).Preload("Account").Where("id = ?", accountID).First(&transaction)
	if result.Error != nil {
		return nil, result.Error
	}
	return &transaction, nil
}

func (r *PostgresTransactionRepository) FindByUserID(ctx context.Context, userID uuid.UUID, query TransactionQuery) ([]models.Transaction, int64, error) {
	var transactions []models.Transaction
	var totalItems int64

	if err := r.db.WithContext(ctx).Model(&models.Account{}).Where("user_id = ?", userID).Count(&totalItems).Error; err != nil {
		return nil, 0, err
	}

	dbQuery := r.db.WithContext(ctx).Preload("Account").Where("user_id = ?", userID)
	if query.AccountID != nil {
		dbQuery = dbQuery.Where("account_id = ?", *query.AccountID)
	}
	if query.StartDate != nil {
		if startDate, err := time.Parse("02/01/06", *query.StartDate); err == nil {
			startDate = startDate.UTC()
			dbQuery = dbQuery.Where("created_at >= ?", startDate)
		} else {
			return []models.Transaction{}, 0, errors.ErrBadRequest
		}
	}
	if query.EndDate != nil {
		if endDate, err := time.Parse("02/01/06", *query.EndDate); err == nil {
			endDate = endDate.Add(23*time.Hour + 59*time.Minute + 59*time.Second).UTC()
			dbQuery = dbQuery.Where("created_at <= ?", endDate)
		} else {
			return []models.Transaction{}, 0, errors.ErrBadRequest
		}
	}
	if query.Category != nil {
		dbQuery = dbQuery.Where("category = ?", *query.Category)
	}
	if query.MinAmount != nil {
		dbQuery = dbQuery.Where("amount >= ?", *query.MinAmount)
	}
	if query.MaxAmount != nil {
		dbQuery = dbQuery.Where("amount <= ?", *query.MaxAmount)
	}

	result := dbQuery.Order("created_at DESC").Offset((query.Page - 1) * query.Limit).Limit(query.Limit).Find(&transactions)
	if result.Error != nil {
		return nil, 0, result.Error
	}

	return transactions, totalItems, nil
}

func (r *PostgresTransactionRepository) CountByUserID(ctx context.Context, userID uuid.UUID) (int64, error) {
	var count int64
	result := r.db.WithContext(ctx).Model(&models.Account{}).Where("user_id = ?", userID).Count(&count)
	if result.Error != nil {
		return 0, result.Error
	}
	return count, nil
}

func (r *PostgresTransactionRepository) CountByQuery(ctx context.Context, userID uuid.UUID, query TransactionQuery) (int64, error) {
	var totalItems int64

	dbQuery := r.db.WithContext(ctx).Model(&models.Transaction{}).Where("user_id = ?", userID)

	if query.AccountID != nil {
		dbQuery = dbQuery.Where("account_id = ?", *query.AccountID)
	}
	if query.StartDate != nil {
		if startDate, err := time.Parse("02/01/06", *query.StartDate); err == nil {
			startDate = startDate.UTC()
			fmt.Println("Start date ", startDate)
			dbQuery = dbQuery.Where("created_at >= ?", startDate)
		} else {
			return 0, errors.ErrBadRequest
		}
	}
	if query.EndDate != nil {
		if endDate, err := time.Parse("02/01/06", *query.EndDate); err == nil {
			endDate = endDate.Add(23*time.Hour + 59*time.Minute + 59*time.Second).UTC()
			fmt.Println("End date ", endDate)

			dbQuery = dbQuery.Where("created_at <= ?", endDate)
		} else {
			return 0, errors.ErrBadRequest
		}
	}
	if query.Category != nil {
		dbQuery = dbQuery.Where("category = ?", *query.Category)
	}
	if query.MinAmount != nil {
		dbQuery = dbQuery.Where("amount >= ?", *query.MinAmount)
	}
	if query.MaxAmount != nil {
		dbQuery = dbQuery.Where("amount <= ?", *query.MaxAmount)
	}

	if err := dbQuery.Count(&totalItems).Error; err != nil {
		return 0, err
	}
	return totalItems, nil
}

func (r *PostgresTransactionRepository) DeleteByUserID(ctx context.Context, tx *gorm.DB, userID uuid.UUID) error {
	return tx.WithContext(ctx).Where("user_id = ?", userID).Delete(&models.Transaction{}).Error
}

func (r *PostgresTransactionRepository) DeleteByAccountID(ctx context.Context, tx *gorm.DB, accountID uuid.UUID) error {
	return tx.WithContext(ctx).Where("user_id = ?", accountID).Delete(&models.Account{}).Error
}

func (r *PostgresTransactionRepository) DeleteByPlanID(ctx context.Context, tx *gorm.DB, planID uuid.UUID) error {
	return tx.WithContext(ctx).Where("user_id = ?", planID).Delete(&models.Plan{}).Error
}
