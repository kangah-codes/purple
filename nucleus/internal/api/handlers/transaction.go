package handlers

import (
	"fmt"
	"net/http"
	"nucleus/internal/api/types"
	"nucleus/internal/models"
	"nucleus/internal/redis"
	"nucleus/log"
	"nucleus/utils"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func CreateTransaction(c *gin.Context) {
	createTransaction := types.CreateTransactionDTO{}
	db := utils.GetDB()

	if err := c.ShouldBindJSON(&createTransaction); err != nil {
		log.ErrorLogger.Println(err)
		c.JSON(400, types.Response{Status: 400, Message: "Invalid request"})
		return
	}

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, types.Response{Status: 401, Message: "Unauthorized"})
		return
	}

	tx := db.Begin()
	if tx.Error != nil {
		log.ErrorLogger.Println(tx.Error)
		c.JSON(500, types.Response{Status: 500, Message: "Failed to start transaction"})
		return
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			log.ErrorLogger.Println("Transaction rolled back due to panic:", r)
			c.JSON(500, types.Response{Status: 500, Message: "Transaction failed"})
		}
	}()

	cacheKey := redis.BuildCacheKey("transactions", fmt.Sprintf("%v", userID), "*")

	if createTransaction.Type == models.Transfer {
		var fromAccount, toAccount models.Account

		if err := tx.Set("gorm:query_option", "FOR UPDATE").First(&fromAccount, createTransaction.FromAccount).Error; err != nil {
			tx.Rollback()
			c.JSON(404, types.Response{Status: 404, Message: "From account not found"})
			return
		}

		if err := tx.Set("gorm:query_option", "FOR UPDATE").First(&toAccount, createTransaction.ToAccount).Error; err != nil {
			tx.Rollback()
			c.JSON(404, types.Response{Status: 404, Message: "To account not found"})
			return
		}

		if fromAccount.Currency != toAccount.Currency {
			tx.Rollback()
			c.JSON(400, types.Response{Status: 400, Message: "Can only transfer using accounts with the same currencies"})
			return
		}

		transaction := models.Transaction{
			AccountId:   fromAccount.ID, // Primary account is the source account
			UserId:      userID.(uuid.UUID),
			Type:        models.Transfer,
			Amount:      createTransaction.Amount,
			Note:        createTransaction.Note,
			Category:    createTransaction.Category,
			CreatedAt:   utils.FormatStrToDateTime(createTransaction.CreatedAt),
			FromAccount: fromAccount.ID,
			ToAccount:   toAccount.ID,
			Currency:    fromAccount.Currency,
			Account:     fromAccount,
		}

		// Update both account balances
		fromAccount.Balance -= createTransaction.Amount
		toAccount.Balance += createTransaction.Amount

		if err := tx.Save(&fromAccount).Error; err != nil {
			tx.Rollback()
			c.JSON(500, types.Response{Status: 500, Message: "Failed to update from account"})
			return
		}

		if err := tx.Save(&toAccount).Error; err != nil {
			tx.Rollback()
			c.JSON(500, types.Response{Status: 500, Message: "Failed to update to account"})
			return
		}

		if err := tx.Create(&transaction).Error; err != nil {
			tx.Rollback()
			c.JSON(500, types.Response{Status: 500, Message: "Failed to create transaction"})
			return
		}

		if err := tx.Commit().Error; err != nil {
			c.JSON(500, types.Response{Status: 500, Message: "Failed to commit transaction"})
			return
		}

		if err := redis.InvalidateMultipleCaches([]string{cacheKey, redis.BuildCacheKey("users", fmt.Sprintf("%s", userID))}); err != nil {
			log.ErrorLogger.Printf("Error invalidating cache with key %s: %v", cacheKey, err)
		}

		c.JSON(201, types.Response{Status: 201, Message: "Transfer completed", Data: transaction})
		return
	}

	// Handle non-transfer transaction (existing code remains the same)
	var account models.Account
	if err := tx.Set("gorm:query_option", "FOR UPDATE").First(&account, createTransaction.AccountId).Error; err != nil {
		tx.Rollback()
		c.JSON(404, types.Response{Status: 404, Message: "Account not found"})
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
		Account:     account,
	}

	if createTransaction.Type == models.Debit {
		account.Balance -= createTransaction.Amount
	} else {
		account.Balance += createTransaction.Amount
	}

	if err := tx.Save(&account).Error; err != nil {
		tx.Rollback()
		c.JSON(500, types.Response{Status: 500, Message: "Failed to update account"})
		return
	}

	if err := tx.Create(&transaction).Error; err != nil {
		tx.Rollback()
		c.JSON(500, types.Response{Status: 500, Message: "Failed to create transaction"})
		return
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(500, types.Response{Status: 500, Message: "Failed to commit transaction"})
		return
	}

	if err := redis.InvalidateMultipleCaches([]string{cacheKey, redis.BuildCacheKey("users", fmt.Sprintf("%s", userID))}); err != nil {
		log.ErrorLogger.Printf("Error invalidating cache with key %s: %v", cacheKey, err)
	}
	c.JSON(201, types.Response{Status: 201, Message: "Transaction created", Data: transaction})
}

