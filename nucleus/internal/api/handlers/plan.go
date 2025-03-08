package handlers

import (
	"fmt"
	"math"
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
	"gorm.io/gorm"
)

func CreatePlan(c *gin.Context) {
	db := utils.GetDB()
	createPlan := types.CreatePlanDTO{}
	if err := c.ShouldBindJSON(&createPlan); err != nil {
		log.InfoLogger.Println("Invalid client request: ", err)
		c.JSON(400, types.Response{Status: http.StatusBadRequest, Message: "Invalid request", Data: nil})
		return
	}

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(401, types.Response{Status: http.StatusInternalServerError, Message: "User is not authorised", Data: nil})
		return
	}

	// build cache key
	cacheKey := redis.BuildCacheKey("plans", fmt.Sprintf("%v", userID), "*")
	plan := models.Plan{
		UserId:           userID.(uuid.UUID),
		Type:             createPlan.Type,
		Category:         createPlan.Category,
		Target:           createPlan.Target,
		Balance:          0,
		StartDate:        utils.FormatStrToDateTime(createPlan.StartDate),
		EndDate:          utils.FormatStrToDateTime(createPlan.EndDate),
		DepositFrequency: createPlan.DepositFrequency,
		PushNotification: createPlan.PushNotification,
		Name:             createPlan.Name,
		Currency:         createPlan.Currency,
	}

	result := db.Create(&plan)
	if result.Error != nil {
		log.ErrorLogger.Println(result.Error)
		c.JSON(500, types.Response{Status: http.StatusInternalServerError, Message: "Failed to create plan", Data: nil})
		return
	}

	if err := redis.InvalidateMultipleCaches([]string{cacheKey, redis.BuildCacheKey("users", fmt.Sprintf("%v", userID))}); err != nil {
		log.ErrorLogger.Printf("Error invalidating cache with key %s: %v", cacheKey, err)
	}

	c.JSON(201, types.Response{Status: http.StatusCreated, Message: "Plan created", Data: plan})
}

func UpdatePlanBalance(c *gin.Context) {
	db := utils.GetDB()
	updatePlanBalance := types.UpdatePlanBalanceDTO{}
	if err := c.ShouldBindJSON(&updatePlanBalance); err != nil {
		c.JSON(400, types.Response{Status: http.StatusBadRequest, Message: "Invalid request", Data: nil})
		return
	}

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(401, types.Response{Status: http.StatusUnauthorized, Message: "Unauthorized", Data: nil})
		return
	}

	planID, _ := c.Params.Get("planID")
	plan := models.Plan{}
	result := db.First(&plan, planID)
	if result.Error != nil {
		c.JSON(404, types.Response{Status: http.StatusNotFound, Message: "Plan not found", Data: nil})
		return
	}

	if plan.UserId != userID {
		c.JSON(401, types.Response{Status: http.StatusUnauthorized, Message: "Cannot update this plan balance", Data: nil})
		return
	}

	plan.Balance = updatePlanBalance.Balance
	result = db.Save(&plan)
	if result.Error != nil {
		log.ErrorLogger.Printf("Error updating plan %s balance %v", planID, result.Error)
		c.JSON(500, types.Response{Status: http.StatusInternalServerError, Message: "Error updating plan balance", Data: nil})
	}

	cacheKey := redis.BuildCacheKey("plans", fmt.Sprintf("%v", userID), "*")
	if err := redis.InvalidateCache(cacheKey); err != nil {
		log.ErrorLogger.Printf("Error invalidating cache with key %s: %v", cacheKey, err)
	}

	c.JSON(200, types.Response{Status: http.StatusOK, Message: "Updated plan balance successfully", Data: plan})
}

