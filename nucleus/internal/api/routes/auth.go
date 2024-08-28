package routes

import (
	"nucleus/internal/api/handlers"

	"github.com/gin-gonic/gin"
)

func RegisterAuthRoutes(r *gin.RouterGroup) {
	userGroup := r.Group("/auth")
	{
		userGroup.POST("/", handlers.SignIn)
	}
}
