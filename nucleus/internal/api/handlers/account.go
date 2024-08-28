package handlers

import (
	"fmt"
	"net/http"
	"nucleus/internal/api/types"
	"nucleus/internal/models"
	"nucleus/utils"
	"strconv"

	"github.com/gin-gonic/gin"
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
		UserId:   userID.(uint),
		Name:     createAccount.Name,
		Category: createAccount.Category,
		Balance:  createAccount.Balance,
	}

	result := db.Create(&account)
	if result.Error != nil {
		utils.ErrorLogger.Println(result.Error)
		c.JSON(500, types.Response{Status: http.StatusInternalServerError, Message: fmt.Sprintf("Failed to create account: %s", result.Error.Error()), Data: nil})
		return
	}

	type Response struct {
		ID               uint    `json:"id"`
		Category         string  `json:"category"`
		Name             string  `json:"name"`
		Balance          float64 `json:"balance"`
		IsDefaultAccount bool    `json:"is_default_account"`
	}

	c.JSON(http.StatusCreated, types.Response{Status: http.StatusCreated, Message: "Account created successfully", Data: Response{
		ID:               account.ID,
		Category:         account.Category,
		Name:             account.Name,
		Balance:          account.Balance,
		IsDefaultAccount: account.IsDefaultAccount,
	}})
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
	result := db.Where("id = ? AND user_id = ?", accountID, userID).First(&account)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, types.Response{Status: http.StatusNotFound, Message: "Account not found", Data: nil})
		return
	}

	if account.IsDefaultAccount {
		c.JSON(http.StatusForbidden, types.Response{Status: http.StatusForbidden, Message: "Cannot delete default account", Data: nil})
		return
	}

	db.Delete(&account)
	c.JSON(http.StatusOK, types.Response{Status: http.StatusOK, Message: "Account deleted successfully", Data: account})
}
