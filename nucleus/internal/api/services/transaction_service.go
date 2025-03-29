package services

import (
	"context"
	"fmt"
	"nucleus/internal/api/repositories"
	"nucleus/internal/api/types"
	"nucleus/internal/config"
	"nucleus/internal/log"
	"nucleus/internal/models"
	"nucleus/internal/utils"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type TransactionService struct {
	transactionRepo repositories.TransactionRepository
	accountRepo     repositories.AccountRepository
	config          *config.Config
}

func NewTransactionService(transactionRepo repositories.TransactionRepository, accountRepo repositories.AccountRepository, cfg *config.Config) *TransactionService {
	return &TransactionService{transactionRepo: transactionRepo, accountRepo: accountRepo, config: cfg}
}

func (s *TransactionService) CreateTransaction(ctx context.Context, payload types.CreateTransactionDTO, userID uuid.UUID) (*models.Transaction, error) {
	tx := s.config.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			log.ErrorLogger.Errorf("Failed to create transaction: %v", r)
		}
	}()

	account, err := s.accountRepo.FindByIDAndUserID(ctx, payload.AccountId, userID)
	if err != nil {
		return nil, err
	}
	if account == nil {
		return nil, fmt.Errorf("account not found")
	}

	if payload.PlanId == uuid.Nil {
		payload.PlanId = uuid.Nil
	}

	transaction := models.Transaction{
		AccountId:   payload.AccountId,
		UserId:      userID,
		Type:        payload.Type,
		Amount:      payload.Amount,
		Note:        payload.Note,
		Category:    payload.Category,
		CreatedAt:   utils.FormatStrToDateTime(payload.CreatedAt),
		FromAccount: uuid.Nil,
		ToAccount:   uuid.Nil,
		Currency:    account.Currency,
		PlanId:      payload.PlanId,
	}

	if payload.Type == models.Debit {
		account.Balance -= payload.Amount
	} else {
		account.Balance += payload.Amount
	}

	if err := s.accountRepo.Update(ctx, tx, account); err != nil {
		log.ErrorLogger.Errorf("Error updating account balance: %v", err)
		return nil, fmt.Errorf("error creating transaction")
	}

	if err := s.transactionRepo.Create(ctx, tx, &transaction); err != nil {
		log.ErrorLogger.Errorf("Error creating transaction: %v", err)
		return nil, fmt.Errorf("error creating transaction")
	}

	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		log.ErrorLogger.Printf("Error commiting transaction: %v", err)
	}

	return &transaction, nil
}

func (s *TransactionService) CreateTransferTransaction(ctx context.Context, payload types.CreateTransactionDTO, userID uuid.UUID) (*models.Transaction, error) {
	tx := s.config.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			log.ErrorLogger.Errorf("Failed to delete plan: %v", r)
		}
	}()

	fromAccount, err := s.accountRepo.FindByIDAndUserID(ctx, payload.FromAccount, userID)
	if err != nil {
		return nil, fmt.Errorf("source account not found: %w", err)
	}
	if fromAccount == nil {
		return nil, fmt.Errorf("source account not found")
	}

	toAccount, err := s.accountRepo.FindByIDAndUserID(ctx, payload.ToAccount, userID)
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
		UserId:      userID,
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

	if err := s.accountRepo.Update(ctx, tx, fromAccount); err != nil {
		log.ErrorLogger.Errorf("Error updating source account balance: %v", err)
		return nil, fmt.Errorf("error creating transaction")
	}

	if err := s.accountRepo.Update(ctx, tx, toAccount); err != nil {
		log.ErrorLogger.Errorf("Error updating destination account balance: %v", err)
		return nil, fmt.Errorf("error creating transaction")
	}

	if err := s.transactionRepo.Create(ctx, tx, &transaction); err != nil {
		log.ErrorLogger.Errorf("Error creating transfer transaction: %v", err)
		return nil, fmt.Errorf("error creating transaction")
	}

	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		log.ErrorLogger.Printf("Error commiting transaction: %v", err)
	}

	return &transaction, nil
}

func (s *TransactionService) DeleteByUserID(ctx context.Context, tx *gorm.DB, userID uuid.UUID) error {
	return s.transactionRepo.DeleteByUserID(ctx, tx, userID)
}

func (s *TransactionService) FetchPaginatedTransactions(ctx context.Context, userID uuid.UUID, query *repositories.TransactionQuery, page int, limit int) ([]models.Transaction, int64, error) {
	return s.transactionRepo.FindByUserID(ctx, userID, *query, page, limit)
}
