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

func CreateTransaction(c *gin.Context) {
	createTransaction := types.CreateTransactionDTO{}
	db := utils.GetDB()

	// Parse JSON body
	if err := c.ShouldBindJSON(&createTransaction); err != nil {
		utils.ErrorLogger.Println(err)
		c.JSON(400, types.Response{Status: 400, Message: "Invalid request", Data: nil})
		return
	}

	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Start the DB transaction
	tx := db.Begin()
	if tx.Error != nil {
		utils.ErrorLogger.Println(tx.Error)
		c.JSON(500, types.Response{Status: http.StatusInternalServerError, Message: "Failed to start transaction", Data: nil})
		return
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			utils.ErrorLogger.Println("Transaction rolled back due to panic:", r)
			c.JSON(500, types.Response{Status: http.StatusInternalServerError, Message: "Transaction failed", Data: nil})
		}
	}()

	var transactions []models.Transaction

	if createTransaction.Type == models.Transfer {
		// Handle transfer transaction
		var fromAccount, toAccount models.Account

		// Fetch fromAccount and toAccount
		if err := tx.Set("gorm:query_option", "FOR UPDATE").First(&fromAccount, createTransaction.FromAccount).Error; err != nil {
			utils.ErrorLogger.Println(err)
			tx.Rollback()
			c.JSON(404, types.Response{Status: 404, Message: "From account not found", Data: nil})
			return
		}

		if err := tx.Set("gorm:query_option", "FOR UPDATE").First(&toAccount, createTransaction.ToAccount).Error; err != nil {
			utils.ErrorLogger.Println(err)
			tx.Rollback()
			c.JSON(404, types.Response{Status: 404, Message: "To account not found", Data: nil})
			return
		}

		// TODO: in the future we may want to use a currency API to do the conversion automatically
		// or even make it a premium feature
		if fromAccount.Currency != toAccount.Currency {
			utils.ErrorLogger.Println("Currency mismatch")
			tx.Rollback()
			c.JSON(400, types.Response{Status: 400, Message: "Can only transfer using accounts with the same currencies", Data: nil})
			return
		}

		// Create debit transaction for fromAccount
		debitTransaction := models.Transaction{
			AccountId:   fromAccount.ID,
			UserId:      userID.(uuid.UUID),
			Type:        models.Debit,
			Amount:      createTransaction.Amount,
			Note:        createTransaction.Note,
			Category:    createTransaction.Category,
			CreatedAt:   utils.FormatStrToDateTime(createTransaction.CreatedAt),
			FromAccount: fromAccount.ID,
			ToAccount:   toAccount.ID,
			Currency:    fromAccount.Currency,
		}

		// Create credit transaction for toAccount
		creditTransaction := models.Transaction{
			AccountId:   toAccount.ID,
			UserId:      userID.(uuid.UUID),
			Type:        models.Credit,
			Amount:      createTransaction.Amount,
			Note:        createTransaction.Note,
			Category:    createTransaction.Category,
			CreatedAt:   utils.FormatStrToDateTime(createTransaction.CreatedAt),
			FromAccount: fromAccount.ID,
			ToAccount:   toAccount.ID,
			Currency:    toAccount.Currency,
		}

		// Update account balances
		oldFromBalance := fromAccount.Balance
		oldToBalance := toAccount.Balance
		fromAccount.Balance -= createTransaction.Amount
		toAccount.Balance += createTransaction.Amount

		utils.InfoLogger.Printf("From account %s old balance: %v, new balance: %v", fromAccount.Name, oldFromBalance, fromAccount.Balance)
		utils.InfoLogger.Printf("To account %s old balance: %v, new balance: %v", toAccount.Name, oldToBalance, toAccount.Balance)

		// Save updated accounts
		if err := tx.Save(&fromAccount).Error; err != nil {
			utils.ErrorLogger.Println("Failed to update from account:", err)
			tx.Rollback()
			c.JSON(500, types.Response{Status: http.StatusInternalServerError, Message: "Failed to update from account", Data: nil})
			return
		}

		if err := tx.Save(&toAccount).Error; err != nil {
			utils.ErrorLogger.Println("Failed to update to account:", err)
			tx.Rollback()
			c.JSON(500, types.Response{Status: http.StatusInternalServerError, Message: "Failed to update to account", Data: nil})
			return
		}

		debitTransaction.Account = fromAccount
		creditTransaction.Account = toAccount
		transactions = append(transactions, debitTransaction, creditTransaction)
		// Verify the updates
		var verifyFromAccount, verifyToAccount models.Account
		tx.First(&verifyFromAccount, fromAccount.ID)
		tx.First(&verifyToAccount, toAccount.ID)
		utils.InfoLogger.Printf("Verified From account balance: %v", verifyFromAccount.Balance)
		utils.InfoLogger.Printf("Verified To account balance: %v", verifyToAccount.Balance)

	} else {
		// Handle non-transfer transaction
		var account models.Account
		if err := tx.Set("gorm:query_option", "FOR UPDATE").First(&account, createTransaction.AccountId).Error; err != nil {
			utils.ErrorLogger.Println(err)
			tx.Rollback()
			c.JSON(404, types.Response{Status: 404, Message: "Account not found", Data: nil})
			return
		}

		transaction := models.Transaction{
			AccountId:   createTransaction.AccountId,
			UserId:      userID.(uuid.UUID),
			Type:        createTransaction.Type,
			Amount:      createTransaction.Amount,
			Note:        createTransaction.Note,
			Category:    createTransaction.Category,
			CreatedAt:   utils.FormatStrToDateTime(createTransaction.CreatedAt),
			FromAccount: uuid.Nil,
			ToAccount:   uuid.Nil,
			Currency:    account.Currency,
		}

		transaction.Account = account

		transactions = append(transactions, transaction)

		// Update account balance
		oldBalance := account.Balance
		if createTransaction.Type == models.Debit {
			account.Balance -= createTransaction.Amount
		} else {
			account.Balance += createTransaction.Amount
		}

		utils.InfoLogger.Printf("Account %s old balance: %v, new balance: %v", account.Name, oldBalance, account.Balance)

		if err := tx.Save(&account).Error; err != nil {
			utils.ErrorLogger.Println("Failed to update account:", err)
			tx.Rollback()
			c.JSON(500, types.Response{Status: http.StatusInternalServerError, Message: "Failed to update account", Data: nil})
			return
		}

		// Verify the update
		var verifyAccount models.Account
		tx.First(&verifyAccount, account.ID)
		utils.InfoLogger.Printf("Verified Account balance: %v", verifyAccount.Balance)
	}

	// Insert the transaction record(s)
	for _, transaction := range transactions {
		if err := tx.Create(&transaction).Error; err != nil {
			utils.ErrorLogger.Println("Failed to create transaction:", err)
			tx.Rollback()
			c.JSON(500, types.Response{Status: http.StatusInternalServerError, Message: "Failed to create transaction", Data: nil})
			return
		}
	}

	// Commit the transaction
	if err := tx.Commit().Error; err != nil {
		utils.ErrorLogger.Println("Failed to commit transaction:", err)
		c.JSON(500, types.Response{Status: http.StatusInternalServerError, Message: "Failed to commit transaction", Data: nil})
		return
	}

	// Return success response
	c.JSON(201, types.Response{Status: http.StatusCreated, Message: "Transaction(s) created", Data: transactions})
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

	if updateTransaction.FromAccount != uuid.Nil {
		result := db.Where("id = ?", updateTransaction.FromAccount).First(&models.Account{})
		if result.Error != nil {
			c.JSON(404, types.Response{Status: http.StatusNotFound, Message: "From account not found", Data: nil})
			return
		}
	}

	if updateTransaction.ToAccount != uuid.Nil {
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
		transaction.FromAccount = uuid.Nil
		transaction.ToAccount = uuid.Nil
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
		c.JSON(401, types.Response{Status: http.StatusUnauthorized, Message: "Unauthorized", Data: nil})
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

	// Access query parameters
	accountID := c.Query("accountID")

	fmt.Println(accountID, "ACCID")

	var totalItems int64
	query := db.Model(&models.Transaction{}).Where("user_id = ?", userID).Count(&totalItems)

	// Apply filters based on query parameters
	if accountID != "" {
		utils.InfoLogger.Println("Account id is not null")
		query = query.Where("account_id = ?", accountID)
	}

	result := query.Preload("Account").Where("user_id = ?", userID).Order("created_at desc").Limit(pageSize).Offset(offset).Find(&transactions)
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
