package services

import (
	"fmt"
	"nucleus/internal/api/types"
	"nucleus/internal/models"
	"nucleus/internal/redis"
	"nucleus/log"
	"nucleus/utils"
	"time"

	"github.com/google/uuid"
)

func CreateAccount(payload types.CreateAccountDTO, userID uuid.UUID) (*models.Account, error) {
	db := utils.GetDB()
	account := models.Account{
		UserId:   userID,
		Name:     payload.Name,
		Balance:  payload.Balance,
		Currency: payload.Currency,
		Category: payload.Category,
	}

	if err := db.Create(&account).Error; err != nil {
		return nil, err
	}

	cacheKey := redis.BuildCacheKey("accounts", userID.String(), "*")
	if err := redis.InvalidateMultipleCaches([]string{cacheKey, redis.BuildCacheKey("users", userID.String())}); err != nil {
		log.ErrorLogger.Printf("Error invalidating cache with key %s: %v", cacheKey, err)
	}

	return &account, nil
}

func UpdateAccount(accountID string, userID string, payload types.UpdateAccountDTO) (*models.Account, error) {
	db := utils.GetDB()
	account := models.Account{}
	cacheKey := redis.BuildCacheKey("accounts_response", userID, "*")

	result := db.Where("id = ? AND user_id = ?", accountID, userID).First(&account)
	if result.Error != nil {
		return nil, result.Error
	}

	account.Name = payload.Name
	account.Balance = payload.Balance
	account.Category = payload.Category

	result = db.Save(&account)
	if result.Error != nil {
		return nil, result.Error
	}

	if err := redis.InvalidateMultipleCaches([]string{cacheKey, redis.BuildCacheKey("users", userID)}); err != nil {
		log.ErrorLogger.Printf("Error invalidating cache with key %s: %v", cacheKey, err)
	}

	return &account, nil
}

func FetchPaginatedAccounts(userID uuid.UUID, page int, limit int) ([]models.Account, error) {
	db := utils.GetDB()
	accounts := []models.Account{}
	// accounts:userID:page:pageSize
	cacheKey := redis.BuildCacheKey("accounts", userID.String(), fmt.Sprintf("%d", page), fmt.Sprintf("%d", limit))

	var cachedResponse []models.Account
	cacheHit, err := redis.GetEncryptedCache(cacheKey, &cachedResponse)
	if err != nil {
		log.ErrorLogger.Printf("Error fetching from cache with key %s: %v\nContinuing to use results from db", cacheKey, err)
	}

	if cacheHit {
		return cachedResponse, nil
	}

	result := db.Where("user_id = ?", userID).Offset((page - 1) * limit).Limit(limit).Find(&accounts)
	if result.Error != nil {
		return nil, result.Error
	}

	err = redis.SetEncryptedCache(cacheKey, accounts, 30*time.Minute)
	if err != nil {
		log.ErrorLogger.Printf("Failed to set value in cache with key %s: %v", cacheKey, err)
	}

	return accounts, nil
}

func FetchTotalAccounts(userID uuid.UUID) (int64, error) {
	db := utils.GetDB()
	var count int64

	result := db.Model(&models.Account{}).Where("user_id = ?", userID).Count(&count)
	if result.Error != nil {
		return 0, result.Error
	}

	return count, nil
}

func FetchAccount(accountID string, userID string) (*models.Account, error) {
	db := utils.GetDB()
	account := models.Account{}
	// model:account:userID:accountID
	cacheKey := redis.BuildCacheKey("account", userID, accountID)

	var cachedResponse models.Account

	cacheHit, err := redis.GetEncryptedCache(cacheKey, &cachedResponse)
	if err != nil {
		log.ErrorLogger.Printf("Error fetching from cache with key %s: %v\nContinuing to use results from db", cacheKey, err)
	}

	if cacheHit {
		return &cachedResponse, nil
	}

	result := db.Where("id = ? AND user_id = ?", accountID, userID).First(&account)
	if result.Error != nil {
		return nil, result.Error
	}

	return &account, nil
}

func DeleteAccount(accountID string, userID string) (*models.Account, error) {
	db := utils.GetDB()
	tx := db.Begin()

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			log.ErrorLogger.Printf("Failed to delete account: %v", r)
		}
	}()

	account, err := FetchAccount(accountID, userID)
	if err != nil {
		return nil, fmt.Errorf("account not found")
	}

	if account == nil {
		return nil, fmt.Errorf("account not found")
	}

	if account.IsDefaultAccount {
		tx.Rollback()
		return nil, fmt.Errorf("cannot delete default account")
	}

	if err := tx.Where("id = ? AND user_id = ?", accountID, userID).Delete(account).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Where("account_id = ? AND user_id = ?", accountID, userID).Delete(&models.Transaction{}).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	cacheKey := redis.BuildCacheKey("accounts", userID, "*")
	if err := redis.InvalidateMultipleCaches([]string{cacheKey, redis.BuildCacheKey("users", userID)}); err != nil {
		log.ErrorLogger.Printf("Error invalidating cache: %v", err)
	}

	return account, nil
}
