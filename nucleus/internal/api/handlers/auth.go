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
		utils.ErrorLogger.Printf("Failed to bind JSON: %v", err)
		c.JSON(400, types.Response{Status: 400, Message: "Invalid request", Data: nil})
		return
	}

	user := models.User{}
	result := db.Where("email = ?", signIn.Username).First(&user)
	if result.Error != nil {
		utils.ErrorLogger.Printf("Failed to find user: %v", result.Error)
		c.JSON(404, types.Response{Status: 404, Message: "User not found", Data: nil})
		return
	}

	if !utils.CheckPasswordHash(signIn.Password, user.Password) {
		utils.ErrorLogger.Printf("Invalid password for user: %v", user.ID)
		c.JSON(401, types.Response{Status: 401, Message: "Invalid password", Data: nil})
		return
	}

	// clear all other sessions
	res := db.Where("user_id = ?", user.ID).Delete(&models.Session{})
	if res.Error != nil {
		utils.ErrorLogger.Printf("Failed to delete prior sessions: %v", res.Error)
		c.JSON(500, types.Response{Status: 500, Message: "Failed to sign in", Data: nil})
		return
	}

	session, err := utils.CreateSession(db, user.ID)
	if err != nil {
		utils.ErrorLogger.Printf("Failed to create session: %v", err)
		c.JSON(500, types.Response{Status: 500, Message: "Failed to create session", Data: nil})
		return
	}

	type Response struct {
		AccessToken           string `json:"access_token"`
		AccessTokenExpiresAt  string `json:"access_token_expires_at"`
		RefreshToken          string `json:"refresh_token"`
		RefreshTokenExpiresAt string `json:"refresh_token_expires_at"`
	}

	response := Response{
		AccessToken:           session.AccessToken.Token,
		AccessTokenExpiresAt:  session.AccessToken.ExpiresAt.String(),
		RefreshToken:          session.RefreshToken.Token,
		RefreshTokenExpiresAt: session.RefreshToken.ExpiresAt.String(),
	}

	c.JSON(200, types.Response{Status: 200, Message: "Sign in successful", Data: response})
}
