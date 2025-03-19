package services

import (
	"context"
	"errors"
	"nucleus/internal/api/repositories"
	"nucleus/internal/models"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserService struct {
	userRepo repositories.UserRepository
	authRepo repositories.AuthRepository
	db       *gorm.DB
}

var ErrUserAlreadyExists = errors.New("user already exists with these details")

func NewUserService(userRepo repositories.UserRepository, authRepo repositories.AuthRepository, db *gorm.DB) *UserService {
	return &UserService{userRepo: userRepo, authRepo: authRepo, db: db}
}

func (s *UserService) FetchUserByID(ctx context.Context, id uuid.UUID) (*models.User, error) {
	return s.userRepo.FindByID(ctx, id)
}

func (s *UserService) FetchUserByUsername(ctx context.Context, username string) (*models.User, error) {
	return s.userRepo.FindByUsername(ctx, username)
}

func (s *UserService) UpdateUser(ctx context.Context, user *models.User) error {
	user.UpdatedAt = time.Now()
	return s.userRepo.Update(ctx, user)
}

func (s *UserService) DeleteUser(ctx context.Context, tx *gorm.DB, id uuid.UUID) error {
	return s.userRepo.Delete(ctx, tx, id)
}
