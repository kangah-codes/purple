package handlers

import (
	"nucleus/internal/api/types"
	"nucleus/internal/models"
	"nucleus/utils"

	"github.com/gin-gonic/gin"
)

func SignIn(c *gin.Context) {
	signIn := types.SignInDTO{}
	db := utils.GetDB()
	if err := c.ShouldBindJSON(&signIn); err != nil {
		c.JSON(400, types.Response{Status: 400, Message: "Invalid request", Data: nil})
		return
	}

	user := models.User{}
	result := db.Where("email = ?", signIn.Username).First(&user)
	if result.Error != nil {
		c.JSON(404, types.Response{Status: 404, Message: "User not found", Data: nil})
		return
	}

	if !utils.CheckPasswordHash(signIn.Password, user.Password) {
		c.JSON(401, types.Response{Status: 401, Message: "Invalid password", Data: nil})
		return
	}

	session, err := utils.CreateSession(db, user.ID)
	if err != nil {
		c.JSON(500, types.Response{Status: 500, Message: "Failed to create session", Data: nil})
		return
	}

	c.JSON(200, types.Response{Status: 200, Message: "Sign in successful", Data: session})
}
