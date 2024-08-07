package handlers

import (
	"fmt"
	"nucleus/utils"

	"nucleus/internal/api/types"
	"nucleus/internal/models"

	"github.com/gin-gonic/gin"
)

func CreateUser(c *gin.Context) {
	signUp := types.SignUpDTO{}
	db := utils.GetDB()
	if err := c.ShouldBindJSON(&signUp); err != nil {
		c.JSON(400, types.Response{Status: 400, Message: "Invalid request", Data: nil})
		return
	}

	if !utils.ValidatePassword(signUp.Password) {
		c.JSON(400, types.Response{Status: 400, Message: "Invalid password", Data: nil})
		return
	}

	if !utils.ValidateEmail(signUp.Email) {
		c.JSON(400, types.Response{Status: 400, Message: "Invalid email", Data: nil})
		return
	}

	hashedPassword, err := utils.HashPassword(signUp.Password)
	if err != nil {
		c.JSON(500, types.Response{Status: 500, Message: "Failed to create user", Data: nil})
		return
	}

	user := models.User{
		Username:    signUp.Username,
		Email:       signUp.Email,
		Password:    hashedPassword,
		PhoneNumber: signUp.PhoneNumber,
		FirstName:   signUp.FirstName,
		LastName:    signUp.LastName,
	}

	result := db.Create(&user)
	if result.Error != nil {
		c.JSON(500, types.Response{Status: 500, Message: fmt.Sprintf("Failed to create user: %s", result.Error.Error()), Data: nil})
	}

	c.JSON(201, types.Response{Status: 201, Message: "User created successfully", Data: user})
}

func DeleteUser(c *gin.Context) {
	db := utils.GetDB()
	user := models.User{}
	userID := c.Param("id")

	result := db.First(&user, userID)
	if result.Error != nil {
		c.JSON(404, types.Response{Status: 404, Message: "User not found", Data: nil})
		return
	}

	db.Delete(&user)
	c.JSON(200, types.Response{Status: 200, Message: "User deleted successfully", Data: nil})
}
