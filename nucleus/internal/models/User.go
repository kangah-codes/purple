package models

import (
	"gorm.io/gorm"
)

var (
	SuperUser string = "superuser"
	AppUser   string = "user"
)

type User struct {
	gorm.Model
	FirstName    string        `gorm:"not null" json:"first_name"`
	LastName     string        `gorm:"not null" json:"last_name"`
	Email        string        `gorm:"unique;not null" json:"email"`
	Username     string        `gorm:"unique;not null" json:"username"`
	PhoneNumber  string        `gorm:"unique;not null" json:"phone_number"`
	Password     string        `json:"-"`
	Accounts     []Account     `gorm:"foreignKey:UserId" json:"accounts"`
	Plans        []Plan        `gorm:"foreignKey:UserId" json:"plans"`
	Transactions []Transaction `gorm:"foreignKey:UserId" json:"transactions"`
	Role         string        `gorm:"default:user" json:"role"`
}
