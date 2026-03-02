package routes

import (
	"nucleus/internal/api/containers"
	"nucleus/internal/api/handlers"

	"github.com/gin-gonic/gin"
)

func RegisterAnalyticsRotues(r *gin.RouterGroup, container *containers.Container) {
	analyticsHandler := handlers.NewAnalyticsHandler(
		container.AnalyticsService,
	)
	analyticsGroup := r.Group("/tracking")
	{
		analyticsGroup.POST("/", analyticsHandler.CreateEvent)
	}
}
