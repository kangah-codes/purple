// internal/repositories/postgres_transaction_repository.go

package repositories

import (
	"context"
	"nucleus/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PostgresTransactionRepository struct {
	db *gorm.DB
}

func NewPostgresTransactionRepository(db *gorm.DB) *PostgresTransactionRepository {
	return &PostgresTransactionRepository{db: db}
}

func (r *PostgresTransactionRepository) Create(ctx context.Context, tx *gorm.DB, transaction *models.Transaction) error {
	return tx.WithContext(ctx).Create(transaction).Error
}

func (r *PostgresTransactionRepository) FindByIDAndUserID(ctx context.Context, accountID uuid.UUID, userID uuid.UUID) (*models.Transaction, error) {
	var transaction models.Transaction
	result := r.db.WithContext(ctx).Preload("Account").Where("id = ? AND user_id = ?", accountID, userID).First(&transaction)
	if result.Error != nil {
		return nil, result.Error
	}
	return &transaction, nil
}

func (r *PostgresTransactionRepository) FindByUserID(ctx context.Context, userID uuid.UUID, query TransactionQuery, page int, limit int) ([]models.Transaction, int64, error) {
	var transactions []models.Transaction
	var totalItems int64

	if err := r.db.WithContext(ctx).Model(&models.Account{}).Where("user_id = ?", userID).Count(&totalItems).Error; err != nil {
		return nil, 0, err
	}

	dbQuery := r.db.WithContext(ctx).Preload("Account").Where("user_id = ?", userID)

	if query.AccountID != "" {
		dbQuery = dbQuery.Where("account_id = ?", query.AccountID)
	}

	result := dbQuery.Order("created_at DESC").Offset((page - 1) * limit).Limit(limit).Find(&transactions)
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

func (r *PostgresTransactionRepository) DeleteByUserID(ctx context.Context, tx *gorm.DB, userID uuid.UUID) error {
	return tx.WithContext(ctx).Where("user_id = ?", userID).Delete(&models.Transaction{}).Error
}

func (r *PostgresTransactionRepository) DeleteByAccountID(ctx context.Context, tx *gorm.DB, accountID uuid.UUID) error {
	return tx.WithContext(ctx).Where("user_id = ?", accountID).Delete(&models.Account{}).Error
}

func (r *PostgresTransactionRepository) DeleteByPlanID(ctx context.Context, tx *gorm.DB, planID uuid.UUID) error {
	return tx.WithContext(ctx).Where("user_id = ?", planID).Delete(&models.Plan{}).Error
}
