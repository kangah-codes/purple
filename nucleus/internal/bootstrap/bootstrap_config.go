package bootstrap

import (
	"nucleus/internal/api/repositories"
	"nucleus/internal/api/services"
	"nucleus/internal/config"
	"nucleus/internal/log"
)

func Init() *config.Config {
	log.InitLogger()
	cfg := config.GetConfig()
	cfg.InitialiseValidator()

	emailRepo := repositories.NewMailgunEmailRepository(
		cfg.Env.EmailAPIKey,
		cfg.Env.EmailDomain,
	)

	// init singleton email service
	_ = services.GetEmailService(emailRepo)

	if err := cfg.InitialiseDB(); err != nil {
		log.ErrorLogger.Fatalf("Failed to initialise database: %v", err)
	}

	if err := cfg.InitialiseRedis(); err != nil {
		log.ErrorLogger.Fatalf("Failed to initialise Redis: %v", err)
	}

	cfg.InitialiseRedisCache()

	if err := cfg.InitialiseDispatchClient(); err != nil {
		log.ErrorLogger.Fatalf("Failed to initialise dispatch client")
	}

	return cfg
}
