package handlers

import (
	"net/http"
	"nucleus/internal/api/services"
	"nucleus/internal/api/types"
	"nucleus/internal/log"
	"nucleus/internal/models"

	"github.com/gin-gonic/gin"
)

type AnalyticsHandler struct {
	service *services.AnalyticsService
}

func NewAnalyticsHandler(service *services.AnalyticsService) *AnalyticsHandler {
	return &AnalyticsHandler{service: service}
}

func (h *AnalyticsHandler) CreateEvent(c *gin.Context) {
	createEvent := types.CreateAnalyticsEventDTO{}
	if err := c.ShouldBindJSON(&createEvent); err != nil {
		log.ErrorLogger.Errorln(err)
		c.JSON(http.StatusBadRequest, types.Response{Status: http.StatusBadRequest, Message: "Invalid request", Data: nil})
		return
	}
	err := h.service.CreateAnalyticsEvent(c.Request.Context(), &models.AnalyticsEvent{
		ID:         createEvent.ID,
		TrackingId: createEvent.TrackingId,
		Type:       createEvent.Type,
		Payload:    createEvent.Payload,
		RetryCount: *createEvent.RetryCount,
		CreatedAt:  createEvent.CreatedAt,
	})
	if err != nil {
		log.ErrorLogger.Errorln(err)
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to create event", Data: nil})
		return
	}

	c.JSON(http.StatusCreated, types.Response{Status: http.StatusCreated, Message: "Event created successfully", Data: gin.H{}})
}
