package main

import (
	"context"
	"nucleus/cmd/workers"
	"nucleus/internal/api/containers"
	"nucleus/internal/api/middleware"
	"nucleus/internal/api/routes"
	"nucleus/internal/api/types"
	"nucleus/internal/cache"
	"nucleus/internal/dispatch"
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
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

func SetupLogger() {
	log.InitLogger()
}

func SetupValidator() {
	if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
		utils.RegisterCustomValidations(v)
	}
}

func LoadEnvironment() {
	if os.Getenv("GIN_MODE") != "release" {
		if err := godotenv.Load(); err != nil {
			log.ErrorLogger.Fatal("Error loading .env file")
		} else {
			log.InfoLogger.Println("Loaded env variables")
		}
	}
}

func SetupDatabase() *gorm.DB {
	dsn := utils.EnvValue("DSN", "")
	utils.InitDB(dsn)

	db := utils.GetDB()
	if db == nil {
		log.ErrorLogger.Fatal("Failed to connect to the database")
	}
	return db
}

func SetupWorkers(ctx context.Context, db *gorm.DB, redis *redis.Client) {
	// Session cleaner
	cleaner := workers.NewSessionCleaner(db)
	cleaner.Start(ctx)

	dispatchClient, err := dispatch.NewDispatchClient(redis)
	if err != nil {
		log.ErrorLogger.Printf("Failed to initialise dispatch client: %v", err)
	}

	listeners := []dispatch.BaseListener{
		dispatch.CreateUserSignUpListener(),
	}
	if err := dispatch.InitListeners(dispatchClient, listeners); err != nil {
		log.ErrorLogger.Printf("Failed to initialize listeners: %v", err)
	}

	if err := dispatch.StartListening(dispatchClient, ctx); err != nil {
		log.ErrorLogger.Printf("Failed to start dispatch listener: %v", err)
	}
}

func SetupRouter(db *gorm.DB, redisCache *cache.RedisCache) *gin.Engine {
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

	// register container
	container := containers.NewAPIContainer(db, redisCache)

	// Initialize router
	r := gin.Default()
	r.SetTrustedProxies(nil)

	// Apply middleware
	r.Use(rateLimit)
	r.Use(middleware.CorsMiddleware())
	r.Use(middleware.APIKeyMiddleware())
	r.Use(middleware.AuthMiddleware(&middleware.AuthMiddlewareConfig{
		AuthService: container.AuthService,
	}))

	// Register routes
	RegisterRoutes(r, container)

	return r
}

func RegisterRoutes(r *gin.Engine, container *containers.Container) {
	// health check endpoint
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, types.Response{
			Status:  200,
			Message: "pong",
			Data:    nil,
		})
	})

	// API routes
	v1 := routes.CreateV1Group(r)
	routes.RegisterAuthRoutes(v1, container)
	routes.RegisterUserRoutes(v1, container)
	routes.RegisterAccountRoutes(v1, container)
	routes.RegisterPlanRoutes(v1, container)
	routes.RegisterTransactionRoutes(v1, container)
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

		// TODO: find a better way to close
		// if err := dispatchClient.Close(); err != nil {
		// 	log.ErrorLogger.Errorf("Failed to close dispatch client: %v", err)
		// }
	}()
}
