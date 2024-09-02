package handlers

import (
	"net/http"
	"nucleus/internal/api/types"
	"nucleus/internal/models"
	"nucleus/utils"
	"time"

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
		c.JSON(401, types.Response{Status: 401, Message: "Invalid username/password", Data: nil})
		return
	}

	// Start a transaction
	tx := db.Begin()
	if tx.Error != nil {
		utils.ErrorLogger.Printf("Failed to start transaction: %v", tx.Error)
		c.JSON(500, types.Response{Status: http.StatusInternalServerError, Message: "Failed to sign in", Data: nil})
		return
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			utils.ErrorLogger.Printf("Transaction rolled back due to panic: %v", r)
			c.JSON(500, types.Response{Status: http.StatusInternalServerError, Message: "Failed to sign in", Data: nil})
		}
	}()

	// Clear all other sessions
	res := tx.Where("user_id = ?", user.ID).Delete(&models.Session{})
	if res.Error != nil {
		utils.ErrorLogger.Printf("Failed to delete prior sessions: %v", res.Error)
		tx.Rollback()
		c.JSON(500, types.Response{Status: http.StatusInternalServerError, Message: "Failed to sign in", Data: nil})
		return
	}

	session, err := utils.CreateSession(tx, user.ID)
	if err != nil {
		utils.ErrorLogger.Printf("Failed to create session: %v", err)
		tx.Rollback()
		c.JSON(500, types.Response{Status: http.StatusInternalServerError, Message: "Failed to create session", Data: nil})
		return
	}

	// Commit the transaction
	if err := tx.Commit().Error; err != nil {
		utils.ErrorLogger.Printf("Failed to commit transaction: %v", err)
		c.JSON(500, types.Response{Status: http.StatusInternalServerError, Message: "Failed to sign in", Data: nil})
		return
	}

	type Response struct {
		AccessToken           string    `json:"access_token"`
		AccessTokenExpiresAt  time.Time `json:"access_token_expires_at"`
		RefreshToken          string    `json:"refresh_token"`
		RefreshTokenExpiresAt time.Time `json:"refresh_token_expires_at"`
	}

	response := Response{
		AccessToken:           session.AccessToken.Token,
		AccessTokenExpiresAt:  session.AccessToken.ExpiresAt,
		RefreshToken:          session.RefreshToken.Token,
		RefreshTokenExpiresAt: session.RefreshToken.ExpiresAt,
	}

	c.JSON(200, types.Response{Status: 200, Message: "Sign in successful", Data: response})
}

func SignOut(c *gin.Context) {
	db := utils.GetDB()
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	tx := db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			utils.ErrorLogger.Printf("Failed to sign out: %v", r)
			c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to sign out", Data: nil})
		}
	}()

	if err := tx.Where("user_id = ?", userID).Delete(&models.Session{}).Error; err != nil {
		tx.Rollback()
		utils.ErrorLogger.Printf("Failed to delete sessions: %v", err)
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to sign out", Data: nil})
		return
	}

	if err := tx.Where("user_id = ?", userID).Delete(&models.RefreshToken{}).Error; err != nil {
		tx.Rollback()
		utils.ErrorLogger.Printf("Failed to delete refresh tokens: %v", err)
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to sign out", Data: nil})
		return
	}

	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		utils.ErrorLogger.Printf("Failed to commit transaction: %v", err)
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to sign out", Data: nil})
		return
	}

	c.JSON(http.StatusOK, types.Response{Status: http.StatusOK, Message: "Sign out successful", Data: nil})
}
