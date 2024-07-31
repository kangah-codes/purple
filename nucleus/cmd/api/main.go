package main

import (
	"nucleus/internal/api/types"

	"github.com/gin-gonic/gin"
)

func main() {
	// Create a Gin router
	r := gin.Default()
	// v1 := r.Group("/api/v1")

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, types.Response{
			Status:  200,
			Message: "pong",
			Data:    nil,
		})
	})

	// Run the server on port 8080
	r.Run(":8080")
}