func FetchPlans(c *gin.Context) {
	db := utils.GetDB()
	plans := []models.Plan{}
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(401, types.Response{Status: http.StatusUnauthorized, Message: "Unauthorized", Data: nil})
		return
	}

	// Access query parameters
	name := c.Query("name")
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")
	planType := c.Query("type")

	// Pagination parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	offset := (page - 1) * pageSize

	// build cache key
	cacheKey := redis.BuildCacheKey("plans", fmt.Sprintf("%v", userID), fmt.Sprintf("%d", page), fmt.Sprintf("%d", pageSize), name, startDate, endDate, planType)
	var cachedResponse types.Response
	cacheHit, err := redis.GetEncryptedCache(cacheKey, &cachedResponse)

	if err != nil {
		log.ErrorLogger.Printf("Error fetching data from cache: %v\nContinuing to use results from db", err)
	}

	if cacheHit {
		c.JSON(http.StatusOK, cachedResponse)
		return
	}

	// Base query
	query := db.Preload("Transactions", func(db *gorm.DB) *gorm.DB {
		return db.Order("created_at desc")
	}).Model(&models.Plan{}).Where("user_id = ?", userID)

	// Apply filters based on query parameters
	if name != "" {
		query = query.Where("name LIKE ?", "%"+name+"%")
	}
	if startDate != "" {
		query = query.Where("start_date >= ?", startDate)
	}
	if endDate != "" {
		query = query.Where("end_date <= ?", endDate)
	}
	if planType != "" {
		query = query.Where("type = ?", planType)
	}

	// Count total items
	var totalItems int64
	query.Count(&totalItems)

	// Fetch plans with pagination
	result := query.Order("created_at desc").Limit(pageSize).Offset(offset).Find(&plans)
	if result.Error != nil {
		log.ErrorLogger.Printf("Error fetching plans: %v", result.Error)
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: fmt.Sprintf("Failed to fetch plans: %s", result.Error.Error()), Data: nil})
		return
	}

	totalPages := int((totalItems + int64(pageSize) - 1) / int64(pageSize))
	response := types.Response{
		Status:     http.StatusOK,
		Message:    "Plans fetched successfully",
		Data:       plans,
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

func DeletePlan(c *gin.Context) {
	db := utils.GetDB()
	planID, _ := c.Params.Get("planID")
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(401, types.Response{Status: http.StatusUnauthorized, Message: "Unauthorized", Data: nil})
		return
	}

	cacheKey := redis.BuildCacheKey("plans", fmt.Sprintf("%v", userID), "*")

	plan := models.Plan{}
	if err := db.Where("id = ? AND user_id = ?", planID, userID).First(&plan).Error; err != nil {
		log.ErrorLogger.Printf("Error fetching plan: %v", err)
		c.JSON(404, types.Response{Status: http.StatusNotFound, Message: "Plan could not be found"})
		return
	}

	if plan.UserId != userID {
		log.ErrorLogger.Printf("User %s is not authorized to delete plan %d", userID, plan.ID)
		c.JSON(401, types.Response{Status: http.StatusUnauthorized, Message: "Cannot delete this plan"})
		return
	}

	result := db.Delete(&plan)
	if result.Error != nil {
		log.ErrorLogger.Printf("Error deleting plan: %v", result.Error)
		c.JSON(500, types.Response{Status: http.StatusInternalServerError, Message: "Error deleting plan"})
		return
	}

	if err := redis.InvalidateMultipleCaches([]string{cacheKey, redis.BuildCacheKey("users", fmt.Sprintf("%s", userID))}); err != nil {
		log.ErrorLogger.Printf("Error invalidating cache with key %s: %v", cacheKey, err)
	}

	c.JSON(200, types.Response{Status: http.StatusOK, Message: "Deleted plan successfully"})
}

