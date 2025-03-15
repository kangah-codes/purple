package handlers

import (
	"fmt"
	"net/http"
	"nucleus/internal/api/services"
	"nucleus/internal/api/types"
	"nucleus/internal/models"
	"nucleus/log"
	"nucleus/utils"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AuthHandler struct {
	authService *services.AuthService
	userService *services.UserService
}

func NewAuthHandler(authService *services.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

func (h *AuthHandler) SignUp(c *gin.Context) {
	signUp := types.SignUpDTO{}
	clientIP := c.ClientIP()

	ipInfo, err := utils.GetCountryAndCurrencyFromIP(clientIP)
	if err != nil {
		log.ErrorLogger.Printf("Failed to get country info: %s", err.Error())
		ipInfo = &utils.IPInfo{Currency: "GHS"} // Default to GHS
	}

	if err := c.ShouldBindJSON(&signUp); err != nil {
		c.JSON(http.StatusBadRequest, types.Response{Status: http.StatusBadRequest, Message: "Invalid request", Data: nil})
		return
	}

	if !utils.ValidatePassword(signUp.Password) {
		c.JSON(http.StatusBadRequest, types.Response{Status: http.StatusBadRequest, Message: "Invalid password", Data: nil})
		return
	}

	if !utils.ValidateEmail(signUp.Email) {
		c.JSON(http.StatusBadRequest, types.Response{Status: http.StatusBadRequest, Message: "Invalid email", Data: nil})
		return
	}

	user, err := h.userService.SignUp(c.Request.Context(), &signUp, ipInfo)
	if err != nil {
		log.ErrorLogger.Printf("Failed to sign up user: %v", err)
		if fmt.Sprint(err) == "user already exists with these details: sql: statement error" { // Adjust error checking as needed
			c.JSON(http.StatusConflict, types.Response{Status: http.StatusConflict, Message: "User already exists with these details", Data: nil})
		} else {
			c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to create user", Data: nil})
		}
		return
	}

	log.InfoLogger.Printf("Created user: %+v\n", user)
	c.JSON(http.StatusCreated, types.Response{Status: http.StatusCreated, Message: "User created successfully", Data: user})
}

func (h *AuthHandler) SignIn(c *gin.Context) {
	signIn := types.SignInDTO{}
	if err := c.ShouldBindJSON(&signIn); err != nil {
		log.ErrorLogger.Printf("Failed to bind JSON: %v", err)
		c.JSON(http.StatusBadRequest, types.Response{Status: http.StatusBadRequest, Message: "Invalid request", Data: nil})
		return
	}

	user, err := h.authService.FindUserByUsername(c.Request.Context(), signIn.Username)
	if err != nil {
		log.ErrorLogger.Printf("Failed to find user: %v", err)
		c.JSON(http.StatusUnauthorized, types.Response{Status: http.StatusUnauthorized, Message: "Invalid username/password", Data: nil})
		return
	}

	if !utils.CheckPasswordHash(signIn.Password, user.Password) {
		log.ErrorLogger.Printf("Invalid password for user: %v", user.ID)
		c.JSON(http.StatusUnauthorized, types.Response{Status: http.StatusUnauthorized, Message: "Invalid username/password", Data: nil})
		return
	}

	session, err := h.authService.SignInUser(c.Request.Context(), user.ID)
	if err != nil {
		log.ErrorLogger.Printf("Failed to sign in user: %v", err)
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to sign in", Data: nil})
		return
	}

	type Response struct {
		AccessToken           string           `json:"access_token"`
		AccessTokenExpiresAt  time.Time        `json:"access_token_expires_at"`
		RefreshToken          string           `json:"refresh_token"`
		RefreshTokenExpiresAt time.Time        `json:"refresh_token_expires_at"`
		User                  models.User      `json:"user"`
		AccountGroups         []string         `json:"account_groups"`
		Currencies            []utils.Currency `json:"currencies"`
		TransactionTypes      []string         `json:"transaction_types"`
	}

	response := Response{
		AccessToken:          session.Token,
		AccessTokenExpiresAt: session.ExpiresAt,
		User:                 *user,
		AccountGroups:        utils.AccountGroups,
		Currencies:           utils.Currencies,
		TransactionTypes:     utils.TransactionTypes,
	}

	c.JSON(http.StatusOK, types.Response{Status: http.StatusOK, Message: "Sign in successful", Data: response})
}

func (h *AuthHandler) SignOut(c *gin.Context) {
	userID, exists := c.Get("userID")
	token := c.GetHeader("Authorization")

	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	err := h.authService.SignOutUser(c.Request.Context(), userID.(uuid.UUID), token)
	if err != nil {
		log.ErrorLogger.Printf("Failed to sign out user: %v", err)
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to sign out", Data: nil})
		return
	}

	c.JSON(http.StatusOK, types.Response{Status: http.StatusOK, Message: "Sign out successful", Data: nil})
}
