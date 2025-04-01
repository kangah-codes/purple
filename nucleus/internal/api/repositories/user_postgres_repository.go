package repositories

import (
	"context"
	"nucleus/internal/config"
	"nucleus/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PostgresUserRepository struct {
	db *gorm.DB
}

func NewPostgresUserRepository(cfg *config.Config) *PostgresUserRepository {
	return &PostgresUserRepository{db: cfg.DB}
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

func (r *PostgresUserRepository) FindByUsernameOrEmail(ctx context.Context, username, email string) (*models.User, error) {
	var user models.User
	if err := r.db.WithContext(ctx).
		Where("username = ? OR email = ?", username, email).
		First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *PostgresUserRepository) FindByUsernameAuth(ctx context.Context, username string) (*models.User, error) {
	var user models.User
	if err := r.db.WithContext(ctx).Select("id, email, username, password").Where("username = ? AND activated = true", username).First(&user).Error; err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *PostgresUserRepository) FindByUsername(ctx context.Context, username string) (*models.User, error) {
	var user models.User

	// fetch the user first
	if err := r.db.WithContext(ctx).Where("username = ?", username).First(&user).Error; err != nil {
		return nil, err
	}

	// load associations using the found user's ID
	if err := r.db.WithContext(ctx).
		Preload("Accounts", func(db *gorm.DB) *gorm.DB {
			return db.Where("user_id = ?", user.ID)
		}).
		Preload("Transactions", func(db *gorm.DB) *gorm.DB {
			return db.Omit("account", "user").
				Where("user_id = ?", user.ID).
				Order("created_at desc").
				Limit(5)
		}).
		Preload("Plans", func(db *gorm.DB) *gorm.DB {
			return db.Omit("user").
				Where("user_id = ?", user.ID).
				Order("created_at desc").
				Limit(5)
		}).
		First(&user, user.ID).Error; err != nil {

		return nil, err
	}

	return &user, nil
}

func (r PostgresUserRepository) CheckAvailableUsernameExists(ctx context.Context, username string) (bool, error) {
	var user models.User
	err := r.db.WithContext(ctx).Where("username = ?", username).First(&user).Error

	switch err {
	// if the record is not found the username is not taken
	case gorm.ErrRecordNotFound:
		return false, nil
	default:
		return true, err
	}
}

func (r *PostgresUserRepository) Activate(ctx context.Context, user *models.User, confirmation *models.AccountConfirmationPin) error {
	tx := r.db.Begin()

	// update the user activated and delete all otps associated with user
	user.Activated = true
	user.ExpiresAt = nil

	if err := tx.Save(user).Error; err != nil {
		tx.Rollback()
		return err
	}

	if err := tx.Where("user_id = ?", user.ID).Delete(confirmation).Error; err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}

func (r *PostgresUserRepository) Update(ctx context.Context, user *models.User) error {
	return r.db.WithContext(ctx).Save(user).Error
}

func (r *PostgresUserRepository) Delete(ctx context.Context, tx *gorm.DB, id uuid.UUID) error {
	return tx.WithContext(ctx).Delete(&models.User{}, id).Error
}
