package middleware

import (
	"nucleus/internal/api/types"
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
