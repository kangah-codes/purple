package middleware

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func PaginationMiddleware(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		page, err := strconv.Atoi(c.Query("page"))
		if err != nil {
			page = 1
		}

		pageSize, err := strconv.Atoi(c.Query("page_size"))
		if err != nil {
			pageSize = 10
		}

		c.Set("page", page)
		c.Set("page_size", pageSize)
		c.Next()
	}
}
