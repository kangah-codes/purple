package services

import (
	"context"
	"fmt"
	"nucleus/internal/api/repositories"
	"nucleus/internal/config"
	"nucleus/internal/models"
	"nucleus/internal/utils"
	"time"

	"github.com/google/uuid"
)

type StatsService struct {
	planRepo        repositories.PlanRepository
	transactionRepo repositories.TransactionRepository
	config          *config.Config
}

type DailyActivity struct {
	Heatmap         map[string]float64
	TransactionData map[string][]models.Transaction
}

type HeatmapData struct {
	DailyActivity map[string]float64
	Transactions  []models.Transaction
	SpendOverview map[string]map[string]float64
}

func NewStatsService(planRepo repositories.PlanRepository, transactionRepo repositories.TransactionRepository, cfg *config.Config) *StatsService {
	return &StatsService{planRepo: planRepo, transactionRepo: transactionRepo, config: cfg}
}

func (s *StatsService) CalculateHeatmap(ctx context.Context, query repositories.TransactionQuery) (HeatmapData, error) {
	/**
	Calculate the total amount of money each user has inputed each day for each day of the month
	returns the data in this format {key: 'dd/mm/yy', value: number}
	Fetch all user transactions in the month
	Fetch all plan transactions in the month
	get all the days of the month
	for each day, add up the total transactions & plantransactions
	**/

	var startDate time.Time
	var endDate time.Time
	userID, exists := ctx.Value("userID").(uuid.UUID)
	if !exists {
		return HeatmapData{}, fmt.Errorf("user id not found in context")
	}

	if parsedDate, err := time.Parse("02/01/06", *query.StartDate); err == nil {
		startDate = parsedDate
	} else {
		return HeatmapData{}, err
	}
	if parsedDate, err := time.Parse("02/01/06", *query.EndDate); err == nil {
		endDate = parsedDate
	} else {
		return HeatmapData{}, err
	}

	monthDays := utils.EachDayOfInterval(startDate, endDate)
	userDailyActivity := DailyActivity{Heatmap: make(map[string]float64)}
	count, err := s.transactionRepo.CountByQuery(ctx, userID, query)
	if err != nil {
		return HeatmapData{}, err
	}

	for _, day := range monthDays {
		dateStr := day.Format("02/01/06")
		userDailyActivity.Heatmap[dateStr] = 0
	}

	if transactions, _, err := s.transactionRepo.FindByUserID(ctx, userID, repositories.TransactionQuery{StartDate: query.StartDate, EndDate: query.EndDate, Limit: int(count)}); err == nil {
		for _, transaction := range transactions {
			dateStr := transaction.CreatedAt.Format("02/01/06")
			if _, exists := userDailyActivity.Heatmap[dateStr]; exists {
				userDailyActivity.Heatmap[dateStr] += transaction.Amount
			}
		}

		return HeatmapData{
			DailyActivity: userDailyActivity.Heatmap,
			Transactions:  transactions,
			SpendOverview: utils.CalculateIncomeAndExpenseByCurrency(transactions),
		}, nil
	} else {
		return HeatmapData{}, err
	}
}
