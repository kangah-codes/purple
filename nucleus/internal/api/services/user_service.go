package services

import (
	"context"
	"fmt"
	"nucleus/internal/api/repositories"
	"nucleus/internal/api/types"
	"nucleus/internal/models"
	"nucleus/log"
	"nucleus/utils"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type UserService struct {
	userRepo repositories.UserRepository
	db       *gorm.DB // Inject the database for transaction management
}

func NewUserService(userRepo repositories.UserRepository, db *gorm.DB) *UserService {
	return &UserService{userRepo: userRepo, db: db}
}

func (s *UserService) CreateUser(ctx context.Context, user *models.User) (*models.User, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		log.ErrorLogger.Printf("Error hashing password: %v", err)
		return nil, err
	}
	user.Password = string(hashedPassword)
	user.ID = uuid.New()
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()

	tx := s.db.Begin()
	defer tx.Rollback()

	if err := s.userRepo.Create(ctx, tx, user); err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		log.ErrorLogger.Printf("Failed to commit transaction: %v", err)
		return nil, err
	}

	return user, nil
}

func (s *UserService) GetUserByID(ctx context.Context, id uuid.UUID) (*models.User, error) {
	return s.userRepo.FindByID(ctx, id)
}

func (s *UserService) GetUserByUsername(ctx context.Context, username string) (*models.User, error) {
	return s.userRepo.FindByUsername(ctx, username)
}

func (s *UserService) UpdateUser(ctx context.Context, user *models.User) error {
	user.UpdatedAt = time.Now()
	return s.userRepo.Update(ctx, user)
}

func (s *UserService) DeleteUser(ctx context.Context, id uuid.UUID) error {
	return s.userRepo.Delete(ctx, id)
}

func (s *UserService) SignUp(ctx context.Context, signUp *types.SignUpDTO, ipInfo *utils.IPInfo) (*models.User, error) {
	hashedPassword, err := utils.HashPassword(signUp.Password)
	if err != nil {
		log.ErrorLogger.Printf("Error hashing password: %v", err)
		return nil, err
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
	}

	tx := s.db.Begin()
	defer tx.Rollback()

	if err := s.userRepo.Create(ctx, tx, &user); err != nil {
		tx.Rollback()
		if err == gorm.ErrDuplicatedKey {
			return nil, fmt.Errorf("user already exists with these details: %w", err)
		}
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	// Preload the user with accounts
	createdUser, err := s.userRepo.FindByUsername(ctx, signUp.Username)
	if err != nil {
		tx.Rollback()
		log.ErrorLogger.Printf("Failed to preload user data: %s", err.Error())
		return nil, fmt.Errorf("failed to retrieve user data after creation: %w", err)
	}

	if err := tx.Commit().Error; err != nil {
		log.ErrorLogger.Printf("Failed to commit transaction: %s", err.Error())
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	log.InfoLogger.Printf("Created user: %+v\n", createdUser)
	return createdUser, nil
}
