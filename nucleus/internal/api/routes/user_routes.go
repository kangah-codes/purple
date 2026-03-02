package routes

import (
	"nucleus/internal/api/containers"
	"nucleus/internal/api/handlers"
	"nucleus/internal/api/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterUserRoutes(r *gin.RouterGroup, container *containers.Container) {
	userHandler := handlers.NewUserHandler(
		container.UserService,
		container.PlanService,
		container.AccountService,
		container.TransactionService,
		container.AuthService,
	)
	userGroup := r.Group("/users")
	{
		userGroup.GET("/", middleware.PaginationMiddleware(), userHandler.FetchUsers)
		userGroup.GET("/:id", middleware.PaginationMiddleware(), userHandler.FetchUser)
		userGroup.PUT("/:id", userHandler.UpdateUser)
		userGroup.DELETE("/:id", userHandler.DeleteUser)
	}
}
