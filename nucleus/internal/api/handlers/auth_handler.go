package handlers

import (
	"net/http"
	"nucleus/internal/api/services"
	"nucleus/internal/api/types"
	"nucleus/internal/log"
	"nucleus/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AuthHandler struct {
	authService *services.AuthService
	userService *services.UserService
}

func NewAuthHandler(authService *services.AuthService, userService *services.UserService) *AuthHandler {
	return &AuthHandler{authService: authService, userService: userService}
}

func (h *AuthHandler) SignUp(c *gin.Context) {
	signUp := types.SignUpDTO{}
	clientIP := c.ClientIP()

	if err := c.ShouldBindJSON(&signUp); err != nil {
		c.JSON(http.StatusBadRequest, types.Response{Status: http.StatusBadRequest, Message: "Invalid request"})
		return
	}

	ipInfo, err := utils.GetCountryAndCurrencyFromIP(clientIP)
	if err != nil {
		log.ErrorLogger.Errorf("Failed to get country info: %s", err.Error())
		ipInfo = &utils.IPInfo{Currency: "GHS"} // Default to GHS
	}

	if !utils.ValidatePassword(signUp.Password) {
		c.JSON(http.StatusBadRequest, types.Response{Status: http.StatusBadRequest, Message: "Invalid password"})
		return
	}

	if !utils.ValidateEmail(signUp.Email) {
		c.JSON(http.StatusBadRequest, types.Response{Status: http.StatusBadRequest, Message: "Invalid email"})
		return
	}

	err = h.authService.SignUp(c.Request.Context(), &signUp, ipInfo)
	if err != nil {
		log.ErrorLogger.Errorf("Failed to sign up user: %v", err)
		switch err {
		case services.ErrUserAlreadyExists:
			c.JSON(http.StatusConflict, types.Response{Status: http.StatusConflict, Message: "User already exists with these details"})
		default:
			c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to create user"})
		}
		return
	}

	c.JSON(http.StatusCreated, types.Response{Status: http.StatusCreated, Message: "User created successfully", Data: gin.H{
		"username": signUp.Username,
	}})
}

func (h *AuthHandler) SignIn(c *gin.Context) {
	signIn := types.SignInDTO{}
	if err := c.ShouldBindJSON(&signIn); err != nil {
		log.ErrorLogger.Errorf("Failed to bind JSON: %v", err)
		c.JSON(http.StatusBadRequest, types.Response{Status: http.StatusBadRequest, Message: "Invalid request"})
		return
	}

	user, err := h.authService.FindUserByUsername(c.Request.Context(), signIn.Username)
	if err != nil {
		log.ErrorLogger.Errorf("Failed to find user: %v", err)
		c.JSON(http.StatusUnauthorized, types.Response{Status: http.StatusUnauthorized, Message: "Invalid username/password"})
		return
	}

	if !utils.CheckPasswordHash(signIn.Password, user.Password) {
		log.ErrorLogger.Errorf("Invalid password for user: %v", user.ID)
		c.JSON(http.StatusUnauthorized, types.Response{Status: http.StatusUnauthorized, Message: "Invalid username/password"})
		return
	}

	session, err := h.authService.SignInUser(c.Request.Context(), user.ID)
	if err != nil {
		log.ErrorLogger.Errorf("Failed to sign in user: %v", err)
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to sign in"})
		return
	}

	response := gin.H{
		"access_token":            session.Token,
		"access_token_expires_at": session.ExpiresAt,
		"user":                    &user,
		"account_groups":          utils.AccountGroups,
		"currencies":              utils.Currencies,
		"transaction_types":       utils.TransactionTypes,
	}

	c.JSON(http.StatusOK, types.Response{Status: http.StatusOK, Message: "Sign in successful", Data: response})
}

func (h *AuthHandler) ActivateUserAccount(c *gin.Context) {
	payload := types.ActivateUserAccountDTO{}
	if err := c.ShouldBindJSON(&payload); err != nil {
		log.ErrorLogger.Errorf("Failed to bind JSON: %v", err)
		c.JSON(http.StatusBadRequest, types.Response{Status: http.StatusBadRequest, Message: "Invalid request"})
		return
	}

	user, confirmationPin, err := h.authService.GetConfirmationPin(c.Request.Context(), payload.Username, payload.VerificationCode)
	if err != nil {
		c.JSON(403, types.Response{Status: 403, Message: "Invalid authorisation code"})
		return
	}

	if confirmationPin.Pin != payload.VerificationCode {
		c.JSON(403, types.Response{Status: 403, Message: "Invalid authorisation code"})
		return
	}

	if err := h.userService.ActivateUser(c.Request.Context(), user, confirmationPin); err != nil {
		log.ErrorLogger.Errorf("Failed to activate user: %v", err)
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Could not activate account"})
		return
	}

	c.JSON(200, types.Response{Status: 200, Message: "Account activated"})
}

func (h *AuthHandler) CheckAvailableUsernameExists(c *gin.Context) {
	checkUsername := types.CheckAvailableUsernameExistsDTO{}
	if err := c.ShouldBindJSON(&checkUsername); err != nil {
		log.ErrorLogger.Errorf("Failed to bind JSON: %v", err)
		c.JSON(http.StatusBadRequest, types.Response{Status: http.StatusBadRequest, Message: "Invalid request", Details: []string{"Invalid request payload"}})
		return
	}

	if checkUsername.Username == "" {
		c.JSON(200, types.Response{Status: 200, Message: "Username available"})
		return
	}

	exists, err := h.authService.CheckAvailableUsernameExists(c.Request.Context(), checkUsername.Username)
	if err != nil {
		log.ErrorLogger.Errorf("Error checking username: %v", err)
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Internal Server Error"})
		return
	}

	if exists {
		c.JSON(409, types.Response{Status: http.StatusConflict, Message: "Username not available"})
		return
	}

	c.JSON(200, types.Response{Status: 200, Message: "Username available"})
}

func (h *AuthHandler) RequestPasswordReset(c *gin.Context) {
	// flow for password request reset
	// user makes request to reset password
	// handler takes request and fires off a dispatch event to password_reset_request email queue for processing
	// email service generates user_password_reset with otp & details
	// email service sends email to user
}

func (h *AuthHandler) SignOut(c *gin.Context) {
	userID, _ := c.Get("userID")
	token := c.GetHeader("Authorization")

	err := h.authService.SignOutUser(c.Request.Context(), userID.(uuid.UUID), token)
	if err != nil {
		log.ErrorLogger.Errorf("Failed to sign out user: %v", err)
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to sign out"})
		return
	}

	c.JSON(http.StatusOK, types.Response{Status: http.StatusOK, Message: "Sign out successful"})
}
