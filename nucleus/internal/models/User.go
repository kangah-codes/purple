package models

import "time"

var (
	SuperUser string = "superuser"
	AppUser   string = "user"
)

type User struct {
	Base
	Email        string        `gorm:"unique;not null" json:"email"`
	Username     string        `gorm:"unique;not null" json:"username"`
	Password     string        `json:"-"`
	Accounts     []Account     `gorm:"foreignKey:UserId;constraint:OnDelete:CASCADE;" json:"accounts"`
	Plans        []Plan        `gorm:"foreignKey:UserId;constraint:OnDelete:CASCADE;" json:"plans"`
	Transactions []Transaction `gorm:"foreignKey:UserId;constraint:OnDelete:CASCADE;" json:"transactions"`
	Profile      UserProfile   `gorm:"foreignKey:PUserId;constraint:OnDelete:CASCADE;" json:"profile"`
	Role         string        `gorm:"default:user" json:"role"`
	Activated    bool          `gorm:"default:false" json:"activated"`
	ExpiresAt    time.Time     `gorm:"" json:"expired_at"`
}
