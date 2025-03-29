package main

import (
	"context"
	"nucleus/internal/cache"
	"nucleus/internal/log"
)

func main() {
	// initialise core components
	SetupLogger()
	SetupValidator()
	LoadEnvironment()

	// initialise database and cache
	db := SetupDatabase()
	redisCache := cache.NewRedisCache()

	// setup background workers
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	SetupWorkers(ctx, db, cache.RedisClient)

	// setup API server
	r := SetupRouter(db, redisCache)

	// setup shutdown handler
	setupGracefulShutdown(cancel)

	// start server
	log.InfoLogger.Printf("Starting server on port 8080")
	if err := r.Run("0.0.0.0:8080"); err != nil {
		log.InfoLogger.Fatalf("Failed to run server: %v", err)
	}
}
