package handlers

import (
	"fmt"
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
		c.JSON(400, types.Response{Status: 400, Message: "Invalid request", Data: nil})
		return
	}

	account := models.Account{
		UserId:   uint(c.GetInt("userID")),
		Name:     createAccount.Name,
		Category: createAccount.Category,
		Balance:  createAccount.Balance,
	}

	result := db.Create(&account)
	if result.Error != nil {
		c.JSON(500, types.Response{Status: 500, Message: fmt.Sprintf("Failed to create account: %s", result.Error.Error()), Data: nil})
	}

	c.JSON(201, types.Response{Status: 201, Message: "Account created successfully", Data: account})
}

func FetchUserAccounts(c *gin.Context) {
	db := utils.GetDB()
	userID := c.GetInt("userID")
	accounts := []models.Account{}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	offset := (page - 1) * pageSize

	var totalItems int64
	db.Model(&models.Account{}).Where("user_id = ?", userID).Count(&totalItems)

	result := db.Where("user_id = ?", userID).Limit(pageSize).Offset(offset).Find(&accounts)
	if result.Error != nil {
		c.JSON(500, types.Response{Status: 500, Message: fmt.Sprintf("Failed to fetch accounts: %s", result.Error.Error()), Data: nil})
		return
	}

	totalPages := int((totalItems + int64(pageSize) - 1) / int64(pageSize))

	c.JSON(200, types.Response{
		Status:     200,
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
	userID := c.GetInt("userID")

	account := models.Account{}
	result := db.Where("id = ? AND user_id = ?", accountID, userID).First(&account)
	if result.Error != nil {
		c.JSON(404, types.Response{Status: 404, Message: "Account not found", Data: nil})
		return
	}

	if account.IsDefaultAccount {
		c.JSON(400, types.Response{Status: 405, Message: "Cannot delete default account", Data: nil})
		return
	}

	db.Delete(&account)
	c.JSON(200, types.Response{Status: 200, Message: "Account deleted successfully", Data: account})
}
