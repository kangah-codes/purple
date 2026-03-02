package routes

import (
	"nucleus/internal/api/containers"
	"nucleus/internal/api/handlers"
	"nucleus/internal/api/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterAuthRoutes(r *gin.RouterGroup, container *containers.Container) {
	authHandler := handlers.NewAuthHandler(container.AuthService, container.UserService)

	authGroup := r.Group("/auth")
	{
		authGroup.POST("/sign-in", authHandler.SignIn)
		authGroup.POST("/sign-up", authHandler.SignUp)
		authGroup.POST("/sign-out", middleware.RequireParams([]string{"userID"}), authHandler.SignOut)
		authGroup.POST("/check-username", authHandler.CheckAvailableUsernameExists)
		authGroup.POST("/activate", authHandler.ActivateUserAccount)
	}
}
