package main

import (
	"nucleus/internal/models"
	"nucleus/log"
	"nucleus/utils"

	"github.com/joho/godotenv"
)

func main() {
	log.InitLogger()

	err := godotenv.Load()
	if err != nil {
		log.ErrorLogger.Fatal("Error loading .env file")
	}

	dsn := utils.EnvValue("DSN", "")
	utils.InitDB(dsn)

	db := utils.GetDB()
	if db == nil {
		log.ErrorLogger.Fatal("Failed to connect to the database")
	}

	models.Migrate(db)
}
