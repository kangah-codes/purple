package routes

import (
	"nucleus/internal/api/handlers"
	"nucleus/internal/api/middleware"
	"nucleus/utils"

	"github.com/gin-gonic/gin"
)

func RegisterPlanRoutes(r *gin.RouterGroup) {
	db := utils.GetDB()
	planGroup := r.Group("/plan")
	{
		planGroup.POST("/", middleware.AuthMiddleware(db), handlers.CreatePlan)
		planGroup.GET("/", middleware.AuthMiddleware(db), middleware.PaginationMiddleware(), handlers.FetchPlans)
		planGroup.PUT("/:planID", middleware.AuthMiddleware(db), handlers.UpdatePlanBalance)
		planGroup.DELETE("/:planID", middleware.AuthMiddleware(db), handlers.DeletePlan)
	}
}
