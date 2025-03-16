package repositories

import (
	"context"
	"nucleus/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PostgresAccountRepository struct {
	db *gorm.DB
}

func NewPostgresAccountRepository(db *gorm.DB) *PostgresAccountRepository {
	return &PostgresAccountRepository{db: db}
}

func (r *PostgresAccountRepository) Create(ctx context.Context, account *models.Account) error {
	return r.db.WithContext(ctx).Create(account).Error
}

func (r *PostgresAccountRepository) Update(ctx context.Context, tx *gorm.DB, account *models.Account) error {
	return tx.WithContext(ctx).Save(account).Error
}

func (r *PostgresAccountRepository) FindByIDAndUserID(ctx context.Context, accountID uuid.UUID, userID uuid.UUID) (*models.Account, error) {
	var account models.Account
	result := r.db.WithContext(ctx).Where("id = ? AND user_id = ?", accountID, userID).First(&account)
	if result.Error != nil {
		return nil, result.Error
	}
	return &account, nil
}

func (r *PostgresAccountRepository) FindByUserIDPaginated(ctx context.Context, userID uuid.UUID, page int, limit int) ([]models.Account, int, error) {
	var accounts []models.Account
	totalItems, err := r.CountByUserID(ctx, userID)
	if err != nil {
		return accounts, -1, err
	}

	result := r.db.WithContext(ctx).Where("user_id = ?", userID).Offset((page - 1) * limit).Limit(limit).Find(&accounts)
	if result.Error != nil {
		return nil, 0, result.Error
	}

	return accounts, totalItems, nil
}

func (r *PostgresAccountRepository) CountByUserID(ctx context.Context, userID uuid.UUID) (int, error) {
	var count int64
	result := r.db.WithContext(ctx).Model(&models.Account{}).Where("user_id = ?", userID).Count(&count)
	if result.Error != nil {
		return 0, result.Error
	}
	return int(count), nil
}

func (r *PostgresAccountRepository) Delete(ctx context.Context, tx *gorm.DB, account *models.Account) error {
	return tx.WithContext(ctx).Delete(account).Error
}
