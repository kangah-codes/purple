package routes

import (
	"nucleus/internal/api/handlers"
	"nucleus/internal/api/middleware"
	"nucleus/internal/api/repositories"
	"nucleus/internal/api/services"
	"nucleus/internal/cache"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterPlanRoutes(r *gin.RouterGroup, db *gorm.DB, cache *cache.RedisCache) {
	postgresPlanRepo := repositories.NewPostgresPlanRepository(db)
	postgresTransactionRepo := repositories.NewPostgresTransactionRepository(db)
	cachePlanRepo := repositories.NewCachingPlanRepository(postgresPlanRepo, cache, "plans", time.Minute*5)
	planService := services.NewPlanService(cachePlanRepo, postgresTransactionRepo, db)
	planHandler := handlers.NewPlanHandler(planService)

	planGroup := r.Group("/plan")
	{
		planGroup.POST(
			"/",
			middleware.RequireParams([]string{"userID"}),
			planHandler.CreatePlan,
		)
		planGroup.GET(
			"/",
			middleware.PaginationMiddleware(), middleware.RequireParams([]string{"userID"}),
			planHandler.FetchUserPlans,
		)
		planGroup.GET(
			"/:planID",
			middleware.PaginationMiddleware(), middleware.RequireParams([]string{"userID"}),
			planHandler.FetchPlan,
		)
		planGroup.PUT(
			"/:planID",
			middleware.RequireParams([]string{"userID"}),
			planHandler.UpdatePlanBalance,
		)
		planGroup.DELETE(
			"/:planID",
			middleware.RequireParams([]string{"userID"}),
			planHandler.DeletePlan,
		)
		planGroup.POST(
			"/:planID/transaction",
			middleware.RequireParams([]string{"userID"}),
			planHandler.AddPlanTransaction,
		)
		planGroup.GET(
			"/:planID/track-status",
			middleware.RequireParams([]string{"userID"}),
			handlers.CalculatePlanOnTrack,
		)
	}
}
