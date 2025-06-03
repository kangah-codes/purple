package middleware

import (
	"errors"
	"net/http"
	"nucleus/internal/api/services"
	"nucleus/internal/api/types"
	"nucleus/internal/log"
	"nucleus/internal/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AuthMiddlewareConfig struct {
	AuthService *services.AuthService
}

func AuthMiddleware(config *AuthMiddlewareConfig) gin.HandlerFunc {
	return func(c *gin.Context) {
		// routes to disable auth header checks
		disabledRoutes := map[string]bool{
			"/api/v1/auth/sign-in":        true,
			"/api/v1/auth/sign-up":        true,
			"/api/v1/auth/check-username": true,
			"/api/v1/auth/activate":       true,
			"/api/v1/tracking/":           true,
		}

		if disabledRoutes[c.FullPath()] {
			c.Next()
			return
		}

		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, types.Response{
				Status:  http.StatusUnauthorized,
				Message: "Authorization header is required",
				Data:    nil,
			})
			return
		}

		session, err := config.AuthService.GetSession(c.Request.Context(), authHeader)
		if err != nil {
			log.ErrorLogger.Errorf("Error validating session token: %v", err)
			statusCode := http.StatusUnauthorized
			message := "Invalid or expired session token"
			if errors.Is(err, gorm.ErrRecordNotFound) {
				// Keep the default message
			} else {
				message = "Failed to validate session token"
				statusCode = http.StatusInternalServerError
			}
			c.AbortWithStatusJSON(statusCode, types.Response{
				Status:  statusCode,
				Message: message,
				Data:    nil,
			})
			return
		}

		c.Set("userID", session.UserID)
		c.Next()
	}
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
