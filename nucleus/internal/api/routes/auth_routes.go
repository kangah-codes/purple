package routes

import (
	"nucleus/internal/api/containers"
	"nucleus/internal/api/handlers"
	"nucleus/internal/api/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterAuthRoutes(r *gin.RouterGroup, container *containers.Container) {
	authHandler := handlers.NewAuthHandler(container.AuthService)

	userGroup := r.Group("/auth")
	{
		userGroup.POST("/sign-in", authHandler.SignIn)
		userGroup.POST("/sign-up", authHandler.SignUp)
		userGroup.POST("/sign-out", middleware.RequireParams([]string{"userID"}), authHandler.SignOut)
		userGroup.POST("/check-username", authHandler.CheckAvailableUsernameExists)
	}
}
