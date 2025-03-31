package handlers

import (
	"context"
	"net/http"
	"nucleus/internal/api/repositories"
	"nucleus/internal/api/services"
	"nucleus/internal/api/types"
	"nucleus/internal/log"
	"nucleus/internal/models"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type TransactionHandler struct {
	transactionService *services.TransactionService
}

func NewTransactionHandler(service *services.TransactionService) *TransactionHandler {
	return &TransactionHandler{transactionService: service}
}

func (h *TransactionHandler) CreateTransaction(c *gin.Context) {
	var (
		transaction *models.Transaction
		err         error
	)

	createTransaction := types.CreateTransactionDTO{}
	userID, _ := c.Get("userID")

	if err := c.ShouldBindJSON(&createTransaction); err != nil {
		c.JSON(http.StatusBadRequest, types.Response{Status: http.StatusBadRequest, Message: "Invalid request"})
		return
	}

	ctx := context.WithValue(c.Request.Context(), "userID", userID)
	if createTransaction.Type == models.Transfer {
		transaction, err = h.transactionService.CreateTransferTransaction(ctx, createTransaction, userID.(uuid.UUID))
	} else {
		transaction, err = h.transactionService.CreateTransaction(ctx, createTransaction)
	}

	if err != nil {
		log.ErrorLogger.Errorln(err)
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: err.Error()})
		return
	}

	c.JSON(http.StatusCreated, types.Response{Status: http.StatusCreated, Message: "Transaction created", Data: &transaction})
}

func (h *TransactionHandler) FetchTransactions(c *gin.Context) {
	userID, _ := c.Get("userID")
	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}
	pageSize, err := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	if err != nil || pageSize < 1 {
		pageSize = 10
	}

	// TODO: find a better way to extract query params
	accountID := c.Query("accountID")

	transactionQuery := &repositories.TransactionQuery{
		AccountID: accountID,
	}

	accounts, totalItems, err := h.transactionService.FetchPaginatedTransactions(c.Request.Context(), userID.(uuid.UUID), transactionQuery, page, pageSize)
	if err != nil {
		log.ErrorLogger.Errorln(err)
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to fetch transactions", Data: nil})
		return
	}

	totalPages := int((totalItems + int64(pageSize) - 1) / int64(pageSize))
	response := types.Response{
		Status:     http.StatusOK,
		Message:    "Transactions fetched successfully",
		Data:       accounts,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
		TotalItems: int(totalItems),
	}

	c.JSON(http.StatusOK, response)
}
