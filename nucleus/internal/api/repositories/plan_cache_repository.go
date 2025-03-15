package repositories

import (
	"context"
	"fmt"
	"nucleus/internal/cache"
	"nucleus/internal/models"
	"nucleus/log"
	"strconv"
	"time"

	"github.com/google/uuid"
)

type CachingPlanRepository struct {
	next       PlanRepository
	cache      cache.CacheService
	keyPrefix  string
	expiration time.Duration
}

type PlanQuery struct {
	Name      string `json:"name"`
	StartDate string `json:"start_date"`
	EndDate   string `json:"end_date"`
	PlanType  string `json:"type"`
}

func NewCachingPlanRepository(next PlanRepository, cacheService cache.CacheService, keyPrefix string, expiration time.Duration) *CachingPlanRepository {
	return &CachingPlanRepository{
		next:       next,
		cache:      cacheService,
		keyPrefix:  keyPrefix,
		expiration: expiration,
	}
}

func (r *CachingPlanRepository) buildPlanCacheKey(userID uuid.UUID, planID uuid.UUID) string {
	return r.cache.BuildKey(r.keyPrefix, userID.String(), planID.String())
}

func (r *CachingPlanRepository) buildUserPlansCacheKey(userID uuid.UUID, query PlanQuery, page int, limit int) string {
	queryStr := fmt.Sprintf("name:%s-start:%s-end:%s-type:%s", query.Name, query.StartDate, query.EndDate, query.PlanType)
	return r.cache.BuildKey(r.keyPrefix, userID.String(), "query", queryStr, "page", strconv.Itoa(page), "limit", strconv.Itoa(limit))
}

func (r *CachingPlanRepository) Create(ctx context.Context, plan *models.Plan) error {
	err := r.next.Create(ctx, plan)
	if err == nil {
		r.invalidateUserPlansCache(ctx, plan.UserId)
	}
	return err
}

func (r *CachingPlanRepository) Update(ctx context.Context, plan *models.Plan) error {
	err := r.next.Update(ctx, plan)
	if err == nil {
		r.cache.Invalidate(ctx, r.buildPlanCacheKey(plan.UserId, plan.ID))
		r.invalidateUserPlansCache(ctx, plan.UserId)
	}
	return err
}

func (r *CachingPlanRepository) FindByIDAndUserID(ctx context.Context, planID uuid.UUID, userID uuid.UUID) (*models.Plan, error) {
	key := r.buildPlanCacheKey(userID, planID)
	var cachedPlan models.Plan
	found, err := r.cache.GetEncrypted(ctx, key, &cachedPlan)
	if err != nil {
		log.ErrorLogger.Printf("Error getting plan from cache: %v", err)
	}
	if found {
		return &cachedPlan, nil
	}

	plan, err := r.next.FindByIDAndUserID(ctx, planID, userID)
	if err == nil && plan != nil {
		err := r.cache.SetEncrypted(ctx, key, plan, r.expiration)
		if err != nil {
			log.ErrorLogger.Printf("Error setting plan in cache: %v", err)
		}
	}
	return plan, err
}

func (r *CachingPlanRepository) FindByUserIDPaginated(ctx context.Context, userID uuid.UUID, name, startDate, endDate, planType string, page int, limit int) ([]models.Plan, int64, error) {
	query := PlanQuery{Name: name, StartDate: startDate, EndDate: endDate, PlanType: planType}
	key := r.buildUserPlansCacheKey(userID, query, page, limit)
	var cachedPlans []models.Plan
	found, err := r.cache.GetEncrypted(ctx, key, &cachedPlans)
	if err != nil {
		log.ErrorLogger.Printf("Error getting paginated plans from cache: %v", err)
	}
	if found {
		// We don't cache the total count in this simple example,
		// so we'll always fetch it from the underlying repository.
		totalItems, err := r.next.CountByUserID(ctx, userID)
		if err != nil {
			// TODO: come back to this
			log.ErrorLogger.Println("")
		}
		return cachedPlans, totalItems, nil
	}

	plans, totalItems, err := r.next.FindByUserIDPaginated(ctx, userID, name, startDate, endDate, planType, page, limit)
	if err == nil && len(plans) > 0 {
		err := r.cache.SetEncrypted(ctx, key, plans, r.expiration)
		if err != nil {
			log.ErrorLogger.Printf("Error setting paginated plans in cache: %v", err)
		}
	}
	return plans, totalItems, err
}

func (r *CachingPlanRepository) CountByUserID(ctx context.Context, userID uuid.UUID) (int64, error) {
	return 0, nil
}

func (r *CachingPlanRepository) Delete(ctx context.Context, plan *models.Plan) error {
	err := r.next.Delete(ctx, plan)
	if err == nil {
		r.cache.Invalidate(ctx, r.buildPlanCacheKey(plan.UserId, plan.ID))
		r.invalidateUserPlansCache(ctx, plan.UserId)
	}
	return err
}

func (r *CachingPlanRepository) invalidateUserPlansCache(ctx context.Context, userID uuid.UUID) {
	r.cache.Invalidate(ctx, r.cache.BuildKey(r.keyPrefix, userID.String(), "*"))
	r.cache.Invalidate(ctx, r.cache.BuildKey(r.keyPrefix, "users", userID.String()))
}
