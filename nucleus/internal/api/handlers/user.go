package handlers

import (
	"fmt"
	"net/http"
	"nucleus/utils"
	"strconv"

	"nucleus/internal/api/types"
	"nucleus/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SignUp(c *gin.Context) {
	signUp := types.SignUpDTO{}
	db := utils.GetDB()
	clientIP := c.ClientIP()

	ipInfo, err := utils.GetCountryAndCurrencyFromIP(clientIP)
	if err != nil {
		utils.ErrorLogger.Printf("Failed to get country info: %s", err.Error())
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

	hashedPassword, err := utils.HashPassword(signUp.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to create user", Data: nil})
		return
	}

	// Start transaction
	tx := db.Begin()

	user := models.User{
		Username: signUp.Username,
		Email:    signUp.Email,
		Password: hashedPassword,
		Settings: models.UserSettings{
			PushNotifications:    false,
			TwoFactorAuth:        false,
			EndOfDayNotification: false,
			DefaultCurrency:      ipInfo.Currency,
		},
		Accounts: []models.Account{
			{
				Name:             "Cash",
				Category:         "💵 Cash",
				Balance:          0.00,
				IsDefaultAccount: true,
				Currency:         ipInfo.Currency,
				Transactions:     []models.Transaction{},
			},
		},
		Plans:        []models.Plan{},
		Transactions: []models.Transaction{},
	}

	if err := tx.Create(&user).Error; err != nil {
		tx.Rollback()
		if err == gorm.ErrDuplicatedKey {
			c.JSON(http.StatusConflict, types.Response{Status: http.StatusConflict, Message: "User already exists with these details", Data: nil})
		} else {
			c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: fmt.Sprintf("Failed to create user: %s", err.Error()), Data: nil})
		}
		return
	}

	// Preload the user settings and accounts
	if err := tx.Preload("Settings").Preload("Accounts").First(&user, user.ID).Error; err != nil {
		tx.Rollback()
		utils.ErrorLogger.Printf("Failed to preload user data: %s", err.Error())
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to retrieve user data", Data: nil})
		return
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		utils.ErrorLogger.Printf("Failed to commit transaction: %s", err.Error())
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to create user", Data: nil})
		return
	}

	utils.InfoLogger.Printf("Created user: %+v\n", user)

	c.JSON(http.StatusCreated, types.Response{Status: http.StatusCreated, Message: "User created successfully", Data: user})
}

func DeleteUser(c *gin.Context) {
	db := utils.GetDB()
	user := models.User{}
	userID := c.Param("id")

	result := db.First(&user, userID)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, types.Response{Status: http.StatusNotFound, Message: "User not found", Data: nil})
		return
	}

	// db.Delete(&user)
	tx := db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to delete user", Data: nil})
		}
	}()

	if err := tx.Where("user_id = ?", userID).Delete(&models.Account{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to delete user", Data: nil})
		return
	}

	if err := tx.Where("user_id = ?", userID).Delete(&models.Plan{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to delete user", Data: nil})
		return
	}

	if err := tx.Where("user_id = ?", userID).Delete(&models.Transaction{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to delete user", Data: nil})
		return
	}

	tx.Commit()
	c.JSON(http.StatusOK, types.Response{Status: http.StatusOK, Message: "User deleted successfully", Data: nil})
}

func FetchUser(c *gin.Context) {
	db := utils.GetDB()
	db = db.Debug()
	user := models.User{}
	userID := c.Param("id")

	utils.InfoLogger.Printf("User ID %s", c.Param("id"))

	result := db.Preload("Accounts").Preload("Transactions", func(db *gorm.DB) *gorm.DB {
		return db.Order("created_at desc").Limit(5)
	}).Preload("Plans", func(db *gorm.DB) *gorm.DB {
		return db.Order("created_at desc").Limit(5)
	}).First(&user, "id = ?", userID)
	if result.Error != nil {
		utils.ErrorLogger.Printf("Error fetching user: %v", result.Error)
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(404, types.Response{Status: 404, Message: "User not found", Data: nil})
		} else {
			c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Internal Server Error", Data: nil})
		}
		return
	}

	if result.Error != nil {
		utils.ErrorLogger.Printf("Error fetching user: %v", result.Error)

		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to fetch user", Data: nil})
		return
	}

	c.JSON(200, types.Response{Status: 200, Message: "User fetched successfully", Data: user})
}

func FetchUsers(c *gin.Context) {
	db := utils.GetDB()
	users := []models.User{}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	offset := (page - 1) * pageSize

	var totalItems int64
	db.Model(&models.User{}).Count(&totalItems)

	result := db.Preload("Accounts").Preload("Transactions", func(db *gorm.DB) *gorm.DB {
		return db.Order("created_at desc").Limit(5)
	}).Preload("Plans", func(db *gorm.DB) *gorm.DB {
		return db.Order("created_at desc").Limit(5)
	}).Limit(pageSize).Offset(offset).Find(&users)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to fetch users", Data: nil})
		return
	}

	totalPages := int((totalItems + int64(pageSize) - 1) / int64(pageSize))

	c.JSON(200, types.Response{
		Status:     200,
		Message:    "Users fetched successfully",
		Data:       users,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
		TotalItems: int(totalItems),
	})
}

func UpdateUser(c *gin.Context) {
	db := utils.GetDB()
	user := models.User{}
	userID := c.Param("id")

	result := db.First(&user, userID)
	if result.Error != nil {
		c.JSON(404, types.Response{Status: 404, Message: "User not found", Data: nil})
		return
	}

	update := types.UpdateUserAccountDTO{}
	if err := c.ShouldBindJSON(&update); err != nil {
		c.JSON(http.StatusBadRequest, types.Response{Status: http.StatusBadRequest, Message: "Invalid request", Data: nil})
		return
	}

	user.Username = update.Username

	result = db.Save(&user)
	if result.Error != nil {
		if result.Error == gorm.ErrDuplicatedKey {
			c.JSON(400, types.Response{Status: http.StatusConflict, Message: "User already exists with these details", Data: nil})
			return
		}
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to update user", Data: nil})
		return
	}

	c.JSON(200, types.Response{Status: 200, Message: "User updated successfully", Data: user})
}

func CheckAvailableUsername(c *gin.Context) {
	db := utils.GetDB()
	checkUsername := types.CheckAvailableUsernameDTO{}
	if err := c.ShouldBindJSON(&checkUsername); err != nil {
		c.JSON(http.StatusBadRequest, types.Response{Status: http.StatusBadRequest, Message: "Invalid request", Data: nil})
		return
	}

	result := db.Where("username = ?", checkUsername.Username).First(&models.User{})
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(200, types.Response{Status: http.StatusOK, Message: "Username available", Data: nil})
		} else {
			c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Internal Server Error", Data: nil})
		}
		return
	}

	c.JSON(409, types.Response{Status: http.StatusConflict, Message: "Username not available", Data: nil})
}
