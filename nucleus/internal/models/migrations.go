package models

import (
	"nucleus/internal/log"
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
			log.ErrorLogger.Errorf("Environment variable %s is not a boolean type!", envKey)
			panic("Environment variable is not a boolean type")
		}

		return retVal
	} else {
		return defaultValue
	}
}

func Migrate(db *gorm.DB) {
	var skipMigrations = envValueBool("IGNORE_MIGRATIONS", false)
	if !skipMigrations {
		log.InfoLogger.Println("Running migrations")
		err := db.AutoMigrate(
			&User{},
			&Account{},
			&Plan{},
			&Transaction{},
			&Session{},
			&RefreshToken{},
			&UserProfile{},
			&PasswordResetPin{},
			&AccountConfirmationPin{},
		)
		if err != nil {
			log.ErrorLogger.Fatalf("Failed to run migrations: %v", err)
		}
		log.InfoLogger.Println("Migrations completed")
		return
	}

	log.InfoLogger.Println("Skipping migrations")
}
