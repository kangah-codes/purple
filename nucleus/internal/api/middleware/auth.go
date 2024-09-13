package middleware

import (
	"net/http"
	"nucleus/internal/api/types"
	"nucleus/internal/models"
	"nucleus/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

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

		session, err := utils.ValidateSessionToken(db, token)
		if err != nil {
			c.JSON(401, types.Response{Status: 401, Message: "Invalid or expired token", Data: nil})
			c.Abort()
			return
		}

		utils.InfoLogger.Println("This is the session data; ", session.User, session.UserID)

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
