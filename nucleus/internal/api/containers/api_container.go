package containers

import (
	"nucleus/internal/api/repositories"
	"nucleus/internal/api/services"
	"nucleus/internal/config"
	"time"
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
	StatsService       *services.StatsService
}

func NewAPIContainer(cfg *config.Config) *Container {
	// init all repositories
	userRepo := repositories.NewPostgresUserRepository(cfg)
	accountRepo := repositories.NewPostgresAccountRepository(cfg)
	authRepo := repositories.NewPostgresAuthRepository(cfg)
	planRepo := repositories.NewPostgresPlanRepository(cfg)
	transactionRepo := repositories.NewPostgresTransactionRepository(cfg)

	// add caching
	cacheUserRepo := repositories.NewCachingUserRepository(userRepo, cfg, "app:v1", time.Minute*5)
	cacheAccountRepo := repositories.NewCachingAccountRepository(accountRepo, cfg, "app:v1", time.Minute*5)
	cachePlanRepo := repositories.NewCachingPlanRepository(planRepo, cfg, "app:v1", time.Minute*5)
	cacheTransactionRepo := repositories.NewCachingTransactionRepository(transactionRepo, cfg, "app:v1", time.Minute*5)
	cacheAuthRepo := repositories.NewCachingAuthRepository(authRepo, cfg, "app:v1", time.Minute*10)

	// init services
	userService := services.NewUserService(cacheUserRepo, authRepo, cfg)
	accountService := services.NewAccountService(cacheAccountRepo, cacheTransactionRepo, cfg)
	planService := services.NewPlanService(cachePlanRepo, cacheTransactionRepo, cacheAccountRepo, cfg)
	transactionService := services.NewTransactionService(cacheTransactionRepo, cacheAccountRepo, cfg)
	authService := services.NewAuthService(cacheAuthRepo, cacheUserRepo, cfg)
	statsService := services.NewStatsService(planRepo, transactionRepo, cfg)

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
		StatsService:       statsService,
	}
}
