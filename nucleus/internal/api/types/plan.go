package types

import (
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
)

// DateFormat defines the expected date format for JSON
// DD/MM/YYYY
const DateFormat = "02/01/2006"

type Date time.Time

// UnmarshalJSON implements the json.Unmarshaler interface for Date
func (d *Date) UnmarshalJSON(b []byte) error {
	s := strings.Trim(string(b), "\"")
	t, err := time.Parse(DateFormat, s)
	if err != nil {
		return fmt.Errorf("cannot parse date: %v", err)
	}
	*d = Date(t)
	return nil
}

// MarshalJSON implements the json.Marshaler interface for Date
func (d Date) MarshalJSON() ([]byte, error) {
	return []byte(fmt.Sprintf("\"%s\"", time.Time(d).Format(DateFormat))), nil
}

type CreatePlanDTO struct {
	AccountId        uuid.UUID `json:"account_id" binding:"required"`
	Type             string    `json:"type" binding:"required,oneof=saving expense"`
	Category         string    `json:"category" binding:"required"`
	Target           float64   `json:"target" binding:"required"`
	StartDate        string    `json:"start_date" binding:"required"`
	EndDate          string    `json:"end_date" binding:"required"`
	DepositFrequency string    `json:"deposit_frequency" binding:"required,oneof=daily weekly bi-weekly monthly yearly"`
	PushNotification bool      `json:"push_notification" binding:"required"`
	Name             string    `json:"name" binding:"required"`
}

type UpdatePlanBalanceDTO struct {
	Balance float64 `json:"balance" binding:"required"`
}
