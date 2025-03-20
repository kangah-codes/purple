// internal/services/account_service.go

package services

import (
	"context"
	"fmt"
	"nucleus/internal/api/repositories"
	"nucleus/internal/api/types"
	"nucleus/internal/log"
	"nucleus/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AccountService struct {
	accountRepo     repositories.AccountRepository
	transactionRepo repositories.TransactionRepository
	db              *gorm.DB
}

func NewAccountService(accountRepo repositories.AccountRepository, transactionRepo repositories.TransactionRepository, db *gorm.DB) *AccountService {
	return &AccountService{accountRepo: accountRepo, transactionRepo: transactionRepo, db: db}
}

func (s *AccountService) CreateAccount(ctx context.Context, payload types.CreateAccountDTO, userID uuid.UUID) (*models.Account, error) {
	account := models.Account{
		UserId:   userID,
		Name:     payload.Name,
		Balance:  payload.Balance,
		Currency: payload.Currency,
		Category: payload.Category,
	}

	if err := s.accountRepo.Create(ctx, &account); err != nil {
		return nil, err
	}

	return &account, nil
}

func (s *AccountService) UpdateAccount(ctx context.Context, accountID, userID uuid.UUID, payload types.UpdateAccountDTO) (*models.Account, error) {
	account, err := s.accountRepo.FindByIDAndUserID(ctx, accountID, userID)
	if err != nil {
		return nil, err
	}
	if account == nil {
		return nil, fmt.Errorf("account not found")
	}

	account.Name = payload.Name
	account.Balance = payload.Balance
	account.Category = payload.Category

	if err := s.accountRepo.Update(ctx, s.db, account); err != nil {
		return nil, err
	}

	return account, nil
}

func (s *AccountService) FetchPaginatedAccounts(ctx context.Context, userID uuid.UUID, page int, limit int) ([]models.Account, int, error) {
	return s.accountRepo.FindByUserID(ctx, userID, page, limit)
}

func (s *AccountService) FetchTotalAccounts(ctx context.Context, userID uuid.UUID) (int, error) {
	return s.accountRepo.CountByUserID(ctx, userID)
}

func (s *AccountService) FetchAccount(ctx context.Context, accountID, userID uuid.UUID) (*models.Account, error) {
	return s.accountRepo.FindByIDAndUserID(ctx, accountID, userID)
}

func (s *AccountService) DeleteAccount(ctx context.Context, accountID, userID uuid.UUID) (*models.Account, error) {
	account, err := s.accountRepo.FindByIDAndUserID(ctx, accountID, userID)
	if err != nil {
		return nil, fmt.Errorf("account not found")
	}
	if account == nil {
		return nil, fmt.Errorf("account not found")
	}

	if account.IsDefaultAccount {
		return nil, fmt.Errorf("cannot delete default account")
	}

	tx := s.db.Begin()
	var returnErr error
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			log.ErrorLogger.Errorf("Failed to delete account: %v", r)
			returnErr = fmt.Errorf("failed to delete account: %v", r)
		}
	}()

	err = s.accountRepo.Delete(ctx, tx, account)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	err = s.transactionRepo.DeleteByUserID(ctx, tx, account.UserId)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return account, returnErr
}

func (s *AccountService) DeleteByUserID(ctx context.Context, tx *gorm.DB, userID uuid.UUID) (err error) {
	err = s.accountRepo.DeleteByUserID(ctx, tx, userID)
	if err != nil {
		return err
	}

	if err := tx.Commit().Error; err != nil {
		return err
	}

	return nil
}

func (s *AccountService) CreateAccountTransaction(ctx context.Context, tx *gorm.DB, plan models.Plan, account models.Account, createTransaction types.CreatePlanTransaction, userID uuid.UUID) error {
	var planEmoji string
	if plan.Type == "saving" {
		planEmoji = "💰"
	} else {
		planEmoji = "📉"
	}

	transaction := models.Transaction{
		AccountId:   account.ID,
		UserId:      userID,
		Type:        "debit",
		Amount:      createTransaction.Amount,
		Note:        createTransaction.Note,
		Category:    fmt.Sprintf("%v %v", planEmoji, plan.Name),
		FromAccount: account.ID,
		ToAccount:   uuid.Nil,
		Currency:    account.Currency,
	}

	if err := s.transactionRepo.Create(ctx, tx, &transaction); err != nil {
		log.ErrorLogger.Errorf("Error creating account transaction: %v", err.Error())
		return fmt.Errorf("error creating account transaction")
	}

	return nil
}
