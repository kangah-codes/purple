package handlers

import (
	"net/http"
	"nucleus/internal/utils"
	"strconv"

	"nucleus/internal/api/services"
	"nucleus/internal/api/types"
	"nucleus/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserHandler struct {
	userService        *services.UserService
	planService        *services.PlanService
	accountService     *services.AccountService
	transactionService *services.TransactionService
	authService        *services.AuthService
}

func NewUserHandler(userService *services.UserService, planService *services.PlanService, accountService *services.AccountService, transactionService *services.TransactionService, authService *services.AuthService) *UserHandler {
	return &UserHandler{
		userService:        userService,
		planService:        planService,
		accountService:     accountService,
		transactionService: transactionService,
		authService:        authService,
	}
}

func (h *UserHandler) DeleteUser(c *gin.Context) {
	db := utils.GetDB()
	userID := c.Param("id")
	parsedUserID, err := uuid.Parse(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, types.Response{Status: http.StatusBadRequest, Message: "Bad request"})
		return
	}

	user, err := h.userService.FetchUserByID(c.Request.Context(), parsedUserID)
	if user == nil {
		c.JSON(http.StatusNotFound, types.Response{Status: http.StatusNotFound, Message: "User not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Error fetching user"})
		return
	}

	tx := db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to delete user"})
		}
	}()

	// delete user
	err = h.userService.DeleteUser(c.Request.Context(), tx, user.ID)
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to delete user"})
		return
	}

	// delete user accounts
	err = h.accountService.DeleteByUserID(c.Request.Context(), tx, parsedUserID)
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to delete user"})
		return
	}

	// delete user plans
	err = h.planService.DeleteByUserID(c.Request.Context(), tx, parsedUserID)
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to delete user"})
		return
	}

	// delete user transactions
	err = h.transactionService.DeleteByUserID(c.Request.Context(), tx, parsedUserID)
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to delete user"})
		return
	}

	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to delete user"})
		return
	}

	c.JSON(http.StatusOK, types.Response{Status: http.StatusOK, Message: "User deleted successfully"})
}

func (h *UserHandler) FetchUser(c *gin.Context) {
	user := &models.User{}
	userID := c.Param("id")

	parsedUserID, err := uuid.Parse(userID)
	if err != nil {
		c.JSON(400, types.Response{Status: 400, Message: "Invalid request"})
		return
	}

	user, err = h.userService.FetchUserByID(c.Request.Context(), parsedUserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to fetch user"})
		return
	}

	c.JSON(200, types.Response{Status: 200, Message: "User fetched successfully", Data: *user})
}

func (h *UserHandler) FetchUsers(c *gin.Context) {
	db := utils.GetDB()
	users := []models.User{}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	offset := (page - 1) * pageSize

	var totalItems int64
	db.Model(&models.User{}).Count(&totalItems)

	result := db.Preload("Accounts").Preload("Transactions", func(db *gorm.DB) *gorm.DB {
		return db.Order("created_at desc").Limit(5)
	}).Preload("Plans", func(db *gorm.DB) *gorm.DB {
		return db.Order("created_at desc").Limit(5)
	}).Limit(pageSize).Offset(offset).Find(&users)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to fetch users"})
		return
	}

	totalPages := int((totalItems + int64(pageSize) - 1) / int64(pageSize))

	c.JSON(200, types.Response{
		Status:     200,
		Message:    "Users fetched successfully",
		Data:       users,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
		TotalItems: int(totalItems),
	})
}

func (h *UserHandler) UpdateUser(c *gin.Context) {
	db := utils.GetDB()
	user := models.User{}
	userID := c.Param("id")

	result := db.First(&user, userID)
	if result.Error != nil {
		c.JSON(404, types.Response{Status: 404, Message: "User not found"})
		return
	}

	update := types.UpdateUserAccountDTO{}
	if err := c.ShouldBindJSON(&update); err != nil {
		c.JSON(http.StatusBadRequest, types.Response{Status: http.StatusBadRequest, Message: "Invalid request"})
		return
	}

	user.Username = update.Username

	result = db.Save(&user)
	if result.Error != nil {
		if result.Error == gorm.ErrDuplicatedKey {
			c.JSON(400, types.Response{Status: http.StatusConflict, Message: "User already exists with these details"})
			return
		}
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to update user"})
		return
	}

	c.JSON(200, types.Response{Status: 200, Message: "User updated successfully", Data: user})
}

func (h *UserHandler) CheckAvailableUsername(c *gin.Context) {
	checkUsername := types.CheckAvailableUsernameDTO{}
	if err := c.ShouldBindJSON(&checkUsername); err != nil {
		c.JSON(http.StatusBadRequest, types.Response{Status: http.StatusBadRequest, Message: "Invalid request"})
		return
	}

	exists, err := h.authService.CheckAvailableUsername(c.Request.Context(), checkUsername.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Internal Server Error"})
		return
	}

	if !exists {
		c.JSON(409, types.Response{Status: http.StatusConflict, Message: "Username not available"})
		return
	}

	c.JSON(409, types.Response{Status: http.StatusConflict, Message: "Username not available"})
}
