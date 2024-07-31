package utils

import (
	"log"
	"sync"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var (
	instance *gorm.DB
	once     sync.Once
)

func GetDB() *gorm.DB {
	return instance
}

func InitDB(dsn string, attempts int, coolDown time.Duration) {
	once.Do(func() {
		instance = ConnectToDB(OpenDb, dsn, attempts, coolDown)
		if instance == nil {
			log.Panic("Failed to connect to the database")
		}
	})
}

type sqlOpener func(string) (*gorm.DB, error)

func ConnectToDB(openDatabase sqlOpener, dsn string, attempts int, coolDown time.Duration) *gorm.DB {
	if dsn == "" {
		log.Panic("No database connection string provided.")
	}
	counts := 0

	for {
		connection, err := openDatabase(dsn)
		if err != nil {
			log.Println("Database not ready...")
			counts++
		} else {
			log.Println("Connected to database.")
			return connection
		}

		if counts >= attempts {
			log.Println(err)
			return nil
		}

		log.Println("Waiting for database to be ready...")
		time.Sleep(coolDown)
		continue
	}
}

func OpenDb(dsn string) (*gorm.DB, error) {
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Println(err)
		return nil, err
	}

	return db, nil
}
