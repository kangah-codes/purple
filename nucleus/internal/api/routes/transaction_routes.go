package routes

import (
	"nucleus/internal/api/containers"
	"nucleus/internal/api/handlers"
	"nucleus/internal/api/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterTransactionRoutes(r *gin.RouterGroup, container *containers.Container) {
	transactionHandler := handlers.NewTransactionHandler(container.TransactionService)

	transactionGroup := r.Group("/transaction")
	{
		transactionGroup.POST("/", transactionHandler.CreateTransaction)
		transactionGroup.GET("/", middleware.PaginationMiddleware(), transactionHandler.FetchTransactions)
		// transactionGroup.PUT("/:transactionID", transactionHandler.UpdateTransaction)
		// transactionGroup.DELETE("/:transactionID", transactionHandler.DeleteTransaction)
	}
}
