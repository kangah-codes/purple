package containers

import (
	"nucleus/internal/api/repositories"
	"nucleus/internal/api/services"
	"nucleus/internal/cache"
	"time"

	"gorm.io/gorm"
)

type Container struct {
	// repositories
	UserRepo        repositories.UserRepository
	AuthRepo        repositories.AuthRepository
	PlanRepo        repositories.PlanRepository
	AccountRepo     repositories.AccountRepository
	TransactionRepo repositories.TransactionRepository

	// services
	UserService        *services.UserService
	PlanService        *services.PlanService
	AuthService        *services.AuthService
	AccountService     *services.AccountService
	TransactionService *services.TransactionService
}

func NewAPIContainer(db *gorm.DB, cache *cache.RedisCache) *Container {
	// init all repositories
	userRepo := repositories.NewPostgresUserRepository(db)
	accountRepo := repositories.NewPostgresAccountRepository(db)
	authRepo := repositories.NewPostgresAuthRepository(db)
	planRepo := repositories.NewPostgresPlanRepository(db)
	transactionRepo := repositories.NewPostgresTransactionRepository(db)

	// add caching
	cacheUserRepo := repositories.NewCachingUserRepository(userRepo, cache, "user", time.Minute*5)
	cacheAccountRepo := repositories.NewCachingAccountRepository(accountRepo, cache, "accounts", time.Minute*5)
	cachePlanRepo := repositories.NewCachingPlanRepository(planRepo, cache, "plans", time.Minute*5)
	cacheTransactionRepo := repositories.NewCachingTransactionRepository(transactionRepo, cache, "transactions", time.Minute*5)
	cacheAuthRepo := repositories.NewCachingAuthRepository(authRepo, cache, "auth", time.Minute*10)

	// init services
	userService := services.NewUserService(cacheUserRepo, authRepo, db)
	accountService := services.NewAccountService(cacheAccountRepo, cacheTransactionRepo, db)
	planService := services.NewPlanService(cachePlanRepo, cacheTransactionRepo, cacheAccountRepo, db)
	transactionService := services.NewTransactionService(cacheTransactionRepo, cacheAccountRepo, db)
	authService := services.NewAuthService(cacheAuthRepo, cacheUserRepo, db)

	return &Container{
		// repos
		UserRepo:        cacheUserRepo,
		AccountRepo:     cacheAccountRepo,
		AuthRepo:        cacheAuthRepo,
		PlanRepo:        cachePlanRepo,
		TransactionRepo: cacheTransactionRepo,

		// services
		UserService:        userService,
		AccountService:     accountService,
		PlanService:        planService,
		TransactionService: transactionService,
		AuthService:        authService,
	}
}
