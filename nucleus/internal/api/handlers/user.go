package handlers

import (
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

	user := models.User{}
	if err := user.CreateUser(db, signUp); err != nil {
		c.JSON(500, types.Response{Status: 500, Message: err.Error(), Data: nil})
		return
	}

	c.JSON(201, types.Response{Status: 201, Message: "User created successfully", Data: user})
}