func AddPlanTransaction(c *gin.Context) {
	db := utils.GetDB()
	transaction := types.CreatePlanTransaction{}
	var account models.Account

	if err := c.ShouldBindJSON(&transaction); err != nil {
		log.ErrorLogger.Printf("Invalid client request: %v", err)
		c.JSON(400, types.Response{Status: http.StatusBadRequest, Message: "Invalid request", Data: nil})
		return
	}

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(401, types.Response{Status: http.StatusUnauthorized, Message: "Unauthorized", Data: nil})
		return
	}

	// build cache keys
	planCacheKey := redis.BuildCacheKey("plans", fmt.Sprintf("%v", userID), "*")
	transactionCacheKey := redis.BuildCacheKey("transactions", fmt.Sprintf("%v", userID), "*")

	// Start database transaction
	tx := db.Begin()
	if tx.Error != nil {
		log.ErrorLogger.Printf("Error starting transaction: %v", tx.Error)
		c.JSON(500, types.Response{Status: http.StatusInternalServerError, Message: "Error processing request", Data: nil})
		return
	}

	planID, _ := c.Params.Get("planID")
	plan := models.Plan{}
	result := tx.Where("id = ? AND user_id = ?", planID, userID).First(&plan)
	if result.Error != nil {
		c.JSON(404, types.Response{Status: http.StatusNotFound, Message: "Plan not found", Data: nil})
		return
	}

	if transaction.DebitAccountId != uuid.Nil {
		if err := tx.Where("id = ? and user_id = ?", transaction.DebitAccountId, userID).First(&account).Error; err != nil {
			log.ErrorLogger.Printf("Error fetching account: %v", err)
			c.JSON(404, types.Response{Status: http.StatusNotFound, Message: "Account not found", Data: nil})
			return
		}

		// if the account & plan currencies don't match, throw an error
		// maybe make this a premium faeture? with currency conversion
		if account.Currency != plan.Currency {
			tx.Rollback()
			c.JSON(400, types.Response{Status: http.StatusBadRequest, Message: "Account currency does not match plan currency", Data: nil})
			return
		}

		// debit the account by the transaction amount
		account.Balance -= transaction.Amount
		if err := tx.Save(&account).Error; err != nil {
			tx.Rollback()
			log.ErrorLogger.Printf("Error updating account balance: %v", err)
			c.JSON(500, types.Response{Status: http.StatusInternalServerError, Message: "Error updating account balance", Data: nil})
			return
		}

		// create emoji for plan type
		var planEmoji string
		if plan.Type == "saving" {
			planEmoji = "💰"
		} else {
			planEmoji = "📉"
		}

		// create a transaction for the account
		accTransaction := models.Transaction{
			AccountId:   account.ID,
			UserId:      userID.(uuid.UUID),
			Type:        "debit",
			Amount:      transaction.Amount,
			Note:        transaction.Note,
			Category:    fmt.Sprintf("%v %v", planEmoji, plan.Name),
			FromAccount: account.ID,
			ToAccount:   uuid.Nil,
			Currency:    account.Currency,
		}

		if err := tx.Create(&accTransaction).Error; err != nil {
			tx.Rollback()
			log.ErrorLogger.Printf("Error creating account transaction: %v", err)

			if err := redis.InvalidateMultipleCaches([]string{planCacheKey, transactionCacheKey}); err != nil {
				log.ErrorLogger.Printf("Error invalidating cache with key: %v", err)
			}
			c.JSON(500, types.Response{Status: http.StatusInternalServerError, Message: "Error creating account transaction", Data: nil})
			return
		}

	}

	if plan.UserId != userID {
		c.JSON(401, types.Response{Status: http.StatusUnauthorized, Message: "Cannot add transaction to this plan", Data: nil})
		return
	}

	planTransaction := models.PlanTransaction{
		Amount: transaction.Amount,
		Note:   transaction.Note,
		UserId: userID.(uuid.UUID),
		PlanId: plan.ID,
	}

	if transaction.DebitAccountId != uuid.Nil {
		planTransaction.DebitAccountId = &transaction.DebitAccountId
		planTransaction.DebitAccount = account
	}

	// Create plan transaction within the database transaction
	if err := tx.Create(&planTransaction).Error; err != nil {
		tx.Rollback()
		log.ErrorLogger.Printf("Error creating plan transaction: %v", err)
		c.JSON(500, types.Response{Status: http.StatusInternalServerError, Message: "Error creating plan transaction", Data: nil})
		return
	}

	// Update plan balance within the same database transaction
	plan.Balance += transaction.Amount
	if err := tx.Save(&plan).Error; err != nil {
		tx.Rollback()
		log.ErrorLogger.Printf("Error updating plan balance: %v", err)
		c.JSON(500, types.Response{Status: http.StatusInternalServerError, Message: "Error updating plan balance", Data: nil})
		return
	}

	// Commit the transaction
	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		log.ErrorLogger.Printf("Error committing transaction: %v", err)
		c.JSON(500, types.Response{Status: http.StatusInternalServerError, Message: "Error processing request", Data: nil})
		return
	}

	if err := redis.InvalidateMultipleCaches([]string{planCacheKey, transactionCacheKey}); err != nil {
		log.ErrorLogger.Printf("Error invalidating cache with key: %v", err)
	}

	c.JSON(201, types.Response{Status: http.StatusCreated, Message: "Plan transaction created", Data: planTransaction})
}

