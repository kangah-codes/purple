package services

import (
	"context"
	"fmt"
	"nucleus/internal/api/repositories"
	"nucleus/internal/models"
	"nucleus/log"
	"nucleus/utils"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AuthService struct {
	authRepo repositories.AuthRepository
	userRepo repositories.UserRepository
	db       *gorm.DB
}

func NewAuthService(authRepo repositories.AuthRepository, userRepo repositories.UserRepository, db *gorm.DB) *AuthService {
	return &AuthService{authRepo: authRepo, userRepo: userRepo, db: db}
}

func (s *AuthService) FindUserByUsername(ctx context.Context, username string) (*models.User, error) {
	return s.userRepo.FindByUsername(ctx, username)
}

func (s *AuthService) SignInUser(ctx context.Context, userID uuid.UUID) (*models.Session, error) {
	tx := s.db.Begin()
	if tx.Error != nil {
		log.ErrorLogger.Printf("Failed to start transaction: %v", tx.Error)
		return nil, tx.Error
	}
	defer tx.Rollback()

	if err := s.clearSessions(ctx, userID, tx); err != nil {
		return nil, err
	}

	token, err := utils.GenerateSessionToken()
	if err != nil {
		log.ErrorLogger.Println(err)
		return nil, err
	}

	session := models.Session{
		UserID:    userID,
		Token:     token,
		ExpiresAt: time.Now().Add(time.Hour * 24 * 30),
	}

	if err := s.authRepo.SignIn(ctx, &session); err != nil {
		tx.Rollback()
		return nil, err
	}

	return &session, tx.Commit().Error
}

func (s *AuthService) SignOutUser(ctx context.Context, userID uuid.UUID, token string) error {
	tx := s.db.Begin()
	if tx.Error != nil {
		log.ErrorLogger.Printf("Failed to start transaction: %v", tx.Error)
		return tx.Error
	}
	defer tx.Rollback()

	var session models.Session
	if err := tx.WithContext(ctx).Where("token = ?", token).First(&session).Error; err != nil {
		return err
	}

	if err := tx.WithContext(ctx).Where("user_id = ?", userID).Delete(&models.Session{}).Error; err != nil {
		log.ErrorLogger.Printf("Failed to delete sessions: %v", err)
		return err
	}

	if err := tx.WithContext(ctx).Where("user_id = ?", userID).Delete(&models.RefreshToken{}).Error; err != nil { // Assuming you have RefreshToken model/repository
		log.ErrorLogger.Printf("Failed to delete refresh tokens: %v", err)
		return err
	}

	if err := tx.Commit().Error; err != nil {
		log.ErrorLogger.Printf("Failed to commit transaction: %v", err)
		return err
	}

	err := s.authRepo.Clear(ctx, session.Token)
	if err != nil {
		log.ErrorLogger.Printf("Error clearing user sessions from cache: %v", err)
	}

	return nil
}

func (s *AuthService) clearSessions(ctx context.Context, userID uuid.UUID, tx *gorm.DB) error {
	if err := tx.WithContext(ctx).Where("user_id = ?", userID).Delete(&models.Session{}).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to clear sessions: %w", err)
	}

	return nil
}

func (s *AuthService) GetSession(ctx context.Context, token string) (*models.Session, error) {
	session, err := s.authRepo.Get(ctx, token)
	if err != nil {
		return nil, err
	}
	if session == nil || session.ExpiresAt.Before(time.Now()) {
		return nil, gorm.ErrRecordNotFound
	}
	return session, nil
}
