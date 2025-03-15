// internal/services/transaction_service.go

package services

import (
	"context"
	"fmt"
	"nucleus/internal/api/repositories"
	"nucleus/internal/api/types"
	"nucleus/internal/models"
	"nucleus/log"
	"nucleus/utils"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type TransactionService struct {
	transactionRepo repositories.TransactionRepository
	accountRepo     repositories.AccountRepository
	db              *gorm.DB
}

func NewTransactionService(transactionRepo repositories.TransactionRepository, accountRepo repositories.AccountRepository, db *gorm.DB) *TransactionService {
	return &TransactionService{transactionRepo: transactionRepo, accountRepo: accountRepo, db: db}
}

func (s *TransactionService) CreateTransaction(ctx context.Context, payload types.CreateTransactionDTO, userIDStr string) (*models.Transaction, error) {
	parsedUserID, err := uuid.Parse(userIDStr)
	if err != nil {
		return nil, fmt.Errorf("invalid user id: %w", err)
	}

	tx := s.db.Begin()
	defer tx.Rollback()

	account, err := s.accountRepo.FindByIDAndUserID(ctx, payload.AccountId, parsedUserID)
	if err != nil {
		return nil, err
	}
	if account == nil {
		return nil, fmt.Errorf("account not found")
	}

	transaction := models.Transaction{
		AccountId:   payload.AccountId,
		UserId:      parsedUserID,
		Type:        payload.Type,
		Amount:      payload.Amount,
		Note:        payload.Note,
		Category:    payload.Category,
		CreatedAt:   utils.FormatStrToDateTime(payload.CreatedAt),
		FromAccount: uuid.Nil,
		ToAccount:   uuid.Nil,
		Currency:    account.Currency,
	}

	if payload.Type == models.Debit {
		account.Balance -= payload.Amount
	} else {
		account.Balance += payload.Amount
	}

	if err := s.accountRepo.Update(ctx, account); err != nil {
		log.ErrorLogger.Printf("Error updating account balance: %v", err)
		return nil, err
	}

	if err := s.transactionRepo.Create(ctx, tx, &transaction); err != nil {
		log.ErrorLogger.Printf("Error creating transaction: %v", err)
		return nil, err
	}

	return &transaction, tx.Commit().Error
}

func (s *TransactionService) CreateTransferTransaction(ctx context.Context, payload types.CreateTransactionDTO, userIDStr string) (*models.Transaction, error) {
	parsedUserID, err := uuid.Parse(userIDStr)
	if err != nil {
		return nil, fmt.Errorf("invalid user id: %w", err)
	}

	tx := s.db.Begin()
	defer tx.Rollback()

	fromAccount, err := s.accountRepo.FindByIDAndUserID(ctx, payload.FromAccount, parsedUserID)
	if err != nil {
		return nil, fmt.Errorf("source account not found: %w", err)
	}
	if fromAccount == nil {
		return nil, fmt.Errorf("source account not found")
	}

	toAccount, err := s.accountRepo.FindByIDAndUserID(ctx, payload.ToAccount, parsedUserID)
	if err != nil {
		return nil, fmt.Errorf("destination account not found: %w", err)
	}
	if toAccount == nil {
		return nil, fmt.Errorf("destination account not found")
	}

	if fromAccount.Currency != toAccount.Currency {
		return nil, fmt.Errorf("currency mismatch between accounts")
	}

	transaction := models.Transaction{
		AccountId:   payload.AccountId,
		UserId:      parsedUserID,
		Type:        models.Transfer,
		Amount:      payload.Amount,
		Note:        payload.Note,
		Category:    payload.Category,
		CreatedAt:   utils.FormatStrToDateTime(payload.CreatedAt),
		FromAccount: fromAccount.ID,
		ToAccount:   toAccount.ID,
		Currency:    fromAccount.Currency,
	}

	fromAccount.Balance -= payload.Amount
	toAccount.Balance += payload.Amount

	if err := s.accountRepo.Update(ctx, fromAccount); err != nil {
		log.ErrorLogger.Printf("Error updating source account balance: %v", err)
		return nil, err
	}

	if err := s.accountRepo.Update(ctx, toAccount); err != nil {
		log.ErrorLogger.Printf("Error updating destination account balance: %v", err)
		return nil, err
	}

	if err := s.transactionRepo.Create(ctx, tx, &transaction); err != nil {
		log.ErrorLogger.Printf("Error creating transfer transaction: %v", err)
		return nil, err
	}

	return &transaction, tx.Commit().Error
}

func (s *TransactionService) FetchPaginatedTransactions(ctx context.Context, userID uuid.UUID, page int, limit int) ([]models.Transaction, int64, error) {
	return s.transactionRepo.FindByUserIDPaginated(ctx, userID, page, limit)
}
