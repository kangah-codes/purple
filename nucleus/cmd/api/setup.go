package main

import (
	"context"
	"nucleus/cmd/workers"
	"nucleus/internal/api/handlers"
	"nucleus/internal/api/middleware"
	"nucleus/internal/api/repositories"
	"nucleus/internal/api/routes"
	"nucleus/internal/api/services"
	"nucleus/internal/api/types"
	"nucleus/internal/cache"
	"nucleus/internal/log"
	"nucleus/internal/utils"
	"os"
	"os/signal"
	"syscall"
	"time"

	ratelimit "github.com/JGLTechnologies/gin-rate-limit"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/go-playground/validator/v10"
	"github.com/joho/godotenv"
	"gorm.io/gorm"
)

func setupLogger() {
	log.InitLogger()
}

func setupValidator() {
	if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
		utils.RegisterCustomValidations(v)
	}
}

func loadEnvironment() {
	if os.Getenv("GIN_MODE") != "release" {
		if err := godotenv.Load(); err != nil {
			log.ErrorLogger.Fatal("Error loading .env file")
		} else {
			log.InfoLogger.Println("Loaded env variables")
		}
	}
}

func setupDatabase() *gorm.DB {
	dsn := utils.EnvValue("DSN", "")
	utils.InitDB(dsn)

	db := utils.GetDB()
	if db == nil {
		log.ErrorLogger.Fatal("Failed to connect to the database")
	}
	return db
}

func setupWorkers(ctx context.Context, db *gorm.DB) {
	// Session cleaner
	cleaner := workers.NewSessionCleaner(db)
	cleaner.Start(ctx)

	/*
		dispatchClient, err := dispatch.NewDispatchClient(cache.RedisClient)
		if err != nil {
			log.ErrorLogger.Fatalf("Failed to initialise dispatch client: %v", err)
		}

		listeners := []dispatch.BaseListener{}
		if err := dispatch.InitListeners(dispatchClient, listeners); err != nil {
			log.ErrorLogger.Fatalf("Failed to initialize listeners: %v", err)
		}

		if err := dispatch.StartListening(dispatchClient, ctx); err != nil {
			log.ErrorLogger.Fatalf("Failed to start dispatch listener: %v", err)
		}
	*/
}

func setupRouter(db *gorm.DB, redisCache *cache.RedisCache) *gin.Engine {
	// Setup rate limiting
	rateLimitStore := ratelimit.InMemoryStore(&ratelimit.InMemoryOptions{
		Rate:  time.Second,
		Limit: 5,
	})

	rateLimit := ratelimit.RateLimiter(rateLimitStore, &ratelimit.Options{
		ErrorHandler: func(ctx *gin.Context, i ratelimit.Info) {
			ctx.JSON(429, gin.H{"error": "Too many requests"})
			ctx.Abort()
		},
		KeyFunc: func(ctx *gin.Context) string {
			return ctx.ClientIP()
		},
	})

	// Setup auth components
	authHandler, authMiddlewareConfig := setupAuthComponents(db, redisCache)

	// Initialize router
	r := gin.Default()
	r.SetTrustedProxies(nil)

	// Apply middleware
	r.Use(rateLimit)
	r.Use(middleware.CorsMiddleware())
	r.Use(middleware.APIKeyMiddleware())
	r.Use(middleware.AuthMiddleware(authMiddlewareConfig))

	// Register routes
	registerRoutes(r, db, redisCache, authHandler)

	return r
}

func setupAuthComponents(db *gorm.DB, redisCache *cache.RedisCache) (*handlers.AuthHandler, *middleware.AuthMiddlewareConfig) {
	postgresAuthRepo := repositories.NewPostgresAuthRepository(db)
	userRepo := repositories.NewPostgresUserRepository(db)
	cacheAuthRepo := repositories.NewCachingAuthRepository(postgresAuthRepo, redisCache, "auth", time.Minute*10)
	authService := services.NewAuthService(cacheAuthRepo, userRepo, db)
	authHandler := handlers.NewAuthHandler(authService)

	authMiddlewareConfig := &middleware.AuthMiddlewareConfig{
		AuthService: authService,
	}

	return authHandler, authMiddlewareConfig
}

func registerRoutes(r *gin.Engine, db *gorm.DB, redisCache *cache.RedisCache, authHandler *handlers.AuthHandler) {
	// Health check endpoint
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, types.Response{
			Status:  200,
			Message: "pong",
			Data:    nil,
		})
	})

	// API routes
	v1 := routes.CreateV1Group(r)
	routes.RegisterAuthRoutes(v1, authHandler)
	routes.RegisterUserRoutes(v1, db, redisCache)
	routes.RegisterAccountRoutes(v1, db, redisCache)
	routes.RegisterPlanRoutes(v1, db, redisCache)
	routes.RegisterTransactionRoutes(v1, db, redisCache)
	routes.RegisterUtilRoutes(v1)
	routes.RegisterStatsRoutes(v1)
}

func setupGracefulShutdown(cancel context.CancelFunc) {
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		<-quit
		log.InfoLogger.Println("Shutting down server")

		// Stop workers
		cancel()

		/*
			if err := dispatchClient.Close(); err != nil {
				log.ErrorLogger.Errorf("Failed to close dispatch client: %v", err)
			}
		*/
	}()
}
