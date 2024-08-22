package utils

import (
	"fmt"
	"log"
	"sync"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var (
	db   *gorm.DB
	once sync.Once
)

// InitDB initializes the database connection
func InitDB(dsn string) {
	once.Do(func() {
		var err error
		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
		if err != nil {
			log.Fatalf("Failed to connect to database: %v", err)
		}
		fmt.Println("Connected to database")
	})
}

// GetDB returns the current database instance
func GetDB() *gorm.DB {
	if db == nil {
		log.Fatal("Database not initialized. Call InitDB first.")
	}
	return db
}
