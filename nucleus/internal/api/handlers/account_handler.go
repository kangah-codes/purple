package handlers

import (
	"net/http"
	"nucleus/internal/api/services"
	"nucleus/internal/api/types"
	"nucleus/internal/log"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AccountHandler struct {
	accountService *services.AccountService
}

func NewAccountHandler(service *services.AccountService) *AccountHandler {
	return &AccountHandler{accountService: service}
}

func (h *AccountHandler) CreateAccount(c *gin.Context) {
	userID, _ := c.Get("userID")
	createAccount := types.CreateAccountDTO{}
	if err := c.ShouldBindJSON(&createAccount); err != nil {
		log.ErrorLogger.Println(err)
		c.JSON(http.StatusBadRequest, types.Response{Status: http.StatusBadRequest, Message: "Invalid request", Data: nil})
		return
	}

	account, err := h.accountService.CreateAccount(c.Request.Context(), createAccount, userID.(uuid.UUID))
	if err != nil {
		log.ErrorLogger.Println(err)
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to create account", Data: nil})
		return
	}

	c.JSON(http.StatusCreated, types.Response{Status: http.StatusCreated, Message: "Account created successfully", Data: gin.H{
		"ID":               account.ID,
		"Category":         account.Category,
		"Name":             account.Name,
		"Balance":          account.Balance,
		"IsDefaultAccount": account.IsDefaultAccount,
		"Currency":         account.Currency,
	}})
}

func (h *AccountHandler) UpdateUserAccount(c *gin.Context) {
	userID, _ := c.Get("userID")
	accountID := c.Param("accountID")
	updateAccount := types.UpdateAccountDTO{}
	if err := c.ShouldBindJSON(&updateAccount); err != nil {
		log.ErrorLogger.Println(err)
		c.JSON(http.StatusBadRequest, types.Response{Status: http.StatusBadRequest, Message: "Invalid request", Data: nil})
		return
	}

	account, err := h.accountService.UpdateAccount(c.Request.Context(), accountID, userID.(string), updateAccount)
	if err != nil {
		log.ErrorLogger.Println(err)
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to update account", Data: nil})
		return
	}

	c.JSON(http.StatusOK, types.Response{Status: http.StatusOK, Message: "Account updated successfully", Data: account})
}

func (h *AccountHandler) FetchUserAccounts(c *gin.Context) {
	userID, _ := c.Get("userID")
	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}
	pageSize, err := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	if err != nil || pageSize < 1 {
		pageSize = 10
	}

	count, err := h.accountService.FetchTotalAccounts(c.Request.Context(), userID.(uuid.UUID))
	if err != nil {
		log.ErrorLogger.Printf("Error fetching total user accounts: %v", err)
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to fetch accounts", Data: nil})
		return
	}

	accounts, totalItems, err := h.accountService.FetchPaginatedAccounts(c.Request.Context(), userID.(uuid.UUID), page, int(count))
	if err != nil {
		log.ErrorLogger.Println(err)
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to fetch accounts", Data: nil})
		return
	}

	totalPages := (totalItems + pageSize - 1) / pageSize
	response := types.Response{
		Status:     http.StatusOK,
		Message:    "Accounts fetched successfully",
		Data:       accounts,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
		TotalItems: int(totalItems),
	}

	c.JSON(http.StatusOK, response)
}

func (h *AccountHandler) DeleteUserAccount(c *gin.Context) {
	accountID := c.Param("id")
	userID, _ := c.Get("userID")

	account, err := h.accountService.DeleteAccount(c.Request.Context(), accountID, userID.(string))
	if err != nil {
		log.ErrorLogger.Printf("Failed to delete account: %v", err)

		if err.Error() == "cannot delete default account" {
			c.JSON(http.StatusForbidden, types.Response{Status: http.StatusForbidden, Message: err.Error(), Data: nil})
			return
		}

		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to delete account", Data: nil})
		return
	}

	c.JSON(http.StatusOK, types.Response{Status: http.StatusOK, Message: "Account deleted successfully", Data: account})
}
