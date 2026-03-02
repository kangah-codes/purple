package utils

import (
	"math"
	"regexp"
	"strings"

	"slices"

	"github.com/go-playground/validator/v10"
)

func ValidatePassword(s string) bool {
	var passwordRegex = regexp.MustCompile(`^[a-zA-Z0-9@$!%*?&]*[a-z][a-zA-Z0-9@$!%*?&]*$`)

	return passwordRegex.MatchString(s)
}

func ValidateEmail(e string) bool {
	var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)

	return emailRegex.MatchString(e)
}

func RegisterCustomValidations(v *validator.Validate) {
	v.RegisterValidation("oneof", validateOneOf)
	v.RegisterValidation("validNumber", validateNumber)
	v.RegisterValidation("validCurrency", validateCurrency)
	v.RegisterValidation("validBool", validateBool)
}

func validateOneOf(fl validator.FieldLevel) bool {
	value := fl.Field().String()
	params := fl.Param()
	return slices.Contains(strings.Split(params, " "), value)
}

func validateNumber(fl validator.FieldLevel) bool {
	balance := fl.Field().Float()
	return !math.IsNaN(balance) && !math.IsInf(balance, 0)
}

func validateCurrency(fl validator.FieldLevel) bool {
	currency := fl.Field().String()

	for _, c := range Currencies {
		if c.Code == currency {
			return true
		}
	}

	return false
}

func validateBool(fl validator.FieldLevel) bool {
	return true
}
