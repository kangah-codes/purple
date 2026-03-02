package routes

import (
	"nucleus/internal/api/containers"
	"nucleus/internal/api/handlers"

	"github.com/gin-gonic/gin"
)

func RegisterStatsRoutes(r *gin.RouterGroup, container *containers.Container) {
	statsHandler := handlers.NewStatsHandler(container.StatsService)
	statsGroup := r.Group("/stats")
	{
		statsGroup.GET("/", statsHandler.CalculateMonthlyStats)
	}
}
