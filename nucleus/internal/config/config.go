package config

import (
	"context"
	"crypto/tls"
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
	DBHost     string `mapstructure:"DB_HOST" validate:"required"`
	DBPort     string `mapstructure:"DB_PORT" validate:"required,numeric"`
	DBUser     string `mapstructure:"DB_USER" validate:"required"`
	DBPassword string `mapstructure:"DB_PASSWORD" validate:"required"`
	DBName     string `mapstructure:"DB_NAME" validate:"required"`

	// Redis
	RedisHost     string `mapstructure:"REDIS_HOST" validate:"required"`
	RedisPort     string `mapstructure:"REDIS_PORT" validate:"required,numeric"`
	RedisPassword string `mapstructure:"REDIS_PASSWORD"`
	RedisUsername string `mapstructure:"REDIS_USERNAME"`

	// Server
	ServerPort string `mapstructure:"SERVER_PORT"`
	// ENV        string `mapstructure:"ENV" validate:"required,oneof=dev prod"`
	ENV string `mapstructure:"ENV"`

	// Email
	MailgunAPIKey string `mapstructure:"MAILGUN_API_KEY" validate:"required"`
	EmailDomain   string `mapstructure:"EMAIL_DOMAIN" validate:"required"`
	ResendAPIKey  string `mapstructure:"RESEND_API_KEY" validate:"required"`

	// Encryption Key
	EncryptionKey string `mapstructure:"ENCRYPTION_KEY" validate:"required"`
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

		if err := config.ValidateEnv(); err != nil {
			log.ErrorLogger.Fatal("Invalid environment configuration:", err)
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
	env.RedisUsername = os.Getenv("REDIS_USERNAME")

	env.ServerPort = os.Getenv("SERVER_PORT")
	env.ENV = os.Getenv("ENV")

	env.EncryptionKey = os.Getenv("ENCRYPTION_KEY")
	env.MailgunAPIKey = os.Getenv("MAILGUN_API_KEY")
	env.EmailDomain = os.Getenv("EMAIL_DOMAIN")
	env.ResendAPIKey = os.Getenv("RESEND_API_KEY")

	return env
}

func (c *Config) ValidateEnv() error {
	validate := validator.New()
	err := validate.Struct(c.Env)
	if err != nil {
		for _, err := range err.(validator.ValidationErrors) {
			log.ErrorLogger.Printf("Config validation failed: Field '%s' failed on '%s' constraint", err.Field(), err.Tag())
		}
		return err
	}
	log.InfoLogger.Println("Config validation successful ✅")
	return nil
}

func (c *Config) InitialiseValidator() {
	if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
		utils.RegisterCustomValidations(v)
	}
}

// InitialiseDB initializes the database connection
func (c *Config) InitialiseDB() error {
	var sslMode string
	if config.Env.ENV == "dev" {
		sslMode = "disable"
	} else {
		sslMode = "verify-full"
	}

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
		c.Env.DBHost,
		c.Env.DBUser,
		c.Env.DBPassword,
		c.Env.DBName,
		c.Env.DBPort,
		sslMode,
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
	var tlsConfig *tls.Config
	if config.Env.ENV == "dev" {
		tlsConfig = nil
	} else {
		tlsConfig = &tls.Config{InsecureSkipVerify: true}
	}

	c.Redis = redis.NewClient(&redis.Options{
		Addr:        fmt.Sprintf("%s:%s", c.Env.RedisHost, c.Env.RedisPort),
		Username:    c.Env.RedisUsername,
		Password:    c.Env.RedisPassword,
		DB:          0,
		DialTimeout: 30 * time.Second,
		MaxRetries:  5,
		TLSConfig:   tlsConfig,
	})

	_, err := c.Redis.Ping(ctx).Result()
	if err != nil {
		log.ErrorLogger.Errorf("Failed to connect to Redis: %v", err)
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
