package middleware

import (
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"nucleus/internal/api/types"
	"nucleus/internal/models"
	"nucleus/internal/redis"
	"nucleus/log"
	"nucleus/utils"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func HashToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}

func APIKeyMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		apiKey := utils.EnvValue("API_KEY", "")
		if apiKey != c.GetHeader("X-API-KEY") {
			c.JSON(401, types.Response{Status: 401, Message: "Invalid API key", Data: nil})
			c.Abort()
			return
		}

		c.Next()
	}
}

func AuthMiddleware(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		db := utils.GetDB()
		token := c.GetHeader("Authorization")

		if token == "" {
			c.JSON(401, types.Response{Status: 401, Message: "No authorization token provided", Data: nil})
			c.Abort()
			return
		}

		cacheKey := redis.BuildCacheKey("sessions", HashToken(token))
		var session models.Session
		cacheHit, _ := redis.GetCache(cacheKey, &session)
		if cacheHit && session.UserID != uuid.Nil {
			c.Set("userID", session.UserID)
			c.Next()
			return
		}

		session, err := utils.ValidateSessionToken(db, token)
		if err != nil {
			c.JSON(401, types.Response{Status: 401, Message: "Invalid or expired token", Data: nil})
			c.Abort()
			return
		}

		if err := redis.SetCache(cacheKey, session, 30*(time.Hour*24)); err != nil {
			log.ErrorLogger.Printf("Failed to set value in cache with key %s: %v", cacheKey, err)
		}

		c.Set("userID", session.UserID)
		c.Next()
	}
}

func SuperUserMiddleware(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		db := utils.GetDB()
		userID := c.GetInt("userID")

		user := models.User{}
		result := db.First(&user, userID)
		if result.Error != nil {
			c.JSON(500, types.Response{Status: http.StatusInternalServerError, Message: "An error occured", Data: nil})
			c.Abort()
			return
		}

		if user.Role != models.SuperUser {
			c.JSON(401, types.Response{Status: http.StatusUnauthorized, Message: "Forbidden", Data: nil})
			c.Abort()
			return
		}

		c.Next()
	}
}
