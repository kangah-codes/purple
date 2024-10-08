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

func CreatePlan(c *gin.Context) {
	db := utils.GetDB()
	createPlan := types.CreatePlanDTO{}
	if err := c.ShouldBindJSON(&createPlan); err != nil {
		utils.InfoLogger.Println("Invalid client request: ", err)
		c.JSON(400, types.Response{Status: http.StatusBadRequest, Message: "Invalid request", Data: nil})
		return
	}

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(401, types.Response{Status: http.StatusUnauthorized, Message: "Unauthorized", Data: nil})
		return
	}

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
		utils.ErrorLogger.Println(result.Error)
		c.JSON(500, types.Response{Status: http.StatusInternalServerError, Message: "Failed to create plan", Data: nil})
		return
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
		utils.ErrorLogger.Printf("Error updating plan %s balance %v", planID, result.Error)
		c.JSON(500, types.Response{Status: http.StatusInternalServerError, Message: "Error updating plan balance", Data: nil})
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

	// Base query
	query := db.Model(&models.Plan{}).Where("user_id = ?", userID)

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
		utils.ErrorLogger.Printf("Error fetching plans: %v", result.Error)
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: fmt.Sprintf("Failed to fetch plans: %s", result.Error.Error()), Data: nil})
		return
	}

	totalPages := int((totalItems + int64(pageSize) - 1) / int64(pageSize))

	c.JSON(http.StatusOK, types.Response{
		Status:     http.StatusOK,
		Message:    "Plans fetched successfully",
		Data:       plans,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
		TotalItems: int(totalItems),
	})
}

func DeletePlan(c *gin.Context) {
	db := utils.GetDB()
	planID, _ := strconv.Atoi(c.Param("id"))
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(401, types.Response{Status: http.StatusUnauthorized, Message: "Unauthorized", Data: nil})
		return
	}

	plan := models.Plan{}
	if err := db.Where("id = ? AND user_id = ?", planID, userID).First(&plan).Error; err != nil {
		c.JSON(404, types.Response{Status: http.StatusNotFound, Message: "Plan could not be found"})
		return
	}

	if plan.UserId != userID {
		c.JSON(401, types.Response{Status: http.StatusUnauthorized, Message: "Cannot delete this plan"})
		return
	}

	result := db.Delete(&plan)
	if result.Error != nil {
		c.JSON(500, types.Response{Status: http.StatusInternalServerError, Message: "Error deleting plan"})
		return
	}

	c.JSON(200, types.Response{Status: http.StatusOK, Message: "Deleted plan successfully"})
}