func FetchPlan(c *gin.Context) {
	db := utils.GetDB()
	planID := c.Param("planID")
	userID, exists := c.Get("userID")

	if !exists {
		c.JSON(401, types.Response{Status: http.StatusUnauthorized, Message: "Unauthorized", Data: nil})
		return
	}

	if _, err := uuid.Parse(planID); err != nil {
		log.ErrorLogger.Println("Invalid UUID", planID, err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid UUID"})
		return
	}

	cacheKey := redis.BuildCacheKey("plans", fmt.Sprintf("%v", userID), fmt.Sprintf("%v", planID))
	var cachedResponse types.Response
	cacheHit, err := redis.GetEncryptedCache(cacheKey, &cachedResponse)
	if err != nil {
		log.ErrorLogger.Printf("Error fetching from cache with key %s: %v\nContinuing to use results from db", cacheKey, err)
	}

	if cacheHit {
		c.JSON(http.StatusOK, cachedResponse)
		return
	}

	plan := models.Plan{}
	result := db.Preload("Transactions", func(db *gorm.DB) *gorm.DB {
		return db.Omit("plan", "user").Order("created_at desc")
	}).Where("id = ? and user_id = ?", planID, userID).First(&plan)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(404, types.Response{Status: http.StatusNotFound, Message: "Plan not found", Data: nil})
		} else {
			log.ErrorLogger.Println("Error fetching plan", result.Error)
			c.JSON(500, types.Response{Status: http.StatusInternalServerError, Message: "Error fetching plan", Data: nil})
		}

		return
	}

	// we shouldn't even get here, but I'll keep this code in :)
	if plan.UserId != userID {
		c.JSON(401, types.Response{Status: http.StatusUnauthorized, Message: "Cannot delete this plan"})
		return
	}

	response := types.Response{Status: http.StatusOK, Message: "Plan fetched successfully", Data: plan}

	if err := redis.SetEncryptedCache(cacheKey, response, 30*time.Minute); err != nil {
		log.ErrorLogger.Printf("Failed to set value in cache with key %s: %v", cacheKey, err)
	}

	c.JSON(200, response)
}

