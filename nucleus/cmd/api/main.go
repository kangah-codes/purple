package main

import (
	"context"
	"nucleus/internal/bootstrap"
	"nucleus/internal/log"
)

func main() {
	cfg := bootstrap.Init()

	// setup background workers
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// setup workers
	SetupWorkers(ctx, cfg)

	// setup API server
	r := SetupRouter(cfg)

	// setup shutdown handler
	setupGracefulShutdown(cancel, cfg)

	// start server
	log.InfoLogger.Printf("Starting server on port 8080")
	if err := r.Run("0.0.0.0:8080"); err != nil {
		log.InfoLogger.Fatalf("Failed to run server: %v", err)
	}
}
