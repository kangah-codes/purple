package services

import (
	"context"
	"fmt"
	"nucleus/internal/api/repositories"
	"nucleus/internal/api/types"
	"nucleus/internal/config"
	"nucleus/internal/dispatch"
	"nucleus/internal/log"
	"nucleus/internal/models"
	"nucleus/internal/utils"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AuthService struct {
	authRepo repositories.AuthRepository
	userRepo repositories.UserRepository
	config   *config.Config
}

func NewAuthService(authRepo repositories.AuthRepository, userRepo repositories.UserRepository, cfg *config.Config) *AuthService {
	return &AuthService{authRepo: authRepo, userRepo: userRepo, config: cfg}
}

func (s *AuthService) FindUserByUsername(ctx context.Context, username string) (*models.User, error) {
	return s.userRepo.FindByUsernameAuth(ctx, username)
}

func (s *AuthService) SignInUser(ctx context.Context, userID uuid.UUID) (*models.Session, error) {
	tx := s.config.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			log.ErrorLogger.Printf("Recovered from panic: %v", r)
		}
	}()

	token, err := utils.GenerateSessionToken()
	if err != nil {
		log.ErrorLogger.Errorln(err)
		return nil, err
	}

	session := models.Session{
		UserID: userID,
		Token:  token,
		// expire token in 1 month
		ExpiresAt: time.Now().Add(time.Hour * 24 * 30),
	}

	if err := s.clearSessions(ctx, userID, tx); err != nil {
		return nil, err
	}

	if err := s.authRepo.SignIn(ctx, &session); err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		log.ErrorLogger.Printf("Error signing user in: %v", err)
		return nil, err
	}

	return &session, nil
}

func (s *AuthService) SignUp(ctx context.Context, signUp *types.SignUpDTO, ipInfo *utils.IPInfo) error {
	// Check if username or email already exists
	existingUser, err := s.userRepo.FindByUsernameOrEmail(ctx, signUp.Username, signUp.Email)
	if err != nil && err != gorm.ErrRecordNotFound {
		return fmt.Errorf("failed to check existing user: %w", err)
	}
	if existingUser != nil {
		return ErrUserAlreadyExists
	}

	hashedPassword, err := utils.HashPassword(signUp.Password)
	if err != nil {
		log.ErrorLogger.Errorf("Error hashing password: %v", err)
		return err
	}

	user := models.User{
		Username: signUp.Username,
		Email:    signUp.Email,
		Password: hashedPassword,
		Accounts: []models.Account{
			{
				Name:             "Cash",
				Category:         "💵 Cash",
				Balance:          0.00,
				IsDefaultAccount: true,
				Currency:         ipInfo.Currency,
				Transactions:     []models.Transaction{},
			},
		},
		Plans:        []models.Plan{},
		Transactions: []models.Transaction{},
		Activated:    false,
		ExpiresAt:    time.Now().Add(24 * time.Hour),
	}

	tx := s.config.DB.Begin()
	defer tx.Rollback()

	if err := s.userRepo.Create(ctx, tx, &user); err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}

	confirmation := models.AccountConfirmationPin{
		UserId:    user.ID,
		Pin:       utils.GenerateOTP(5),
		ExpiresAt: time.Now().Add(24 * time.Hour),
	}

	if err = tx.WithContext(ctx).Create(&confirmation).Error; err != nil {
		tx.Rollback()
		log.ErrorLogger.Printf("Error creating confirmation OTP: %v", err)
	}

	if err = dispatch.Publish(s.config.Dispatch, "user.signup", types.UserSignUpEvent{
		Username:         signUp.Username,
		Email:            signUp.Email,
		VerificationCode: "99999",
	}); err != nil {
		tx.Rollback()
		log.ErrorLogger.Printf("Error dispatching signup event: %v", err)
	}

	if err := tx.Commit().Error; err != nil {
		log.ErrorLogger.Errorf("Failed to commit transaction: %s", err.Error())
		return fmt.Errorf("failed to create user: %w", err)
	}

	return nil
}

func (s *AuthService) SignOutUser(ctx context.Context, userID uuid.UUID, token string) error {
	tx := s.config.DB.Begin()
	if tx.Error != nil {
		log.ErrorLogger.Errorf("Failed to start transaction: %v", tx.Error)
		return tx.Error
	}
	defer tx.Rollback()

	session, err := s.authRepo.Get(ctx, token)
	if err != nil {
		return err
	}

	if err := s.authRepo.SignOut(ctx, session); err != nil {
		return err
	}

	if err := tx.Commit().Error; err != nil {
		log.ErrorLogger.Errorf("Failed to commit transaction: %v", err)
		return err
	}

	return nil
}

func (s *AuthService) CheckAvailableUsernameExists(ctx context.Context, userName string) (bool, error) {
	return s.userRepo.CheckAvailableUsernameExists(ctx, userName)
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
