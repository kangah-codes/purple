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

func CreateTransaction(c *gin.Context) {
	createTransaction := types.CreateTransactionDTO{}
	db := utils.GetDB()
	if err := c.ShouldBindJSON(&createTransaction); err != nil {
		utils.ErrorLogger.Println(err)
		c.JSON(400, types.Response{Status: 400, Message: "Invalid request", Data: nil})
		return
	}

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	transaction := models.Transaction{
		AccountId: createTransaction.AccountId,
		UserId:    userID.(uint),
		Type:      createTransaction.Type,
		Amount:    createTransaction.Amount,
		Note:      createTransaction.Note,
		Category:  createTransaction.Category,
	}

	// set transactions which aren't transfers to 0
	if createTransaction.Type != models.Transfer {
		transaction.FromAccount = 0
		transaction.ToAccount = 0
	} else {
		transaction.FromAccount = createTransaction.FromAccount
		transaction.ToAccount = createTransaction.ToAccount
	}

	result := db.Create(&transaction)
	if result.Error != nil {
		utils.ErrorLogger.Println(result.Error)
		c.JSON(500, types.Response{Status: http.StatusInternalServerError, Message: "Failed to create transaction", Data: nil})
		return
	}

	// Fetch the related account data
	account := models.Account{}
	if err := db.Where("id = ?", transaction.AccountId).First(&account).Error; err != nil {
		utils.ErrorLogger.Println(err)
		c.JSON(500, types.Response{Status: http.StatusInternalServerError, Message: "Failed to fetch account", Data: nil})
		return
	}

	transaction.Account = account

	c.JSON(201, types.Response{Status: http.StatusCreated, Message: "Transaction created", Data: transaction})
}

func UpdateTransaction(c *gin.Context) {
	updateTransaction := types.UpdateTransactionDTO{}
	db := utils.GetDB()
	if err := c.ShouldBindJSON(&updateTransaction); err != nil {
		utils.ErrorLogger.Println(err)
		c.JSON(400, types.Response{Status: 400, Message: "Invalid request", Data: nil})
		return
	}

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	transactionID, _ := c.Params.Get("transactionID")
	transaction := models.Transaction{}
	result := db.First(&transaction, transactionID)
	if result.Error != nil {
		c.JSON(404, types.Response{Status: 404, Message: "Transaction not found", Data: nil})
		return
	}

	if transaction.UserId != userID {
		c.JSON(403, types.Response{Status: 403, Message: "Forbidden", Data: nil})
		return
	}

	if updateTransaction.FromAccount != 0 {
		result := db.Where("id = ?", updateTransaction.FromAccount).First(&models.Account{})
		if result.Error != nil {
			c.JSON(404, types.Response{Status: http.StatusNotFound, Message: "From account not found", Data: nil})
			return
		}
	}

	if updateTransaction.ToAccount != 0 {
		result := db.Where("id = ?", updateTransaction.ToAccount).First(&models.Account{})
		if result.Error != nil {
			c.JSON(404, types.Response{Status: http.StatusNotFound, Message: "To account not found", Data: nil})
			return
		}
	}

	transaction.AccountId = updateTransaction.AccountId
	transaction.Type = updateTransaction.Type
	transaction.Amount = updateTransaction.Amount
	transaction.Note = updateTransaction.Note
	transaction.Category = updateTransaction.Category
	// set transactions which aren't transfers to 0
	if updateTransaction.Type != models.Transfer {
		transaction.FromAccount = 0
		transaction.ToAccount = 0
	} else {
		transaction.FromAccount = updateTransaction.FromAccount
		transaction.ToAccount = updateTransaction.ToAccount
	}

	result = db.Save(&transaction)

	if result.Error != nil {
		utils.ErrorLogger.Println(result.Error)
		c.JSON(500, types.Response{Status: http.StatusInternalServerError, Message: "Failed to update transaction", Data: nil})
		return
	}

	c.JSON(200, types.Response{Status: http.StatusOK, Message: "Transaction updated", Data: transaction})
}

func DeleteTransaction(c *gin.Context) {
	db := utils.GetDB()
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	transactionID, _ := c.Params.Get("transactionID")
	transaction := models.Transaction{}
	result := db.First(&transaction, transactionID)
	if result.Error != nil {
		c.JSON(404, types.Response{Status: 404, Message: "Transaction not found", Data: nil})
		return
	}

	if transaction.UserId != userID {
		c.JSON(403, types.Response{Status: 403, Message: "Forbidden", Data: nil})
		return
	}

	result = db.Delete(&transaction)
	if result.Error != nil {
		utils.ErrorLogger.Println(result.Error)
		c.JSON(500, types.Response{Status: http.StatusInternalServerError, Message: "Failed to delete transaction", Data: nil})
		return
	}

	c.JSON(200, types.Response{Status: http.StatusOK, Message: "Transaction deleted", Data: nil})
}

func FetchTransactions(c *gin.Context) {
	db := utils.GetDB()
	transactions := []models.Transaction{}
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	offset := (page - 1) * pageSize

	var totalItems int64
	db.Model(&models.Transaction{}).Where("user_id = ?", userID).Count(&totalItems)

	result := db.Preload("Account").Where("user_id = ?", userID).Limit(pageSize).Offset(offset).Find(&transactions)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: fmt.Sprintf("Failed to fetch transactions: %s", result.Error.Error()), Data: nil})
		return
	}

	totalPages := int((totalItems + int64(pageSize) - 1) / int64(pageSize))

	c.JSON(http.StatusOK, types.Response{
		Status:     http.StatusOK,
		Message:    "Transactions fetched successfully",
		Data:       transactions,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
		TotalItems: int(totalItems),
	})
}
