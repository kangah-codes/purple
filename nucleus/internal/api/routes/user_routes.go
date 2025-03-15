package routes

import (
	"nucleus/internal/api/handlers"
	"nucleus/internal/api/middleware"
	"nucleus/internal/cache"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterUserRoutes(r *gin.RouterGroup, _db *gorm.DB, cache *cache.RedisCache) {
	userGroup := r.Group("/users")
	{
		userGroup.POST("/sign-up", handlers.SignUp)
		userGroup.GET("/", middleware.PaginationMiddleware(), handlers.FetchUsers)
		userGroup.GET("/:id", middleware.PaginationMiddleware(), handlers.FetchUser)
		userGroup.PUT("/:id", handlers.UpdateUser)
		userGroup.DELETE("/:id", handlers.DeleteUser)
		userGroup.POST("/check-username", handlers.CheckAvailableUsername)
	}
}
