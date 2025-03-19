package repositories

import (
	"context"
	"nucleus/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PostgresUserRepository struct {
	db *gorm.DB
}

func NewPostgresUserRepository(db *gorm.DB) *PostgresUserRepository {
	return &PostgresUserRepository{db: db}
}

func (r *PostgresUserRepository) Create(ctx context.Context, tx *gorm.DB, user *models.User) error {
	return tx.WithContext(ctx).Create(user).Error
}

func (r *PostgresUserRepository) FindByID(ctx context.Context, id uuid.UUID) (*models.User, error) {
	var user models.User
	if err := r.db.WithContext(ctx).Preload("Accounts", func(db *gorm.DB) *gorm.DB {
		return db.Where("user_id = ?", id)
	}).Preload("Transactions", func(db *gorm.DB) *gorm.DB {
		return db.Omit("account", "user").Where("user_id = ?", id).Order("created_at desc").Limit(5)
	}).Preload("Plans", func(db *gorm.DB) *gorm.DB {
		return db.Omit("user").Where("user_id = ?", id).Order("created_at desc").Limit(5)
	}).First(&user, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *PostgresUserRepository) FindByUsername(ctx context.Context, username string) (*models.User, error) {
	var user models.User
	if err := r.db.WithContext(ctx).Preload("Accounts", func(db *gorm.DB) *gorm.DB {
		return db.Where("user_id = ?", username)
	}).Preload("Transactions", func(db *gorm.DB) *gorm.DB {
		return db.Omit("account", "user").Where("user_id = ?", username).Order("created_at desc").Limit(5)
	}).Preload("Plans", func(db *gorm.DB) *gorm.DB {
		return db.Omit("user").Where("user_id = ?", username).Order("created_at desc").Limit(5)
	}).First(&user, "id = ?", username).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *PostgresUserRepository) Update(ctx context.Context, user *models.User) error {
	return r.db.WithContext(ctx).Save(user).Error
}

func (r *PostgresUserRepository) Delete(ctx context.Context, tx *gorm.DB, id uuid.UUID) error {
	return tx.WithContext(ctx).Delete(&models.User{}, id).Error
}
