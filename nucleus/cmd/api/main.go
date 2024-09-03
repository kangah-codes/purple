package main

import (
	"context"
	"nucleus/cmd/workers"
	"nucleus/internal/api/middleware"
	"nucleus/internal/api/routes"
	"nucleus/internal/api/types"
	"nucleus/internal/models"
	"nucleus/utils"
	"os"
	"os/signal"
	"syscall"

	"time"

	ratelimit "github.com/JGLTechnologies/gin-rate-limit"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	utils.InitLogger()

	// load env variables only in dev
	if os.Getenv("GIN_MODE") != "prod" {
		err := godotenv.Load()
		if err != nil {
			utils.ErrorLogger.Fatal("Error loading .env file")
		} else {
			utils.InfoLogger.Println("Loaded env variables")
		}
	}

	dsn := utils.EnvValue("DSN", "")
	utils.InitDB(dsn)

	// get db instance
	db := utils.GetDB()
	if db == nil {
		utils.ErrorLogger.Fatal("Failed to connect to the database")
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

	models.Migrate(db)
	r := gin.Default()
	r.Use(rateLimit)
	r.Use(middleware.CorsMiddleware())
	r.Use(middleware.APIKeyMiddleware())

	// create api group
	v1 := utils.CreateV1Group(r)
	routes.RegisterUserRoutes(v1)
	routes.RegisterAuthRoutes(v1)
	routes.RegisterAccountRoutes(v1)
	routes.RegisterTransactionRoutes(v1)
	routes.RegisterPlanRoutes(v1)

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, types.Response{
			Status:  200,
			Message: "pong",
			Data:    nil,
		})
	})

	utils.InfoLogger.Printf("Starting server on port 8080")

	// setup graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		<-quit
		utils.InfoLogger.Println("Shutting down server")

		// stop workers
		cancel()
		cleaner.Stop()
	}()

	// disable trusted proxies
	engine := gin.Default()
	engine.SetTrustedProxies(nil)

	// Run the server on the specified port
	if err := r.Run(":8080"); err != nil {
		utils.InfoLogger.Fatalf("Failed to run server: %v", err)
	}
}
