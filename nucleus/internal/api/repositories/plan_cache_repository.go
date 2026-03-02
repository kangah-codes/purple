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

type CachingPlanRepository struct {
	next       PlanRepository
	keyPrefix  string
	expiration time.Duration
	config     *config.Config
}

type PlanQuery struct {
	Name      string `json:"name"`
	StartDate string `json:"start_date"`
	EndDate   string `json:"end_date"`
	PlanType  string `json:"type"`
}

func NewCachingPlanRepository(next PlanRepository, cfg *config.Config, keyPrefix string, expiration time.Duration) *CachingPlanRepository {
	return &CachingPlanRepository{
		next:       next,
		keyPrefix:  keyPrefix,
		expiration: expiration,
		config:     cfg,
	}
}

func (r *CachingPlanRepository) Create(ctx context.Context, plan *models.Plan) error {
	err := r.next.Create(ctx, plan)
	if err == nil {
		r.config.RedisCache.InvalidateMultiple(ctx, []string{
			fmt.Sprintf("%s:plans:%s:%s", r.keyPrefix, plan.User.ID.String(), plan.ID.String()),
			fmt.Sprintf("%s:users:%s", r.keyPrefix, plan.User.ID.String()),
		})
	}
	return err
}

func (r *CachingPlanRepository) Update(ctx context.Context, tx *gorm.DB, plan *models.Plan) error {
	if err := r.next.Update(ctx, tx, plan); err != nil {
		return err
	}

	userID, ok := ctx.Value("userID").(uuid.UUID)
	if !ok {
		return fmt.Errorf("invalid or missing userID in context")
	}

	cacheKeys := []string{
		fmt.Sprintf("%s:plans:%s:%s", r.keyPrefix, userID.String(), plan.ID.String()),
		fmt.Sprintf("%s:users:%s", r.keyPrefix, userID.String()),
	}

	if err := r.config.RedisCache.InvalidateMultiple(ctx, cacheKeys); err != nil {
		log.ErrorLogger.Errorf("Failed to invalidate cache keys: %v", cacheKeys)
		return err
	}

	return nil
}

func (r *CachingPlanRepository) FindByID(ctx context.Context, planID uuid.UUID) (*models.Plan, error) {
	userID := ctx.Value("userID").(uuid.UUID)
	key := fmt.Sprintf("%s:plans:%s:%s", r.keyPrefix, userID.String(), planID.String())
	var cachedPlan models.Plan
	found, err := r.config.RedisCache.Get(ctx, key, &cachedPlan)
	if err != nil {
		log.ErrorLogger.Errorf("Error getting plan from cache: %v", err)
	}
	if found {
		return &cachedPlan, nil
	}

	plan, err := r.next.FindByID(ctx, planID)
	if err == nil && plan != nil {
		err := r.config.RedisCache.Set(ctx, key, plan, r.expiration)
		if err != nil {
			log.ErrorLogger.Errorf("Error setting plan in cache: %v", err)
		}
	}
	return plan, err
}

func (r *CachingPlanRepository) FindByUserID(ctx context.Context, userID uuid.UUID, name, startDate, endDate, planType string, page int, limit int) ([]models.Plan, int64, error) {
	key := fmt.Sprintf(
		"%s:plans:%s:page-%d:limit-%d:name-%s:startDate-%s:endDate-%s:type-%s",
		r.keyPrefix, userID.String(), page, limit, name, startDate, endDate, planType,
	)
	var cachedPlans []models.Plan
	found, err := r.config.RedisCache.Get(ctx, key, &cachedPlans)
	if err != nil {
		log.ErrorLogger.Errorf("Error getting paginated plans from cache: %v", err)
	}
	if found {
		totalItems, err := r.next.CountByUserID(ctx, userID)
		if err != nil {
			return nil, 0, err
		}
		return cachedPlans, totalItems, nil
	}

	plans, totalItems, err := r.next.FindByUserID(ctx, userID, name, startDate, endDate, planType, page, limit)
	if err == nil && len(plans) > 0 {
		err := r.config.RedisCache.Set(ctx, key, plans, r.expiration)
		if err != nil {
			log.ErrorLogger.Errorf("Error setting paginated plans in cache: %v", err)
		}
	}
	return plans, totalItems, err
}

func (r *CachingPlanRepository) CountByUserID(ctx context.Context, userID uuid.UUID) (int64, error) {
	return 0, nil
}

func (r *CachingPlanRepository) Delete(ctx context.Context, tx *gorm.DB, plan *models.Plan) error {
	err := r.next.Delete(ctx, tx, plan)
	userID := ctx.Value("userID").(uuid.UUID)
	if err == nil {
		cacheKeys := []string{
			fmt.Sprintf("%s:transactions:%s:*", r.keyPrefix, userID.String()),
			fmt.Sprintf("%s:accounts:%s:*", r.keyPrefix, userID.String()),
			fmt.Sprintf("%s:plans:%s:*", r.keyPrefix, userID.String()),
			fmt.Sprintf("%s:users:%s", r.keyPrefix, userID.String()),
		}
		r.config.RedisCache.InvalidateMultiple(ctx, cacheKeys)
	}
	return err
}

func (r *CachingPlanRepository) DeleteByUserID(ctx context.Context, tx *gorm.DB, userID uuid.UUID) error {
	err := r.next.DeleteByUserID(ctx, tx, userID)
	if err != nil {
		return err
	}

	cacheKeys := []string{
		fmt.Sprintf("%s:plans:%s:*", r.keyPrefix, userID.String()),
		fmt.Sprintf("%s:users:%s", r.keyPrefix, userID.String()),
	}
	r.config.RedisCache.InvalidateMultiple(ctx, cacheKeys)

	return nil
}
