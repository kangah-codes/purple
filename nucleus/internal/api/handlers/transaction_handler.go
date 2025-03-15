package handlers

import (
	"net/http"
	"nucleus/internal/api/services"
	"nucleus/internal/api/types"
	"nucleus/internal/models"
	"nucleus/log"
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
	createTransaction := types.CreateTransactionDTO{}
	userID, _ := c.Get("userID")

	if err := c.ShouldBindJSON(&createTransaction); err != nil {
		c.JSON(http.StatusBadRequest, types.Response{Status: http.StatusBadRequest, Message: "Invalid request"})
		return
	}

	var (
		transaction *models.Transaction
		err         error
	)

	if createTransaction.Type == models.Transfer {
		transaction, err = h.transactionService.CreateTransferTransaction(c.Request.Context(), createTransaction, userID.(string))
	} else {
		transaction, err = h.transactionService.CreateTransaction(c.Request.Context(), createTransaction, userID.(string))
	}

	if err != nil {
		log.ErrorLogger.Println(err)
		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Error creating transaction"})
		return
	}

	c.JSON(http.StatusCreated, types.Response{Status: http.StatusCreated, Message: "Transaction created", Data: transaction})
}

// func (h *TransactionHandler) UpdateTransaction(c *gin.Context) {
// 	updateTransaction := types.UpdateTransactionDTO{}
// 	if err := c.ShouldBindJSON(&updateTransaction); err != nil {
// 		log.ErrorLogger.Println(err)
// 		c.JSON(http.StatusBadRequest, types.Response{Status: http.StatusBadRequest, Message: "Invalid request", Data: nil})
// 		return
// 	}

// 	userID, exists := c.Get("userID")
// 	if !exists {
// 		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
// 		return
// 	}

// 	transactionID := c.Param("transactionID")
// 	transactionUUID, err := uuid.Parse(transactionID)
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, types.Response{Status: http.StatusBadRequest, Message: "Invalid transaction ID format", Data: nil})
// 		return
// 	}

// 	err = fmt.Errorf("update transaction not yet implemented with dependency injection") // Placeholder
// 	if err != nil {
// 		log.ErrorLogger.Println(err)
// 		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to update transaction", Data: nil})
// 		return
// 	}

// 	// The original logic directly accessed the database.
// 	// With DI, you'd ideally have an UpdateTransaction method in your TransactionService
// 	// that uses the injected repositories.

// 	// Example (conceptual - you'd need to implement this in the service):
// 	/*
// 		updatedTransaction, err := h.transactionService.UpdateTransaction(c.Request.Context(), transactionUUID, userID.(uuid.UUID), updateTransaction)
// 		if err != nil {
// 			// Handle errors
// 			return
// 		}
// 		c.JSON(http.StatusOK, types.Response{Status: http.StatusOK, Message: "Transaction updated", Data: updatedTransaction})
// 	*/

// 	// For now, since the service doesn't have this method:
// 	c.JSON(http.StatusNotImplemented, types.Response{Status: http.StatusNotImplemented, Message: "Update transaction not implemented with DI yet"})
// }

// func (h *TransactionHandler) DeleteTransaction(c *gin.Context) {
// 	userID, exists := c.Get("userID")
// 	if !exists {
// 		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
// 		return
// 	}
// 	transactionID := c.Param("transactionID")
// 	transactionUUID, err := uuid.Parse(transactionID)
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, types.Response{Status: http.StatusBadRequest, Message: "Invalid transaction ID format", Data: nil})
// 		return
// 	}

// 	err = fmt.Errorf("delete transaction not yet implemented with dependency injection") // Placeholder
// 	if err != nil {
// 		log.ErrorLogger.Println(err)
// 		c.JSON(http.StatusInternalServerError, types.Response{Status: http.StatusInternalServerError, Message: "Failed to delete transaction", Data: nil})
// 		return
// 	}

// 	// Similar to UpdateTransaction, you'd have a DeleteTransaction method in your service.
// 	// Example (conceptual):
// 	/*
// 		err = h.transactionService.DeleteTransaction(c.Request.Context(), transactionUUID, userID.(uuid.UUID))
// 		if err != nil {
// 			// Handle errors
// 			return
// 		}
// 		c.JSON(http.StatusOK, types.Response{Status: http.StatusOK, Message: "Transaction deleted"})
// 	*/

// 	// For now:
// 	c.JSON(http.StatusNotImplemented, types.Response{Status: http.StatusNotImplemented, Message: "Delete transaction not implemented with DI yet"})
// }

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

	accounts, totalItems, err := h.transactionService.FetchPaginatedTransactions(c.Request.Context(), userID.(uuid.UUID), page, pageSize)
	if err != nil {
		log.ErrorLogger.Println(err)
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
