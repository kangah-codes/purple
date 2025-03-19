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

func RegisterUserRoutes(r *gin.RouterGroup, db *gorm.DB, cache *cache.RedisCache) {
	userRepo := repositories.NewPostgresUserRepository(db)
	accountRepo := repositories.NewPostgresAccountRepository(db)
	authRepo := repositories.NewPostgresAuthRepository(db)
	planRepo := repositories.NewPostgresPlanRepository(db)
	transactionRepo := repositories.NewPostgresTransactionRepository(db)

	cacheUserRepo := repositories.NewCachingUserRepository(userRepo, cache, "user", time.Minute*5)
	cacheAccountRepo := repositories.NewCachingAccountRepository(accountRepo, cache, "accounts", time.Minute*5)
	cachePlanRepo := repositories.NewCachingPlanRepository(planRepo, cache, "plans", time.Minute*5)
	cacheTransactionRepo := repositories.NewCachingTransactionRepository(transactionRepo, cache, "transactions", time.Minute*5)
	cacheAuthRepo := repositories.NewCachingAuthRepository(authRepo, cache, "auth", time.Minute*10)

	userService := services.NewUserService(cacheUserRepo, authRepo, db)
	accountService := services.NewAccountService(cacheAccountRepo, cacheTransactionRepo, db)
	planService := services.NewPlanService(cachePlanRepo, cacheTransactionRepo, cacheAccountRepo, db)
	transactionService := services.NewTransactionService(cacheTransactionRepo, cacheAccountRepo, db)
	authService := services.NewAuthService(cacheAuthRepo, cacheUserRepo, db)

	userHandler := handlers.NewUserHandler(userService, planService, accountService, transactionService, authService)
	userGroup := r.Group("/users")
	{
		userGroup.GET("/", middleware.PaginationMiddleware(), userHandler.FetchUsers)
		userGroup.GET("/:id", middleware.PaginationMiddleware(), userHandler.FetchUser)
		userGroup.PUT("/:id", userHandler.UpdateUser)
		userGroup.DELETE("/:id", userHandler.DeleteUser)
		userGroup.POST("/check-username", userHandler.CheckAvailableUsername)
	}
}
