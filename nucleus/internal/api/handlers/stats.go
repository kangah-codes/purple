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
	Data map[string]float64
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

	db := utils.GetDB()
	transactions := []models.Transaction{}
	planTransactions := []models.PlanTransaction{}
	userID, exists := c.Get("userID")
	now := time.Now()
	currentYear, currentMonth, _ := now.Date()
	currentLocation := now.Location()
	firstOfMonth := time.Date(currentYear, currentMonth, 1, 0, 0, 0, 0, currentLocation)
	lastOfMonth := firstOfMonth.AddDate(0, 1, -1)
	monthDays := utils.EachDayOfInterval(firstOfMonth, lastOfMonth)
	userDailyActivity := DailyActivity{Data: make(map[string]float64)}

	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Fetch all user transactions
	transactionsResult := db.Model(&models.Transaction{}).Where("user_id = ? and created_at >= ? and created_at <= ?", userID, firstOfMonth, lastOfMonth).Find(&transactions)
	if transactionsResult.Error != nil {
		log.ErrorLogger.Printf("Error fetching month transactions: %v", transactionsResult.Error)
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Error calculating daily activity", Data: nil})
		return
	}

	// Fetch all plan transactions
	planTransactionsResult := db.Model(&models.PlanTransaction{}).Where("user_id = ? and created_at >= ? and created_at <= ?", userID, firstOfMonth, lastOfMonth).Find(&planTransactions)
	if planTransactionsResult.Error != nil {
		log.ErrorLogger.Printf("Error fetching month plan transactions: %v", planTransactionsResult.Error)
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Error calculating daily activity", Data: nil})
		return
	}

	// Initialize daily activity data
	for _, day := range monthDays {
		dateStr := day.Format("02/01/06")
		userDailyActivity.Data[dateStr] = 0
	}

	// Sum up transactions for each day
	for _, transaction := range transactions {
		dateStr := transaction.CreatedAt.Format("02/01/06")
		if _, exists := userDailyActivity.Data[dateStr]; exists {
			userDailyActivity.Data[dateStr] += transaction.Amount
		}
	}

	// Sum up plan transactions for each day
	for _, planTransaction := range planTransactions {
		dateStr := planTransaction.CreatedAt.Format("02/01/06")
		if _, exists := userDailyActivity.Data[dateStr]; exists {
			userDailyActivity.Data[dateStr] += planTransaction.Amount
		}
	}

	response := types.Response{Status: http.StatusOK, Message: "Monthly stats fetched successfully", Data: gin.H{
		"DailyActivity": userDailyActivity.Data,
	}}

	c.JSON(http.StatusOK, response)
}
