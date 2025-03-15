// internal/services/account_service.go

package services

import (
	"context"
	"fmt"
	"nucleus/internal/api/repositories"
	"nucleus/internal/api/types"
	"nucleus/internal/models"
	"nucleus/log"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AccountService struct {
	accountRepo repositories.AccountRepository
	db          *gorm.DB
}

func NewAccountService(accountRepo repositories.AccountRepository, db *gorm.DB) *AccountService {
	return &AccountService{accountRepo: accountRepo, db: db}
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

func (s *AccountService) UpdateAccount(ctx context.Context, accountIDStr string, userIDStr string, payload types.UpdateAccountDTO) (*models.Account, error) {
	accountID, err := uuid.Parse(accountIDStr)
	if err != nil {
		return nil, fmt.Errorf("invalid account ID: %w", err)
	}
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID: %w", err)
	}

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

	if err := s.accountRepo.Update(ctx, account); err != nil {
		return nil, err
	}

	return account, nil
}

func (s *AccountService) FetchPaginatedAccounts(ctx context.Context, userID uuid.UUID, page int, limit int) ([]models.Account, int64, error) {
	return s.accountRepo.FindByUserIDPaginated(ctx, userID, page, limit)
}

func (s *AccountService) FetchTotalAccounts(ctx context.Context, userID uuid.UUID) (int64, error) {
	return s.accountRepo.CountByUserID(ctx, userID)
}

func (s *AccountService) FetchAccount(ctx context.Context, accountIDStr string, userIDStr string) (*models.Account, error) {
	accountID, err := uuid.Parse(accountIDStr)
	if err != nil {
		return nil, fmt.Errorf("invalid account ID: %w", err)
	}
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID: %w", err)
	}
	return s.accountRepo.FindByIDAndUserID(ctx, accountID, userID)
}

func (s *AccountService) DeleteAccount(ctx context.Context, accountIDStr string, userIDStr string) (*models.Account, error) {
	accountID, err := uuid.Parse(accountIDStr)
	if err != nil {
		return nil, fmt.Errorf("invalid account ID: %w", err)
	}
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID: %w", err)
	}

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

	// Note: Transaction handling for deleting associated transactions
	// should ideally be within a unit of work pattern or a dedicated
	// transaction management service. For simplicity here, we'll keep
	// it within the service, but be aware of this potential improvement.
	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			log.ErrorLogger.Printf("Failed to delete account: %v", r)
		}
	}()

	if err := tx.WithContext(ctx).Where("id = ?", account.ID).Delete(&models.Account{}).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.WithContext(ctx).Where("account_id = ? AND user_id = ?", account.ID, userID).Delete(&models.Transaction{}).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return account, nil
}

func (s *AccountService) CreateAccountTransaction(tx *gorm.DB, plan models.Plan, account models.Account, transaction types.CreatePlanTransaction, userID uuid.UUID) error {
	// ... (This logic might belong in a TransactionService or be part of the AccountService depending on complexity)
	var planEmoji string
	if plan.Type == "saving" {
		planEmoji = "💰"
	} else {
		planEmoji = "📉"
	}

	accTransaction := models.Transaction{
		AccountId:   account.ID,
		UserId:      userID,
		Type:        "debit",
		Amount:      transaction.Amount,
		Note:        transaction.Note,
		Category:    fmt.Sprintf("%v %v", planEmoji, plan.Name),
		FromAccount: account.ID,
		ToAccount:   uuid.Nil,
		Currency:    account.Currency,
	}

	if err := tx.Create(&accTransaction).Error; err != nil {
		log.ErrorLogger.Printf("Error creating account transaction: %v", err)
		return fmt.Errorf("error creating account transaction")
	}

	return nil
}
