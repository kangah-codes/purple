package config

import (
	"context"
	"fmt"
	"nucleus/internal/cache"
	"nucleus/internal/dispatch"
	"nucleus/internal/log"
	"nucleus/internal/utils"
	"os"
	"sync"
	"time"

	"github.com/gin-gonic/gin/binding"
	"github.com/go-playground/validator/v10"
	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type Config struct {
	DB         *gorm.DB
	Redis      *redis.Client
	RedisCache *cache.RedisCache
	Env        *EnvConfig
	Dispatch   *dispatch.DispatchClient
}

type EnvConfig struct {
	// Database
	DBHost     string `mapstructure:"DB_HOST"`
	DBPort     string `mapstructure:"DB_PORT"`
	DBUser     string `mapstructure:"DB_USER"`
	DBPassword string `mapstructure:"DB_PASSWORD"`
	DBName     string `mapstructure:"DB_NAME"`

	// Redis
	RedisHost     string `mapstructure:"REDIS_HOST"`
	RedisPort     string `mapstructure:"REDIS_PORT"`
	RedisPassword string `mapstructure:"REDIS_PASSWORD"`

	// Server
	ServerPort string `mapstructure:"SERVER_PORT"`
	ENV        string `mapstructure:"ENV"`

	// Email
	EmailAPIKey string `mapstructure:"EMAIL_API_KEY"`
	EmailDomain string `mapstructure:"EMAIL_DOMAIN"`

	EncryptionKey string `mapstructure:"ENCRYPTION_KEY"`
}

var (
	config *Config
	once   sync.Once
)

// GetConfig returns a singleton instance of Config
func GetConfig() *Config {
	once.Do(func() {
		config = &Config{
			Env: loadEnv(),
		}
	})
	return config
}

func loadEnv() *EnvConfig {
	env := &EnvConfig{}
	if os.Getenv("GIN_MODE") != "release" {
		if err := godotenv.Load(); err != nil {
			log.ErrorLogger.Fatal("Error loading .env file")
		} else {
			log.InfoLogger.Println("Loaded env variables")
		}
	}

	env.DBHost = os.Getenv("DB_HOST")
	env.DBPort = os.Getenv("DB_PORT")
	env.DBUser = os.Getenv("DB_USER")
	env.DBPassword = os.Getenv("DB_PASSWORD")
	env.DBName = os.Getenv("DB_NAME")

	env.RedisHost = os.Getenv("REDIS_HOST")
	env.RedisPort = os.Getenv("REDIS_PORT")
	env.RedisPassword = os.Getenv("REDIS_PASSWORD")

	env.ServerPort = os.Getenv("SERVER_PORT")
	env.ENV = os.Getenv("ENV")

	env.EncryptionKey = os.Getenv("ENCRYPTION_KEY")
	env.EmailAPIKey = os.Getenv("EMAIL_API_KEY")
	env.EmailDomain = os.Getenv("EMAIL_DOMAIN")

	return env
}

func (c *Config) InitialiseValidator() {
	if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
		utils.RegisterCustomValidations(v)
	}
}

// InitialiseDB initializes the database connection
func (c *Config) InitialiseDB() error {
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		c.Env.DBHost,
		c.Env.DBUser,
		c.Env.DBPassword,
		c.Env.DBName,
		c.Env.DBPort,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return fmt.Errorf("failed to get database instance: %w", err)
	}

	// Set connection pool settings
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	c.DB = db
	return nil
}

// InitialiseRedis initializes the Redis connection
func (c *Config) InitialiseRedis() error {
	ctx := context.Background()
	c.Redis = redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", c.Env.RedisHost, c.Env.RedisPort),
		Password: c.Env.RedisPassword,
		DB:       0,
	})

	_, err := c.Redis.Ping(ctx).Result()
	if err != nil {
		log.ErrorLogger.Fatalf("Failed to connect to Redis: %v", err.Error())
		return err
	}

	log.InfoLogger.Println("Connected to Redis")
	return nil
}

// InitialiseRedisCache inits the redis cache
func (c *Config) InitialiseRedisCache() {
	c.RedisCache = &cache.RedisCache{
		Client: c.Redis,
		Options: cache.RedisCacheOptions{
			Encrypt:    true,
			EncryptKey: []byte(c.Env.EncryptionKey),
		},
	}
}

// InitialiseDispatchClient initializes the dispatch client
func (c *Config) InitialiseDispatchClient() error {
	if c.Redis == nil {
		return fmt.Errorf("redis client is not initialized")
	}

	dipatchClient, err := dispatch.NewDispatchClient(c.Redis)
	if err != nil {
		return err
	}

	c.Dispatch = dipatchClient
	return nil
}