func CalculatePlanOnTrack(c *gin.Context) {
	db := utils.GetDB()
	planID := c.Param("planID")
	userID, exists := c.Get("userID")

	if !exists {
		c.JSON(401, types.Response{Status: http.StatusUnauthorized, Message: "Unauthorized", Data: nil})
		return
	}

	if _, err := uuid.Parse(planID); err != nil {
		log.ErrorLogger.Println("Invalid UUID", planID, err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid UUID"})
		return
	}

	plan := models.Plan{}
	result := db.Preload("Transactions", func(db *gorm.DB) *gorm.DB {
		return db.Order("created_at desc")
	}).Where("id = ?", planID).First(&plan)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(404, types.Response{Status: http.StatusNotFound, Message: "Plan not found", Data: nil})
		} else {
			log.ErrorLogger.Println("Error fetching plan", result.Error)
			c.JSON(500, types.Response{Status: http.StatusInternalServerError, Message: "Error fetching plan", Data: nil})
		}
		return
	}

	if plan.UserId != userID {
		c.JSON(401, types.Response{Status: http.StatusUnauthorized, Message: "Cannot access this plan"})
		return
	}

	// Calculate basic metrics
	now := time.Now()
	totalDuration := plan.EndDate.Sub(plan.StartDate)
	elapsedDuration := now.Sub(plan.StartDate)
	daysRemaining := plan.EndDate.Sub(now).Hours() / 24
	if daysRemaining < 0 {
		daysRemaining = 0
	}

	// Calculate savings progress
	var amountSaved float64
	var lastTransactionDate time.Time
	var longestStreak int
	var currentStreak int
	lastDepositDate := plan.StartDate

	for i, transaction := range plan.Transactions {
		amountSaved += transaction.Amount

		if i == 0 {
			lastTransactionDate = transaction.CreatedAt
		}

		// Calculate deposit streaks
		if i > 0 {
			daysBetweenDeposits := transaction.CreatedAt.Sub(lastDepositDate).Hours() / 24
			var expectedInterval float64
			switch plan.DepositFrequency {
			case "daily":
				expectedInterval = 1
			case "weekly":
				expectedInterval = 7
			case "bi-weekly":
				expectedInterval = 14
			case "monthly":
				expectedInterval = 30
			case "yearly":
				expectedInterval = 365
			default:
				expectedInterval = 1
			}

			if daysBetweenDeposits <= expectedInterval*1.5 { // Allow 50% buffer
				currentStreak++
				if currentStreak > longestStreak {
					longestStreak = currentStreak
				}
			} else {
				currentStreak = 1
			}
		}

		lastDepositDate = transaction.CreatedAt
	}

	amountRemaining := plan.Target - amountSaved
	percentageSaved := (amountSaved / plan.Target) * 100

	// Calculate expected progress based on time elapsed
	expectedProgress := (elapsedDuration.Hours() / totalDuration.Hours()) * 100
	progressDifference := percentageSaved - expectedProgress

	// Calculate daily savings target based on deposit frequency
	var depositInterval float64
	switch plan.DepositFrequency {
	case "daily":
		depositInterval = 1
	case "weekly":
		depositInterval = 7
	case "bi-weekly":
		depositInterval = 14
	case "monthly":
		depositInterval = 30
	case "yearly":
		depositInterval = 365
	default:
		depositInterval = 1
	}

	periodsSaved := daysRemaining / depositInterval
	if periodsSaved <= 0 {
		periodsSaved = 1
	}
	periodicSavingsTarget := amountRemaining / periodsSaved

	// Calculate savings pace and status
	var savingsPace string
	var onTrack bool
	if progressDifference >= 5 {
		savingsPace = "ahead"
		onTrack = true
	} else if progressDifference <= -5 {
		savingsPace = "behind"
		onTrack = false
	} else {
		savingsPace = "on_track"
		onTrack = true
	}

	// Calculate next milestone
	milestones := []float64{25, 50, 75, 100}
	var nextMilestone float64
	for _, milestone := range milestones {
		if percentageSaved < milestone {
			nextMilestone = milestone
			break
		}
	}

	// Calculate projected completion
	averageSavingsPerDay := amountSaved / (elapsedDuration.Hours() / 24)
	var projectedCompletionDate time.Time
	if averageSavingsPerDay > 0 {
		daysToComplete := amountRemaining / averageSavingsPerDay
		projectedCompletionDate = now.AddDate(0, 0, int(daysToComplete))
	} else {
		projectedCompletionDate = plan.EndDate
	}

	response := gin.H{
		"amount_saved":         amountSaved,
		"amount_remaining":     amountRemaining,
		"percentage_saved":     math.Round(percentageSaved*100) / 100,
		"days_remaining":       math.Round(daysRemaining*100) / 100,
		"periodic_target":      math.Round(periodicSavingsTarget*100) / 100,
		"deposit_frequency":    plan.DepositFrequency,
		"on_track":             onTrack,
		"savings_pace":         savingsPace,
		"progress_difference":  math.Round(progressDifference*100) / 100,
		"next_milestone":       nextMilestone,
		"longest_streak":       longestStreak,
		"current_streak":       currentStreak,
		"projected_completion": projectedCompletionDate,
		"last_deposit":         lastTransactionDate,
	}

	c.JSON(200, types.Response{
		Status:  http.StatusOK,
		Message: "Plan progress calculated successfully",
		Data:    response,
	})
}
