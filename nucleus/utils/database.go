package utils

import (
	"nucleus/log"
	"sync"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var (
	db   *gorm.DB
	once sync.Once
)

func InitDB(dsn string) {
	once.Do(func() {
		var err error
		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Info),
		})
		if err != nil {
			log.ErrorLogger.Fatalf("Failed to connect to database: %v", err)
		}
		log.InfoLogger.Println("Connected to database...")
	})
}

func GetDB() *gorm.DB {
	if db == nil {
		log.ErrorLogger.Fatal("Database not initialized. Call InitDB first.")
	}
	return db
}
