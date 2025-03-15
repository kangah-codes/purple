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

func (r *PostgresTransactionRepository) CreateForPlan(ctx context.Context, tx *gorm.DB, transaction *models.PlanTransaction) error {
	return tx.WithContext(ctx).Create(transaction).Error
}

func (r *PostgresTransactionRepository) FindByIDAndUserID(ctx context.Context, accountID uuid.UUID, userID uuid.UUID) (*models.Transaction, error) {
	var transaction models.Transaction
	result := r.db.WithContext(ctx).Where("id = ? AND user_id = ?", accountID, userID).First(&transaction)
	if result.Error != nil {
		return nil, result.Error
	}
	return &transaction, nil
}

func (r *PostgresTransactionRepository) FindByUserIDPaginated(ctx context.Context, userID uuid.UUID, page int, limit int) ([]models.Transaction, int64, error) {
	var transactions []models.Transaction
	var totalItems int64

	// Get the total count first
	if err := r.db.WithContext(ctx).Model(&models.Account{}).Where("user_id = ?", userID).Count(&totalItems).Error; err != nil {
		return nil, 0, err
	}

	// Then get the paginated results
	result := r.db.WithContext(ctx).Where("user_id = ?", userID).Offset((page - 1) * limit).Limit(limit).Find(&transactions)
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
