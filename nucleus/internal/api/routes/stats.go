package routes

import (
	"nucleus/internal/api/handlers"
	"nucleus/internal/api/middleware"
	"nucleus/utils"

	"github.com/gin-gonic/gin"
)

func RegisterStatsRoutes(r *gin.RouterGroup) {
	db := utils.GetDB()
	statsGroup := r.Group("/stats")
	{
		statsGroup.GET("/", middleware.AuthMiddleware(db), handlers.CalculateMonthlyStats)
	}
}
