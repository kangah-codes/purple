package routes

import (
	"nucleus/internal/api/handlers"

	"github.com/gin-gonic/gin"
)

func RegisterAuthRoutes(r *gin.RouterGroup, authHandler *handlers.AuthHandler) {

	userGroup := r.Group("/auth")
	{
		userGroup.POST("/", authHandler.SignIn)
		userGroup.POST("/sign-up", authHandler.SignUp)
		userGroup.POST("/sign-out", authHandler.SignOut)
	}
}
