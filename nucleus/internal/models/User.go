package models

import (
	"fmt"
	"nucleus/internal/api/types"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	FirstName    string `gorm:"not null" json:"first_name"`
	LastName     string `gorm:"not null" json:"last_name"`
	Email        string `gorm:"unique" json:"email"`
	Username     string `gorm:"unique" json:"username"`
	PhoneNumber  string `gorm:"unique" json:"phone_number"`
	Password     string
	Accounts     []Account     `gorm:"foreignKey:UserId"`
	Plans        []Plan        `gorm:"foreignKey:UserId"`
	Transactions []Transaction `gorm:"foreignKey:UserId"`
}

func (u *User) CreateUser(db *gorm.DB, data types.SignUpDTO) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(data.Password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	newUser := User{
		Username:    data.Username,
		Email:       data.Email,
		Password:    string(hashedPassword),
		PhoneNumber: data.PhoneNumber,
		FirstName:   data.FirstName,
		LastName:    data.LastName,
	}

	result := db.Create(&newUser)
	if result.Error != nil {
		return fmt.Errorf("failed to create user: %w", result.Error)
	}

	*u = newUser

	return nil
}
