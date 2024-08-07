package middleware

import (
	"nucleus/internal/api/types"
	"nucleus/internal/models"
	"nucleus/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

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
			c.JSON(500, types.Response{Status: 500, Message: "Failed to fetch user", Data: nil})
			c.Abort()
			return
		}

		if user.Role != models.SuperUser {
			c.JSON(403, types.Response{Status: 403, Message: "Forbidden", Data: nil})
			c.Abort()
			return
		}

		c.Next()
	}
}
