package main

import (
	"log"
	"nucleus/internal/api/routes"
	"nucleus/internal/api/types"
	"nucleus/internal/models"
	"nucleus/utils"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	dsn := utils.EnvValue("DSN", "")
	utils.InitDB(dsn)
	db := utils.GetDB()
	utils.InitLogger()

	if db == nil {
		log.Fatal("Failed to connect to the database")
	}

	models.Migrate(db)
	r := gin.Default()
	v1 := utils.CreateV1Group(r)
	routes.RegisterUserRoutes(v1)
	routes.RegisterAuthRoutes(v1)

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, types.Response{
			Status:  200,
			Message: "pong",
			Data:    nil,
		})
	})

	log.Printf("Starting server on port 8080")

	// Run the server on the specified port
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
