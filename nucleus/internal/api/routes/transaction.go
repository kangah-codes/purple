package routes

import (
	"nucleus/internal/api/handlers"
	"nucleus/internal/api/middleware"
	"nucleus/utils"

	"github.com/gin-gonic/gin"
)

func RegisterTransactionRoutes(r *gin.RouterGroup) {
	db := utils.GetDB()
	transactionGroup := r.Group("/transaction")
	{
		transactionGroup.POST("/", middleware.AuthMiddleware(db), handlers.CreateTransaction)
		transactionGroup.GET("/", middleware.AuthMiddleware(db), middleware.PaginationMiddleware(), handlers.FetchTransactions)
		transactionGroup.PUT("/:transactionID", middleware.AuthMiddleware(db), handlers.UpdateTransaction)
		transactionGroup.DELETE("/:transactionID", middleware.AuthMiddleware(db), handlers.DeleteTransaction)
	}
}
