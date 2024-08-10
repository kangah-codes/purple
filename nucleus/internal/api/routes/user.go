package routes

import (
	"nucleus/internal/api/handlers"
	"nucleus/internal/api/middleware"
	"nucleus/utils"

	"github.com/gin-gonic/gin"
)

func RegisterUserRoutes(r *gin.Engine) {
	db := utils.GetDB()
	v1 := utils.CreateV1Group(r)
	userGroup := v1.Group("/users")
	{
		userGroup.POST("/", middleware.AuthMiddleware(db), handlers.CreateAccount)
		userGroup.GET("/:id", middleware.AuthMiddleware(db), handlers.FetchUser)
		userGroup.PUT("/:id", middleware.AuthMiddleware(db), handlers.UpdateUser)
		userGroup.DELETE("/:id", middleware.AuthMiddleware(db), handlers.DeleteUser)
	}
}
