package errors

import (
	"errors"
)

var ErrBadRequest error = errors.New("invalid request")
var ErrPlanNotFound = errors.New("plan not found")
var ErrAccountNotFound = errors.New("account not found")
var ErrUnauthAccess = errors.New("invalid permissions")
var ErrCurrencyMismatch = errors.New("account currency  does not match plan currency")
