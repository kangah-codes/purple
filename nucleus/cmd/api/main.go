package main

import (
	"nucleus/internal/api/types"
	"nucleus/utils"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	v1 := utils.CreateV1Group(r)

	v1.GET("/ping", func(c *gin.Context) {
		c.JSON(200, types.Response{
			Status:  200,
			Message: "pong",
			Data:    nil,
		})
	})

	// Run the server on port 8080
	r.Run(":8080")
}
