package main

import (
	"log"
	"nucleus/internal/api/middleware"
	"nucleus/internal/api/routes"
	"nucleus/internal/api/types"
	"nucleus/utils"

	"time"

	ratelimit "github.com/JGLTechnologies/gin-rate-limit"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	dsn := utils.EnvValue("DSN", "")
	utils.InitDB(dsn)
	utils.InitLogger()

	db := utils.GetDB()

	if db == nil {
		log.Fatal("Failed to connect to the database")
	}

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

	// models.Migrate(db)
	r := gin.Default()
	r.Use(rateLimit)
	r.Use(middleware.CorsMiddleware())
	r.Use(middleware.APIKeyMiddleware())

	v1 := utils.CreateV1Group(r)
	routes.RegisterUserRoutes(v1)
	routes.RegisterAuthRoutes(v1)
	routes.RegisterAccountRoutes(v1)

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, types.Response{
			Status:  200,
			Message: "pong",
			Data:    nil,
		})
	})

	log.Printf("Starting server on port 8080")

	// Run the server on the specified port
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
