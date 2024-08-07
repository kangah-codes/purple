package models

import (
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
