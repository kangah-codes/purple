package routes

import (
	"nucleus/internal/api/handlers"

	"github.com/gin-gonic/gin"
)

func RegisterStatsRoutes(r *gin.RouterGroup) {
	statsGroup := r.Group("/stats")
	{
		statsGroup.GET("/", handlers.CalculateMonthlyStats)
	}
}
