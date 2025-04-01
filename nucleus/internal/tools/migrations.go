package main

import (
	"fmt"
	"nucleus/internal/log"
	"nucleus/internal/models"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func main() {
	var sslMode string
	if os.Getenv("ENV") == "dev" {
		sslMode = "disable"
	} else {
		sslMode = "verify-full"
	}

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
		sslMode,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.ErrorLogger.Errorf("failed to connect to database: %v", err)
		panic("failed to connect to database")
	}

	models.Migrate(db)
}
