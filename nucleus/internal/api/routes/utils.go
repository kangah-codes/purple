package routes

import (
	"nucleus/internal/api/handlers"

	"github.com/gin-gonic/gin"
)

func RegisterUtilRoutes(r *gin.RouterGroup) {
	userGroup := r.Group("/utils")
	{
		userGroup.POST("/account-groups", handlers.FetchAccountGroups)
	}
}
