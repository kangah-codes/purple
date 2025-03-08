package handlers

import (
	"net/http"
	"nucleus/internal/api/services"
	"nucleus/internal/api/types"
	"nucleus/log"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func CreateAccount(c *gin.Context) {
	userID, _ := c.Get("userID")
	createAccount := types.CreateAccountDTO{}
	if err := c.ShouldBindJSON(&createAccount); err != nil {
		log.ErrorLogger.Println(err)
		c.JSON(400, types.Response{Status: 400, Message: "Invalid request", Data: nil})
		return
	}

	account, err := services.CreateAccount(createAccount, userID.(uuid.UUID))
	if err != nil {
		log.ErrorLogger.Println(err)
		c.JSON(500, types.Response{Status: http.StatusInternalServerError, Message: "Failed to create account", Data: nil})
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

func UpdateUserAccount(c *gin.Context) {
	userID, _ := c.Get("userID")
	accountID, _ := c.Params.Get("accountID")
	updateAccount := types.UpdateAccountDTO{}
	if err := c.ShouldBindJSON(&updateAccount); err != nil {
		log.ErrorLogger.Println(err)
		c.JSON(400, types.Response{Status: 400, Message: "Invalid request", Data: nil})
		return
	}

	account, err := services.UpdateAccount(accountID, userID.(string), updateAccount)
	if err != nil {
		log.ErrorLogger.Println(err)
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to update account", Data: nil})
		return
	}

	c.JSON(http.StatusOK, types.Response{Status: http.StatusOK, Message: "Account updated successfully", Data: account})
}

func FetchUserAccounts(c *gin.Context) {
	userID, _ := c.Get("userID")
	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}
	pageSize, err := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	if err != nil || pageSize < 1 {
		pageSize = 10
	}

	totalItems, err := services.FetchTotalAccounts(userID.(uuid.UUID))
	if err != nil {
		log.ErrorLogger.Println(err)
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to fetch accounts", Data: nil})
		return
	}

	accounts, err := services.FetchPaginatedAccounts(userID.(uuid.UUID), page, int(totalItems))
	if err != nil {
		log.ErrorLogger.Println(err)
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to fetch accounts", Data: nil})
		return
	}

	totalPages := int((totalItems + int64(pageSize) - 1) / int64(pageSize))
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

func DeleteUserAccount(c *gin.Context) {
	accountID := c.Param("id")
	userID, _ := c.Get("userID")

	account, err := services.DeleteAccount(accountID, userID.(string))
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
