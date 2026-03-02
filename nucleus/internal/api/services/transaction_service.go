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

func (s *TransactionService) CreateTransaction(ctx context.Context, payload types.CreateTransactionDTO) (*models.Transaction, error) {
	tx := s.config.DB.Begin()
	var err error
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			log.ErrorLogger.Errorf("Failed to create transaction: %v", r)
			err = fmt.Errorf("failed to create transaction due to a panic: %v", r)
		}
		if err != nil {
			if rbErr := tx.Rollback().Error; rbErr != nil {
				log.ErrorLogger.Errorf("Error rolling back transaction after error: %v, original error: %v", rbErr, err)
			}
		} else {
			if commitErr := tx.Commit().Error; commitErr != nil {
				log.ErrorLogger.Printf("Error committing transaction: %v", commitErr)
				err = commitErr // Set the error if commit fails
			}
		}
	}()

	account, findErr := s.accountRepo.FindByID(ctx, payload.AccountId)
	if findErr != nil {
		return nil, findErr
	}
	if account == nil {
		return nil, fmt.Errorf("account not found")
	}
	userID := ctx.Value("userID").(uuid.UUID)
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
	if updateErr := s.accountRepo.Update(ctx, tx, account); updateErr != nil {
		log.ErrorLogger.Errorf("Error updating account balance: %v", updateErr)
		return nil, fmt.Errorf("error creating transaction: %w", updateErr)
	}
	if createErr := s.transactionRepo.Create(ctx, tx, &transaction); createErr != nil {
		log.ErrorLogger.Errorf("Error creating transaction: %v", createErr)
		return nil, fmt.Errorf("error creating transaction: %w", createErr)
	}

	return &transaction, err
}

func (s *TransactionService) CreateTransferTransaction(ctx context.Context, payload types.CreateTransactionDTO, userID uuid.UUID) (*models.Transaction, error) {
	tx := s.config.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			log.ErrorLogger.Errorf("Failed to delete plan: %v", r)
		}
	}()

	fromAccount, err := s.accountRepo.FindByID(ctx, payload.FromAccount)
	if err != nil {
		return nil, fmt.Errorf("source account not found: %w", err)
	}
	if fromAccount == nil {
		return nil, fmt.Errorf("source account not found")
	}

	toAccount, err := s.accountRepo.FindByID(ctx, payload.ToAccount)
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

func (s *TransactionService) FetchPaginatedTransactions(ctx context.Context, userID uuid.UUID, query *repositories.TransactionQuery) ([]models.Transaction, int64, error) {
	return s.transactionRepo.FindByUserID(ctx, userID, *query)
}
