package services

import (
	"context"
	"nucleus/internal/api/repositories"
	"nucleus/internal/config"
	"nucleus/internal/models"
)

type AnalyticsService struct {
	analyticsRepo repositories.AnalyticsRepository
	config        *config.Config
}

func NewAnalyticsService(analyticsRepo repositories.AnalyticsRepository, cfg *config.Config) *AnalyticsService {
	return &AnalyticsService{analyticsRepo: analyticsRepo, config: cfg}
}

func (s *AnalyticsService) CreateAnalyticsEvent(ctx context.Context, event *models.AnalyticsEvent) error {
	return s.analyticsRepo.Create(ctx, event)
}
func (s *AnalyticsService) CreateAnalyticsEvents(ctx context.Context, events []*models.AnalyticsEvent) error {
	return s.analyticsRepo.CreateBatch(ctx, events)
}
