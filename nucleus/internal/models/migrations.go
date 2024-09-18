package models

import (
	"log"
	"os"
	"strconv"

	"gorm.io/gorm"
)

// I know i've already created this function somewhere but I'm too tired to deal with
// the import cycle bullshit rn
func envValueBool(envKey string, defaultValue bool) bool {
	val, present := os.LookupEnv(envKey)
	if present {
		retVal, err := strconv.ParseBool(val)

		if err != nil {
			log.Panicf("Environment variable %s is not a boolean type!", envKey)
		}

		return retVal
	} else {
		return defaultValue
	}
}

func Migrate(db *gorm.DB) {
	var skipMigrations = envValueBool("IGNORE_MIGRATIONS", false)
	if !skipMigrations {
		log.Println("Running migrations")
		err := db.AutoMigrate(
			&User{},
			&Account{},
			&Plan{},
			&Transaction{},
			&Session{},
			&RefreshToken{},
			&UserSettings{},
		)
		if err != nil {
			log.Fatalf("Failed to run migrations: %v", err)
		}
		log.Println("Migrations completed")
	}

	log.Println("Skipping migrations")
}
