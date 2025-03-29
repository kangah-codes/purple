package repositories

import (
	"context"
	"nucleus/internal/config"
	"nucleus/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PostgresPlanRepository struct {
	db *gorm.DB
}

func NewPostgresPlanRepository(cfg *config.Config) *PostgresPlanRepository {
	return &PostgresPlanRepository{db: cfg.DB}
}

func (r *PostgresPlanRepository) Create(ctx context.Context, plan *models.Plan) error {
	return r.db.WithContext(ctx).Create(plan).Error
}

func (r *PostgresPlanRepository) Update(ctx context.Context, tx *gorm.DB, plan *models.Plan) error {
	return tx.WithContext(ctx).Save(plan).Error
}

func (r *PostgresPlanRepository) FindByID(ctx context.Context, planID uuid.UUID) (*models.Plan, error) {
	var plan models.Plan
	result := r.db.WithContext(ctx).
		Preload("Transactions", func(db *gorm.DB) *gorm.DB {
			return db.Omit("plan", "user").Preload("Account").Order("created_at desc")
		}).Where("id = ?", planID).First(&plan)
	if result.Error != nil {
		return nil, result.Error
	}
	return &plan, nil
}

func (r *PostgresPlanRepository) FindByUserID(ctx context.Context, userID uuid.UUID, name, startDate, endDate, planType string, page int, limit int) ([]models.Plan, int64, error) {
	var plans []models.Plan
	var totalItems int64
	db := r.db.WithContext(ctx).Preload("Transactions", func(db *gorm.DB) *gorm.DB {
		return db.Preload("Account").Order("created_at desc")
	}).Model(&models.Plan{}).Where("user_id = ?", userID)

	if name != "" {
		db = db.Where("name LIKE ?", "%"+name+"%")
	}
	if startDate != "" {
		db = db.Where("start_date >= ?", startDate)
	}
	if endDate != "" {
		db = db.Where("end_date <= ?", endDate)
	}
	if planType != "" {
		db = db.Where("type = ?", planType)
	}

	if err := db.Count(&totalItems).Error; err != nil {
		return nil, 0, err
	}

	result := db.Order("created_at desc").Limit(limit).Offset((page - 1) * limit).Find(&plans)
	if result.Error != nil {
		return nil, 0, result.Error
	}
	return plans, totalItems, nil
}

func (r *PostgresPlanRepository) Delete(ctx context.Context, tx *gorm.DB, plan *models.Plan) error {
	return tx.WithContext(ctx).Delete(plan).Error
}

func (r *PostgresPlanRepository) DeleteByUserID(ctx context.Context, tx *gorm.DB, userID uuid.UUID) error {
	return tx.WithContext(ctx).Where("user_id = ?", userID).Delete(models.Plan{}).Error
}

func (r *PostgresPlanRepository) CountByUserID(ctx context.Context, userID uuid.UUID) (int64, error) {
	var count int64
	result := r.db.WithContext(ctx).Model(&models.Plan{}).Where("user_id = ?", userID).Count(&count)
	if result.Error != nil {
		return 0, result.Error
	}
	return count, nil
}
