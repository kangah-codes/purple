package services

import (
	"context"
	"errors"
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

var ErrPlanNotFound = errors.New("plan not found")
var ErrAccountNotFound = errors.New("account not found")
var ErrUnauthAccess = errors.New("invalid permissions")
var ErrCurrencyMismatch = errors.New("account currency  does not match plan currency")

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

func (s *PlanService) AddPlanTransaction(ctx context.Context, userID uuid.UUID, planID uuid.UUID, createTransaction types.CreatePlanTransaction) (*models.Transaction, error) {
	var account models.Account

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

	plan, err := s.planRepo.FindByIDAndUserID(ctx, planID, userID)
	if err != nil {
		tx.Rollback()
		return nil, ErrPlanNotFound
	}
	if plan == nil {
		tx.Rollback()
		return nil, ErrPlanNotFound
	}

	if createTransaction.DebitAccountId != uuid.Nil {
		accountRepo := repositories.NewPostgresAccountRepository(s.db)

		acc, err := accountRepo.FindByIDAndUserID(ctx, createTransaction.DebitAccountId, userID)
		if err != nil {
			tx.Rollback()
			return nil, ErrAccountNotFound
		}
		account = *acc

		if acc.Currency != plan.Currency {
			tx.Rollback()
			return nil, ErrCurrencyMismatch
		}

		account.Balance -= createTransaction.Amount
		if err := accountRepo.Update(ctx, &account); err != nil {
			tx.Rollback()
			log.ErrorLogger.Printf("Error updating account balance: %v", err)
			return nil, fmt.Errorf("error updating account balance")
		}

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
			tx.Rollback()
			return nil, err
		}
	}

	transaction := models.Transaction{
		Amount: createTransaction.Amount,
		Note:   createTransaction.Note,
		UserId: userID,
	}

	if createTransaction.DebitAccountId != uuid.Nil {
		transaction.FromAccount = createTransaction.DebitAccountId
		transaction.ToAccount = account.ID
	}

	if err := s.transactionRepo.Create(ctx, tx, &transaction); err != nil {
		tx.Rollback()
		log.ErrorLogger.Printf("Error creating plan transaction: %v", err)
		return nil, fmt.Errorf("error creating plan transaction")
	}

	plan.Balance += createTransaction.Amount
	if err := s.planRepo.Update(ctx, plan); err != nil {
		tx.Rollback()
		log.ErrorLogger.Printf("Error updating plan balance: %v", err)
		return nil, fmt.Errorf("error updating plan balance")
	}

	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		log.ErrorLogger.Printf("Error committing transaction: %v", err)
		return nil, fmt.Errorf("error processing request: %v", err)
	}

	return &transaction, nil
}
