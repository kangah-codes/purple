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

type PlanService struct {
	planRepo        repositories.PlanRepository
	transactionRepo repositories.TransactionRepository
	db              *gorm.DB
}

func NewPlanService(planRepo repositories.PlanRepository, transactionRepo repositories.TransactionRepository, db *gorm.DB) *PlanService {
	return &PlanService{planRepo: planRepo, transactionRepo: transactionRepo, db: db}
}

type PlanQuery struct {
	Name      string `json:"name"`
	StartDate string `json:"start_date"`
	EndDate   string `json:"end_date"`
	PlanType  string `json:"type"`
}

func (s *PlanService) CreatePlan(ctx context.Context, payload types.CreatePlanDTO, userID uuid.UUID) (*models.Plan, error) {
	plan := models.Plan{
		UserId:           userID,
		Type:             payload.Type,
		Category:         payload.Category,
		Target:           payload.Target,
		Balance:          0,
		StartDate:        utils.FormatStrToDateTime(payload.StartDate),
		EndDate:          utils.FormatStrToDateTime(payload.EndDate),
		DepositFrequency: payload.DepositFrequency,
		PushNotification: payload.PushNotification,
		Name:             payload.Name,
		Currency:         payload.Currency,
	}

	if err := s.planRepo.Create(ctx, &plan); err != nil {
		return nil, err
	}

	return &plan, nil
}

func (s *PlanService) UpdatePlanBalance(ctx context.Context, planID uuid.UUID, userID uuid.UUID, balance float64) (*models.Plan, error) {
	plan, err := s.planRepo.FindByIDAndUserID(ctx, planID, userID)
	if err != nil {
		return nil, err
	}
	if plan == nil {
		return nil, fmt.Errorf("plan not found")
	}

	plan.Balance = balance
	if err := s.planRepo.Update(ctx, plan); err != nil {
		return nil, err
	}

	return plan, nil
}

func (s *PlanService) FetchPaginatedPlans(ctx context.Context, userID uuid.UUID, queryParams PlanQuery, page int, limit int) ([]models.Plan, int, error) {
	plans, totalItems, err := s.planRepo.FindByUserIDPaginated(ctx, userID, queryParams.Name, queryParams.StartDate, queryParams.EndDate, queryParams.PlanType, page, limit)
	return plans, int(totalItems), err
}

func (s *PlanService) FetchPlan(ctx context.Context, planIDStr string, userIDStr string) (*models.Plan, error) {
	planID, err := uuid.Parse(planIDStr)
	if err != nil {
		return nil, fmt.Errorf("invalid plan ID: %w", err)
	}
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID: %w", err)
	}
	return s.planRepo.FindByIDAndUserID(ctx, planID, userID)
}

func (s *PlanService) DeletePlan(ctx context.Context, planIDStr string, userIDStr string) error {
	planID, err := uuid.Parse(planIDStr)
	if err != nil {
		return fmt.Errorf("invalid plan ID: %w", err)
	}
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return fmt.Errorf("invalid user ID: %w", err)
	}

	plan, err := s.planRepo.FindByIDAndUserID(ctx, planID, userID)
	if err != nil {
		return fmt.Errorf("plan not found")
	}
	if plan == nil {
		return fmt.Errorf("plan not found")
	}

	// Note: Transaction handling for deleting associated plan transactions
	// should ideally be within a unit of work pattern or a dedicated
	// transaction management service. For simplicity here, we'll keep
	// it within the service, but be aware of this potential improvement.
	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			log.ErrorLogger.Printf("Failed to delete plan: %v", r)
		}
	}()

	if err := tx.WithContext(ctx).Where("id = ?", plan.ID).Delete(&models.Plan{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	if err := tx.WithContext(ctx).Where("plan_id = ? AND user_id = ?", plan.ID, userID).Delete(&models.PlanTransaction{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}

func (s *PlanService) AddPlanTransaction(ctx context.Context, userID uuid.UUID, planID uuid.UUID, transaction types.CreatePlanTransaction) (*models.PlanTransaction, error) {
	var account models.Account

	// Start database transaction
	tx := s.db.Begin()
	if tx.Error != nil {
		log.ErrorLogger.Printf("Error starting transaction: %v", tx.Error)
		return nil, fmt.Errorf("error starting database transaction: %v", tx.Error)
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			log.ErrorLogger.Printf("Failed to add plan transaction: %v", r)
		}
	}()

	// Fetch the plan
	plan, err := s.planRepo.FindByIDAndUserID(ctx, planID, userID)
	if err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("plan not found")
	}
	if plan == nil {
		tx.Rollback()
		return nil, fmt.Errorf("plan not found")
	}

	// Handle account debit if specified
	if transaction.DebitAccountId != uuid.Nil {
		accountRepo := repositories.NewPostgresAccountRepository(s.db)
		acc, err := accountRepo.FindByIDAndUserID(ctx, transaction.DebitAccountId, userID)
		if err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("account not found: %w", err)
		}
		account = *acc // Dereference the pointer

		// Validate currency match
		if account.Currency != plan.Currency {
			tx.Rollback()
			return nil, fmt.Errorf("account currency does not match plan currency")
		}

		// Debit the account
		account.Balance -= transaction.Amount
		if err := accountRepo.Update(ctx, &account); err != nil {
			tx.Rollback()
			log.ErrorLogger.Printf("Error updating account balance: %v", err)
			return nil, fmt.Errorf("error updating account balance")
		}

		// Create account transaction (consider moving this to AccountService if it becomes more complex)
		if err := s.createAccountTransaction(tx, *plan, account, transaction, userID); err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	// Create plan transaction
	planTransaction := models.PlanTransaction{
		Amount: transaction.Amount,
		Note:   transaction.Note,
		UserId: userID,
		PlanId: plan.ID,
	}

	if transaction.DebitAccountId != uuid.Nil {
		planTransaction.DebitAccountId = &transaction.DebitAccountId
		planTransaction.DebitAccount = account
	}

	// Create plan transaction within the database transaction
	if err := s.transactionRepo.CreateForPlan(ctx, tx, &planTransaction); err != nil {
		tx.Rollback()
		log.ErrorLogger.Printf("Error creating plan transaction: %v", err)
		return nil, fmt.Errorf("error creating plan transaction")
	}

	// Update plan balance
	plan.Balance += transaction.Amount
	if err := s.planRepo.Update(ctx, plan); err != nil {
		tx.Rollback()
		log.ErrorLogger.Printf("Error updating plan balance: %v", err)
		return nil, fmt.Errorf("error updating plan balance")
	}

	// Commit the transaction
	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		log.ErrorLogger.Printf("Error committing transaction: %v", err)
		return nil, fmt.Errorf("error processing request: %v", err)
	}

	// Cache invalidation is handled by the caching repository

	return &planTransaction, nil
}

func (s *PlanService) createAccountTransaction(tx *gorm.DB, plan models.Plan, account models.Account, transaction types.CreatePlanTransaction, userID uuid.UUID) error {
	// Create emoji for plan type
	var planEmoji string
	if plan.Type == "saving" {
		planEmoji = "💰"
	} else {
		planEmoji = "📉"
	}

	// Create a transaction for the account
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

	accountTransactionRepo := repositories.NewPostgresTransactionRepository(tx) // Create repo within transaction
	if err := accountTransactionRepo.Create(context.Background(), tx, &accTransaction); err != nil {
		log.ErrorLogger.Printf("Error creating account transaction: %v", err)
		return fmt.Errorf("error creating account transaction")
	}

	return nil
}
