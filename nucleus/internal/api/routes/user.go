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
		userGroup.POST("/sign-up", handlers.SignUp)
		userGroup.GET("/", middleware.AuthMiddleware(db), middleware.PaginationMiddleware(), handlers.FetchUsers)
		userGroup.GET("/:id", middleware.AuthMiddleware(db), middleware.PaginationMiddleware(), handlers.FetchUser)
		userGroup.PUT("/:id", middleware.AuthMiddleware(db), handlers.UpdateUser)
		userGroup.DELETE("/:id", middleware.AuthMiddleware(db), handlers.DeleteUser)
		userGroup.POST("/check-username", handlers.CheckAvailableUsername)
	}
}
