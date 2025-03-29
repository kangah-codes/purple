package main

import (
	"context"
	"nucleus/internal/api/containers"
	"nucleus/internal/api/middleware"
	"nucleus/internal/api/routes"
	"nucleus/internal/api/types"
	"nucleus/internal/config"
	"nucleus/internal/dispatch"
	"nucleus/internal/log"
	"nucleus/internal/workers"
	"os"
	"os/signal"
	"syscall"
	"time"

	ratelimit "github.com/JGLTechnologies/gin-rate-limit"
	"github.com/gin-gonic/gin"
)

func SetupWorkers(ctx context.Context, cfg *config.Config) {
	// Session cleaner
	cleaner := workers.NewSessionCleaner(cfg.DB)
	cleaner.Start(ctx)

	listeners := []dispatch.BaseListener{
		workers.CreateUserSignUpListener(),
	}
	if err := dispatch.InitListeners(cfg.Dispatch, listeners); err != nil {
		log.ErrorLogger.Printf("Failed to initialize listeners: %v", err)
	}

	if err := dispatch.StartListening(cfg.Dispatch, ctx); err != nil {
		log.ErrorLogger.Printf("Failed to start dispatch listener: %v", err)
	}
}

func SetupRouter(cfg *config.Config) *gin.Engine {
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
	container := containers.NewAPIContainer(cfg)

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

func setupGracefulShutdown(cancel context.CancelFunc, cfg *config.Config) {
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		<-quit
		log.InfoLogger.Println("Shutting down server")

		// Stop workers
		cancel()

		if err := cfg.Dispatch.Close(); err != nil {
			log.ErrorLogger.Errorf("Failed to close dispatch client: %v", err)
		}
	}()
}
