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

func RegisterAccountRoutes(r *gin.RouterGroup, db *gorm.DB, cache *cache.RedisCache) {
	postgresAccountRepo := repositories.NewPostgresAccountRepository(db)
	postgresTransactionRepo := repositories.NewPostgresTransactionRepository(db)
	cacheAccountRepo := repositories.NewCachingAccountRepository(postgresAccountRepo, cache, "accounts", time.Minute*5)
	accountService := services.NewAccountService(cacheAccountRepo, postgresTransactionRepo, db)
	accountHandler := handlers.NewAccountHandler(accountService)

	accountGroup := r.Group("/account")
	{
		accountGroup.POST(
			"/",
			middleware.RequireParams([]string{"userID"}),
			accountHandler.CreateAccount,
		)
		accountGroup.GET(
			"/",
			middleware.PaginationMiddleware(),
			middleware.RequireParams([]string{"userID"}),
			accountHandler.FetchUserAccounts,
		)
		accountGroup.DELETE(
			"/:accountID",
			middleware.RequireParams([]string{"userID"}),
			accountHandler.DeleteUserAccount,
		)
		accountGroup.PATCH(
			"/:accountID",
			middleware.RequireParams([]string{"userID"}),
			accountHandler.UpdateUserAccount,
		)
	}
}
