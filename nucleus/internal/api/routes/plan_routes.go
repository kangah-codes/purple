package routes

import (
	"nucleus/internal/api/containers"
	"nucleus/internal/api/handlers"
	"nucleus/internal/api/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterPlanRoutes(r *gin.RouterGroup, container *containers.Container) {
	planHandler := handlers.NewPlanHandler(container.PlanService)

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
