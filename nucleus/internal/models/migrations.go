package models

import (
	"log"

	"gorm.io/gorm"
)

func Migrate(db *gorm.DB) {
	log.Println("Running migrations")
	err := db.AutoMigrate(
		&User{},
		&Account{},
		&Plan{},
		&Transaction{},
		&Session{},
		&RefreshToken{},
	)
	if err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}
	log.Println("Migrations completed")
}
