package models

import "github.com/google/uuid"

type UserSettings struct {
	Base
	UserId               uuid.UUID `json:"user_id"`
	PushNotifications    bool      `gorm:"default:false" json:"push_notifications"`
	TwoFactorAuth        bool      `gorm:"default:false" json:"two_factor_auth"`
	EndOfDayNotification bool      `gorm:"default:false" json:"end_of_day_notification"`
	DefaultCurrency      string    `gorm:"size:5" json:"default_currency"`
}
