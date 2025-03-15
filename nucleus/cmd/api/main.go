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
	"nucleus/log"
	"nucleus/utils"
	"os"
	"os/signal"
	"syscall"

	"time"

	ratelimit "github.com/JGLTechnologies/gin-rate-limit"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/go-playground/validator/v10"
	"github.com/joho/godotenv"
)

func main() {
	log.InitLogger()
	// validate := validator.New()
	// utils.RegisterCustomValidations(validate)
	if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
		utils.RegisterCustomValidations(v)
	}

	// load env variables only in dev
	if os.Getenv("GIN_MODE") != "release" {
		err := godotenv.Load()
		if err != nil {
			log.ErrorLogger.Fatal("Error loading .env file")
		} else {
			log.InfoLogger.Println("Loaded env variables")
		}
	}

	dsn := utils.EnvValue("DSN", "")
	utils.InitDB(dsn)
	cache.InitRedis()
	redisCache := cache.NewRedisCache(cache.RedisClient)

	// get db instance
	db := utils.GetDB()
	if db == nil {
		log.ErrorLogger.Fatal("Failed to connect to the database")
	}

	// context for workers
	ctx, cancel := context.WithCancel(context.Background())

	// session cleaners
	cleaner := workers.NewSessionCleaner(db)
	cleaner.Start(ctx)

	// rate limiting
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

	// initialise auth stuff
	postgresAuthRepo := repositories.NewPostgresAuthRepository(db)
	userRepo := repositories.NewPostgresUserRepository(db)
	cacheAuthRepo := repositories.NewCachingAuthRepository(postgresAuthRepo, redisCache, "auth", time.Minute*10)
	authService := services.NewAuthService(cacheAuthRepo, userRepo, db)
	authHandler := handlers.NewAuthHandler(authService)
	authMiddlewareConfig := &middleware.AuthMiddlewareConfig{
		AuthService: authService,
	}

	// models.Migrate(db)
	r := gin.Default()
	r.Use(rateLimit)
	r.Use(middleware.CorsMiddleware())
	r.Use(middleware.APIKeyMiddleware())
	r.Use(middleware.AuthMiddleware(authMiddlewareConfig))

	// create api group
	v1 := utils.CreateV1Group(r)
	routes.RegisterAuthRoutes(v1, authHandler)
	routes.RegisterUserRoutes(v1, db, redisCache)
	routes.RegisterAccountRoutes(v1, db, redisCache)
	routes.RegisterPlanRoutes(v1, db, redisCache)
	routes.RegisterTransactionRoutes(v1, db, redisCache)
	routes.RegisterUtilRoutes(v1)
	routes.RegisterStatsRoutes(v1)

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, types.Response{
			Status:  200,
			Message: "pong",
			Data:    nil,
		})
	})

	log.InfoLogger.Printf("Starting server on port 8080")

	// setup graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		<-quit
		log.InfoLogger.Println("Shutting down server")

		// stop workers
		cancel()
		cleaner.Stop()
	}()

	// disable trusted proxies
	engine := gin.Default()
	engine.SetTrustedProxies(nil)

	// Run the server on the specified port
	if err := r.Run("0.0.0.0:8080"); err != nil {
		log.InfoLogger.Fatalf("Failed to run server: %v", err)
	}
}
