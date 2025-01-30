package handlers

import (
	"net/http"
	"nucleus/internal/api/types"
	"nucleus/internal/models"
	"nucleus/log"
	"nucleus/utils"
	"time"

	"github.com/gin-gonic/gin"
)

type DailyActivity struct {
	Heatmap         map[string]float64
	TransactionData map[string][]models.Transaction
}

func CalculateMonthlyStats(c *gin.Context) {
	/**
	Calculate the total amount of money each user has inputed each day for each day of the month
	returns the data in this format {key: 'dd/mm/yy', value: number}
	Fetch all user transactions in the month
	Fetch all plan transactions in the month
	get all the days of the month
	for each day, add up the total transactions & plantransactions
	**/

	// get start and end date from query params
	// if not provided, default to current month
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	db := utils.GetDB()
	transactions := []models.Transaction{}
	planTransactions := []models.PlanTransaction{}
	userID, exists := c.Get("userID")

	var startQueryDate, endQueryDate time.Time
	if startDate == "" || endDate == "" {
		now := time.Now()
		currentYear, currentMonth, _ := now.Date()
		currentLocation := now.Location()
		startQueryDate = time.Date(currentYear, currentMonth, 1, 0, 0, 0, 0, currentLocation)
		endQueryDate = startQueryDate.AddDate(0, 1, -1)
	} else {
		var err error
		startQueryDate, err = time.Parse("02/01/06", startDate)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid start_date format"})
			return
		}
		endQueryDate, err = time.Parse("02/01/06", endDate)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid end_date format"})
			return
		}
	}

	monthDays := utils.EachDayOfInterval(startQueryDate, endQueryDate)
	userDailyActivity := DailyActivity{Heatmap: make(map[string]float64)}

	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Fetch all user transactions
	transactionsResult := db.Model(&models.Transaction{}).Select("id, amount, created_at, type, category, currency").Where("user_id = ? and created_at >= ? and created_at <= ?", userID, startQueryDate, endQueryDate).Find(&transactions)
	if transactionsResult.Error != nil {
		log.ErrorLogger.Printf("Error fetching month transactions: %v", transactionsResult.Error)
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Error calculating daily activity", Data: nil})
		return
	}

	// Fetch all plan transactions
	planTransactionsResult := db.Model(&models.PlanTransaction{}).Where("user_id = ? and created_at >= ? and created_at <= ?", userID, startQueryDate, endQueryDate).Find(&planTransactions)
	if planTransactionsResult.Error != nil {
		log.ErrorLogger.Printf("Error fetching month plan transactions: %v", planTransactionsResult.Error)
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Error calculating daily activity", Data: nil})
		return
	}

	// Initialize daily activity data
	for _, day := range monthDays {
		dateStr := day.Format("02/01/06")
		userDailyActivity.Heatmap[dateStr] = 0
	}

	// Sum up transactions for each day
	for _, transaction := range transactions {
		dateStr := transaction.CreatedAt.Format("02/01/06")
		if _, exists := userDailyActivity.Heatmap[dateStr]; exists {
			userDailyActivity.Heatmap[dateStr] += transaction.Amount
		}
	}

	// Sum up plan transactions for each day
	for _, planTransaction := range planTransactions {
		dateStr := planTransaction.CreatedAt.Format("02/01/06")
		if _, exists := userDailyActivity.Heatmap[dateStr]; exists {
			userDailyActivity.Heatmap[dateStr] += planTransaction.Amount
		}
	}

	response := types.Response{Status: http.StatusOK, Message: "Monthly stats fetched successfully", Data: gin.H{
		"DailyActivity":   userDailyActivity.Heatmap,
		"TransactionData": transactions,
		"SpendOverview":   utils.CalculateIncomeAndExpenseByCurrency(transactions),
	}}

	c.JSON(http.StatusOK, response)
}
