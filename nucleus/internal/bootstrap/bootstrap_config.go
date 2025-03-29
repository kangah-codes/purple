package bootstrap

import (
	"nucleus/internal/config"
	"nucleus/internal/log"
)

func Init() *config.Config {
	log.InitLogger()
	cfg := config.GetConfig()
	cfg.InitialiseValidator()

	if err := cfg.InitialiseDB(); err != nil {
		log.ErrorLogger.Fatalf("Failed to initialise database: %v", err)
	}

	if err := cfg.InitialiseRedis(); err != nil {
		log.ErrorLogger.Fatalf("Failed to initialise Redis: %v", err)
	}

	if err := cfg.InitialiseDispatchClient(); err != nil {
		log.ErrorLogger.Fatalf("Failed to initialise dispatch client")
	}

	return cfg
}
