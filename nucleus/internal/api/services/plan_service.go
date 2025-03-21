package services

import (
	"context"
	"errors"
	"fmt"
	"nucleus/internal/api/repositories"
	"nucleus/internal/api/types"
	"nucleus/internal/log"
	"nucleus/internal/models"
	"nucleus/internal/utils"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PlanService struct {
	planRepo        repositories.PlanRepository
	transactionRepo repositories.TransactionRepository
	accountRepo     repositories.AccountRepository
	db              *gorm.DB
}

func NewPlanService(planRepo repositories.PlanRepository, transactionRepo repositories.TransactionRepository, accountRepo repositories.AccountRepository, db *gorm.DB) *PlanService {
	return &PlanService{planRepo: planRepo, transactionRepo: transactionRepo, accountRepo: accountRepo, db: db}
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
	plan, err := s.planRepo.FindByID(ctx, planID)
	if err != nil {
		return nil, err
	}
	if plan == nil {
		return nil, fmt.Errorf("plan not found")
	}

	plan.Balance = balance
	if err := s.planRepo.Update(ctx, s.db, plan); err != nil {
		return nil, err
	}

	return plan, nil
}

func (s *PlanService) FetchPaginatedPlans(ctx context.Context, userID uuid.UUID, queryParams PlanQuery, page int, limit int) ([]models.Plan, int, error) {
	plans, totalItems, err := s.planRepo.FindByUserID(ctx, userID, queryParams.Name, queryParams.StartDate, queryParams.EndDate, queryParams.PlanType, page, limit)
	return plans, int(totalItems), err
}

func (s *PlanService) FetchPlan(ctx context.Context, planID uuid.UUID, userID uuid.UUID) (*models.Plan, error) {
	return s.planRepo.FindByID(ctx, planID)
}

func (s *PlanService) DeletePlan(ctx context.Context, planID uuid.UUID) error {
	plan, err := s.planRepo.FindByID(ctx, planID)
	if err != nil {
		return fmt.Errorf("plan not found")
	}
	if plan == nil {
		return fmt.Errorf("plan not found")
	}

	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			log.ErrorLogger.Errorf("Failed to delete plan: %v", r)
		}
	}()

	err = s.planRepo.Delete(ctx, tx, plan)
	if err != nil {
		tx.Rollback()
		return err
	}

	err = s.transactionRepo.DeleteByPlanID(ctx, tx, planID)
	if err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}

func (s *PlanService) DeleteByUserID(ctx context.Context, tx *gorm.DB, userID uuid.UUID) error {
	err := s.planRepo.DeleteByUserID(ctx, tx, userID)
	if err != nil {
		tx.Rollback()
		return err
	}

	// TODO; figure out how to delete plan transactions in bulk by user id

	return nil
}

func (s *PlanService) AddPlanTransaction(ctx context.Context, userID uuid.UUID, planID uuid.UUID, createTransaction types.CreatePlanTransaction) (*models.Transaction, error) {
	var account models.Account
	tx := s.db.Begin()
	if tx.Error != nil {
		log.ErrorLogger.Errorf("Error starting transaction: %v", tx.Error)
		return nil, fmt.Errorf("error starting database transaction: %v", tx.Error)
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			log.ErrorLogger.Errorf("Failed to add plan transaction: %v", r)
		}
	}()

	plan, err := s.planRepo.FindByID(ctx, planID)
	if err != nil {
		tx.Rollback()
		return nil, ErrPlanNotFound
	}
	if plan == nil {
		tx.Rollback()
		return nil, ErrPlanNotFound
	}

	// update plan balance
	plan.Balance += createTransaction.Amount

	// debit account
	acc, err := s.accountRepo.FindByIDAndUserID(ctx, createTransaction.DebitAccountId, userID)
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
	if err := s.accountRepo.Update(ctx, tx, &account); err != nil {
		tx.Rollback()
		log.ErrorLogger.Errorf("Error updating account balance: %v", err)
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
		PlanId:      plan.ID,
	}

	if err := s.transactionRepo.Create(ctx, tx, &transaction); err != nil {
		tx.Rollback()
		return nil, err
	}

	err = s.planRepo.Update(ctx, tx, plan)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		log.ErrorLogger.Errorf("Error committing transaction: %v", err)
		return nil, fmt.Errorf("error processing request: %v", err)
	}

	return &transaction, nil
}
