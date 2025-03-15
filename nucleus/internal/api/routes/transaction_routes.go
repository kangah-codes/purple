package routes

import (
	"nucleus/internal/api/handlers"
	"nucleus/internal/api/middleware"
	"nucleus/internal/api/repositories"
	"nucleus/internal/api/services"
	"nucleus/internal/cache"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterTransactionRoutes(r *gin.RouterGroup, db *gorm.DB, cache *cache.RedisCache) {
	postgresTransactionRepo := repositories.NewPostgresTransactionRepository(db)
	accountRepo := repositories.NewPostgresAccountRepository(db)
	cacheTransactionRepo := repositories.NewCachingTransactionRepository(postgresTransactionRepo, cache, "transactions", time.Minute*5)
	transactionService := services.NewTransactionService(cacheTransactionRepo, accountRepo, db)
	transactionHandler := handlers.NewTransactionHandler(transactionService)

	transactionGroup := r.Group("/transaction")
	{
		transactionGroup.POST("/", transactionHandler.CreateTransaction)
		transactionGroup.GET("/", middleware.PaginationMiddleware(), transactionHandler.FetchTransactions)
		// transactionGroup.PUT("/:transactionID", transactionHandler.UpdateTransaction)
		// transactionGroup.DELETE("/:transactionID", transactionHandler.DeleteTransaction)
	}
}
