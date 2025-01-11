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

func CreateAccount(c *gin.Context) {
	createAccount := types.CreateAccountDTO{}
	db := utils.GetDB()
	if err := c.ShouldBindJSON(&createAccount); err != nil {
		log.ErrorLogger.Println(err)
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
		log.ErrorLogger.Println(result.Error)
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

	// clear all caches that match this pattern
	cacheKey := redis.BuildCacheKey("accounts", fmt.Sprintf("%s", userID), "*")
	if err := redis.InvalidateMultipleCaches([]string{cacheKey, redis.BuildCacheKey("users", fmt.Sprintf("%s", userID))}); err != nil {
		log.ErrorLogger.Printf("Error invalidating cache with key %s: %v", cacheKey, err)
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
	accountID, _ := c.Params.Get("accountID")
	account := models.Account{}

	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	cacheKey := redis.BuildCacheKey("accounts_response", fmt.Sprintf("%s", userID), "*")
	result := db.Where("id = ? AND user_id = ?", accountID, userID).First(&account)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, types.Response{Status: http.StatusNotFound, Message: "Account not found", Data: nil})
		return
	}

	if err := c.ShouldBindJSON(&updateAccount); err != nil {
		log.ErrorLogger.Println(err)
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

	if err := redis.InvalidateMultipleCaches([]string{cacheKey, redis.BuildCacheKey("users", fmt.Sprintf("%s", userID))}); err != nil {
		log.ErrorLogger.Printf("Error invalidating cache with key %s: %v", cacheKey, err)
	}

	c.JSON(http.StatusOK, types.Response{Status: http.StatusOK, Message: "Account updated successfully", Data: account})
}

func FetchUserAccounts(c *gin.Context) {
	db := utils.GetDB()
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Parse pagination parameters
	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}
	pageSize, err := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	if err != nil || pageSize < 1 {
		pageSize = 10
	}

	// Build cache key
	// model_response:userID:page:pageSize
	cacheKey := redis.BuildCacheKey("accounts", fmt.Sprintf("%s", userID), fmt.Sprintf("%d", page), fmt.Sprintf("%d", pageSize))

	// Check cache
	var cachedResponse types.Response
	cacheHit, err := redis.GetCache(cacheKey, &cachedResponse)
	if err != nil {
		log.ErrorLogger.Printf("Error fetching from cache with key %s: %v\nContinuing to use results from db", cacheKey, err)
	}

	if cacheHit {
		// Cache hit response
		c.JSON(http.StatusOK, cachedResponse)
		return
	}

	// Fetch accounts from the database
	var accounts []models.Account
	var totalItems int64

	db.Model(&models.Account{}).Where("user_id = ?", userID).Count(&totalItems)
	result := db.Where("user_id = ?", userID).Limit(pageSize).Offset((page - 1) * pageSize).Find(&accounts)
	if result.Error != nil {
		log.ErrorLogger.Printf("Error fetching accounts from DB: %v\n", result.Error)
		c.JSON(http.StatusInternalServerError, types.Response{
			Status:  http.StatusInternalServerError,
			Message: "Failed to fetch accounts from database",
		})
		return
	}

	totalPages := int((totalItems + int64(pageSize) - 1) / int64(pageSize))

	// Build the response object
	response := types.Response{
		Status:     http.StatusOK,
		Message:    "Accounts fetched successfully",
		Data:       accounts,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
		TotalItems: int(totalItems),
	}

	// Cache the response
	err = redis.SetCache(cacheKey, response, 30*time.Minute)
	if err != nil {
		log.ErrorLogger.Printf("Failed to set value in cache with key %s: %v", cacheKey, err)
	}

	// Respond with data
	c.JSON(http.StatusOK, response)
}

func DeleteUserAccount(c *gin.Context) {
	db := utils.GetDB()
	accountID, _ := strconv.Atoi(c.Param("id"))
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	cacheKey := redis.BuildCacheKey("accounts", fmt.Sprintf("%s", userID), "*")
	account := models.Account{}
	if err := db.Where("id = ? AND user_id = ?", accountID, userID).First(&account).Error; err != nil {
		log.ErrorLogger.Printf("Failed to fetch account: %v", err)
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
			log.ErrorLogger.Printf("Failed to delete account: %v", r)
			c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to delete account", Data: nil})
			return
		}
	}()

	if err := tx.Where("id = ? AND user_id = ?", accountID, userID).Delete(&account).Error; err != nil {
		tx.Rollback()
		log.ErrorLogger.Printf("Failed to delete account: %v", err)
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to delete account", Data: nil})
		return
	}

	if err := tx.Where("account_id = ? AND user_id = ?", accountID, userID).Delete(&models.Transaction{}).Error; err != nil {
		tx.Rollback()
		log.ErrorLogger.Printf("Failed to delete transactions: %v", err)
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to delete account", Data: nil})
		return
	}

	if err := redis.InvalidateMultipleCaches([]string{cacheKey, redis.BuildCacheKey("users", fmt.Sprintf("%s", userID))}); err != nil {
		log.ErrorLogger.Printf("Error invalidating cache with key %s: %v", cacheKey, err)
	}

	tx.Commit()
	c.JSON(http.StatusOK, types.Response{Status: http.StatusOK, Message: "Account deleted successfully", Data: account})
}
