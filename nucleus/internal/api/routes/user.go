package routes

import (
	"nucleus/internal/api/handlers"
	"nucleus/internal/api/middleware"
	"nucleus/utils"

	"github.com/gin-gonic/gin"
)

func RegisterUserRoutes(r *gin.RouterGroup) {
	db := utils.GetDB()
	userGroup := r.Group("/users")
	{
		userGroup.POST("/", middleware.AuthMiddleware(db), middleware.PaginationMiddleware(), handlers.CreateUser)
		userGroup.GET("/", middleware.AuthMiddleware(db), middleware.PaginationMiddleware(), handlers.FetchUsers)
		userGroup.GET("/:id", middleware.AuthMiddleware(db), middleware.PaginationMiddleware(), handlers.FetchUser)
		userGroup.PUT("/:id", middleware.AuthMiddleware(db), middleware.PaginationMiddleware(), handlers.UpdateUser)
		userGroup.DELETE("/:id", middleware.AuthMiddleware(db), middleware.PaginationMiddleware(), handlers.DeleteUser)
	}
}
