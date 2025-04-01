package handlers

import (
	"context"
	"net/http"
	"nucleus/internal/api/repositories"
	"nucleus/internal/api/services"
	"nucleus/internal/api/types"
	"nucleus/internal/log"
	"nucleus/internal/models"

	"github.com/gin-gonic/gin"
)

type DailyActivity struct {
	Heatmap         map[string]float64
	TransactionData map[string][]models.Transaction
}

type StatsHandler struct {
	statsService *services.StatsService
}

func NewStatsHandler(statsService *services.StatsService) *StatsHandler {
	return &StatsHandler{statsService: statsService}
}

func (h *StatsHandler) CalculateMonthlyStats(c *gin.Context) {
	userID, _ := c.Get("userID")
	ctx := context.WithValue(c.Request.Context(), "userID", userID)
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")
	if startDate == "" || endDate == "" {
		c.JSON(http.StatusBadRequest, types.Response{Status: http.StatusBadRequest, Message: "Invalid request"})
		return
	}

	query := repositories.TransactionQuery{
		StartDate: &startDate,
		EndDate:   &endDate,
	}

	data, err := h.statsService.CalculateHeatmap(ctx, query)
	if err != nil {
		log.ErrorLogger.Errorf("Error calculating heatmap data: %v", err)
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to calculate data"})
		return
	}

	c.JSON(http.StatusOK, types.Response{Status: http.StatusOK, Message: "Monthly stats fetched successfully", Data: gin.H{
		"DailyActivity":   data.DailyActivity,
		"TransactionData": data.Transactions,
		"SpendOverview":   data.SpendOverview,
	}})
}
