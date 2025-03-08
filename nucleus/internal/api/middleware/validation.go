package middleware

import (
	"net/http"
	"nucleus/internal/api/types"

	"github.com/gin-gonic/gin"
)

func RequireParams(params []string) gin.HandlerFunc {
	return func(c *gin.Context) {
		for _, param := range params {
			if _, exists := c.Get(param); !exists {
				c.JSON(http.StatusBadRequest, types.Response{Status: http.StatusInternalServerError, Message: "Missing required parameter: " + param, Data: nil})
				c.Abort()
				return
			}
		}
		c.Next()
	}
}