func UpdateTransaction(c *gin.Context) {
	updateTransaction := types.UpdateTransactionDTO{}
	db := utils.GetDB()
	if err := c.ShouldBindJSON(&updateTransaction); err != nil {
		log.ErrorLogger.Println(err)
		c.JSON(400, types.Response{Status: 400, Message: "Invalid request", Data: nil})
		return
	}

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	cacheKey := redis.BuildCacheKey("transactions", fmt.Sprintf("%v", userID), "*")
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
		log.ErrorLogger.Println(result.Error)
		c.JSON(500, types.Response{Status: http.StatusInternalServerError, Message: "Failed to update transaction", Data: nil})
		return
	}

	if err := redis.InvalidateMultipleCaches([]string{cacheKey, redis.BuildCacheKey("users", fmt.Sprintf("%s", userID))}); err != nil {
		log.ErrorLogger.Printf("Error invalidating cache with key %s: %v", cacheKey, err)
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
	cacheKey := redis.BuildCacheKey("transactions", fmt.Sprintf("%v", userID), "*")
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
		log.ErrorLogger.Println(result.Error)
		c.JSON(500, types.Response{Status: http.StatusInternalServerError, Message: "Failed to delete transaction", Data: nil})
		return
	}

	if err := redis.InvalidateMultipleCaches([]string{cacheKey, redis.BuildCacheKey("users", fmt.Sprintf("%s", userID))}); err != nil {
		log.ErrorLogger.Printf("Error invalidating cache with key %s: %v", cacheKey, err)
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
	startDate := c.Query("startDate")
	endDate := c.Query("endDate")

	cacheKey := redis.BuildCacheKey("transactions", fmt.Sprintf("%v", userID), fmt.Sprintf("%d", page), fmt.Sprintf("%d", pageSize), accountID)
	var cachedResponse types.Response
	cacheHit, err := redis.GetEncryptedCache(cacheKey, &cachedResponse)

	if err != nil {
		log.ErrorLogger.Printf("Error fetching from cache with key %s: %v\nContinuing to use results from db", cacheKey, err)
	}

	if cacheHit {
		c.JSON(http.StatusOK, cachedResponse)
		return
	}

	var totalItems int64
	query := db.Model(&models.Transaction{}).Where("user_id = ?", userID).Count(&totalItems)

	// Apply filters based on query parameters
	if accountID != "" {
		query = query.Where("account_id = ?", accountID)
	}

	if startDate != "" && endDate != "" {
		// Parse the start date
		parsedStartDate, err := time.Parse("02/01/2006", startDate)
		if err != nil {
			log.ErrorLogger.Errorf("Error parsing start date: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"Error": "Invalid start date format"})
			return
		}
		// Set start date to midnight (00:00:00) of that day
		startDateMidnight := time.Date(
			parsedStartDate.Year(),
			parsedStartDate.Month(),
			parsedStartDate.Day(),
			0, 0, 0, 0, // Hour, Minute, Second, Nanosecond
			parsedStartDate.Location(),
		)

		// Parse the end date
		parsedEndDate, err := time.Parse("02/01/2006", endDate)
		if err != nil {
			log.ErrorLogger.Errorf("Error parsing end date: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"Error": "Invalid end date format"})
			return
		}
		// Set end date to 11:59:59 PM (23:59:59) of that day
		endDateEndOfDay := time.Date(
			parsedEndDate.Year(),
			parsedEndDate.Month(),
			parsedEndDate.Day(),
			23, 59, 59, 0, // Hour, Minute, Second, Nanosecond
			parsedEndDate.Location(),
		)

		fmt.Printf("startdate: %v\nenddate: %v", startDateMidnight, endDateEndOfDay)

		log.ErrorLogger.Fatalf("DIE")

		// Add the timestamp range to the query using GORM
		query = query.Where("created_at >= ? AND created_at <= ?", startDateMidnight, endDateEndOfDay)
	}

	result := query.Preload("Account").Where("user_id = ?", userID).Order("created_at desc").Limit(pageSize).Offset(offset).Find(&transactions)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: fmt.Sprintf("Failed to fetch transactions: %s", result.Error.Error()), Data: nil})
		return
	}

	totalPages := int((totalItems + int64(pageSize) - 1) / int64(pageSize))
	response := types.Response{
		Status:     http.StatusOK,
		Message:    "Transactions fetched successfully",
		Data:       transactions,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
		TotalItems: int(totalItems),
	}

	if err := redis.SetEncryptedCache(cacheKey, response, 30*time.Minute); err != nil {
		log.ErrorLogger.Printf("Failed to set value in cache with key %s: %v", cacheKey, err)
	}

	c.JSON(http.StatusOK, response)
}
