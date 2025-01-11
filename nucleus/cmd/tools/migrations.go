package main

import (
	"nucleus/internal/models"
	"nucleus/log"
	"nucleus/utils"

	"github.com/joho/godotenv"
)

// Run the migrations before pushing any new changes
func main() {
	log.InitLogger()

	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		log.ErrorLogger.Fatal("Error loading .env file")
	}

	// Initialize the database
	dsn := utils.EnvValue("DSN", "")
	utils.InitDB(dsn)

	// Get the database instance
	db := utils.GetDB()
	if db == nil {
		log.ErrorLogger.Fatal("Failed to connect to the database")
	}

	// Run migrations
	models.Migrate(db)
	log.InfoLogger.Println("Migrations completed successfully")
}
