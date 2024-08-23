package routes

import (
	"nucleus/internal/api/handlers"
	"nucleus/internal/api/middleware"
	"nucleus/utils"

	"github.com/gin-gonic/gin"
)

func RegisterAccountRoutes(r *gin.RouterGroup) {
	db := utils.GetDB()
	accountGroup := r.Group("/account")
	{
		accountGroup.POST("/", middleware.AuthMiddleware(db), handlers.CreateAccount)
		accountGroup.GET("/", middleware.AuthMiddleware(db), middleware.PaginationMiddleware(), handlers.FetchUserAccounts)
		accountGroup.DELETE("/:accountID", middleware.AuthMiddleware(db), handlers.DeleteUserAccount)
	}
}
