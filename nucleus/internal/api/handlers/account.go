package handlers

import (
	"fmt"
	"net/http"
	"nucleus/internal/api/types"
	"nucleus/internal/models"
	"nucleus/utils"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func CreateAccount(c *gin.Context) {
	createAccount := types.CreateAccountDTO{}
	db := utils.GetDB()
	if err := c.ShouldBindJSON(&createAccount); err != nil {
		utils.ErrorLogger.Println(err)
		c.JSON(400, types.Response{Status: 400, Message: "Invalid request", Data: nil})
		return
	}

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	account := models.Account{
		UserId:   userID.(uuid.UUID),
		Name:     createAccount.Name,
		Category: createAccount.Category,
		Balance:  createAccount.Balance,
		Currency: createAccount.Currency,
	}

	result := db.Create(&account)
	if result.Error != nil {
		utils.ErrorLogger.Println(result.Error)
		c.JSON(500, types.Response{Status: http.StatusInternalServerError, Message: fmt.Sprintf("Failed to create account: %s", result.Error.Error()), Data: nil})
		return
	}

	type Response struct {
		ID               uuid.UUID `json:"id"`
		Category         string    `json:"category"`
		Name             string    `json:"name"`
		Balance          float64   `json:"balance"`
		IsDefaultAccount bool      `json:"is_default_account"`
	}

	c.JSON(http.StatusCreated, types.Response{Status: http.StatusCreated, Message: "Account created successfully", Data: Response{
		ID:               account.ID,
		Category:         account.Category,
		Name:             account.Name,
		Balance:          account.Balance,
		IsDefaultAccount: account.IsDefaultAccount,
	}})
}

func UpdateUserAccount(c *gin.Context) {
	db := utils.GetDB()
	updateAccount := types.UpdateAccountDTO{}
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	accountID, _ := c.Params.Get("accountID")
	account := models.Account{}
	result := db.Where("id = ? AND user_id = ?", accountID, userID).First(&account)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, types.Response{Status: http.StatusNotFound, Message: "Account not found", Data: nil})
		return
	}

	if err := c.ShouldBindJSON(&updateAccount); err != nil {
		utils.ErrorLogger.Println(err)
		c.JSON(http.StatusBadRequest, types.Response{Status: http.StatusBadRequest, Message: "Invalid request", Data: nil})
		return
	}

	account.Name = updateAccount.Name
	account.Balance = updateAccount.Balance
	account.Category = updateAccount.Category
	result = db.Save(&account)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: fmt.Sprintf("Failed to update account: %s", result.Error.Error()), Data: nil})
		return
	}

	c.JSON(http.StatusOK, types.Response{Status: http.StatusOK, Message: "Account updated successfully", Data: account})
}

func FetchUserAccounts(c *gin.Context) {
	db := utils.GetDB()
	accounts := []models.Account{}
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	offset := (page - 1) * pageSize

	var totalItems int64
	db.Model(&models.Account{}).Where("user_id = ?", userID).Count(&totalItems)

	result := db.Where("user_id = ?", userID).Limit(pageSize).Offset(offset).Find(&accounts)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: fmt.Sprintf("Failed to fetch accounts: %s", result.Error.Error()), Data: nil})
		return
	}

	totalPages := int((totalItems + int64(pageSize) - 1) / int64(pageSize))

	c.JSON(http.StatusOK, types.Response{
		Status:     http.StatusOK,
		Message:    "Accounts fetched successfully",
		Data:       accounts,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
		TotalItems: int(totalItems),
	})
}

func DeleteUserAccount(c *gin.Context) {
	db := utils.GetDB()
	accountID, _ := strconv.Atoi(c.Param("id"))
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	account := models.Account{}
	if err := db.Where("id = ? AND user_id = ?", accountID, userID).First(&account).Error; err != nil {
		utils.ErrorLogger.Printf("Failed to fetch account: %v", err)
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to fetch account", Data: nil})
		return
	}

	// Check if the account is a default account
	if account.IsDefaultAccount {
		c.JSON(http.StatusForbidden, types.Response{Status: http.StatusForbidden, Message: "Cannot delete default account", Data: nil})
		return
	}

	tx := db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			utils.ErrorLogger.Printf("Failed to delete account: %v", r)
			c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to delete account", Data: nil})
			return
		}
	}()

	if err := tx.Where("id = ? AND user_id = ?", accountID, userID).Delete(&account).Error; err != nil {
		tx.Rollback()
		utils.ErrorLogger.Printf("Failed to delete account: %v", err)
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to delete account", Data: nil})
		return
	}

	if err := tx.Where("account_id = ? AND user_id = ?", accountID, userID).Delete(&models.Transaction{}).Error; err != nil {
		tx.Rollback()
		utils.ErrorLogger.Printf("Failed to delete transactions: %v", err)
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to delete account", Data: nil})
		return
	}

	tx.Commit()
	c.JSON(http.StatusOK, types.Response{Status: http.StatusOK, Message: "Account deleted successfully", Data: account})
}
