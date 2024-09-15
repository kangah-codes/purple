package models

var (
	SuperUser string = "superuser"
	AppUser   string = "user"
)

type User struct {
	Base
	Email        string        `gorm:"unique;not null" json:"email"`
	Username     string        `gorm:"unique;not null" json:"username"`
	Password     string        `json:"-"`
	Accounts     []Account     `gorm:"foreignKey:UserId" json:"accounts"`
	Plans        []Plan        `gorm:"foreignKey:UserId" json:"plans"`
	Transactions []Transaction `gorm:"foreignKey:UserId" json:"transactions"`
	Role         string        `gorm:"default:user" json:"role"`
}
