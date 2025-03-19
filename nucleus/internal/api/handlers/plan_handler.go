package handlers

import (
	"math"
	"net/http"
	"nucleus/internal/api/services"
	"nucleus/internal/api/types"
	"nucleus/internal/log"
	"nucleus/internal/models"
	"nucleus/internal/utils"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PlanHandler struct {
	planService *services.PlanService
}

func NewPlanHandler(service *services.PlanService) *PlanHandler {
	return &PlanHandler{planService: service}
}

func (h *PlanHandler) CreatePlan(c *gin.Context) {
	createPlan := types.CreatePlanDTO{}
	if err := c.ShouldBindJSON(&createPlan); err != nil {
		log.InfoLogger.Println("Invalid client request: ", err)
		c.JSON(http.StatusBadRequest, types.Response{Status: http.StatusBadRequest, Message: "Invalid request", Data: nil})
		return
	}

	userID, _ := c.Get("userID")
	plan, err := h.planService.CreatePlan(c.Request.Context(), createPlan, userID.(uuid.UUID))
	if err != nil {
		log.ErrorLogger.Errorln(err)
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to create plan", Data: nil})
		return
	}

	c.JSON(http.StatusCreated, types.Response{Status: http.StatusCreated, Message: "Plan created", Data: plan})
}

func (h *PlanHandler) UpdatePlanBalance(c *gin.Context) {
	updatePlanBalance := types.UpdatePlanBalanceDTO{}
	if err := c.ShouldBindJSON(&updatePlanBalance); err != nil {
		c.JSON(http.StatusBadRequest, types.Response{Status: http.StatusBadRequest, Message: "Invalid request", Data: nil})
		return
	}

	userID, _ := c.Get("userID")
	planID, _ := c.Params.Get("planID")
	planUUID, err := uuid.Parse(planID)
	if err != nil {
		c.JSON(http.StatusBadRequest, types.Response{Status: http.StatusBadRequest, Message: "Invalid plan id", Data: nil})
		return
	}

	plan, err := h.planService.UpdatePlanBalance(c.Request.Context(), planUUID, userID.(uuid.UUID), updatePlanBalance.Balance)
	if err != nil {
		log.ErrorLogger.Errorln(err)
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to update plan balance", Data: nil})
		return
	}

	c.JSON(http.StatusOK, types.Response{Status: http.StatusOK, Message: "Updated plan balance successfully", Data: plan})
}

func (h *PlanHandler) FetchUserPlans(c *gin.Context) {
	userID, _ := c.Get("userID")
	name := c.Query("name")
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")
	planType := c.Query("type")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	plans, totalItems, err := h.planService.FetchPaginatedPlans(c.Request.Context(), userID.(uuid.UUID), services.PlanQuery{
		Name:      name,
		StartDate: startDate,
		EndDate:   endDate,
		PlanType:  planType,
	}, page, pageSize)
	if err != nil {
		log.ErrorLogger.Errorln("Error fetching user plans: %v", err)
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusUnauthorized, Message: "Unauthorized", Data: nil})
		return
	}

	totalPages := int((int64(totalItems) + int64(pageSize) - 1) / int64(pageSize))
	response := types.Response{
		Status:     http.StatusOK,
		Message:    "Plans fetched successfully",
		Data:       plans,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
		TotalItems: totalItems,
	}

	c.JSON(http.StatusOK, response)
}

func (h *PlanHandler) DeletePlan(c *gin.Context) {
	planID, _ := c.Params.Get("planID")
	parsedPlanID, err := uuid.Parse(planID)
	if err != nil {
		c.JSON(http.StatusNotFound, types.Response{Status: http.StatusNotFound, Message: "Plan not found"})
		return
	}

	err = h.planService.DeletePlan(c.Request.Context(), parsedPlanID)
	if err != nil {
		log.ErrorLogger.Errorf("Error deleting plan: %v", err)
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Error deleting plan"})
		return
	}

	c.JSON(http.StatusOK, types.Response{Status: http.StatusOK, Message: "Deleted plan successfully"})
}

func (h *PlanHandler) AddPlanTransaction(c *gin.Context) {
	transaction := types.CreatePlanTransaction{}
	if err := c.ShouldBindJSON(&transaction); err != nil {
		log.ErrorLogger.Errorf("Invalid client request: %v", err)
		c.JSON(http.StatusBadRequest, types.Response{Status: http.StatusBadRequest, Message: "Invalid request", Data: nil})
		return
	}

	userID, _ := c.Get("userID")
	planID, _ := c.Params.Get("planID")

	userUUID := userID.(uuid.UUID)
	planUUID, err := uuid.Parse(planID)
	if err != nil {
		c.JSON(http.StatusBadRequest, types.Response{Status: http.StatusBadRequest, Message: "Invalid plan ID format", Data: nil})
		return
	}

	planTransaction, err := h.planService.AddPlanTransaction(c.Request.Context(), userUUID, planUUID, transaction)
	if err != nil {
		switch err {
		case services.ErrPlanNotFound:
			c.JSON(http.StatusNotFound, types.Response{Status: http.StatusNotFound, Message: "Plan not found", Data: nil})
		case services.ErrAccountNotFound:
			c.JSON(http.StatusNotFound, types.Response{Status: http.StatusNotFound, Message: "Account not found", Data: nil})
		case services.ErrUnauthAccess:
			c.JSON(http.StatusUnauthorized, types.Response{Status: http.StatusUnauthorized, Message: "Cannot add transaction to this plan", Data: nil})
		case services.ErrCurrencyMismatch:
			c.JSON(http.StatusBadRequest, types.Response{Status: http.StatusBadRequest, Message: "Account currency does not match plan currency", Data: nil})
		default:
			c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Error processing request", Data: nil})
		}
		return
	}

	c.JSON(http.StatusCreated, types.Response{Status: http.StatusCreated, Message: "Plan transaction created", Data: planTransaction})
}

func (h *PlanHandler) FetchPlan(c *gin.Context) {
	planID := c.Param("planID")
	userID, _ := c.Get("userID")
	parsedPlanID, err := uuid.Parse(planID)
	if err != nil {
		c.JSON(http.StatusNotFound, types.Response{Status: http.StatusNotFound, Message: "Plan not found"})
		return
	}

	plan, err := h.planService.FetchPlan(c.Request.Context(), parsedPlanID, userID.(uuid.UUID))
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, types.Response{Status: http.StatusNotFound, Message: "Plan not found"})
		} else {
			c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Error fetching plan"})
		}
		return
	}

	c.JSON(http.StatusOK, types.Response{Status: http.StatusOK, Message: "Plan fetched successfully", Data: plan})
}

// TODO: come back to this
func CalculatePlanOnTrack(c *gin.Context) {
	db := utils.GetDB()
	planID := c.Param("planID")
	userID, exists := c.Get("userID")

	if !exists {
		c.JSON(401, types.Response{Status: http.StatusUnauthorized, Message: "Unauthorized", Data: nil})
		return
	}

	if _, err := uuid.Parse(planID); err != nil {
		log.ErrorLogger.Errorln("Invalid UUID", planID, err)
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
			log.ErrorLogger.Errorln("Error fetching plan", result.Error)
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
